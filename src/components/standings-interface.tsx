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
  Trophy,
  ThumbsDown,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { UserAvatar } from '@/components/user-avatar';

interface StandingsInterfaceProps {
  user: {
    userId: number;
    username: string;
    firstName: string;
    lastName: string;
  };
}

interface WeeklyResult {
  week: number;
  winner: {
    userId: number;
    username: string;
    firstName: string;
    lastName: string;
    avatarColor: string;
    correct: number;
    total: number;
  } | null;
  loser: {
    userId: number;
    username: string;
    firstName: string;
    lastName: string;
    avatarColor: string;
    correct: number;
    total: number;
  } | null;
  tiebreaker: {
    winner: any;
    loser: any;
    actualTotal: number;
  } | null;
  completed: boolean;
}

export function StandingsInterface({ user }: StandingsInterfaceProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<WeeklyResult[]>([]);
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [currentWeek, setCurrentWeek] = useState(0);
  const [season, setSeason] = useState(0);

  useEffect(() => {
    fetchStandings();
  }, []);

  const fetchStandings = async () => {
    try {
      const response = await fetch('/api/standings');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load standings');
      }

      setResults(data.results || []);
      setCurrentWeek(data.currentWeek);
      setSelectedWeek(data.currentWeek);
      setSeason(data.season);
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

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading standings...</p>
        </div>
      </div>
    );
  }

  const selectedResult = results.find(r => r.week === selectedWeek);
  
  // Calculate overall lunch debts
  const lunchDebts = new Map<number, { wins: number; losses: number }>();
  results.forEach(result => {
    if (result.winner && result.loser && result.completed) {
      const winnerId = result.winner.userId;
      const loserId = result.loser.userId;
      
      if (!lunchDebts.has(winnerId)) {
        lunchDebts.set(winnerId, { wins: 0, losses: 0 });
      }
      if (!lunchDebts.has(loserId)) {
        lunchDebts.set(loserId, { wins: 0, losses: 0 });
      }
      
      lunchDebts.get(winnerId)!.wins++;
      lunchDebts.get(loserId)!.losses++;
    }
  });

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
              <div>
                <h1 className="text-xl lg:text-2xl font-bold">Weekly Standings</h1>
                <p className="text-xs lg:text-sm text-muted-foreground">
                  {user.firstName} {user.lastName} • {season} Season
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto">
              <Button variant="outline" size="sm" onClick={() => router.push('/picks')}>
                <span className="sm:hidden">🏈</span>
                <span className="hidden sm:inline">🏈 Picks</span>
              </Button>
              <Button variant="outline" size="sm" onClick={() => router.push('/scores')}>
                <span className="sm:hidden">📊</span>
                <span className="hidden sm:inline">📊 Scores</span>
              </Button>
              <Button variant="outline" size="sm" onClick={() => router.push('/stats')}>
                <span className="sm:hidden">📈</span>
                <span className="hidden sm:inline">📈 Stats</span>
              </Button>
              <Button variant="outline" size="sm" onClick={() => router.push('/chat')}>
                <span className="sm:hidden">💬</span>
                <span className="hidden sm:inline">💬 Chat</span>
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
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Week Selector */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Select Week</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedWeek(w => Math.max(1, w - 1))}
                      disabled={selectedWeek <= 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Badge variant={selectedWeek === currentWeek ? 'default' : 'secondary'}>
                      Week {selectedWeek}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedWeek(w => Math.min(18, w + 1))}
                      disabled={selectedWeek >= 18}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Week Results */}
          {selectedResult && (
            <>
              {/* Winner */}
              <div className="lg:col-span-3">
                <Card className="border-amber-500/50 bg-gradient-to-br from-amber-500/10 to-transparent">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="w-6 h-6 text-amber-500" />
                      Week {selectedResult.week} Winner
                    </CardTitle>
                    <CardDescription>Most correct picks</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {selectedResult.winner ? (
                      <div className="flex items-center gap-4">
                        <UserAvatar
                          firstName={selectedResult.winner.firstName}
                          lastName={selectedResult.winner.lastName}
                          avatarType={selectedResult.winner.avatarType}
                          avatarValue={selectedResult.winner.avatarValue}
                          avatarColor={selectedResult.winner.avatarColor}
                          size="xl"
                        />
                        <div className="flex-1">
                          <p className="text-2xl font-bold">
                            {selectedResult.winner.firstName} {selectedResult.winner.lastName}
                          </p>
                          <p className="text-muted-foreground">
                            {selectedResult.winner.correct} correct out of {selectedResult.winner.total} games
                          </p>
                        </div>
                        <Badge variant="default" className="text-lg px-4 py-2">
                          {Math.round((selectedResult.winner.correct / selectedResult.winner.total) * 100)}%
                        </Badge>
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-4">
                        {selectedResult.completed ? 'No clear winner yet' : 'Week not yet completed'}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Loser */}
              <div className="lg:col-span-3">
                <Card className="border-red-500/50 bg-gradient-to-br from-red-500/10 to-transparent">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ThumbsDown className="w-6 h-6 text-red-500" />
                      Week {selectedResult.week} Loser
                    </CardTitle>
                    <CardDescription>Fewest correct picks (owes lunch!)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {selectedResult.loser ? (
                      <div className="flex items-center gap-4">
                        <UserAvatar
                          firstName={selectedResult.loser.firstName}
                          lastName={selectedResult.loser.lastName}
                          avatarType={selectedResult.loser.avatarType}
                          avatarValue={selectedResult.loser.avatarValue}
                          avatarColor={selectedResult.loser.avatarColor}
                          size="xl"
                        />
                        <div className="flex-1">
                          <p className="text-2xl font-bold">
                            {selectedResult.loser.firstName} {selectedResult.loser.lastName}
                          </p>
                          <p className="text-muted-foreground">
                            {selectedResult.loser.correct} correct out of {selectedResult.loser.total} games
                          </p>
                        </div>
                        <Badge variant="destructive" className="text-lg px-4 py-2">
                          {Math.round((selectedResult.loser.correct / selectedResult.loser.total) * 100)}%
                        </Badge>
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-4">
                        {selectedResult.completed ? 'No clear loser yet' : 'Week not yet completed'}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Monday Night Tiebreaker */}
              {selectedResult.tiebreaker && (
                <div className="lg:col-span-3">
                  <Card className="border-blue-500/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        🌙 Monday Night Tiebreaker
                      </CardTitle>
                      <CardDescription>
                        Actual total: {selectedResult.tiebreaker.actualTotal} points
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {selectedResult.tiebreaker.winner && (
                        <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                          <p className="text-sm font-semibold text-green-500 mb-2">Closest Guess</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <UserAvatar
                                firstName={selectedResult.tiebreaker.winner.firstName}
                                lastName={selectedResult.tiebreaker.winner.lastName}
                                avatarType={selectedResult.tiebreaker.winner.avatarType}
                                avatarValue={selectedResult.tiebreaker.winner.avatarValue}
                                avatarColor={selectedResult.tiebreaker.winner.avatarColor}
                                size="sm"
                              />
                              <span className="font-semibold">
                                {selectedResult.tiebreaker.winner.firstName} {selectedResult.tiebreaker.winner.lastName}
                              </span>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-lg">{selectedResult.tiebreaker.winner.guess}</p>
                              <p className="text-xs text-muted-foreground">
                                {selectedResult.tiebreaker.winner.over ? 'Over by' : 'Under by'} {selectedResult.tiebreaker.winner.distance}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {selectedResult.tiebreaker.loser && (
                        <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/30">
                          <p className="text-sm font-semibold text-red-500 mb-2">Farthest Guess</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <UserAvatar
                                firstName={selectedResult.tiebreaker.loser.firstName}
                                lastName={selectedResult.tiebreaker.loser.lastName}
                                avatarType={selectedResult.tiebreaker.loser.avatarType}
                                avatarValue={selectedResult.tiebreaker.loser.avatarValue}
                                avatarColor={selectedResult.tiebreaker.loser.avatarColor}
                                size="sm"
                              />
                              <span className="font-semibold">
                                {selectedResult.tiebreaker.loser.firstName} {selectedResult.tiebreaker.loser.lastName}
                              </span>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-lg">{selectedResult.tiebreaker.loser.guess}</p>
                              <p className="text-xs text-muted-foreground">
                                Off by {selectedResult.tiebreaker.loser.distance}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </>
          )}

          {/* Overall Lunch Tracker */}
          <div className="lg:col-span-3">
            <Card className="border-amber-500/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🍔 Season Lunch Tracker
                </CardTitle>
                <CardDescription>
                  Who owes who lunch this season
                </CardDescription>
              </CardHeader>
              <CardContent>
                {lunchDebts.size > 0 ? (
                  <div className="space-y-2">
                    {Array.from(lunchDebts.entries())
                      .sort((a, b) => (b[1].wins - b[1].losses) - (a[1].wins - a[1].losses))
                      .map(([userId, record]) => {
                        const result = results.find(r => r.winner?.userId === userId || r.loser?.userId === userId);
                        const userInfo = result?.winner?.userId === userId ? result.winner : result?.loser;
                        if (!userInfo) return null;

                        const netLunches = record.wins - record.losses;
                        
                        return (
                          <div key={userId} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                            <div className="flex items-center gap-3">
                              <UserAvatar
                                firstName={userInfo.firstName}
                                lastName={userInfo.lastName}
                                avatarType={userInfo.avatarType}
                                avatarValue={userInfo.avatarValue}
                                avatarColor={userInfo.avatarColor}
                                size="md"
                              />
                              <div>
                                <p className="font-semibold">{userInfo.firstName} {userInfo.lastName}</p>
                                <p className="text-xs text-muted-foreground">
                                  {record.wins}W - {record.losses}L
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              {netLunches > 0 ? (
                                <Badge variant="default" className="bg-green-500">
                                  +{netLunches} 🍔
                                </Badge>
                              ) : netLunches < 0 ? (
                                <Badge variant="destructive">
                                  {netLunches} 🍔
                                </Badge>
                              ) : (
                                <Badge variant="secondary">
                                  Even
                                </Badge>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No completed weeks yet
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
