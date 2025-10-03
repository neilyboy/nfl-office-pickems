import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserSession } from '@/lib/session';
import { getCurrentWeek, getWeekGames } from '@/lib/espn-api';

/**
 * GET - Get season statistics for all users
 */
export async function GET() {
  try {
    const session = await getUserSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { season } = await getCurrentWeek();

    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        avatarColor: true,
      },
    });

    // Get all picks for the season
    const allPicks = await prisma.pick.findMany({
      where: { season },
      include: {
        user: true,
      },
    });

    // Get all unique weeks that have picks
    const weeks = Array.from(new Set(allPicks.map(p => p.week))).sort((a, b) => a - b);
    
    // Fetch game results for each week
    const gamesByWeek = new Map();
    for (const week of weeks) {
      try {
        const games = await getWeekGames(week, season);
        gamesByWeek.set(week, games);
        console.log(`Loaded ${games.length} games for Week ${week}`);
      } catch (error) {
        console.error(`Failed to load games for week ${week}:`, error);
      }
    }

    // Helper function to check if a pick was correct
    const isPickCorrect = (pick: any, games: any[]): boolean | null => {
      const game = games.find(g => g.id === pick.gameId);
      if (!game) return null;
      
      // Only count completed games
      if (game.status.type.state !== 'post') return null;
      
      const homeTeam = game.competitions[0].competitors.find((c: any) => c.homeAway === 'home');
      const awayTeam = game.competitions[0].competitors.find((c: any) => c.homeAway === 'away');
      
      if (!homeTeam || !awayTeam) return null;
      
      const homeScore = parseInt(homeTeam.score) || 0;
      const awayScore = parseInt(awayTeam.score) || 0;
      
      let winnerId: string;
      if (homeScore > awayScore) {
        winnerId = homeTeam.team.id;
      } else if (awayScore > homeScore) {
        winnerId = awayTeam.team.id;
      } else {
        // Tie - no winner
        return null;
      }
      
      return pick.pickedTeamId === winnerId;
    };

    // Calculate stats for each user
    const stats = users.map(user => {
      const userPicks = allPicks.filter(p => p.userId === user.id);
      
      // Group by week
      const weekMap = new Map<number, any[]>();
      userPicks.forEach(pick => {
        if (!weekMap.has(pick.week)) {
          weekMap.set(pick.week, []);
        }
        weekMap.get(pick.week)!.push(pick);
      });

      const totalWeeks = weekMap.size;
      
      // Calculate correct/incorrect picks
      let totalCorrect = 0;
      let totalIncorrect = 0;
      const weekResults: { week: number; correct: number; total: number }[] = [];
      
      weekMap.forEach((picks, week) => {
        const games = gamesByWeek.get(week);
        if (!games) {
          console.log(`No games found for week ${week} for user ${user.username}`);
          return;
        }
        
        let weekCorrect = 0;
        let weekTotal = 0;
        
        picks.forEach(pick => {
          const result = isPickCorrect(pick, games);
          if (result === true) {
            totalCorrect++;
            weekCorrect++;
            weekTotal++;
          } else if (result === false) {
            totalIncorrect++;
            weekTotal++;
          } else if (result === null) {
            // Game not completed yet or pick not found
            console.log(`Pick for game ${pick.gameId} in week ${week} has no result yet`);
          }
        });
        
        if (weekTotal > 0) {
          weekResults.push({ week, correct: weekCorrect, total: weekTotal });
        }
      });
      
      // Calculate win rate
      const totalGames = totalCorrect + totalIncorrect;
      const winRate = totalGames > 0 ? Math.round((totalCorrect / totalGames) * 100) : 0;
      
      // Find best and worst weeks
      let bestWeek = 0;
      let worstWeek = 0;
      if (weekResults.length > 0) {
        const bestWeekResult = weekResults.reduce((best, curr) => 
          curr.correct > best.correct ? curr : best
        );
        const worstWeekResult = weekResults.reduce((worst, curr) => 
          curr.correct < worst.correct ? curr : worst
        );
        bestWeek = bestWeekResult.correct;
        worstWeek = worstWeekResult.correct;
      }

      const userStats = {
        userId: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarColor: user.avatarColor,
        totalWeeks,
        totalCorrect,
        totalIncorrect,
        winRate,
        bestWeek,
        worstWeek,
        currentStreak: 0,
      };
      
      console.log(`Stats for ${user.username}: ${totalCorrect}/${totalGames} correct (${winRate}%)`);
      
      return userStats;
    });

    // Sort by total correct (descending)
    stats.sort((a, b) => {
      if (b.totalCorrect !== a.totalCorrect) {
        return b.totalCorrect - a.totalCorrect;
      }
      return b.winRate - a.winRate;
    });

    return NextResponse.json({
      season,
      stats,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    return NextResponse.json(
      { error: 'Failed to load statistics' },
      { status: 500 }
    );
  }
}
