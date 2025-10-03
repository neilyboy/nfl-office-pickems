import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserSession } from '@/lib/session';
import { getCurrentWeek, getWeekGames } from '@/lib/espn-api';

/**
 * GET - Get live scores with user picks and standings
 */
export async function GET() {
  try {
    const session = await getUserSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current week
    const { week, season } = await getCurrentWeek();

    // Get games for the week
    const games = await getWeekGames(week, season);

    // Get all picks for this week
    const allPicks = await prisma.pick.findMany({
      where: { week, season },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatarColor: true,
            avatarType: true,
            avatarValue: true,
          },
        },
      },
    });

    // Get user's picks
    const userPicks = allPicks.filter(p => p.userId === session.userId);

    // Add user pick and total picks to each game
    const gamesWithPicks = games.map(game => {
      const userPick = userPicks.find(p => p.gameId === game.id);
      const gamePicks = allPicks.filter(p => p.gameId === game.id);
      
      const homeTeam = game.competitions[0].competitors.find(c => c.homeAway === 'home');
      const awayTeam = game.competitions[0].competitors.find(c => c.homeAway === 'away');

      // Get users who picked each team
      const homePickers = gamePicks
        .filter(p => p.pickedTeamId === homeTeam?.team.id)
        .map(p => ({
          userId: p.user.id,
          username: p.user.username,
          firstName: p.user.firstName,
          lastName: p.user.lastName,
          avatarColor: p.user.avatarColor,
          avatarType: p.user.avatarType,
          avatarValue: p.user.avatarValue,
        }));

      const awayPickers = gamePicks
        .filter(p => p.pickedTeamId === awayTeam?.team.id)
        .map(p => ({
          userId: p.user.id,
          username: p.user.username,
          firstName: p.user.firstName,
          lastName: p.user.lastName,
          avatarColor: p.user.avatarColor,
          avatarType: p.user.avatarType,
          avatarValue: p.user.avatarValue,
        }));

      return {
        ...game,
        userPick: userPick?.pickedTeamId,
        totalPicks: {
          homeCount: homePickers.length,
          awayCount: awayPickers.length,
        },
        pickers: {
          home: homePickers,
          away: awayPickers,
        },
      };
    });

    // Calculate standings
    const uniqueUserIds = Array.from(new Set(allPicks.map(p => p.userId)));
    const usersWithPicks = await prisma.user.findMany({
      where: {
        id: {
          in: uniqueUserIds,
        },
      },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        avatarColor: true,
        avatarType: true,
        avatarValue: true,
      },
    });

    const standings = usersWithPicks.map(user => {
      const userGamePicks = allPicks.filter(p => p.userId === user.id);
      
      let correct = 0;
      let incorrect = 0;
      let remaining = 0;

      games.forEach(game => {
        const pick = userGamePicks.find(p => p.gameId === game.id);
        if (!pick) return;

        if (game.status.type.state === 'post') {
          // Game is final
          const homeTeam = game.competitions[0].competitors.find(c => c.homeAway === 'home');
          const awayTeam = game.competitions[0].competitors.find(c => c.homeAway === 'away');
          
          if (homeTeam && awayTeam) {
            const homeScore = parseInt(homeTeam.score || '0');
            const awayScore = parseInt(awayTeam.score || '0');
            const winnerId = homeScore > awayScore ? homeTeam.team.id : awayTeam.team.id;
            
            if (pick.pickedTeamId === winnerId) {
              correct++;
            } else {
              incorrect++;
            }
          }
        } else {
          // Game not finished yet
          remaining++;
        }
      });

      // Get Monday guess from first pick
      const mondayGuess = userGamePicks.find(p => p.mondayNightGuess !== null)?.mondayNightGuess || null;

      return {
        userId: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarColor: user.avatarColor,
        avatarType: user.avatarType,
        avatarValue: user.avatarValue,
        correct,
        incorrect,
        remaining,
        mondayGuess,
      };
    });

    // Sort by correct picks (descending), then by Monday guess (ascending for tiebreaker)
    standings.sort((a, b) => {
      if (b.correct !== a.correct) return b.correct - a.correct;
      if (a.mondayGuess !== null && b.mondayGuess !== null) {
        return a.mondayGuess - b.mondayGuess;
      }
      return 0;
    });

    return NextResponse.json({
      week,
      season,
      games: gamesWithPicks,
      standings,
    });
  } catch (error) {
    console.error('Get live scores error:', error);
    return NextResponse.json(
      { error: 'Failed to load scores' },
      { status: 500 }
    );
  }
}
