import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserSession } from '@/lib/session';
import { getCurrentWeek, getWeekGames, getFirstGameTime } from '@/lib/espn-api';

/**
 * GET - Check if user needs notifications
 * Returns notification triggers that should be shown
 */
export async function GET() {
  try {
    const session = await getUserSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { week, season } = await getCurrentWeek();
    const games = await getWeekGames(week, season);
    const firstGameTime = getFirstGameTime(games);

    if (!firstGameTime) {
      return NextResponse.json({ notifications: [] });
    }

    const now = new Date();
    const hoursUntilGame = (firstGameTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    // Check if user has made picks for this week
    const userPicks = await prisma.pick.findMany({
      where: {
        userId: session.userId,
        week,
        season,
      },
    });

    const hasMadePicks = userPicks.length > 0;
    const notifications = [];

    // "Make your picks" reminder
    // Show if: picks not made, 24-72 hours before first game
    if (!hasMadePicks && hoursUntilGame > 0 && hoursUntilGame <= 72) {
      const urgency = hoursUntilGame <= 24 ? 'urgent' : hoursUntilGame <= 48 ? 'soon' : 'reminder';
      
      notifications.push({
        type: 'make-picks',
        week,
        hoursUntilLock: Math.round(hoursUntilGame),
        urgency,
        message: `Week ${week} locks in ${Math.round(hoursUntilGame)} hours!`,
      });
    }

    // "Games starting soon" alert
    // Show if: 30 min - 2 hours before first game
    if (hoursUntilGame > 0.5 && hoursUntilGame <= 2) {
      notifications.push({
        type: 'games-starting',
        week,
        hoursUntilGame: Math.round(hoursUntilGame * 10) / 10,
        message: `Week ${week} games start in ${Math.round(hoursUntilGame * 60)} minutes!`,
      });
    }

    // Check for completed weeks with unviewed results
    const completedWeeks = await prisma.pick.findMany({
      where: {
        userId: session.userId,
        season,
        week: {
          lt: week, // Previous weeks
        },
      },
      distinct: ['week'],
      select: {
        week: true,
      },
    });

    // Check if all games from last week are complete
    if (completedWeeks.length > 0) {
      const lastWeek = Math.max(...completedWeeks.map(w => w.week));
      const lastWeekGames = await getWeekGames(lastWeek, season);
      const allComplete = lastWeekGames.every(g => g.status.type.state === 'post');

      if (allComplete) {
        // Check if user has viewed results (simple check: have they visited since games ended?)
        const lastGameTime = new Date(Math.max(...lastWeekGames.map(g => new Date(g.date).getTime())));
        const hoursSinceLastGame = (now.getTime() - lastGameTime.getTime()) / (1000 * 60 * 60);

        // Show results notification 2-24 hours after last game ends
        if (hoursSinceLastGame >= 2 && hoursSinceLastGame <= 24) {
          // Calculate user's results
          const lastWeekPicks = await prisma.pick.findMany({
            where: {
              userId: session.userId,
              week: lastWeek,
              season,
            },
          });

          let correct = 0;
          let total = 0;

          lastWeekPicks.forEach(pick => {
            const game = lastWeekGames.find(g => g.id === pick.gameId);
            if (!game || game.status.type.state !== 'post') return;

            const homeTeam = game.competitions[0].competitors.find(c => c.homeAway === 'home');
            const awayTeam = game.competitions[0].competitors.find(c => c.homeAway === 'away');
            
            if (!homeTeam || !awayTeam) return;

            const homeScore = parseInt(homeTeam.score) || 0;
            const awayScore = parseInt(awayTeam.score) || 0;
            const winnerId = homeScore > awayScore ? homeTeam.team.id : awayTeam.team.id;

            total++;
            if (pick.pickedTeamId === winnerId) {
              correct++;
            }
          });

          if (total > 0) {
            // Get user's rank
            const allUsers = await prisma.user.findMany();
            const allPicks = await prisma.pick.findMany({
              where: { week: lastWeek, season },
            });

            const userScores = allUsers.map(user => {
              const picks = allPicks.filter(p => p.userId === user.id);
              let userCorrect = 0;

              picks.forEach(pick => {
                const game = lastWeekGames.find(g => g.id === pick.gameId);
                if (!game || game.status.type.state !== 'post') return;

                const homeTeam = game.competitions[0].competitors.find(c => c.homeAway === 'home');
                const awayTeam = game.competitions[0].competitors.find(c => c.homeAway === 'away');
                
                if (!homeTeam || !awayTeam) return;

                const homeScore = parseInt(homeTeam.score) || 0;
                const awayScore = parseInt(awayTeam.score) || 0;
                const winnerId = homeScore > awayScore ? homeTeam.team.id : awayTeam.team.id;

                if (pick.pickedTeamId === winnerId) {
                  userCorrect++;
                }
              });

              return { userId: user.id, correct: userCorrect };
            });

            const sortedScores = userScores.sort((a, b) => b.correct - a.correct);
            const rank = sortedScores.findIndex(s => s.userId === session.userId) + 1;

            notifications.push({
              type: 'weekly-results',
              week: lastWeek,
              correct,
              total,
              rank,
              totalPlayers: allUsers.length,
              message: `Week ${lastWeek} results: ${correct}/${total} correct`,
            });
          }
        }
      }
    }

    return NextResponse.json({ notifications });
  } catch (error: any) {
    console.error('Error checking notifications:', error);
    return NextResponse.json({ error: 'Failed to check notifications' }, { status: 500 });
  }
}
