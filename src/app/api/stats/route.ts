import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserSession } from '@/lib/session';
import { getCurrentWeek, getWeekGames } from '@/lib/espn-api';

/**
 * Calculate season highlights (Most Improved, Perfect Weeks, etc.)
 */
function calculateSeasonHighlights(users: any[], allPicks: any[], gamesByWeek: Map<any, any>, isPickCorrect: Function) {
  // Calculate weekly performance for each user
  const userWeeklyPerformance = new Map();
  
  users.forEach(user => {
    const userPicks = allPicks.filter(p => p.userId === user.id);
    const weekMap = new Map<number, { correct: number; total: number }>();
    
    userPicks.forEach(pick => {
      if (!weekMap.has(pick.week)) {
        weekMap.set(pick.week, { correct: 0, total: 0 });
      }
    });
    
    userPicks.forEach(pick => {
      const games = gamesByWeek.get(pick.week);
      if (!games) return;
      
      const result = isPickCorrect(pick, games);
      const weekData = weekMap.get(pick.week)!;
      
      if (result === true) {
        weekData.correct++;
        weekData.total++;
      } else if (result === false) {
        weekData.total++;
      }
    });
    
    userWeeklyPerformance.set(user.id, {
      user,
      weeks: Array.from(weekMap.entries())
        .map(([week, data]) => ({ week, ...data }))
        .sort((a, b) => a.week - b.week),
    });
  });

  // Find Most Improved (best improvement from one week to next)
  let mostImproved = null;
  let biggestImprovement = 0;

  userWeeklyPerformance.forEach((data) => {
    const weeks = data.weeks;
    for (let i = 1; i < weeks.length; i++) {
      const prevWeek = weeks[i - 1];
      const currWeek = weeks[i];
      
      if (prevWeek.total > 0 && currWeek.total > 0) {
        const prevRate = prevWeek.correct / prevWeek.total;
        const currRate = currWeek.correct / currWeek.total;
        const improvement = currRate - prevRate;
        
        if (improvement > biggestImprovement) {
          biggestImprovement = improvement;
          mostImproved = {
            userId: data.user.id,
            username: data.user.username,
            firstName: data.user.firstName,
            lastName: data.user.lastName,
            avatarColor: data.user.avatarColor,
            fromWeek: prevWeek.week,
            toWeek: currWeek.week,
            improvement: Math.round(improvement * 100),
            fromCorrect: prevWeek.correct,
            fromTotal: prevWeek.total,
            toCorrect: currWeek.correct,
            toTotal: currWeek.total,
          };
        }
      }
    }
  });

  // Find Perfect Weeks (all picks correct)
  const perfectWeeks: any[] = [];
  
  userWeeklyPerformance.forEach((data) => {
    data.weeks.forEach((week: any) => {
      if (week.total > 0 && week.correct === week.total) {
        perfectWeeks.push({
          userId: data.user.id,
          username: data.user.username,
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          avatarColor: data.user.avatarColor,
          week: week.week,
          correct: week.correct,
        });
      }
    });
  });

  return {
    mostImproved,
    perfectWeeks,
  };
}

/**
 * Calculate advanced analytics - streaks, trends, records
 */
function calculateAdvancedAnalytics(users: any[], allPicks: any[], gamesByWeek: Map<any, any>, isPickCorrect: Function) {
  const userAnalytics = users.map(user => {
    const userPicks = allPicks.filter(p => p.userId === user.id);
    const weeks = Array.from(new Set(userPicks.map(p => p.week))).sort((a, b) => a - b);
    
    // Calculate current streak
    let currentStreak = 0;
    let streakType: 'win' | 'loss' | null = null;
    
    // Calculate week by week performance
    const weeklyPerformance = weeks.map(week => {
      const weekPicks = userPicks.filter(p => p.week === week);
      const games = gamesByWeek.get(week);
      if (!games) return { week, correct: 0, total: 0 };
      
      let correct = 0;
      let total = 0;
      
      weekPicks.forEach(pick => {
        const result = isPickCorrect(pick, games);
        if (result === true) {
          correct++;
          total++;
        } else if (result === false) {
          total++;
        }
      });
      
      return { week, correct, total };
    });
    
    // Calculate streak from most recent games (in reverse chronological order)
    const recentPicks = [...userPicks]
      .sort((a, b) => b.week - a.week)
      .slice(0, 20); // Last 20 picks
    
    for (const pick of recentPicks) {
      const games = gamesByWeek.get(pick.week);
      if (!games) continue;
      
      const result = isPickCorrect(pick, games);
      if (result === null) continue; // Skip unfinished games
      
      if (currentStreak === 0) {
        // Start streak
        streakType = result ? 'win' : 'loss';
        currentStreak = 1;
      } else if ((streakType === 'win' && result) || (streakType === 'loss' && !result)) {
        // Continue streak
        currentStreak++;
      } else {
        // Streak broken
        break;
      }
    }
    
    // Find best and worst streaks
    let bestStreak = 0;
    let worstStreak = 0;
    let tempStreak = 0;
    let tempType: 'win' | 'loss' | null = null;
    
    userPicks.forEach(pick => {
      const games = gamesByWeek.get(pick.week);
      if (!games) return;
      
      const result = isPickCorrect(pick, games);
      if (result === null) return;
      
      if (tempStreak === 0) {
        tempType = result ? 'win' : 'loss';
        tempStreak = 1;
      } else if ((tempType === 'win' && result) || (tempType === 'loss' && !result)) {
        tempStreak++;
      } else {
        if (tempType === 'win' && tempStreak > bestStreak) {
          bestStreak = tempStreak;
        } else if (tempType === 'loss' && tempStreak > worstStreak) {
          worstStreak = tempStreak;
        }
        tempType = result ? 'win' : 'loss';
        tempStreak = 1;
      }
    });
    
    // Check final streak
    if (tempType === 'win' && tempStreak > bestStreak) {
      bestStreak = tempStreak;
    } else if (tempType === 'loss' && tempStreak > worstStreak) {
      worstStreak = tempStreak;
    }
    
    return {
      userId: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarColor: user.avatarColor,
      currentStreak,
      streakType,
      bestStreak,
      worstStreak,
      weeklyPerformance,
    };
  });
  
  return userAnalytics;
}

