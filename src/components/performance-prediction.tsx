'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown,
  Minus,
  Target,
  Zap,
  Brain,
  AlertCircle
} from 'lucide-react';

interface PredictionProps {
  username: string;
  weeklyPerformance: Array<{
    week: number;
    correct: number;
    total: number;
  }>;
  currentStreak: number;
  winRate: number;
}

function calculateTrend(performance: Array<{ correct: number; total: number }>) {
  if (performance.length < 2) return 0;
  
  const recent = performance.slice(-3);
  const older = performance.slice(-6, -3);
  
  if (older.length === 0) return 0;
  
  const recentAvg = recent.reduce((sum, w) => sum + (w.correct / w.total), 0) / recent.length;
  const olderAvg = older.reduce((sum, w) => sum + (w.correct / w.total), 0) / older.length;
  
  return recentAvg - olderAvg;
}

function predictNextWeek(performance: Array<{ correct: number; total: number }>, winRate: number, streak: number) {
  if (performance.length === 0) return { low: 5, mid: 6, high: 8 };
  
  const trend = calculateTrend(performance);
  const recentPerf = performance.slice(-3);
  const recentAvg = recentPerf.reduce((sum, w) => sum + (w.correct / w.total), 0) / recentPerf.length;
  
  // Base prediction on recent average
  let basePrediction = recentAvg * 10;
  
  // Adjust for trend
  basePrediction += trend * 10 * 0.3;
  
  // Adjust for streak (hot/cold)
  if (streak > 0) basePrediction += Math.min(streak * 0.2, 1);
  if (streak < 0) basePrediction -= Math.min(Math.abs(streak) * 0.2, 1);
  
  // Adjust for overall win rate
  basePrediction = (basePrediction * 0.7) + (winRate * 10 * 0.3);
  
  // Calculate range
  const mid = Math.max(0, Math.min(10, Math.round(basePrediction)));
  const low = Math.max(0, mid - 2);
  const high = Math.min(10, mid + 2);
  
  return { low, mid, high };
}

function getConfidence(performance: Array<{ correct: number; total: number }>, winRate: number) {
  if (performance.length < 3) return 'Low';
  
  const recentPerf = performance.slice(-5);
  const variance = recentPerf.reduce((sum, w) => {
    const rate = w.correct / w.total;
    return sum + Math.pow(rate - winRate, 2);
  }, 0) / recentPerf.length;
  
  if (variance < 0.03) return 'Very High';
  if (variance < 0.06) return 'High';
  if (variance < 0.1) return 'Medium';
  return 'Low';
}

function getInsights(
  trend: number,
  streak: number,
  winRate: number,
  performance: Array<{ correct: number; total: number }>
) {
  const insights = [];
  
  if (trend > 0.1) {
    insights.push({
      icon: TrendingUp,
      color: 'text-green-500',
      text: 'You\'re on an upward trend! Your recent picks are improving.',
    });
  } else if (trend < -0.1) {
    insights.push({
      icon: TrendingDown,
      color: 'text-red-500',
      text: 'Recent performance is declining. Time to analyze your strategy!',
    });
  } else {
    insights.push({
      icon: Minus,
      color: 'text-blue-500',
      text: 'Performance is stable. Consistency is key!',
    });
  }
  
  if (streak >= 3) {
    insights.push({
      icon: Zap,
      color: 'text-amber-500',
      text: `You're on fire with a ${streak} pick winning streak!`,
    });
  } else if (streak <= -3) {
    insights.push({
      icon: AlertCircle,
      color: 'text-orange-500',
      text: 'Cold streak detected. Consider researching matchups more carefully.',
    });
  }
  
  if (winRate > 0.65) {
    insights.push({
      icon: Target,
      color: 'text-purple-500',
      text: 'Elite performance! You\'re outperforming most of the league.',
    });
  } else if (winRate < 0.45) {
    insights.push({
      icon: Brain,
      color: 'text-cyan-500',
      text: 'Room for improvement. Try going against popular picks occasionally.',
    });
  }
  
  return insights;
}

