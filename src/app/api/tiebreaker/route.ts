import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserSession } from '@/lib/session';
import { getCurrentWeek, getWeekGames } from '@/lib/espn-api';
import { getDayOfWeek } from '@/lib/utils';

/**
 * GET - Calculate Monday Night Tiebreaker results for a week
 */
export async function GET(request: Request) {
  try {
    const session = await getUserSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const weekParam = searchParams.get('week');
    
    const { week: currentWeek, season } = await getCurrentWeek();
    const week = weekParam ? parseInt(weekParam) : currentWeek;

    // Get all Monday games for this week
    const games = await getWeekGames(week, season);
    const mondayGames = games.filter(g => getDayOfWeek(g.date) === 'Monday');

    if (mondayGames.length === 0) {
      return NextResponse.json({
        week,
        season,
        hasMondayGames: false,
        message: 'No Monday games this week',
      });
    }

    // Check if all Monday games are completed
    const allCompleted = mondayGames.every(g => g.status.type.state === 'post');
    
    if (!allCompleted) {
      return NextResponse.json({
        week,
        season,
        hasMondayGames: true,
        completed: false,
        message: 'Monday games not yet completed',
        games: mondayGames.length,
      });
    }

    // Calculate actual Monday total
    let actualTotal = 0;
    mondayGames.forEach(game => {
      const homeTeam = game.competitions[0].competitors.find((c: any) => c.homeAway === 'home');
      const awayTeam = game.competitions[0].competitors.find((c: any) => c.homeAway === 'away');
      
      if (homeTeam && awayTeam) {
        const homeScore = parseInt(homeTeam.score) || 0;
        const awayScore = parseInt(awayTeam.score) || 0;
        actualTotal += homeScore + awayScore;
      }
    });

    // Get all user guesses for this week
    const picks = await prisma.pick.findMany({
      where: {
        week,
        season,
        mondayNightGuess: { not: null },
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatarColor: true,
          },
        },
      },
      distinct: ['userId'],
    });

    // Calculate distances and determine winner/loser
    const guesses = picks.map(pick => {
      const guess = pick.mondayNightGuess!;
      const distance = Math.abs(guess - actualTotal);
      const over = guess > actualTotal;

      return {
        userId: pick.user.id,
        username: pick.user.username,
        firstName: pick.user.firstName,
        lastName: pick.user.lastName,
        avatarColor: pick.user.avatarColor,
        guess,
        distance,
        over,
      };
    });

    // Sort by distance (closest first)
    guesses.sort((a, b) => a.distance - b.distance);

    // Winner: closest without going over, or just closest if all are over
    const notOverGuesses = guesses.filter(g => !g.over);
    const winner = notOverGuesses.length > 0 ? notOverGuesses[0] : guesses[0];

    // Loser: farthest away
    const loser = guesses[guesses.length - 1];

    return NextResponse.json({
      week,
      season,
      hasMondayGames: true,
      completed: true,
      actualTotal,
      totalGames: mondayGames.length,
      winner,
      loser,
      allGuesses: guesses,
    });
  } catch (error) {
    console.error('Tiebreaker calculation error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate tiebreaker' },
      { status: 500 }
    );
  }
}
