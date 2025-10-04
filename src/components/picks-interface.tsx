'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { 
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Save, 
  Lock,
  Clock,
  AlertCircle,
  Trophy,
  LogOut
} from 'lucide-react';
import { formatTime, getDayOfWeek } from '@/lib/utils';
import { ESPNGame } from '@/lib/espn-api';
import { getTeamLogoPath } from '@/lib/team-mappings';
import Image from 'next/image';
import { RandomPickGenerator } from '@/components/random-pick-generator';
import { UpsetAlerts } from '@/components/upset-alerts';

interface PicksInterfaceProps {
  user: {
    userId: number;
    username: string;
    firstName: string;
    lastName: string;
    isAdmin?: boolean;
  };
}

interface UserPick {
  gameId: string;
  pickedTeamId: string;
}

export function PicksInterface({ user }: PicksInterfaceProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [permissions, setPermissions] = useState({
    randomPicker: false,
    upsetAlerts: false,
    powerRankings: false,
    matchupSimulator: false,
  });
  const [week, setWeek] = useState(0);
  const [currentWeek, setCurrentWeek] = useState(0);
  const [season, setSeason] = useState(0);
  const [picks, setPicks] = useState<UserPick[]>([]);
  const [mondayGuess, setMondayGuess] = useState('');
  const [lockTime, setLockTime] = useState<Date | null>(null);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [games, setGames] = useState<ESPNGame[]>([]);

  useEffect(() => {
    fetchWeekGames();
    fetchPermissions();
  }, [week]);

  const fetchPermissions = async () => {
    try {
      const response = await fetch('/api/user/permissions');
      const data = await response.json();
      if (data.permissions) {
        setPermissions(data.permissions);
      }
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
    }
  };

  useEffect(() => {
    if (lockTime) {
      updateTimeRemaining(); // Run immediately
      const interval = setInterval(() => {
        updateTimeRemaining();
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [lockTime, week, currentWeek]);

  const fetchWeekGames = async () => {
    setLoading(true);
    setIsLocked(false); // Reset lock state when changing weeks
    try {
      const url = week > 0 
        ? `/api/games/current-week?week=${week}` 
        : '/api/games/current-week';
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load games');
      }

      setGames(data.games || []);
      setWeek(data.week);
      setCurrentWeek(data.currentWeek || data.week);
      setSeason(data.season);
      const newLockTime = data.lockTime ? new Date(data.lockTime) : null;
      setLockTime(newLockTime);

      // Load existing picks
      await loadUserPicks(data.week, data.season);
      
      // Immediately check lock status for the new week
      if (newLockTime) {
        const now = new Date();
        const diff = newLockTime.getTime() - now.getTime();
        
        // Past weeks are always locked
        if (data.week < (data.currentWeek || data.week)) {
          setIsLocked(true);
        } else if (diff <= 0) {
          setIsLocked(true);
        } else {
          setIsLocked(false);
        }
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUserPicks = async (weekNum: number, seasonYear: number) => {
    try {
      const response = await fetch(`/api/picks?week=${weekNum}&season=${seasonYear}`);
      const data = await response.json();

      if (response.ok && data.picks) {
        setPicks(data.picks.map((p: any) => ({
          gameId: p.gameId,
          pickedTeamId: p.pickedTeamId,
        })));
        setMondayGuess(data.mondayGuess?.toString() || '');
      }
    } catch (error) {
      console.error('Failed to load picks:', error);
    }
  };

  const updateTimeRemaining = () => {
    if (!lockTime) return;

    const now = new Date();
    const diff = lockTime.getTime() - now.getTime();

    // Past weeks are always locked
    if (week < currentWeek) {
      setIsLocked(true);
      setTimeRemaining('Past Week');
      return;
    }

    if (diff <= 0) {
      setIsLocked(true);
      setTimeRemaining('Picks Locked');
      return;
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
  };

  const handlePickTeam = (gameId: string, teamId: string) => {
    if (isLocked) {
      toast({
        title: 'Picks Locked',
        description: 'Cannot change picks after lock time',
        variant: 'destructive',
      });
      return;
    }

    setPicks(prev => {
      const existing = prev.find(p => p.gameId === gameId);
      if (existing) {
        return prev.map(p => 
          p.gameId === gameId ? { ...p, pickedTeamId: teamId } : p
        );
      }
      return [...prev, { gameId, pickedTeamId: teamId }];
    });
  };

  const handleSavePicks = async () => {
    if (isLocked) {
      toast({
        title: 'Picks Locked',
        description: 'Cannot save picks after lock time',
        variant: 'destructive',
      });
      return;
    }

    // Validate all games have picks
    if (picks.length < games.length) {
      toast({
        title: 'Incomplete Picks',
        description: 'Please pick a winner for all games',
        variant: 'destructive',
      });
      return;
    }

    // Validate Monday guess
    const mondayGames = games.filter(g => getDayOfWeek(g.date) === 'Monday');
    if (mondayGames.length > 0 && !mondayGuess) {
      toast({
        title: 'Monday Guess Required',
        description: 'Please enter your total points guess for Monday games',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);

    try {
      const response = await fetch('/api/picks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          week,
          season,
          picks,
          mondayGuess: mondayGuess ? parseInt(mondayGuess) : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save picks');
      }

      toast({
        title: 'Picks Saved! 🎉',
        description: 'Your picks have been saved successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  const getGamesByDay = () => {
    const gamesByDay = new Map<string, ESPNGame[]>();
    
    games.forEach(game => {
      const day = getDayOfWeek(game.date);
      if (!gamesByDay.has(day)) {
        gamesByDay.set(day, []);
      }
      gamesByDay.get(day)!.push(game);
    });

    return gamesByDay;
  };

  const getMondayGames = () => {
    return games.filter(g => getDayOfWeek(g.date) === 'Monday');
  };

  const getTeamPick = (gameId: string) => {
    return picks.find(p => p.gameId === gameId)?.pickedTeamId;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading games...</p>
        </div>
      </div>
    );
  }

  const gamesByDay = getGamesByDay();
  const mondayGames = getMondayGames();
  const dayOrder = ['Thursday', 'Friday', 'Saturday', 'Sunday', 'Monday'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/scores')}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setWeek(w => Math.max(1, w - 1))}
                  disabled={week <= 1 || loading}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl lg:text-2xl font-bold">Week {week} Picks</h1>
                    {week === currentWeek && (
                      <Badge variant="default" className="text-xs">Current Week</Badge>
                    )}
                    {week < currentWeek && (
                      <Badge variant="secondary" className="text-xs">Past</Badge>
                    )}
                    {week > currentWeek && (
                      <Badge variant="outline" className="text-xs">Future</Badge>
                    )}
                  </div>
                  <p className="text-xs lg:text-sm text-muted-foreground">
                    {user.firstName} {user.lastName} • {season} Season
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setWeek(w => Math.min(18, w + 1))}
                  disabled={week >= 18 || loading}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto">
              {!isLocked && lockTime && (
                <Badge variant="secondary" className="gap-2">
                  <Clock className="w-4 h-4" />
                  {timeRemaining}
                </Badge>
              )}
              {isLocked && (
                <Badge variant="destructive" className="gap-2">
                  <Lock className="w-4 h-4" />
                  Locked
                </Badge>
              )}
              {user.isAdmin && (
                <Button variant="default" size="sm" onClick={() => router.push('/admin')}>
                  <span className="sm:hidden">⚙️</span>
                  <span className="hidden sm:inline">⚙️ Admin</span>
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => router.push('/scores')}>
                <span className="sm:hidden">📊</span>
                <span className="hidden sm:inline">📊 Scores</span>
              </Button>
              <Button variant="outline" size="sm" onClick={() => router.push('/standings')}>
                <span className="sm:hidden">🏆</span>
                <span className="hidden sm:inline">🏆 Standings</span>
              </Button>
              <Button variant="outline" size="sm" onClick={() => router.push('/chat')}>
                <span className="sm:hidden">💬</span>
                <span className="hidden sm:inline">💬 Chat</span>
              </Button>
              <Button variant="outline" size="sm" onClick={() => router.push('/stats')}>
                <span className="sm:hidden">📈</span>
                <span className="hidden sm:inline">📈 Stats</span>
              </Button>
              <Button variant="outline" size="sm" onClick={() => router.push('/profile')}>
                <span className="sm:hidden">👤</span>
                <span className="hidden sm:inline">👤 Profile</span>
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline ml-2">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {isLocked && week < currentWeek && (
          <Card className="mb-6 border-secondary/50 bg-secondary/10">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <Lock className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-1">Past Week</h3>
                  <p className="text-sm text-muted-foreground">
                    You're viewing a past week. These picks are locked and cannot be changed.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {isLocked && week === currentWeek && (
          <Card className="mb-6 border-destructive/50 bg-destructive/10">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <Lock className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-destructive mb-1">Picks Are Locked</h3>
                  <p className="text-sm text-muted-foreground">
                    You can view your picks but cannot make changes. The first game has started or lock time has passed.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {week > currentWeek && (
          <Card className="mb-6 border-blue-500/50 bg-blue-500/10">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-500 mb-1">Future Week</h3>
                  <p className="text-sm text-muted-foreground">
                    You're making picks for a future week. You can come back and edit these until the week's lock time.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Fun Extras - Only show for current/future weeks and not locked */}
        {!isLocked && week >= currentWeek && games.length > 0 && (
          <div className="mb-8 space-y-6">
            {/* Random Pick Generator */}
            {permissions.randomPicker && (
              <RandomPickGenerator
                games={games}
                onPicksGenerated={(picksMap) => {
                  const newPicks: UserPick[] = [];
                  picksMap.forEach((teamId, gameId) => {
                    newPicks.push({ gameId, pickedTeamId: teamId });
                  });
                  setPicks(newPicks);
                }}
              />
            )}

            {/* Upset Alerts */}
            {permissions.upsetAlerts && <UpsetAlerts games={games} />}
          </div>
        )}

        {/* Games by Day */}
        {dayOrder.map(day => {
          const dayGames = gamesByDay.get(day);
          if (!dayGames || dayGames.length === 0) return null;

          return (
            <div key={day} className="mb-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span>{day}</span>
                <Badge variant="secondary">{dayGames.length} {dayGames.length === 1 ? 'game' : 'games'}</Badge>
              </h2>

              <div className="space-y-4">
                {dayGames.map(game => {
                  const homeTeam = game.competitions[0].competitors.find(c => c.homeAway === 'home');
                  const awayTeam = game.competitions[0].competitors.find(c => c.homeAway === 'away');
                  const userPick = getTeamPick(game.id);

                  if (!homeTeam || !awayTeam) return null;

                  return (
                    <Card key={game.id} className="overflow-hidden">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-sm text-muted-foreground">
                            {formatTime(game.date)}
                          </span>
                          {game.status.type.state === 'pre' && (
                            <Badge variant="outline">Upcoming</Badge>
                          )}
                        </div>

                        <div className="space-y-3">
                          {/* Away Team */}
                          <button
                            onClick={() => handlePickTeam(game.id, awayTeam.team.id)}
                            disabled={isLocked}
                            className={`w-full p-4 rounded-lg border-2 transition-all ${
                              userPick === awayTeam.team.id
                                ? 'border-primary bg-primary/10'
                                : 'border-border hover:border-primary/50'
                            } ${isLocked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 relative">
                                  <Image
                                    src={getTeamLogoPath(awayTeam.team.abbreviation)}
                                    alt={awayTeam.team.name}
                                    width={48}
                                    height={48}
                                    className="object-contain"
                                  />
                                </div>
                                <div className="text-left">
                                  <p className="font-semibold">{awayTeam.team.displayName}</p>
                                  <p className="text-sm text-muted-foreground">{awayTeam.team.abbreviation}</p>
                                </div>
                              </div>
                              {userPick === awayTeam.team.id && (
                                <Trophy className="w-5 h-5 text-primary" />
                              )}
                            </div>
                          </button>

                          {/* Home Team */}
                          <button
                            onClick={() => handlePickTeam(game.id, homeTeam.team.id)}
                            disabled={isLocked}
                            className={`w-full p-4 rounded-lg border-2 transition-all ${
                              userPick === homeTeam.team.id
                                ? 'border-primary bg-primary/10'
                                : 'border-border hover:border-primary/50'
                            } ${isLocked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 relative">
                                  <Image
                                    src={getTeamLogoPath(homeTeam.team.abbreviation)}
                                    alt={homeTeam.team.name}
                                    width={48}
                                    height={48}
                                    className="object-contain"
                                  />
                                </div>
                                <div className="text-left">
                                  <p className="font-semibold">{homeTeam.team.displayName}</p>
                                  <p className="text-sm text-muted-foreground">{homeTeam.team.abbreviation}</p>
                                </div>
                              </div>
                              {userPick === homeTeam.team.id && (
                                <Trophy className="w-5 h-5 text-primary" />
                              )}
                            </div>
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Monday Night Tie-breaker */}
        {mondayGames.length > 0 && (
          <Card className="mb-8 border-primary/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                Monday Night Tie-Breaker
              </CardTitle>
              <CardDescription>
                Total combined points from all Monday games (closest without going over wins)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-secondary/50 rounded-lg p-4">
                  <p className="text-sm font-semibold mb-2">Monday Games:</p>
                  {mondayGames.map(game => {
                    const homeTeam = game.competitions[0].competitors.find(c => c.homeAway === 'home');
                    const awayTeam = game.competitions[0].competitors.find(c => c.homeAway === 'away');
                    return (
                      <p key={game.id} className="text-sm text-muted-foreground">
                        {awayTeam?.team.abbreviation} @ {homeTeam?.team.abbreviation}
                      </p>
                    );
                  })}
                </div>

                <div>
                  <Label htmlFor="mondayGuess">Your Total Points Guess</Label>
                  <Input
                    id="mondayGuess"
                    type="number"
                    min="0"
                    max="200"
                    value={mondayGuess}
                    onChange={(e) => setMondayGuess(e.target.value)}
                    placeholder="Enter total points (e.g., 52)"
                    disabled={isLocked}
                    className="text-lg font-semibold"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Must be unique - if someone else has this number, you'll need to pick another
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Save Button */}
        <div className="flex gap-4 sticky bottom-4">
          <Button
            onClick={handleSavePicks}
            disabled={saving || isLocked || picks.length < games.length}
            className="flex-1"
            size="lg"
          >
            {saving ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Picks
              </>
            )}
          </Button>
        </div>

        {picks.length < games.length && (
          <div className="mt-4 bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                You have {games.length - picks.length} game{games.length - picks.length === 1 ? '' : 's'} left to pick
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
