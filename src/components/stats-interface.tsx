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
  TrendingUp,
  TrendingDown,
  LogOut,
  Calendar,
  Target,
  Award
} from 'lucide-react';
import { getInitials } from '@/lib/utils';

interface StatsInterfaceProps {
  user: {
    userId: number;
    username: string;
    firstName: string;
    lastName: string;
  };
}

interface UserStats {
  userId: number;
  username: string;
  firstName: string;
  lastName: string;
  avatarColor: string;
  totalWeeks: number;
  totalCorrect: number;
  totalIncorrect: number;
  winRate: number;
  bestWeek: number;
  worstWeek: number;
  currentStreak: number;
}

export function StatsInterface({ user }: StatsInterfaceProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<UserStats[]>([]);
  const [season, setSeason] = useState(0);
  const [currentWeek, setCurrentWeek] = useState(0);
  const [highlights, setHighlights] = useState<any>(null);
  const [lunchTracker, setLunchTracker] = useState<any[]>([]);
  const [currentWeekProgress, setCurrentWeekProgress] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load stats');
      }

      setStats(data.stats || []);
      setSeason(data.season);
      setCurrentWeek(data.currentWeek || 0);
      setHighlights(data.highlights || null);
      setLunchTracker(data.lunchTracker || []);
      setCurrentWeekProgress(data.currentWeekProgress || []);
      setAnalytics(data.analytics || []);
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
          <p className="text-muted-foreground">Loading statistics...</p>
        </div>
      </div>
    );
  }

  const currentUserStats = stats.find(s => s.userId === user.userId);
  const topPerformer = stats[0];

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
                onClick={() => router.push('/picks')}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold flex items-center gap-2">
                  <Trophy className="w-5 h-5 lg:w-6 lg:h-6" />
                  Season Statistics
                </h1>
                <p className="text-xs lg:text-sm text-muted-foreground">
                  {season} NFL Season
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
              <Button variant="outline" size="sm" onClick={() => router.push('/standings')}>
                <span className="sm:hidden">🏆</span>
                <span className="hidden sm:inline">🏆 Standings</span>
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
        {/* Your Stats Card */}
        {currentUserStats && (
          <Card className="mb-8 border-primary/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Your Season Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-1">
                    {currentUserStats.totalWeeks}
                  </div>
                  <p className="text-sm text-muted-foreground">Weeks Played</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-500 mb-1">
                    {currentUserStats.totalCorrect}
                  </div>
                  <p className="text-sm text-muted-foreground">Total Correct</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-500 mb-1">
                    {currentUserStats.winRate}%
                  </div>
                  <p className="text-sm text-muted-foreground">Win Rate</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-amber-500 mb-1">
                    {currentUserStats.bestWeek}
                  </div>
                  <p className="text-sm text-muted-foreground">Best Week</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Hot Streaks - Current Week Progress */}
        {currentWeekProgress.length > 0 && (
          <Card className="mb-8 border-orange-500/50 bg-gradient-to-r from-orange-500/5 to-red-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🔥 Week {currentWeek} Hot Streaks
              </CardTitle>
              <CardDescription>Who's on fire this week?</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentWeekProgress
                  .filter(p => p.isHotStreak && p.currentWeekFinished > 0)
                  .sort((a, b) => b.currentWeekFinished - a.currentWeekFinished)
                  .map((progress) => (
                    <div
                      key={progress.userId}
                      className="flex items-center gap-3 p-3 rounded-lg bg-orange-500/10 border-2 border-orange-500/30"
                    >
                      <Avatar className="w-10 h-10" style={{ backgroundColor: progress.avatarColor }}>
                        <AvatarFallback style={{ backgroundColor: progress.avatarColor, color: 'white' }}>
                          {getInitials(progress.firstName, progress.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold">{progress.firstName} {progress.lastName}</p>
                        <p className="text-sm text-orange-500 font-bold">
                          🔥 {progress.currentWeekCorrect}/{progress.currentWeekFinished} Perfect!
                        </p>
                      </div>
                    </div>
                  ))}
                {currentWeekProgress.filter(p => p.isHotStreak && p.currentWeekFinished > 0).length === 0 && (
                  <div className="col-span-full text-center py-4 text-muted-foreground">
                    No perfect streaks yet this week
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Overall Leaderboard */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                Overall Leaderboard
              </CardTitle>
              <CardDescription>Season-long performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {stats.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No data yet
                </p>
              ) : (
                stats.map((stat, index) => (
                  <div
                    key={stat.userId}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      stat.userId === user.userId
                        ? 'bg-primary/10 border-2 border-primary'
                        : 'bg-secondary/30'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="text-2xl font-bold w-8 text-center">
                        {index === 0 && '🥇'}
                        {index === 1 && '🥈'}
                        {index === 2 && '🥉'}
                        {index > 2 && <span className="text-muted-foreground">{index + 1}</span>}
                      </div>
                      <Avatar className="w-10 h-10" style={{ backgroundColor: stat.avatarColor }}>
                        <AvatarFallback style={{ backgroundColor: stat.avatarColor, color: 'white' }}>
                          {getInitials(stat.firstName, stat.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">
                          {stat.firstName} {stat.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {stat.totalCorrect} correct • {stat.winRate}% win rate
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-500">
                        {stat.totalCorrect}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        -{stat.totalIncorrect}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="space-y-6">
            {/* Best Performer */}
            {topPerformer && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-500" />
                    Top Performer
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16" style={{ backgroundColor: topPerformer.avatarColor }}>
                      <AvatarFallback style={{ backgroundColor: topPerformer.avatarColor, color: 'white' }}>
                        {getInitials(topPerformer.firstName, topPerformer.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-xl font-bold">
                        {topPerformer.firstName} {topPerformer.lastName}
                      </p>
                      <p className="text-muted-foreground">
                        Leading with {topPerformer.totalCorrect} correct picks
                      </p>
                    </div>
                    <Trophy className="w-8 h-8 text-amber-500" />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Season Highlights */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Season Highlights 🎉</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Most Improved */}
                <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="font-semibold">Most Improved</p>
                      {highlights?.mostImproved && (
                        <p className="text-xs text-muted-foreground">
                          {highlights.mostImproved.firstName} {highlights.mostImproved.lastName}
                        </p>
                      )}
                    </div>
                  </div>
                  {highlights?.mostImproved ? (
                    <div className="text-right">
                      <Badge variant="default" className="bg-green-500">
                        +{highlights.mostImproved.improvement}%
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        Week {highlights.mostImproved.fromWeek} → {highlights.mostImproved.toWeek}
                      </p>
                    </div>
                  ) : (
                    <Badge variant="secondary">No data yet</Badge>
                  )}
                </div>

                {/* Perfect Weeks */}
                <div className="p-3 bg-secondary/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    <span className="font-semibold">Perfect Weeks</span>
                  </div>
                  {highlights?.perfectWeeks && highlights.perfectWeeks.length > 0 ? (
                    <div className="space-y-2 mt-2">
                      {highlights.perfectWeeks.map((pw: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-6 h-6" style={{ backgroundColor: pw.avatarColor }}>
                              <AvatarFallback style={{ backgroundColor: pw.avatarColor, color: 'white', fontSize: '10px' }}>
                                {getInitials(pw.firstName, pw.lastName)}
                              </AvatarFallback>
                            </Avatar>
                            <span>{pw.firstName} {pw.lastName}</span>
                          </div>
                          <Badge variant="outline">
                            Week {pw.week} - {pw.correct}/{pw.correct}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground mt-1">
                      No perfect weeks yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Lunch Tracker */}
            <Card className="border-amber-500/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  🍔 Lunch Tracker
                </CardTitle>
                <CardDescription>
                  Who owes who lunch this season
                </CardDescription>
              </CardHeader>
              <CardContent>
                {lunchTracker.length > 0 ? (
                  <div className="space-y-2">
                    {lunchTracker.map((tracker) => (
                      <div key={tracker.userId} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10" style={{ backgroundColor: tracker.avatarColor }}>
                            <AvatarFallback style={{ backgroundColor: tracker.avatarColor, color: 'white' }}>
                              {getInitials(tracker.firstName, tracker.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">{tracker.firstName} {tracker.lastName}</p>
                            <p className="text-xs text-muted-foreground">
                              {tracker.wins}W - {tracker.losses}L
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          {tracker.net > 0 ? (
                            <Badge variant="default" className="bg-green-500">
                              +{tracker.net} 🍔
                            </Badge>
                          ) : tracker.net < 0 ? (
                            <Badge variant="destructive">
                              {tracker.net} 🍔
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              Even
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">
                      No completed weeks yet
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Advanced Analytics Section */}
        {analytics.length > 0 && (
          <>
            <h2 className="text-2xl font-bold mt-12 mb-6">📊 Advanced Analytics</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Longest Win Streak */}
              <Card className="border-green-500/50 bg-gradient-to-br from-green-500/5 to-emerald-500/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    📈 Longest Win Streaks
                  </CardTitle>
                  <CardDescription>Most correct picks in a row</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics
                      .sort((a, b) => b.bestStreak - a.bestStreak)
                      .slice(0, 5)
                      .map((a, idx) => (
                        <div key={a.userId} className="flex items-center justify-between p-3 rounded-lg bg-green-500/10">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl font-bold w-8">
                              {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}.`}
                            </span>
                            <Avatar className="w-10 h-10" style={{ backgroundColor: a.avatarColor }}>
                              <AvatarFallback style={{ backgroundColor: a.avatarColor, color: 'white' }}>
                                {getInitials(a.firstName, a.lastName)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-semibold">{a.firstName} {a.lastName}</span>
                          </div>
                          <Badge className="bg-green-500">
                            {a.bestStreak} in a row
                          </Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              {/* Longest Loss Streak */}
              <Card className="border-red-500/50 bg-gradient-to-br from-red-500/5 to-orange-500/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    📉 Longest Loss Streaks
                  </CardTitle>
                  <CardDescription>Most wrong picks in a row (ouch!)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics
                      .sort((a, b) => b.worstStreak - a.worstStreak)
                      .slice(0, 5)
                      .map((a, idx) => (
                        <div key={a.userId} className="flex items-center justify-between p-3 rounded-lg bg-red-500/10">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl font-bold w-8">
                              {idx === 0 ? '😬' : idx === 1 ? '😅' : idx === 2 ? '😓' : `${idx + 1}.`}
                            </span>
                            <Avatar className="w-10 h-10" style={{ backgroundColor: a.avatarColor }}>
                              <AvatarFallback style={{ backgroundColor: a.avatarColor, color: 'white' }}>
                                {getInitials(a.firstName, a.lastName)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-semibold">{a.firstName} {a.lastName}</span>
                          </div>
                          <Badge className="bg-red-500">
                            {a.worstStreak} wrong
                          </Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              {/* Hot Hand (3-week best) */}
              <Card className="border-orange-500/50 bg-gradient-to-br from-orange-500/5 to-yellow-500/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    🔥 Hot Hand Award
                  </CardTitle>
                  <CardDescription>Best 3-week stretch this season</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics
                      .filter(a => a.hotHand > 0)
                      .sort((a, b) => b.hotHand - a.hotHand)
                      .slice(0, 5)
                      .map((a, idx) => (
                        <div key={a.userId} className="flex items-center justify-between p-3 rounded-lg bg-orange-500/10">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl font-bold w-8">
                              {idx === 0 ? '🔥' : idx === 1 ? '🌟' : idx === 2 ? '⚡' : `${idx + 1}.`}
                            </span>
                            <Avatar className="w-10 h-10" style={{ backgroundColor: a.avatarColor }}>
                              <AvatarFallback style={{ backgroundColor: a.avatarColor, color: 'white' }}>
                                {getInitials(a.firstName, a.lastName)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold">{a.firstName} {a.lastName}</p>
                              {a.hotHandWeeks.length > 0 && (
                                <p className="text-xs text-muted-foreground">
                                  Weeks {a.hotHandWeeks.join(', ')}
                                </p>
                              )}
                            </div>
                          </div>
                          <Badge className="bg-orange-500">
                            {a.hotHand} correct
                          </Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              {/* Mr. Consistent */}
              <Card className="border-blue-500/50 bg-gradient-to-br from-blue-500/5 to-cyan-500/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    🎪 Mr. Consistent
                  </CardTitle>
                  <CardDescription>Smallest variance between best/worst weeks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics
                      .filter(a => a.consistency >= 0)
                      .sort((a, b) => a.consistency - b.consistency)
                      .slice(0, 5)
                      .map((a, idx) => (
                        <div key={a.userId} className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl font-bold w-8">
                              {idx === 0 ? '🎯' : idx === 1 ? '📊' : idx === 2 ? '⚖️' : `${idx + 1}.`}
                            </span>
                            <Avatar className="w-10 h-10" style={{ backgroundColor: a.avatarColor }}>
                              <AvatarFallback style={{ backgroundColor: a.avatarColor, color: 'white' }}>
                                {getInitials(a.firstName, a.lastName)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-semibold">{a.firstName} {a.lastName}</span>
                          </div>
                          <Badge className="bg-blue-500">
                            ±{a.consistency} variance
                          </Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