export function PerformancePrediction({
  username,
  weeklyPerformance,
  currentStreak,
  winRate,
}: PredictionProps) {
  const prediction = predictNextWeek(weeklyPerformance, winRate, currentStreak);
  const trend = calculateTrend(weeklyPerformance);
  const confidence = getConfidence(weeklyPerformance, winRate);
  const insights = getInsights(trend, currentStreak, winRate, weeklyPerformance);
  
  const trendDirection = trend > 0.05 ? 'up' : trend < -0.05 ? 'down' : 'stable';
  
  return (
    <Card className="overflow-hidden border-2 border-primary/20">
      <CardHeader className="bg-gradient-to-r from-purple-500/10 to-blue-500/10">
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-purple-500" />
          AI Performance Prediction
        </CardTitle>
        <CardDescription>
          Based on your last {weeklyPerformance.length} weeks of picks
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        
        {/* Next Week Prediction */}
        <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Next Week Prediction</h3>
            <Badge variant="outline">
              {confidence} Confidence
            </Badge>
          </div>
          
          <div className="flex items-end justify-center gap-4 mb-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Pessimistic</p>
              <p className="text-2xl font-bold text-muted-foreground">{prediction.low}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Expected</p>
              <p className="text-5xl font-bold text-primary">{prediction.mid}</p>
              <p className="text-xs text-muted-foreground">out of 10</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Optimistic</p>
              <p className="text-2xl font-bold text-muted-foreground">{prediction.high}</p>
            </div>
          </div>
          
          <Progress value={(prediction.mid / 10) * 100} className="h-2" />
          
          <p className="text-sm text-center text-muted-foreground mt-3">
            Based on your recent form, we predict <span className="font-semibold text-foreground">{prediction.mid}</span> correct picks next week
          </p>
        </div>

        {/* Trend Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-secondary/30 rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-1">Current Trend</p>
            <div className="flex items-center gap-2">
              {trendDirection === 'up' && <TrendingUp className="w-5 h-5 text-green-500" />}
              {trendDirection === 'down' && <TrendingDown className="w-5 h-5 text-red-500" />}
              {trendDirection === 'stable' && <Minus className="w-5 h-5 text-blue-500" />}
              <p className="text-xl font-bold capitalize">{trendDirection}</p>
            </div>
          </div>
          
          <div className="bg-secondary/30 rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-1">Current Streak</p>
            <div className="flex items-center gap-2">
              {currentStreak > 0 && <Zap className="w-5 h-5 text-amber-500" />}
              {currentStreak < 0 && <AlertCircle className="w-5 h-5 text-orange-500" />}
              {currentStreak === 0 && <Minus className="w-5 h-5 text-gray-500" />}
              <p className="text-xl font-bold">
                {currentStreak > 0 ? '+' : ''}{currentStreak}
              </p>
            </div>
          </div>
          
          <div className="bg-secondary/30 rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-1">Win Rate</p>
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-500" />
              <p className="text-xl font-bold">{(winRate * 100).toFixed(1)}%</p>
            </div>
          </div>
        </div>

        {/* Insights */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Brain className="w-4 h-4" />
            AI Insights
          </h3>
          <div className="space-y-3">
            {insights.map((insight, idx) => {
              const Icon = insight.icon;
              return (
                <div key={idx} className="flex items-start gap-3 p-3 bg-secondary/20 rounded-lg">
                  <Icon className={`w-5 h-5 ${insight.color} mt-0.5`} />
                  <p className="text-sm">{insight.text}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="text-xs text-muted-foreground text-center pt-4 border-t border-border">
          <p>
            Predictions are based on statistical analysis of your pick history.
            Past performance doesn't guarantee future results. 🏈
          </p>
        </div>

      </CardContent>
    </Card>
  );
}
