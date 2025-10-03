import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserSession } from '@/lib/session';

/**
 * GET - Get user's picks for a week
 */
export async function GET(request: Request) {
  try {
    const session = await getUserSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const week = parseInt(searchParams.get('week') || '0');
    const season = parseInt(searchParams.get('season') || '0');

    const picks = await prisma.pick.findMany({
      where: {
        userId: session.userId,
        week,
        season,
      },
      select: {
        gameId: true,
        pickedTeamId: true,
        mondayNightGuess: true,
      },
    });

    // Get Monday guess from first pick (they all have the same value)
    const mondayGuess = picks.find(p => p.mondayNightGuess !== null)?.mondayNightGuess;

    return NextResponse.json({
      picks,
      mondayGuess,
    });
  } catch (error) {
    console.error('Get picks error:', error);
    return NextResponse.json(
      { error: 'Failed to load picks' },
      { status: 500 }
    );
  }
}

/**
 * POST - Save user's picks for a week
 */
export async function POST(request: Request) {
  try {
    const session = await getUserSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { week, season, picks, mondayGuess } = data;

    if (!week || !season || !Array.isArray(picks)) {
      return NextResponse.json(
        { error: 'Invalid data' },
        { status: 400 }
      );
    }

    // Check if Monday guess is unique (if provided)
    if (mondayGuess !== null) {
      const existingGuess = await prisma.pick.findFirst({
        where: {
          week,
          season,
          mondayNightGuess: mondayGuess,
          userId: { not: session.userId },
        },
      });

      if (existingGuess) {
        return NextResponse.json(
          { error: 'Someone already picked that Monday night total. Please choose a different number.' },
          { status: 400 }
        );
      }
    }

    // Delete existing picks for this week
    await prisma.pick.deleteMany({
      where: {
        userId: session.userId,
        week,
        season,
      },
    });

    // Create new picks
    await prisma.pick.createMany({
      data: picks.map((pick: any) => ({
        userId: session.userId,
        week,
        season,
        gameId: pick.gameId,
        pickedTeamId: pick.pickedTeamId,
        mondayNightGuess: mondayGuess,
        lockedAt: new Date(),
      })),
    });

    return NextResponse.json({
      success: true,
      message: 'Picks saved successfully',
    });
  } catch (error) {
    console.error('Save picks error:', error);
    return NextResponse.json(
      { error: 'Failed to save picks' },
      { status: 500 }
    );
  }
}
