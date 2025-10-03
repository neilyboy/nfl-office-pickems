import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminSession } from '@/lib/session';
import { getCurrentWeek, getWeekGames } from '@/lib/espn-api';

/**
 * GET - Get all users' picks for a specific week (or current week if not specified)
 */
export async function GET(request: Request) {
  try {
    const isAdmin = await getAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current week
    const { searchParams } = new URL(request.url);
    const weekParam = searchParams.get('week');
    
    const { week: currentWeek, season } = await getCurrentWeek();
    const week = weekParam ? parseInt(weekParam) : currentWeek;
    
    // Validate week range
    if (week < 1 || week > 18) {
      return NextResponse.json(
        { error: 'Week must be between 1 and 18' },
        { status: 400 }
      );
    }

    // Get games for the week
    const games = await getWeekGames(week, season);

    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        avatarColor: true,
        avatarType: true,
        avatarValue: true,
      },
      orderBy: { firstName: 'asc' },
    });

    // Get all picks for this week
    const allPicks = await prisma.pick.findMany({
      where: { week, season },
    });

    // Organize picks by user
    const userPicks = users.map(user => {
      const picks = allPicks.filter(p => p.userId === user.id);
      const mondayGuess = picks.find(p => p.mondayNightGuess !== null)?.mondayNightGuess || null;

      return {
        userId: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarColor: user.avatarColor,
        picks: picks.map(p => ({
          gameId: p.gameId,
          pickedTeamId: p.pickedTeamId,
        })),
        mondayGuess,
      };
    });

    return NextResponse.json({
      week,
      currentWeek,
      season,
      games,
      userPicks,
    });
  } catch (error) {
    console.error('Get admin picks error:', error);
    return NextResponse.json(
      { error: 'Failed to load picks' },
      { status: 500 }
    );
  }
}
