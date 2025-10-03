export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export const BADGES: Record<string, Badge> = {
  PERFECT_WEEK: {
    id: 'PERFECT_WEEK',
    name: 'Perfect Week',
    description: 'Got every pick correct in a single week',
    icon: '🌟',
    color: '#fbbf24', // yellow
    rarity: 'epic',
  },
  HOT_STREAK: {
    id: 'HOT_STREAK',
    name: 'Hot Streak',
    description: '5 or more correct picks in a row',
    icon: '🔥',
    color: '#f97316', // orange
    rarity: 'rare',
  },
  COMEBACK_KID: {
    id: 'COMEBACK_KID',
    name: 'Comeback Kid',
    description: 'Biggest week-to-week improvement of the season',
    icon: '📈',
    color: '#10b981', // green
    rarity: 'rare',
  },
  UNDERDOG_KING: {
    id: 'UNDERDOG_KING',
    name: 'Underdog King',
    description: 'Made the most against-the-crowd winning picks',
    icon: '👑',
    color: '#a855f7', // purple
    rarity: 'epic',
  },
  MR_CONSISTENT: {
    id: 'MR_CONSISTENT',
    name: 'Mr. Consistent',
    description: 'Most consistent weekly performance (lowest variance)',
    icon: '🎯',
    color: '#3b82f6', // blue
    rarity: 'rare',
  },
  IRON_MAN: {
    id: 'IRON_MAN',
    name: 'Iron Man',
    description: 'Made picks for every single week',
    icon: '💪',
    color: '#ef4444', // red
    rarity: 'epic',
  },
  FIRST_BLOOD: {
    id: 'FIRST_BLOOD',
    name: 'First Blood',
    description: 'First to submit picks in a week (5+ times)',
    icon: '⚔️',
    color: '#dc2626', // dark red
    rarity: 'rare',
  },
  CLUTCH_MASTER: {
    id: 'CLUTCH_MASTER',
    name: 'Clutch Master',
    description: 'Made accurate Monday night total guesses (5+ perfect)',
    icon: '🎪',
    color: '#ec4899', // pink
    rarity: 'legendary',
  },
  CENTURY_CLUB: {
    id: 'CENTURY_CLUB',
    name: 'Century Club',
    description: 'Reached 100+ correct picks in the season',
    icon: '💯',
    color: '#8b5cf6', // violet
    rarity: 'epic',
  },
  SURVIVOR: {
    id: 'SURVIVOR',
    name: 'Survivor',
    description: 'Longest streak without a wrong pick (10+)',
    icon: '🛡️',
    color: '#06b6d4', // cyan
    rarity: 'legendary',
  },
};

export interface EarnedBadge {
  badge: Badge;
  earnedAt: Date | string;
  progress?: number; // For badges with thresholds
  metadata?: any; // Extra info like streak count, week number, etc.
}

export function calculateUserBadges(analytics: any, allAnalytics: any[]): EarnedBadge[] {
  const earnedBadges: EarnedBadge[] = [];

  if (!analytics) return earnedBadges;

  // 1. Perfect Week - Check if user has any perfect weeks
  const perfectWeeks = analytics.weeklyPerformance?.filter((w: any) => 
    w.total > 0 && w.correct === w.total
  ) || [];
  if (perfectWeeks.length > 0) {
    earnedBadges.push({
      badge: BADGES.PERFECT_WEEK,
      earnedAt: new Date().toISOString(),
      metadata: { 
        count: perfectWeeks.length,
        weeks: perfectWeeks.map((w: any) => w.week)
      },
    });
  }

  // 2. Hot Streak - 5+ correct in a row
  if (analytics.bestStreak >= 5) {
    earnedBadges.push({
      badge: BADGES.HOT_STREAK,
      earnedAt: new Date().toISOString(),
      metadata: { streak: analytics.bestStreak },
    });
  }

  // 3. Comeback Kid - Check if this user has the best improvement
  const topImprovement = allAnalytics
    .map((a: any) => {
      const weeks = a.weeklyPerformance?.filter((w: any) => w.total > 0) || [];
      let maxImprovement = 0;
      for (let i = 1; i < weeks.length; i++) {
        const prevRate = weeks[i-1].total > 0 ? weeks[i-1].correct / weeks[i-1].total : 0;
        const currRate = weeks[i].total > 0 ? weeks[i].correct / weeks[i].total : 0;
        const improvement = currRate - prevRate;
        maxImprovement = Math.max(maxImprovement, improvement);
      }
      return { userId: a.userId, improvement: maxImprovement };
    })
    .sort((a: any, b: any) => b.improvement - a.improvement)[0];
  
  if (topImprovement?.userId === analytics.userId && topImprovement.improvement > 0.2) {
    earnedBadges.push({
      badge: BADGES.COMEBACK_KID,
      earnedAt: new Date().toISOString(),
      metadata: { improvement: Math.round(topImprovement.improvement * 100) },
    });
  }

  // 4. Mr. Consistent - Lowest variance (already calculated)
  const topConsistent = allAnalytics
    .filter((a: any) => a.consistency !== undefined)
    .sort((a: any, b: any) => a.consistency - b.consistency)[0];
  
  if (topConsistent?.userId === analytics.userId && analytics.consistency < 2) {
    earnedBadges.push({
      badge: BADGES.MR_CONSISTENT,
      earnedAt: new Date().toISOString(),
      metadata: { variance: analytics.consistency },
    });
  }

  // 5. Iron Man - Never missed a week
  const totalWeeks = analytics.weeklyPerformance?.length || 0;
  const weeksWithPicks = analytics.weeklyPerformance?.filter((w: any) => w.total > 0).length || 0;
  if (totalWeeks > 0 && totalWeeks === weeksWithPicks && totalWeeks >= 5) {
    earnedBadges.push({
      badge: BADGES.IRON_MAN,
      earnedAt: new Date().toISOString(),
      metadata: { weeksPlayed: totalWeeks },
    });
  }

  // 6. Clutch Master - 5+ perfect Monday guesses
  if (analytics.clutchFactor >= 5) {
    earnedBadges.push({
      badge: BADGES.CLUTCH_MASTER,
      earnedAt: new Date().toISOString(),
      metadata: { perfectGuesses: analytics.clutchFactor },
    });
  }

  // 7. Century Club - 100+ correct picks
  const totalCorrect = analytics.weeklyPerformance?.reduce((sum: number, w: any) => sum + w.correct, 0) || 0;
  if (totalCorrect >= 100) {
    earnedBadges.push({
      badge: BADGES.CENTURY_CLUB,
      earnedAt: new Date().toISOString(),
      metadata: { totalCorrect },
    });
  }

  // 8. Survivor - 10+ correct streak
  if (analytics.bestStreak >= 10) {
    earnedBadges.push({
      badge: BADGES.SURVIVOR,
      earnedAt: new Date().toISOString(),
      metadata: { streak: analytics.bestStreak },
    });
  }

  // 9. Hot Hand Award - Best 3-week stretch
  if (analytics.hotHand >= 30) { // ~10 per week for 3 weeks
    earnedBadges.push({
      badge: BADGES.UNDERDOG_KING,
      earnedAt: new Date().toISOString(),
      metadata: { hotHand: analytics.hotHand },
    });
  }

  return earnedBadges;
}
