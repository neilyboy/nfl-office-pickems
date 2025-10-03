'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EarnedBadge, BADGES } from '@/lib/badges';
import { Trophy, Lock, Star, Award } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface BadgeDisplayProps {
  earnedBadges: EarnedBadge[];
  compact?: boolean;
}

const RARITY_STYLES = {
  common: 'border-gray-500/50 bg-gray-500/10',
  rare: 'border-blue-500/50 bg-blue-500/10',
  epic: 'border-purple-500/50 bg-purple-500/10',
  legendary: 'border-amber-500/50 bg-amber-500/10 shadow-lg shadow-amber-500/20',
};

const RARITY_LABELS = {
  common: 'Common',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
};

export function BadgeDisplay({ earnedBadges, compact = false }: BadgeDisplayProps) {
  const allBadges = Object.values(BADGES);
  const earnedIds = new Set(earnedBadges.map(eb => eb.badge.id));

  if (compact) {
    // Compact view for profile page
    return (
      <div className="flex flex-wrap gap-2">
        {earnedBadges.slice(0, 8).map((earnedBadge) => (
          <TooltipProvider key={earnedBadge.badge.id}>
            <Tooltip>
              <TooltipTrigger>
                <div
                  className={`p-2 rounded-lg border-2 ${RARITY_STYLES[earnedBadge.badge.rarity]} hover:scale-110 transition-transform cursor-pointer`}
                  style={{ borderColor: earnedBadge.badge.color + '80' }}
                >
                  <span className="text-2xl">{earnedBadge.badge.icon}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-center">
                  <p className="font-bold">{earnedBadge.badge.name}</p>
                  <p className="text-xs text-muted-foreground">{earnedBadge.badge.description}</p>
                  {earnedBadge.metadata && (
                    <p className="text-xs mt-1 text-primary">
                      {earnedBadge.metadata.count && `${earnedBadge.metadata.count}x`}
                      {earnedBadge.metadata.streak && `${earnedBadge.metadata.streak} streak`}
                      {earnedBadge.metadata.totalCorrect && `${earnedBadge.metadata.totalCorrect} correct`}
                    </p>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
        {earnedBadges.length > 8 && (
          <div className="p-2 px-3 rounded-lg border-2 border-dashed border-muted bg-muted/10 flex items-center">
            <span className="text-sm text-muted-foreground">+{earnedBadges.length - 8}</span>
          </div>
        )}
      </div>
    );
  }

  // Full trophy case view for stats page
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" />
            Trophy Case
          </h3>
          <p className="text-sm text-muted-foreground">
            {earnedBadges.length} of {allBadges.length} badges earned
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-3 py-1">
          <Star className="w-4 h-4 mr-1 text-amber-500 fill-amber-500" />
          {earnedBadges.length}
        </Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {allBadges.map((badge) => {
          const earned = earnedBadges.find(eb => eb.badge.id === badge.id);
          const isEarned = !!earned;

          return (
            <TooltipProvider key={badge.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Card
                    className={`relative overflow-hidden transition-all ${
                      isEarned
                        ? `${RARITY_STYLES[badge.rarity]} hover:scale-105 cursor-pointer`
                        : 'opacity-50 grayscale border-dashed'
                    }`}
                    style={isEarned ? { borderColor: badge.color + '80' } : {}}
                  >
                    <CardContent className="p-4 text-center">
                      {!isEarned && (
                        <div className="absolute top-2 right-2">
                          <Lock className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                      
                      <div className="mb-2">
                        <span className="text-4xl">{badge.icon}</span>
                      </div>
                      
                      <h4 className="font-bold text-sm mb-1">{badge.name}</h4>
                      
                      {isEarned && (
                        <Badge
                          variant="secondary"
                          className="text-xs"
                          style={{ backgroundColor: badge.color + '30', color: badge.color }}
                        >
                          {RARITY_LABELS[badge.rarity]}
                        </Badge>
                      )}
                      
                      {!isEarned && (
                        <p className="text-xs text-muted-foreground mt-1">Locked</p>
                      )}
                    </CardContent>
                  </Card>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <div>
                    <p className="font-bold mb-1">{badge.name}</p>
                    <p className="text-xs text-muted-foreground mb-2">{badge.description}</p>
                    {earned?.metadata && (
                      <div className="text-xs border-t border-border pt-2 mt-2">
                        {earned.metadata.count && (
                          <p>Achieved: <span className="text-primary">{earned.metadata.count} times</span></p>
                        )}
                        {earned.metadata.weeks && (
                          <p>Weeks: <span className="text-primary">{earned.metadata.weeks.join(', ')}</span></p>
                        )}
                        {earned.metadata.streak && (
                          <p>Streak: <span className="text-primary">{earned.metadata.streak} in a row</span></p>
                        )}
                        {earned.metadata.totalCorrect && (
                          <p>Total: <span className="text-primary">{earned.metadata.totalCorrect} correct</span></p>
                        )}
                        {earned.metadata.improvement && (
                          <p>Improvement: <span className="text-primary">{earned.metadata.improvement}%</span></p>
                        )}
                        {earned.metadata.variance !== undefined && (
                          <p>Variance: <span className="text-primary">±{earned.metadata.variance}</span></p>
                        )}
                        {earned.metadata.weeksPlayed && (
                          <p>Weeks: <span className="text-primary">{earned.metadata.weeksPlayed} straight</span></p>
                        )}
                        {earned.metadata.perfectGuesses && (
                          <p>Perfect Guesses: <span className="text-primary">{earned.metadata.perfectGuesses}</span></p>
                        )}
                        {earned.metadata.hotHand && (
                          <p>Hot Hand: <span className="text-primary">{earned.metadata.hotHand} in 3 weeks</span></p>
                        )}
                      </div>
                    )}
                    {!isEarned && (
                      <p className="text-xs text-amber-500 mt-2">🔒 Complete this achievement to unlock!</p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
    </div>
  );
}
