'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { 
  ArrowLeft, 
  RefreshCw,
  Trophy,
  LogOut,
  TrendingUp,
  Users,
  Activity
} from 'lucide-react';
import { formatTime, getDayOfWeek, getInitials } from '@/lib/utils';
import { ESPNGame } from '@/lib/espn-api';
import { getTeamLogoPath } from '@/lib/team-mappings';
import Image from 'next/image';

interface LiveScoresProps {
  user: {
    userId: number;
    username: string;
    firstName: string;
    lastName: string;
  };
}

interface GameWithPicks extends ESPNGame {
  userPick?: string;
  totalPicks?: {
    homeCount: number;
    awayCount: number;
  };
}

interface UserStanding {
  userId: number;
  username: string;
  firstName: string;
  lastName: string;
  avatarColor: string;
  correct: number;
  incorrect: number;
  remaining: number;
  mondayGuess: number | null;
}

export function LiveScores({ user }: LiveScoresProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [games, setGames] = useState<GameWithPicks[]>([]);
  const [standings, setStandings] = useState<UserStanding[]>([]);
  const [week, setWeek] = useState(0);
  const [season, setSeason] = useState(0);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchScores();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchScores(true);
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const fetchScores = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      const response = await fetch('/api/scores/live');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load scores');
      }

      setGames(data.games || []);
      setStandings(data.standings || []);
      setWeek(data.week);
      setSeason(data.season);
      setLastUpdate(new Date());
    } catch (error: any) {
      if (!silent) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  const getGameStatus = (game: ESPNGame) => {
    const status = game.status.type.state;
    if (status === 'pre') return { label: 'Upcoming', color: 'secondary' };
    if (status === 'in') return { label: 'LIVE', color: 'destructive' };
    if (status === 'post') return { label: 'Final', color: 'default' };
    return { label: status, color: 'secondary' };
  };

  const isPickCorrect = (game: ESPNGame, userPick: string | undefined) => {
    if (!userPick || game.status.type.state !== 'post') return null;
    
    const homeTeam = game.competitions[0].competitors.find(c => c.homeAway === 'home');
    const awayTeam = game.competitions[0].competitors.find(c => c.homeAway === 'away');
    
    if (!homeTeam || !awayTeam) return null;
    
    const homeScore = parseInt(homeTeam.score || '0');
    const awayScore = parseInt(awayTeam.score || '0');
    
    const winnerId = homeScore > awayScore ? homeTeam.team.id : awayTeam.team.id;
    
    return winnerId === userPick;
  };

  const getGamesByDay = () => {
    const gamesByDay = new Map<string, GameWithPicks[]>();
    
    games.forEach(game => {
      const day = getDayOfWeek(game.date);
      if (!gamesByDay.has(day)) {
        gamesByDay.set(day, []);
      }
      gamesByDay.get(day)!.push(game);
    });

    return gamesByDay;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading live scores...</p>
        </div>
      </div>
    );
  }

  const gamesByDay = getGamesByDay();
  const dayOrder = ['Thursday', 'Friday', 'Saturday', 'Sunday', 'Monday'];
  const currentStanding = standings.find(s => s.userId === user.userId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/picks')}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Week {week} Live Scores</h1>
                <p className="text-sm text-muted-foreground">
                  {season} Season • Updated {lastUpdate.toLocaleTimeString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => router.push('/picks')}>
                🏈 Picks
              </Button>
              <Button variant="outline" size="sm" onClick={() => router.push('/standings')}>
                🏆 Standings
              </Button>
              <Button variant="outline" size="sm" onClick={() => router.push('/chat')}>
                💬 Chat
              </Button>
              <Button variant="outline" size="sm" onClick={() => router.push('/stats')}>
                📈 Stats
              </Button>
              <Button variant="outline" size="sm" onClick={() => router.push('/profile')}>
                👤 Profile
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchScores()}
                disabled={refreshing}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Games */}
          <div className="lg:col-span-2 space-y-6">
            {/* Your Stats */}
            {currentStanding && (
              <Card className="border-primary/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-primary" />
                    Your Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-500">{currentStanding.correct}</div>
                      <p className="text-xs text-muted-foreground">Correct</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-red-500">{currentStanding.incorrect}</div>
                      <p className="text-xs text-muted-foreground">Incorrect</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-muted-foreground">{currentStanding.remaining}</div>
                      <p className="text-xs text-muted-foreground">Remaining</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Games by Day */}
            {dayOrder.map(day => {
              const dayGames = gamesByDay.get(day);
              if (!dayGames || dayGames.length === 0) return null;

              return (
                <div key={day}>
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <span>{day}</span>
                    <Badge variant="secondary">{dayGames.length}</Badge>
                  </h2>

                  <div className="space-y-4">
                    {dayGames.map(game => {
                      const homeTeam = game.competitions[0].competitors.find(c => c.homeAway === 'home');
                      const awayTeam = game.competitions[0].competitors.find(c => c.homeAway === 'away');
                      const status = getGameStatus(game);
                      const pickCorrect = isPickCorrect(game, game.userPick);

                      if (!homeTeam || !awayTeam) return null;

                      const homeScore = parseInt(homeTeam.score || '0');
                      const awayScore = parseInt(awayTeam.score || '0');

                      return (
                        <Card key={game.id} className="overflow-hidden">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-sm text-muted-foreground">
                                {formatTime(game.date)}
                              </span>
                              <Badge variant={status.color as any}>
                                {status.label}
                              </Badge>
                            </div>

                            {/* Away Team */}
                            <div className={`flex items-center justify-between p-3 rounded-lg mb-2 ${
                              game.userPick === awayTeam.team.id ? 'bg-primary/10 border-2 border-primary' : 'bg-secondary/30'
                            }`}>
                              <div className="flex items-center gap-3 flex-1">
                                <div className="w-10 h-10 relative">
                                  <Image
                                    src={getTeamLogoPath(awayTeam.team.abbreviation)}
                                    alt={awayTeam.team.name}
                                    width={40}
                                    height={40}
                                    className="object-contain"
                                  />
                                </div>
                                <div className="flex-1">
                                  <p className="font-semibold">{awayTeam.team.displayName}</p>
                                  {game.totalPicks && (
                                    <p className="text-xs text-muted-foreground">
                                      {game.totalPicks.awayCount} pick{game.totalPicks.awayCount !== 1 ? 's' : ''}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="text-3xl font-bold">{awayTeam.score || '-'}</div>
                            </div>

                            {/* Home Team */}
                            <div className={`flex items-center justify-between p-3 rounded-lg ${
                              game.userPick === homeTeam.team.id ? 'bg-primary/10 border-2 border-primary' : 'bg-secondary/30'
                            }`}>
                              <div className="flex items-center gap-3 flex-1">
                                <div className="w-10 h-10 relative">
                                  <Image
                                    src={getTeamLogoPath(homeTeam.team.abbreviation)}
                                    alt={homeTeam.team.name}
                                    width={40}
                                    height={40}
                                    className="object-contain"
                                  />
                                </div>
                                <div className="flex-1">
                                  <p className="font-semibold">{homeTeam.team.displayName}</p>
                                  {game.totalPicks && (
                                    <p className="text-xs text-muted-foreground">
                                      {game.totalPicks.homeCount} pick{game.totalPicks.homeCount !== 1 ? 's' : ''}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="text-3xl font-bold">{homeTeam.score || '-'}</div>
                            </div>

                            {/* Game Status Details */}
                            {game.status.type.state === 'in' && (
                              <div className="mt-3 text-center text-sm text-muted-foreground">
                                {game.status.type.detail}
                              </div>
                            )}

                            {/* Pick Result */}
                            {pickCorrect !== null && (
                              <div className={`mt-3 text-center py-2 rounded-lg ${
                                pickCorrect ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                              }`}>
                                <p className="text-sm font-semibold">
                                  {pickCorrect ? '✓ Correct Pick!' : '✗ Incorrect'}
                                </p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column - Leaderboard */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Leaderboard
                </CardTitle>
                <CardDescription>Week {week} Standings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {standings.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No picks yet
                  </p>
                ) : (
                  standings.map((standing, index) => (
                    <div
                      key={standing.userId}
                      className={`flex items-center gap-3 p-3 rounded-lg ${
                        standing.userId === user.userId ? 'bg-primary/10 border-2 border-primary' : 'bg-secondary/30'
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="text-lg font-bold w-6 text-center text-muted-foreground">
                          {index + 1}
                        </div>
                        <Avatar className="w-8 h-8" style={{ backgroundColor: standing.avatarColor }}>
                          <AvatarFallback style={{ backgroundColor: standing.avatarColor, color: 'white' }}>
                            {getInitials(standing.firstName, standing.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">
                            {standing.firstName} {standing.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {standing.correct}-{standing.incorrect}
                            {standing.remaining > 0 && ` (${standing.remaining} left)`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-500">
                          {standing.correct}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Auto-refresh indicator */}
        <div className="fixed bottom-4 right-4">
          <Badge variant="secondary" className="gap-2">
            <Activity className={`w-3 h-3 ${autoRefresh ? 'animate-pulse text-green-500' : ''}`} />
            Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
          </Badge>
        </div>
      </main>
    </div>
  );
}
