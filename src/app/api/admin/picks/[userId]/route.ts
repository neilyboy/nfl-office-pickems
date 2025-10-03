import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminSession } from '@/lib/session';

/**
 * PUT - Update user's picks (admin only)
 */
export async function PUT(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const isAdmin = await getAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(params.userId);
    const data = await request.json();
    const { week, season, picks, mondayGuess } = data;

    if (!week || !season || !Array.isArray(picks)) {
      return NextResponse.json(
        { error: 'Invalid data' },
        { status: 400 }
      );
    }

    // Check if Monday guess is unique (if provided and different from current)
    if (mondayGuess !== null) {
      const existingGuess = await prisma.pick.findFirst({
        where: {
          week,
          season,
          mondayNightGuess: mondayGuess,
          userId: { not: userId },
        },
      });

      if (existingGuess) {
        return NextResponse.json(
          { error: 'Someone already has that Monday night guess' },
          { status: 400 }
        );
      }
    }

    // Delete existing picks for this user/week
    await prisma.pick.deleteMany({
      where: {
        userId,
        week,
        season,
      },
    });

    // Create new picks
    if (picks.length > 0) {
      await prisma.pick.createMany({
        data: picks.map((pick: any) => ({
          userId,
          week,
          season,
          gameId: pick.gameId,
          pickedTeamId: pick.pickedTeamId,
          mondayNightGuess: mondayGuess,
          lockedAt: new Date(),
        })),
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Picks updated successfully',
    });
  } catch (error) {
    console.error('Update admin picks error:', error);
    return NextResponse.json(
      { error: 'Failed to update picks' },
      { status: 500 }
    );
  }
}