/**
 * Calculate lunch tracker - who owes lunch based on weekly wins/losses
 */
function calculateLunchTracker(users: any[], allPicks: any[], gamesByWeek: Map<any, any>, isPickCorrect: Function) {
  const weeklyResults = new Map<number, { winner: any; loser: any }>();
  
  // Get all unique weeks
  const weeks = Array.from(new Set(allPicks.map(p => p.week))).sort((a, b) => a - b);
  
  weeks.forEach(week => {
    const games = gamesByWeek.get(week);
    if (!games) return;
    
    // Check if week is complete
    const allCompleted = games.every((g: any) => g.status.type.state === 'post');
    if (!allCompleted) return;
    
    // Calculate scores for each user
    const userScores = new Map<number, { correct: number; total: number; user: any }>();
    
    users.forEach(user => {
      userScores.set(user.id, { correct: 0, total: 0, user });
    });
    
    allPicks.filter(p => p.week === week).forEach(pick => {
      const result = isPickCorrect(pick, games);
      const userScore = userScores.get(pick.userId);
      if (!userScore) return;
      
      if (result === true) {
        userScore.correct++;
        userScore.total++;
      } else if (result === false) {
        userScore.total++;
      }
    });
    
    // Find winner and loser
    const scoresArray = Array.from(userScores.values()).filter(s => s.total > 0);
    if (scoresArray.length === 0) return;
    
    scoresArray.sort((a, b) => b.correct - a.correct);
    
    const winner = scoresArray[0];
    const loser = scoresArray[scoresArray.length - 1];
    
    weeklyResults.set(week, {
      winner: {
        userId: winner.user.id,
        username: winner.user.username,
        firstName: winner.user.firstName,
        lastName: winner.user.lastName,
        avatarColor: winner.user.avatarColor,
      },
      loser: {
        userId: loser.user.id,
        username: loser.user.username,
        firstName: loser.user.firstName,
        lastName: loser.user.lastName,
        avatarColor: loser.user.avatarColor,
      },
    });
  });
  
  // Calculate net lunches for each user
  const lunchDebts = new Map<number, { wins: number; losses: number; user: any }>();
  
  users.forEach(user => {
    lunchDebts.set(user.id, { wins: 0, losses: 0, user });
  });
  
  weeklyResults.forEach(result => {
    const winnerDebt = lunchDebts.get(result.winner.userId);
    const loserDebt = lunchDebts.get(result.loser.userId);
    
    if (winnerDebt) winnerDebt.wins++;
    if (loserDebt) loserDebt.losses++;
  });
  
  // Convert to array and sort by net lunches
  const lunchArray = Array.from(lunchDebts.values())
    .map(debt => ({
      userId: debt.user.id,
      username: debt.user.username,
      firstName: debt.user.firstName,
      lastName: debt.user.lastName,
      avatarColor: debt.user.avatarColor,
      wins: debt.wins,
      losses: debt.losses,
      net: debt.wins - debt.losses,
    }))
    .sort((a, b) => b.net - a.net);
  
  return lunchArray;
}

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
        
        // If there's only one week, best and worst are the same
        if (weekResults.length === 1) {
          worstWeek = bestWeek;
        }
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

    // Calculate season highlights
    const highlights = calculateSeasonHighlights(users, allPicks, gamesByWeek, isPickCorrect);

    // Calculate lunch tracker (weekly wins/losses)
    const lunchTracker = calculateLunchTracker(users, allPicks, gamesByWeek, isPickCorrect);

    // Calculate advanced analytics
    const analytics = calculateAdvancedAnalytics(users, allPicks, gamesByWeek, isPickCorrect);

    return NextResponse.json({
      season,
      stats,
      highlights,
      lunchTracker,
      analytics,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    return NextResponse.json(
      { error: 'Failed to load statistics' },
      { status: 500 }
    );
  }
}
