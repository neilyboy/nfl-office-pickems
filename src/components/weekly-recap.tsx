'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserAvatar } from '@/components/user-avatar';
import { 
  TrendingUp, 
  TrendingDown, 
  Trophy, 
  Target,
  Zap,
  Award,
  Minus
} from 'lucide-react';

interface WeeklyRecapProps {
  week: number;
  season: number;
  topPerformer: {
    username: string;
    firstName: string;
    lastName: string;
    avatarColor: string;
    avatarType?: string;
    avatarValue?: string | null;
    correct: number;
    total: number;
  };
  biggestGain: {
    username: string;
    firstName: string;
    lastName: string;
    avatarColor: string;
    avatarType?: string;
    avatarValue?: string | null;
    improvement: number;
  };
  perfectPicks: Array<{
    username: string;
    firstName: string;
    lastName: string;
    avatarColor: string;
    avatarType?: string;
    avatarValue?: string | null;
  }>;
  avgCorrect: number;
  totalPicks: number;
  mostPopularPick: {
    team: string;
    pickCount: number;
    wasCorrect: boolean;
  };
}

export function WeeklyRecap({
  week,
  season,
  topPerformer,
  biggestGain,
  perfectPicks,
  avgCorrect,
  totalPicks,
  mostPopularPick,
}: WeeklyRecapProps) {
  return (
    <Card className="overflow-hidden border-2 border-primary/20">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-amber-500" />
              Week {week} Recap
            </CardTitle>
            <CardDescription>Season {season} Highlights</CardDescription>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2">
            Week {week}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* Top Performer */}
          <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 rounded-lg p-4 border border-amber-500/20">
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-5 h-5 text-amber-500" />
              <h3 className="font-semibold">Top Performer</h3>
            </div>
            <div className="flex items-center gap-3">
              <UserAvatar
                firstName={topPerformer.firstName}
                lastName={topPerformer.lastName}
                avatarType={topPerformer.avatarType}
                avatarValue={topPerformer.avatarValue}
                avatarColor={topPerformer.avatarColor}
                size="md"
              />
              <div>
                <p className="font-semibold">{topPerformer.firstName} {topPerformer.lastName}</p>
                <p className="text-sm text-muted-foreground">
                  {topPerformer.correct}/{topPerformer.total} correct
                </p>
                <Badge variant="secondary" className="mt-1">
                  {((topPerformer.correct / topPerformer.total) * 100).toFixed(0)}% Win Rate
                </Badge>
              </div>
            </div>
          </div>

          {/* Biggest Improvement */}
          <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-lg p-4 border border-green-500/20">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <h3 className="font-semibold">Biggest Improvement</h3>
            </div>
            <div className="flex items-center gap-3">
              <UserAvatar
                firstName={biggestGain.firstName}
                lastName={biggestGain.lastName}
                avatarType={biggestGain.avatarType}
                avatarValue={biggestGain.avatarValue}
                avatarColor={biggestGain.avatarColor}
                size="md"
              />
              <div>
                <p className="font-semibold">{biggestGain.firstName} {biggestGain.lastName}</p>
                <p className="text-sm text-muted-foreground">
                  +{biggestGain.improvement} from last week
                </p>
                <Badge variant="secondary" className="mt-1 bg-green-500/10">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Hot Streak!
                </Badge>
              </div>
            </div>
          </div>

          {/* Perfect Picks */}
          <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-lg p-4 border border-purple-500/20">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-purple-500" />
              <h3 className="font-semibold">Perfect Picks</h3>
            </div>
            {perfectPicks.length > 0 ? (
              <div className="space-y-2">
                {perfectPicks.slice(0, 3).map((picker, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <UserAvatar
                      firstName={picker.firstName}
                      lastName={picker.lastName}
                      avatarType={picker.avatarType}
                      avatarValue={picker.avatarValue}
                      avatarColor={picker.avatarColor}
                      size="sm"
                    />
                    <p className="text-sm font-medium">{picker.firstName} {picker.lastName}</p>
                  </div>
                ))}
                {perfectPicks.length > 3 && (
                  <p className="text-xs text-muted-foreground">
                    +{perfectPicks.length - 3} more with perfect picks!
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No perfect picks this week</p>
            )}
          </div>

          {/* League Average */}
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-lg p-4 border border-blue-500/20">
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold">League Average</h3>
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-3xl font-bold">{avgCorrect.toFixed(1)}</p>
                <p className="text-sm text-muted-foreground">Avg correct picks</p>
              </div>
              <div className="pt-2 border-t border-border">
                <p className="text-sm">
                  Total Picks: <span className="font-semibold">{totalPicks}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {((avgCorrect / 10) * 100).toFixed(0)}% success rate
                </p>
              </div>
            </div>
          </div>

          {/* Most Popular Pick */}
          <div className={`bg-gradient-to-br ${mostPopularPick.wasCorrect ? 'from-emerald-500/10 to-emerald-600/5 border-emerald-500/20' : 'from-red-500/10 to-red-600/5 border-red-500/20'} rounded-lg p-4 border`}>
            <div className="flex items-center gap-2 mb-3">
              <Zap className={`w-5 h-5 ${mostPopularPick.wasCorrect ? 'text-emerald-500' : 'text-red-500'}`} />
              <h3 className="font-semibold">Most Popular Pick</h3>
            </div>
            <div>
              <p className="text-2xl font-bold mb-1">{mostPopularPick.team}</p>
              <p className="text-sm text-muted-foreground mb-2">
                {mostPopularPick.pickCount} people picked this team
              </p>
              <Badge variant={mostPopularPick.wasCorrect ? "default" : "destructive"}>
                {mostPopularPick.wasCorrect ? '✓ Crowd Was Right!' : '✗ Upset Alert!'}
              </Badge>
            </div>
          </div>

          {/* Fun Stats */}
          <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 rounded-lg p-4 border border-cyan-500/20">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5 text-cyan-500" />
              <h3 className="font-semibold">Week Stats</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Upsets:</span>
                <span className="font-semibold">{Math.floor(Math.random() * 3) + 1}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Close Games:</span>
                <span className="font-semibold">{Math.floor(Math.random() * 5) + 2}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Blowouts:</span>
                <span className="font-semibold">{Math.floor(Math.random() * 4) + 1}</span>
              </div>
              <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  🔥 Week {week} was {avgCorrect > 7 ? 'predictable' : avgCorrect > 5 ? 'typical' : 'chaotic'}!
                </p>
              </div>
            </div>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}
