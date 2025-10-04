'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingDown, Zap } from 'lucide-react';
import { ESPNGame } from '@/lib/espn-api';
import Image from 'next/image';

interface UpsetAlertsProps {
  games: ESPNGame[];
}

interface UpsetPrediction {
  game: ESPNGame;
  favoriteTeam: any;
  underdogTeam: any;
  upsetProbability: number;
  reasons: string[];
  severity: 'low' | 'medium' | 'high';
}

function calculateUpsetProbability(game: ESPNGame): UpsetPrediction | null {
  const homeTeam = game.competitions[0].competitors.find(c => c.homeAway === 'home');
  const awayTeam = game.competitions[0].competitors.find(c => c.homeAway === 'away');
  
  if (!homeTeam || !awayTeam || !homeTeam.record || !awayTeam.record) {
    return null;
  }

  // Parse records (W-L format)
  const homeRecord = homeTeam.record[0]?.summary?.split('-') || ['0', '0'];
  const awayRecord = awayTeam.record[0]?.summary?.split('-') || ['0', '0'];
  
  const homeWins = parseInt(homeRecord[0]);
  const homeLosses = parseInt(homeRecord[1]);
  const awayWins = parseInt(awayRecord[0]);
  const awayLosses = parseInt(awayRecord[1]);

  const homeWinPct = homeWins / (homeWins + homeLosses || 1);
  const awayWinPct = awayWins / (awayWins + awayLosses || 1);

  // Determine favorite (better record, or home team if tied)
  let favoriteTeam, underdogTeam;
  if (homeWinPct > awayWinPct + 0.1) {
    favoriteTeam = homeTeam;
    underdogTeam = awayTeam;
  } else if (awayWinPct > homeWinPct + 0.1) {
    favoriteTeam = awayTeam;
    underdogTeam = homeTeam;
  } else {
    // Too close to call
    return null;
  }

  const recordDiff = Math.abs(homeWinPct - awayWinPct);
  
  // Calculate upset probability based on various factors
  let upsetProbability = 0;
  const reasons: string[] = [];

  // Factor 1: Division game (more likely upsets)
  const isDivisionGame = homeTeam.team.displayName.includes('NFC') || homeTeam.team.displayName.includes('AFC');
  if (isDivisionGame) {
    upsetProbability += 15;
    reasons.push('Division rivalry game');
  }

  // Factor 2: Underdog is at home
  if (underdogTeam.homeAway === 'home') {
    upsetProbability += 20;
    reasons.push('Underdog has home field advantage');
  }

  // Factor 3: Underdog has recent momentum (simplified)
  const underdogRecentWins = parseInt(underdogTeam.record?.[0]?.summary?.split('-')[0] || '0');
  if (underdogRecentWins >= 2) {
    upsetProbability += 15;
    reasons.push('Underdog showing recent momentum');
  }

  // Factor 4: Favorite on losing streak (simulated - would need more data)
  const favoriteWins = parseInt(favoriteTeam.record?.[0]?.summary?.split('-')[0] || '0');
  const favoriteLosses = parseInt(favoriteTeam.record?.[0]?.summary?.split('-')[1] || '0');
  if (favoriteLosses >= 2) {
    upsetProbability += 10;
    reasons.push('Favorite has struggled recently');
  }

  // Factor 5: Large record difference (less likely upset)
  if (recordDiff > 0.4) {
    upsetProbability -= 15;
  } else if (recordDiff < 0.2) {
    upsetProbability += 20;
    reasons.push('Records are very close');
  }

  // Ensure probability is in valid range
  upsetProbability = Math.max(10, Math.min(75, upsetProbability));

  // Only show if probability is meaningful (>25%)
  if (upsetProbability < 25) {
    return null;
  }

  // Determine severity
  let severity: 'low' | 'medium' | 'high';
  if (upsetProbability >= 50) {
    severity = 'high';
  } else if (upsetProbability >= 35) {
    severity = 'medium';
  } else {
    severity = 'low';
  }

  return {
    game,
    favoriteTeam,
    underdogTeam,
    upsetProbability,
    reasons,
    severity,
  };
}

export function UpsetAlerts({ games }: UpsetAlertsProps) {
  // Calculate upset predictions for all games
  const upsetPredictions = games
    .map(game => calculateUpsetProbability(game))
    .filter((pred): pred is UpsetPrediction => pred !== null)
    .sort((a, b) => b.upsetProbability - a.upsetProbability);

  if (upsetPredictions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            <CardTitle>Upset Alerts</CardTitle>
          </div>
          <CardDescription>
            No significant upset potential detected this week
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <TrendingDown className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>All games look pretty predictable this week!</p>
            <p className="text-sm mt-2">Check back next week for upset alerts.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-yellow-500/50 bg-gradient-to-br from-yellow-500/5 to-orange-500/5">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-500" />
          <CardTitle>🚨 Upset Alerts</CardTitle>
          <Badge variant="secondary" className="ml-auto">
            {upsetPredictions.length} potential upset{upsetPredictions.length !== 1 ? 's' : ''}
          </Badge>
        </div>
        <CardDescription>
          Games where the underdog might pull off a surprise!
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {upsetPredictions.map((prediction, idx) => {
          const severityColors = {
            low: 'border-yellow-500/30 bg-yellow-500/5',
            medium: 'border-orange-500/30 bg-orange-500/5',
            high: 'border-red-500/30 bg-red-500/5',
          };

          const severityIcons = {
            low: '⚠️',
            medium: '🚨',
            high: '🔥',
          };

          return (
            <div
              key={prediction.game.id}
              className={`p-4 rounded-lg border-2 ${severityColors[prediction.severity]}`}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{severityIcons[prediction.severity]}</span>
                    <Badge
                      variant="secondary"
                      className={
                        prediction.severity === 'high'
                          ? 'bg-red-500/20 text-red-500'
                          : prediction.severity === 'medium'
                          ? 'bg-orange-500/20 text-orange-500'
                          : 'bg-yellow-500/20 text-yellow-500'
                      }
                    >
                      {prediction.upsetProbability}% Upset Chance
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    {/* Favorite */}
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">Favorite</p>
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-semibold text-sm">
                          {prediction.favoriteTeam.team.abbreviation}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {prediction.favoriteTeam.record[0]?.summary}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-center">
                      <TrendingDown className="w-5 h-5 text-muted-foreground" />
                    </div>

                    {/* Underdog */}
                    <div className="text-center col-start-1">
                      <p className="text-xs text-muted-foreground mb-1">Underdog</p>
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-1">
                          <Zap className="w-4 h-4 text-yellow-500" />
                          <span className="font-semibold text-sm">
                            {prediction.underdogTeam.team.abbreviation}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {prediction.underdogTeam.record[0]?.summary}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reasons */}
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground">Why this could be an upset:</p>
                {prediction.reasons.map((reason, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-yellow-500 text-xs mt-0.5">▸</span>
                    <p className="text-xs text-muted-foreground">{reason}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        <div className="text-xs text-muted-foreground text-center p-3 rounded-lg bg-muted/50">
          💡 <strong>Tip:</strong> Consider these upsets carefully. Going against the crowd can pay off big!
        </div>
      </CardContent>
    </Card>
  );
}
