'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, Trophy, Flame, Zap } from 'lucide-react';
import { UserAvatar } from '@/components/user-avatar';

interface PowerRankingsProps {
  stats: Array<{
    userId: number;
    username: string;
    firstName: string;
    lastName: string;
    avatarColor: string;
    avatarType?: string;
    avatarValue?: string | null;
    totalCorrect: number;
    totalIncorrect: number;
    winRate: number;
    currentStreak: number;
  }>;
  analytics: Array<{
    userId: number;
    weeklyPerformance: Array<{ week: number; correct: number; total: number }>;
  }>;
}

interface RankedUser {
  rank: number;
  previousRank: number;
  user: PowerRankingsProps['stats'][0];
  momentum: number;
  trend: 'up' | 'down' | 'stable';
  recentForm: string;
  powerScore: number;
}

function calculatePowerRankings(
  stats: PowerRankingsProps['stats'],
  analytics: PowerRankingsProps['analytics']
): RankedUser[] {
  const rankedUsers = stats.map((user, index) => {
    const userAnalytics = analytics.find(a => a.userId === user.userId);
    const recentWeeks = userAnalytics?.weeklyPerformance.slice(-3) || [];
    
    // Calculate momentum based on recent 3 weeks
    let momentum = 0;
    if (recentWeeks.length >= 2) {
      const recent = recentWeeks.slice(-2);
      const older = recentWeeks.slice(0, -1);
      
      const recentAvg = recent.reduce((sum, w) => sum + (w.total > 0 ? w.correct / w.total : 0), 0) / recent.length;
      const olderAvg = older.reduce((sum, w) => sum + (w.total > 0 ? w.correct / w.total : 0), 0) / older.length;
      
      momentum = (recentAvg - olderAvg) * 100;
    }

    // Calculate recent form string (W/L for last 3 weeks)
    const recentForm = recentWeeks
      .slice(-3)
      .map(w => {
        if (w.total === 0) return '-';
        const pct = w.correct / w.total;
        return pct >= 0.6 ? 'W' : pct >= 0.4 ? 'D' : 'L';
      })
      .join('');

    // Calculate power score (combination of win rate, streak, and momentum)
    const winRateScore = user.winRate;
    const streakScore = Math.min(user.currentStreak * 2, 20); // Max 20 points from streak
    const momentumScore = momentum * 0.5; // Momentum contributes up to 10 points
    const powerScore = winRateScore + streakScore + momentumScore;

    // Determine trend
    let trend: 'up' | 'down' | 'stable';
    if (momentum > 5) trend = 'up';
    else if (momentum < -5) trend = 'down';
    else trend = 'stable';

    return {
      rank: index + 1,
      previousRank: index + 1, // Will be updated
      user,
      momentum,
      trend,
      recentForm,
      powerScore,
    };
  });

  // Sort by power score
  rankedUsers.sort((a, b) => b.powerScore - a.powerScore);

  // Update ranks and calculate rank changes
  rankedUsers.forEach((user, index) => {
    const newRank = index + 1;
    user.previousRank = user.rank;
    user.rank = newRank;
  });

  return rankedUsers;
}

