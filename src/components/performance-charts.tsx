'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, PieChart as PieChartIcon, BarChart3, Activity } from 'lucide-react';

interface PerformanceChartsProps {
  userAnalytics: any;
  allAnalytics: any[];
  userName: string;
}

const COLORS = {
  primary: '#3b82f6',
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
  purple: '#8b5cf6',
  cyan: '#06b6d4',
};

export function PerformanceCharts({ userAnalytics, allAnalytics, userName }: PerformanceChartsProps) {
  if (!userAnalytics || !userAnalytics.weeklyPerformance) {
    return null;
  }

  // Prepare weekly performance data
  const weeklyData = userAnalytics.weeklyPerformance
    .filter((w: any) => w.total > 0)
    .map((w: any) => ({
      week: `Week ${w.week}`,
      correct: w.correct,
      incorrect: w.total - w.correct,
      winRate: w.total > 0 ? Math.round((w.correct / w.total) * 100) : 0,
    }));

  // Prepare cumulative data for area chart
  let cumulative = 0;
  const cumulativeData = weeklyData.map((w: any) => {
    cumulative += w.correct;
    return {
      week: w.week,
      totalCorrect: cumulative,
    };
  });

  // Prepare pie chart data
  const totalCorrect = userAnalytics.weeklyPerformance.reduce((sum: number, w: any) => sum + w.correct, 0);
  const totalGames = userAnalytics.weeklyPerformance.reduce((sum: number, w: any) => sum + w.total, 0);
  const totalIncorrect = totalGames - totalCorrect;
  
  const pieData = [
    { name: 'Correct', value: totalCorrect, color: COLORS.success },
    { name: 'Incorrect', value: totalIncorrect, color: COLORS.danger },
  ];

  // Find top performer for comparison
  const topPerformer = allAnalytics
    .sort((a, b) => {
      const aCorrect = a.weeklyPerformance.reduce((sum: number, w: any) => sum + w.correct, 0);
      const bCorrect = b.weeklyPerformance.reduce((sum: number, w: any) => sum + w.correct, 0);
      return bCorrect - aCorrect;
    })[0];

  const topPerformerCorrect = topPerformer?.weeklyPerformance.reduce((sum: number, w: any) => sum + w.correct, 0) || 0;
  const topPerformerGames = topPerformer?.weeklyPerformance.reduce((sum: number, w: any) => sum + w.total, 0) || 0;
  const topPerformerWinRate = topPerformerGames > 0 ? Math.round((topPerformerCorrect / topPerformerGames) * 100) : 0;

  const comparisonData = [
    {
      category: 'Total Correct',
      you: totalCorrect,
      topPerformer: topPerformerCorrect,
    },
    {
      category: 'Win Rate %',
      you: totalGames > 0 ? Math.round((totalCorrect / totalGames) * 100) : 0,
      topPerformer: topPerformerWinRate,
    },
    {
      category: 'Best Streak',
      you: userAnalytics.bestStreak || 0,
      topPerformer: topPerformer?.bestStreak || 0,
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mt-12 mb-6">📊 Performance Charts</h2>

      {/* Weekly Performance Line Chart */}
      <Card className="border-blue-500/50 bg-gradient-to-br from-blue-500/5 to-cyan-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            Weekly Performance Trend
          </CardTitle>
          <CardDescription>Your correct picks by week</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="week" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="correct"
                stroke={COLORS.success}
                strokeWidth={3}
                dot={{ fill: COLORS.success, r: 5 }}
                activeDot={{ r: 7 }}
                name="Correct Picks"
              />
              <Line
                type="monotone"
                dataKey="winRate"
                stroke={COLORS.primary}
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: COLORS.primary, r: 4 }}
                name="Win Rate %"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Season Progression Area Chart */}
        <Card className="border-purple-500/50 bg-gradient-to-br from-purple-500/5 to-pink-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-500" />
              Season Progression
            </CardTitle>
            <CardDescription>Cumulative correct picks over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={cumulativeData}>
                <defs>
                  <linearGradient id="colorCorrect" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.purple} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={COLORS.purple} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="week" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="totalCorrect"
                  stroke={COLORS.purple}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorCorrect)"
                  name="Total Correct"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Win Rate Pie Chart */}
        <Card className="border-green-500/50 bg-gradient-to-br from-green-500/5 to-emerald-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-green-500" />
              Overall Performance
            </CardTitle>
            <CardDescription>Correct vs Incorrect picks</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Comparison Bar Chart */}
      {topPerformer && (
        <Card className="border-orange-500/50 bg-gradient-to-br from-orange-500/5 to-yellow-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-orange-500" />
              You vs Top Performer
            </CardTitle>
            <CardDescription>
              Comparing your stats with {topPerformer.firstName} {topPerformer.lastName}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="category" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Legend />
                <Bar dataKey="you" fill={COLORS.cyan} name={userName} radius={[8, 8, 0, 0]} />
                <Bar dataKey="topPerformer" fill={COLORS.warning} name="Top Performer" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
