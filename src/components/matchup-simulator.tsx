'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Swords, Trophy, TrendingUp } from 'lucide-react';
import { UserAvatar } from '@/components/user-avatar';

interface MatchupSimulatorProps {
  users: Array<{
    userId: number;
    username: string;
    firstName: string;
    lastName: string;
    avatarColor: string;
    avatarType?: string;
    avatarValue?: string | null;
  }>;
  stats: Array<{
    userId: number;
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

interface MatchupResult {
  player1: any;
  player2: any;
  player1WinChance: number;
  player2WinChance: number;
  expectedDifference: number;
  insights: string[];
}

export function MatchupSimulator({ users, stats, analytics }: MatchupSimulatorProps) {
  const [player1Id, setPlayer1Id] = useState<number | null>(null);
  const [player2Id, setPlayer2Id] = useState<number | null>(null);
  const [result, setResult] = useState<MatchupResult | null>(null);

  const simulateMatchup = () => {
    if (!player1Id || !player2Id || player1Id === player2Id) return;

    const p1User = users.find(u => u.userId === player1Id)!;
    const p2User = users.find(u => u.userId === player2Id)!;
    const p1Stats = stats.find(s => s.userId === player1Id)!;
    const p2Stats = stats.find(s => s.userId === player2Id)!;
    const p1Analytics = analytics.find(a => a.userId === player1Id);
    const p2Analytics = analytics.find(a => a.userId === player2Id);

    // Calculate recent form (last 3 weeks)
    const p1Recent = p1Analytics?.weeklyPerformance.slice(-3) || [];
    const p2Recent = p2Analytics?.weeklyPerformance.slice(-3) || [];

    const p1RecentAvg = p1Recent.length > 0
      ? p1Recent.reduce((sum, w) => sum + (w.total > 0 ? w.correct / w.total : 0), 0) / p1Recent.length
      : 0;
    const p2RecentAvg = p2Recent.length > 0
      ? p2Recent.reduce((sum, w) => sum + (w.total > 0 ? w.correct / w.total : 0), 0) / p2Recent.length
      : 0;

    // Calculate win chance based on multiple factors
    let p1Score = 0;
    let p2Score = 0;
    const insights: string[] = [];

    // Factor 1: Overall win rate (40% weight)
    p1Score += (p1Stats.winRate / 100) * 40;
    p2Score += (p2Stats.winRate / 100) * 40;

    if (p1Stats.winRate > p2Stats.winRate + 5) {
      insights.push(`${p1User.firstName} has better overall win rate (${p1Stats.winRate.toFixed(1)}% vs ${p2Stats.winRate.toFixed(1)}%)`);
    } else if (p2Stats.winRate > p1Stats.winRate + 5) {
      insights.push(`${p2User.firstName} has better overall win rate (${p2Stats.winRate.toFixed(1)}% vs ${p1Stats.winRate.toFixed(1)}%)`);
    }

    // Factor 2: Recent form (30% weight)
    p1Score += p1RecentAvg * 30;
    p2Score += p2RecentAvg * 30;

    if (p1RecentAvg > p2RecentAvg + 0.1) {
      insights.push(`${p1User.firstName} has hot recent form`);
    } else if (p2RecentAvg > p1RecentAvg + 0.1) {
      insights.push(`${p2User.firstName} has hot recent form`);
    }

    // Factor 3: Current streak (20% weight)
    const p1StreakBonus = Math.min(Math.abs(p1Stats.currentStreak) * 2, 20);
    const p2StreakBonus = Math.min(Math.abs(p2Stats.currentStreak) * 2, 20);

    if (p1Stats.currentStreak > 0) p1Score += p1StreakBonus;
    if (p2Stats.currentStreak > 0) p2Score += p2StreakBonus;
    if (p1Stats.currentStreak < 0) p1Score -= p1StreakBonus / 2;
    if (p2Stats.currentStreak < 0) p2Score -= p2StreakBonus / 2;

    if (p1Stats.currentStreak >= 3) {
      insights.push(`${p1User.firstName} is on a ${p1Stats.currentStreak}-pick winning streak 🔥`);
    } else if (p2Stats.currentStreak >= 3) {
      insights.push(`${p2User.firstName} is on a ${p2Stats.currentStreak}-pick winning streak 🔥`);
    }

    // Factor 4: Consistency (10% weight)
    const p1Variance = p1Recent.length > 1
      ? p1Recent.reduce((sum, w) => {
          const rate = w.total > 0 ? w.correct / w.total : 0;
          return sum + Math.pow(rate - p1RecentAvg, 2);
        }, 0) / p1Recent.length
      : 0;
    
    const p2Variance = p2Recent.length > 1
      ? p2Recent.reduce((sum, w) => {
          const rate = w.total > 0 ? w.correct / w.total : 0;
          return sum + Math.pow(rate - p2RecentAvg, 2);
        }, 0) / p2Recent.length
      : 0;

    if (p1Variance < p2Variance && p1Variance < 0.05) {
      p1Score += 10;
      insights.push(`${p1User.firstName} is very consistent week-to-week`);
    } else if (p2Variance < p1Variance && p2Variance < 0.05) {
      p2Score += 10;
      insights.push(`${p2User.firstName} is very consistent week-to-week`);
    }

    // Normalize to percentages
    const total = p1Score + p2Score;
    const p1WinChance = (p1Score / total) * 100;
    const p2WinChance = (p2Score / total) * 100;

    // Expected difference (in a 10-pick week)
    const expectedDifference = Math.abs((p1WinChance - p2WinChance) / 10);

    setResult({
      player1: { ...p1User, ...p1Stats },
      player2: { ...p2User, ...p2Stats },
      player1WinChance: Math.round(p1WinChance),
      player2WinChance: Math.round(p2WinChance),
      expectedDifference: Math.round(expectedDifference * 10) / 10,
      insights,
    });
  };

  const availableP2Users = player1Id
    ? users.filter(u => u.userId !== player1Id)
    : users;

  return (
    <Card className="border-blue-500/50 bg-gradient-to-br from-blue-500/5 to-purple-500/5">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Swords className="w-5 h-5 text-blue-500" />
          <CardTitle>⚔️ Head-to-Head Matchup Simulator</CardTitle>
        </div>
        <CardDescription>
          Predict who would win in a direct matchup
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Player 1</label>
            <Select value={player1Id?.toString()} onValueChange={(val) => setPlayer1Id(parseInt(val))}>
              <SelectTrigger>
                <SelectValue placeholder="Select player..." />
              </SelectTrigger>
              <SelectContent>
                {users.map(user => (
                  <SelectItem key={user.userId} value={user.userId.toString()}>
                    {user.firstName} {user.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Player 2</label>
            <Select
              value={player2Id?.toString()}
              onValueChange={(val) => setPlayer2Id(parseInt(val))}
              disabled={!player1Id}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select player..." />
              </SelectTrigger>
              <SelectContent>
                {availableP2Users.map(user => (
                  <SelectItem key={user.userId} value={user.userId.toString()}>
                    {user.firstName} {user.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          onClick={simulateMatchup}
          disabled={!player1Id || !player2Id || player1Id === player2Id}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500"
          size="lg"
        >
          <Swords className="w-5 h-5 mr-2" />
          Simulate Matchup
        </Button>

        {result && (
          <div className="space-y-4 mt-6">
            <div className="grid grid-cols-2 gap-4">
              {/* Player 1 */}
              <div className={`
                p-4 rounded-lg border-2 transition-all
                ${result.player1WinChance > result.player2WinChance 
                  ? 'border-green-500 bg-green-500/10' 
                  : 'border-border'
                }
              `}>
                <div className="flex flex-col items-center gap-2">
                  <UserAvatar
                    firstName={result.player1.firstName}
                    lastName={result.player1.lastName}
                    avatarType={result.player1.avatarType}
                    avatarValue={result.player1.avatarValue}
                    avatarColor={result.player1.avatarColor}
                    size="lg"
                  />
                  <p className="font-semibold text-center">
                    {result.player1.firstName}
                  </p>
                  <Badge
                    className={`
                      text-lg px-4 py-1
                      ${result.player1WinChance > result.player2WinChance 
                        ? 'bg-green-500' 
                        : 'bg-secondary'
                      }
                    `}
                  >
                    {result.player1WinChance}%
                  </Badge>
                  {result.player1WinChance > result.player2WinChance && (
                    <Trophy className="w-6 h-6 text-yellow-500" />
                  )}
                </div>
              </div>

              {/* Player 2 */}
              <div className={`
                p-4 rounded-lg border-2 transition-all
                ${result.player2WinChance > result.player1WinChance 
                  ? 'border-green-500 bg-green-500/10' 
                  : 'border-border'
                }
              `}>
                <div className="flex flex-col items-center gap-2">
                  <UserAvatar
                    firstName={result.player2.firstName}
                    lastName={result.player2.lastName}
                    avatarType={result.player2.avatarType}
                    avatarValue={result.player2.avatarValue}
                    avatarColor={result.player2.avatarColor}
                    size="lg"
                  />
                  <p className="font-semibold text-center">
                    {result.player2.firstName}
                  </p>
                  <Badge
                    className={`
                      text-lg px-4 py-1
                      ${result.player2WinChance > result.player1WinChance 
                        ? 'bg-green-500' 
                        : 'bg-secondary'
                      }
                    `}
                  >
                    {result.player2WinChance}%
                  </Badge>
                  {result.player2WinChance > result.player1WinChance && (
                    <Trophy className="w-6 h-6 text-yellow-500" />
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Analysis
              </p>
              <p className="text-sm text-muted-foreground mb-3">
                Expected difference: <strong>{result.expectedDifference} picks</strong> in a 10-game week
              </p>
              <div className="space-y-2">
                {result.insights.map((insight, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-blue-500 text-xs mt-0.5">▸</span>
                    <p className="text-xs text-muted-foreground">{insight}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground text-center p-3 rounded-lg bg-muted/50">
          🎯 Simulation based on win rate, recent form, streaks, and consistency
        </div>
      </CardContent>
    </Card>
  );
}
