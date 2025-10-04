/**
 * CSV Export Utilities
 * Generate CSV files from stats data
 */

interface StatsData {
  userId: number;
  username: string;
  firstName: string;
  lastName: string;
  correct: number;
  incorrect: number;
  winRate: number;
  currentStreak: number;
  bestStreak: number;
  clutchFactor: number;
  totalPicks: number;
}

interface WeeklyPerformance {
  week: number;
  correct: number;
  total: number;
}

/**
 * Convert data to CSV format
 */
function arrayToCSV(data: any[], headers: string[]): string {
  const csvRows = [];
  
  // Add headers
  csvRows.push(headers.join(','));
  
  // Add data rows
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header];
      // Escape quotes and wrap in quotes if contains comma
      const escaped = String(value).replace(/"/g, '""');
      return escaped.includes(',') ? `"${escaped}"` : escaped;
    });
    csvRows.push(values.join(','));
  });
  
  return csvRows.join('\n');
}

/**
 * Download CSV file
 */
function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('hidden', '');
  a.setAttribute('href', url);
  a.setAttribute('download', filename);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

/**
 * Export season stats to CSV
 */
export function exportSeasonStats(stats: StatsData[], season: number) {
  const headers = [
    'username',
    'firstName',
    'lastName',
    'correct',
    'incorrect',
    'totalPicks',
    'winRate',
    'currentStreak',
    'bestStreak',
    'clutchFactor',
  ];
  
  const data = stats.map(s => ({
    username: s.username,
    firstName: s.firstName,
    lastName: s.lastName,
    correct: s.correct,
    incorrect: s.incorrect,
    totalPicks: s.totalPicks,
    winRate: `${s.winRate.toFixed(1)}%`,
    currentStreak: s.currentStreak,
    bestStreak: s.bestStreak,
    clutchFactor: s.clutchFactor,
  }));
  
  const csv = arrayToCSV(data, headers);
  downloadCSV(csv, `nfl-pickems-season-${season}-stats.csv`);
}

/**
 * Export weekly performance to CSV
 */
export function exportWeeklyPerformance(
  weeklyData: WeeklyPerformance[],
  username: string,
  season: number
) {
  const headers = ['week', 'correct', 'total', 'percentage'];
  
  const data = weeklyData.map(w => ({
    week: w.week,
    correct: w.correct,
    total: w.total,
    percentage: `${((w.correct / w.total) * 100).toFixed(1)}%`,
  }));
  
  const csv = arrayToCSV(data, headers);
  downloadCSV(csv, `${username}-weekly-performance-${season}.csv`);
}

/**
 * Export full leaderboard with detailed stats
 */
export function exportDetailedLeaderboard(stats: any[], season: number, week: number) {
  const headers = [
    'rank',
    'username',
    'firstName',
    'lastName',
    'correct',
    'incorrect',
    'winRate',
    'currentStreak',
    'bestStreak',
    'totalPoints',
    'avgWeeklyScore',
    'clutchFactor',
    'consistency',
  ];
  
  const sortedStats = [...stats].sort((a, b) => b.correct - a.correct);
  
  const data = sortedStats.map((s, index) => ({
    rank: index + 1,
    username: s.username,
    firstName: s.firstName,
    lastName: s.lastName,
    correct: s.correct,
    incorrect: s.incorrect,
    winRate: `${s.winRate.toFixed(1)}%`,
    currentStreak: s.currentStreak,
    bestStreak: s.bestStreak,
    totalPoints: s.correct, // Could be customized
    avgWeeklyScore: s.totalPicks > 0 ? (s.correct / (s.totalPicks / 10)).toFixed(1) : '0.0',
    clutchFactor: s.clutchFactor,
    consistency: s.winRate > 60 ? 'High' : s.winRate > 50 ? 'Medium' : 'Low',
  }));
  
  const csv = arrayToCSV(data, headers);
  downloadCSV(csv, `leaderboard-week-${week}-season-${season}.csv`);
}
