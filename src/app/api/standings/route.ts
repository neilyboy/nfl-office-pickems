import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserSession } from '@/lib/session';
import { getCurrentWeek, getWeekGames } from '@/lib/espn-api';
import { getDayOfWeek } from '@/lib/utils';

/**
 * GET - Get weekly standings (winners/losers) for all completed weeks
 */
export async function GET() {
  try {
    const session = await getUserSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { week: currentWeek, season } = await getCurrentWeek();

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
    });

    // Get all picks for the season
    const allPicks = await prisma.pick.findMany({
      where: { season },
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

    // Get unique weeks with picks
    const weeks = Array.from(new Set(allPicks.map(p => p.week))).sort((a, b) => a - b);

    // Calculate results for each week
    const results = await Promise.all(
      weeks.map(async (week) => {
        try {
          const games = await getWeekGames(week, season);
          const weekPicks = allPicks.filter(p => p.week === week);

          // Check if week is completed (all games finished)
          const completed = games.every(g => g.status.type.state === 'post');

          if (!completed) {
            return {
              week,
              winner: null,
              loser: null,
              tiebreaker: null,
              completed: false,
            };
          }

          // Calculate correct picks for each user
          const userScores = new Map<number, { correct: number; total: number; user: any }>();

          users.forEach(user => {
            userScores.set(user.id, {
              correct: 0,
              total: 0,
              user,
            });
          });

          weekPicks.forEach(pick => {
            const game = games.find(g => g.id === pick.gameId);
            if (!game || game.status.type.state !== 'post') return;

            const homeTeam = game.competitions[0].competitors.find((c: any) => c.homeAway === 'home');
            const awayTeam = game.competitions[0].competitors.find((c: any) => c.homeAway === 'away');

            if (!homeTeam || !awayTeam) return;

            const homeScore = parseInt(homeTeam.score) || 0;
            const awayScore = parseInt(awayTeam.score) || 0;

            let winnerId: string;
            if (homeScore > awayScore) {
              winnerId = homeTeam.team.id;
            } else if (awayScore > homeScore) {
              winnerId = awayTeam.team.id;
            } else {
              return; // Tie, don't count
            }

            const userScore = userScores.get(pick.userId);
            if (userScore) {
              userScore.total++;
              if (pick.pickedTeamId === winnerId) {
                userScore.correct++;
              }
            }
          });

          // Find winner (most correct) and loser (least correct)
          const scoresArray = Array.from(userScores.values()).filter(s => s.total > 0);
          
          if (scoresArray.length === 0) {
            return {
              week,
              winner: null,
              loser: null,
              tiebreaker: null,
              completed: true,
            };
          }

          scoresArray.sort((a, b) => b.correct - a.correct);

          let winner = scoresArray[0];
          let loser = scoresArray[scoresArray.length - 1];

          // Calculate Monday tiebreaker if applicable
          let tiebreaker = null;
          const mondayGames = games.filter(g => getDayOfWeek(g.date) === 'Monday');
          
          // Check if we need tiebreaker (multiple users with same high/low score)
          const topScore = scoresArray[0].correct;
          const bottomScore = scoresArray[scoresArray.length - 1].correct;
          const tiedForFirst = scoresArray.filter(s => s.correct === topScore);
          const tiedForLast = scoresArray.filter(s => s.correct === bottomScore);
          
          if (mondayGames.length > 0 && mondayGames.every(g => g.status.type.state === 'post')) {
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

            const guesses = weekPicks
              .filter(p => p.mondayNightGuess !== null)
              .reduce((acc, pick) => {
                const existing = acc.find(g => g.userId === pick.userId);
                if (!existing) {
                  acc.push({
                    userId: pick.userId,
                    guess: pick.mondayNightGuess!,
                    user: pick.user,
                  });
                }
                return acc;
              }, [] as any[]);

            if (guesses.length > 0) {
              const guessesWithDistance = guesses.map(g => ({
                ...g,
                distance: Math.abs(g.guess - actualTotal),
                over: g.guess > actualTotal,
              }));

              // Sort by distance, prefer under over over
              guessesWithDistance.sort((a, b) => {
                // If both under or both over, sort by distance
                if (a.over === b.over) return a.distance - b.distance;
                // Prefer under (not over) when distances are same
                return a.over ? 1 : -1;
              });

              // Winner: closest without going over, or closest if all went over
              const notOverGuesses = guessesWithDistance.filter(g => !g.over);
              const tbWinner = notOverGuesses.length > 0 ? notOverGuesses[0] : guessesWithDistance[0];
              const tbLoser = guessesWithDistance[guessesWithDistance.length - 1];

              // If there's a tie for winner, use tiebreaker to determine actual winner
              if (tiedForFirst.length > 1 && tbWinner) {
                // Only look among people tied for first
                const actualWinner = tiedForFirst.find(s => s.user.id === tbWinner.userId);
                if (actualWinner) {
                  winner = actualWinner;
                }
              }

              // If there's a tie for loser, use tiebreaker to determine actual loser
              if (tiedForLast.length > 1 && tbLoser) {
                // Only look among people tied for last
                const actualLoser = tiedForLast.find(s => s.user.id === tbLoser.userId);
                if (actualLoser) {
                  loser = actualLoser;
                }
              }

              tiebreaker = {
                actualTotal,
                winner: {
                  userId: tbWinner.userId,
                  username: tbWinner.user.username,
                  firstName: tbWinner.user.firstName,
                  lastName: tbWinner.user.lastName,
                  avatarColor: tbWinner.user.avatarColor,
                  avatarType: tbWinner.user.avatarType,
                  avatarValue: tbWinner.user.avatarValue,
                  guess: tbWinner.guess,
                  distance: tbWinner.distance,
                  over: tbWinner.over,
                },
                loser: {
                  userId: tbLoser.userId,
                  username: tbLoser.user.username,
                  firstName: tbLoser.user.firstName,
                  lastName: tbLoser.user.lastName,
                  avatarColor: tbLoser.user.avatarColor,
                  avatarType: tbLoser.user.avatarType,
                  avatarValue: tbLoser.user.avatarValue,
                  guess: tbLoser.guess,
                  distance: tbLoser.distance,
                  over: tbLoser.over,
                },
              };
            }
          }

          // If winner and loser are the same (only one person made picks), don't count it
          if (winner.user.id === loser.user.id) {
            return {
              week,
              winner: null,
              loser: null,
              tiebreaker: null,
              completed: true,
            };
          }

          return {
            week,
            winner: {
              userId: winner.user.id,
              username: winner.user.username,
              firstName: winner.user.firstName,
              lastName: winner.user.lastName,
              avatarColor: winner.user.avatarColor,
              avatarType: winner.user.avatarType,
              avatarValue: winner.user.avatarValue,
              correct: winner.correct,
              total: winner.total,
            },
            loser: {
              userId: loser.user.id,
              username: loser.user.username,
              firstName: loser.user.firstName,
              lastName: loser.user.lastName,
              avatarColor: loser.user.avatarColor,
              avatarType: loser.user.avatarType,
              avatarValue: loser.user.avatarValue,
              correct: loser.correct,
              total: loser.total,
            },
            tiebreaker,
            completed: true,
          };
        } catch (error) {
          console.error(`Error calculating week ${week}:`, error);
          return {
            week,
            winner: null,
            loser: null,
            tiebreaker: null,
            completed: false,
          };
        }
      })
    );

    return NextResponse.json({
      season,
      currentWeek,
      results,
    });
  } catch (error) {
    console.error('Standings error:', error);
    return NextResponse.json(
      { error: 'Failed to load standings' },
      { status: 500 }
    );
  }
}