export function PowerRankings({ stats, analytics }: PowerRankingsProps) {
  const rankings = calculatePowerRankings(stats, analytics);

  const getTrendIcon = (trend: 'up' | 'down' | 'stable', momentum: number) => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  const getMomentumBadge = (momentum: number) => {
    if (momentum > 10) return { label: 'Hot', color: 'bg-orange-500', icon: '🔥' };
    if (momentum > 5) return { label: 'Rising', color: 'bg-green-500', icon: '📈' };
    if (momentum < -10) return { label: 'Cold', color: 'bg-blue-500', icon: '🧊' };
    if (momentum < -5) return { label: 'Falling', color: 'bg-red-500', icon: '📉' };
    return { label: 'Steady', color: 'bg-gray-500', icon: '➡️' };
  };

  return (
    <Card className="border-primary/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            <CardTitle>📊 Weekly Power Rankings</CardTitle>
          </div>
          <Badge variant="secondary">Live</Badge>
        </div>
        <CardDescription>
          Rankings based on performance, momentum, and recent form
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-2">
          {rankings.map((ranked, idx) => {
            const rankChange = ranked.previousRank - ranked.rank;
            const momentumBadge = getMomentumBadge(ranked.momentum);
            
            return (
              <div
                key={ranked.user.userId}
                className={`
                  p-4 rounded-lg border transition-all
                  ${idx === 0 ? 'border-yellow-500/50 bg-gradient-to-r from-yellow-500/10 to-orange-500/10' : ''}
                  ${idx === 1 ? 'border-gray-400/50 bg-gradient-to-r from-gray-400/10 to-gray-500/10' : ''}
                  ${idx === 2 ? 'border-amber-700/50 bg-gradient-to-r from-amber-700/10 to-amber-800/10' : ''}
                  ${idx > 2 ? 'border-border hover:border-primary/50' : ''}
                `}
              >
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div className="flex flex-col items-center w-12 shrink-0">
                    <span className={`
                      text-2xl font-bold
                      ${idx === 0 ? 'text-yellow-500' : ''}
                      ${idx === 1 ? 'text-gray-400' : ''}
                      ${idx === 2 ? 'text-amber-700' : ''}
                    `}>
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${ranked.rank}`}
                    </span>
                    {rankChange !== 0 && (
                      <Badge
                        variant="secondary"
                        className={`
                          text-xs mt-1
                          ${rankChange > 0 ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}
                        `}
                      >
                        {rankChange > 0 ? '+' : ''}{rankChange}
                      </Badge>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <UserAvatar
                      firstName={ranked.user.firstName}
                      lastName={ranked.user.lastName}
                      avatarType={ranked.user.avatarType}
                      avatarValue={ranked.user.avatarValue}
                      avatarColor={ranked.user.avatarColor}
                      size="md"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">
                        {ranked.user.firstName} {ranked.user.lastName}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{ranked.user.winRate.toFixed(1)}% Win Rate</span>
                        {ranked.user.currentStreak !== 0 && (
                          <>
                            <span>•</span>
                            <span className={ranked.user.currentStreak > 0 ? 'text-green-500' : 'text-red-500'}>
                              {Math.abs(ranked.user.currentStreak)} {ranked.user.currentStreak > 0 ? 'W' : 'L'} Streak
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="hidden sm:flex items-center gap-4">
                    {/* Recent Form */}
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">Form</p>
                      <div className="flex gap-0.5">
                        {ranked.recentForm.split('').map((result, i) => (
                          <div
                            key={i}
                            className={`
                              w-5 h-5 rounded flex items-center justify-center text-xs font-bold
                              ${result === 'W' ? 'bg-green-500 text-white' : ''}
                              ${result === 'D' ? 'bg-yellow-500 text-white' : ''}
                              ${result === 'L' ? 'bg-red-500 text-white' : ''}
                              ${result === '-' ? 'bg-muted text-muted-foreground' : ''}
                            `}
                          >
                            {result}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Momentum */}
                    <div className="flex items-center gap-2">
                      {getTrendIcon(ranked.trend, ranked.momentum)}
                      <Badge className={momentumBadge.color}>
                        {momentumBadge.icon} {momentumBadge.label}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
          <p className="font-semibold mb-2">How Rankings Work:</p>
          <ul className="space-y-1 ml-4">
            <li>• <strong>Power Score</strong> = Win Rate + Streak Bonus + Momentum</li>
            <li>• <strong>Momentum</strong> measures improvement over last 3 weeks</li>
            <li>• <strong>Form</strong> shows W/L/D for recent weeks (60%+ = W, 40-60% = D, &lt;40% = L)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
