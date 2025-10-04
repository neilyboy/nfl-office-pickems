'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dices, Sparkles, TrendingUp, Users, Zap } from 'lucide-react';
import { ESPNGame } from '@/lib/espn-api';

interface RandomPickGeneratorProps {
  games: ESPNGame[];
  onPicksGenerated: (picks: Map<string, string>) => void;
}

type Strategy = 'random' | 'favorites' | 'underdogs' | 'popular' | 'contrarian';

const STRATEGIES = [
  {
    id: 'random' as Strategy,
    name: 'Pure Random',
    icon: Dices,
    description: 'Flip a coin for each game',
    emoji: '🎲',
  },
  {
    id: 'favorites' as Strategy,
    name: 'Always Favorites',
    icon: TrendingUp,
    description: 'Pick the team with better record',
    emoji: '📈',
  },
  {
    id: 'underdogs' as Strategy,
    name: 'Underdog Special',
    icon: Zap,
    description: 'Go with the underdogs',
    emoji: '⚡',
  },
  {
    id: 'popular' as Strategy,
    name: 'Follow the Crowd',
    icon: Users,
    description: 'Pick what most people pick',
    emoji: '👥',
  },
  {
    id: 'contrarian' as Strategy,
    name: 'Contrarian',
    icon: Sparkles,
    description: 'Pick against the crowd',
    emoji: '✨',
  },
];

export function RandomPickGenerator({ games, onPicksGenerated }: RandomPickGeneratorProps) {
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy>('random');
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<Map<string, string> | null>(null);

  const generatePicks = async (strategy: Strategy) => {
    setIsGenerating(true);
    
    // Simulate thinking time for fun
    await new Promise(resolve => setTimeout(resolve, 800));

    const picks = new Map<string, string>();

    games.forEach(game => {
      const homeTeam = game.competitions[0].competitors.find(c => c.homeAway === 'home');
      const awayTeam = game.competitions[0].competitors.find(c => c.homeAway === 'away');
      
      if (!homeTeam || !awayTeam) return;

      let pickedTeamId: string;

      switch (strategy) {
        case 'random':
          // Truly random 50/50
          pickedTeamId = Math.random() > 0.5 ? homeTeam.team.id : awayTeam.team.id;
          break;

        case 'favorites':
          // Pick team with better record
          const homeWins = parseInt(homeTeam.record?.[0]?.summary?.split('-')[0] || '0');
          const awayWins = parseInt(awayTeam.record?.[0]?.summary?.split('-')[0] || '0');
          
          if (homeWins === awayWins) {
            // If same record, pick home team (home field advantage)
            pickedTeamId = homeTeam.team.id;
          } else {
            pickedTeamId = homeWins > awayWins ? homeTeam.team.id : awayTeam.team.id;
          }
          break;

        case 'underdogs':
          // Pick team with worse record (or away team if same)
          const homeW = parseInt(homeTeam.record?.[0]?.summary?.split('-')[0] || '0');
          const awayW = parseInt(awayTeam.record?.[0]?.summary?.split('-')[0] || '0');
          
          if (homeW === awayW) {
            pickedTeamId = awayTeam.team.id; // Away team is underdog
          } else {
            pickedTeamId = homeW < awayW ? homeTeam.team.id : awayTeam.team.id;
          }
          break;

        case 'popular':
          // For now, simulate popular picks (could use real data)
          // Home teams are usually more popular, so 60% home
          pickedTeamId = Math.random() > 0.4 ? homeTeam.team.id : awayTeam.team.id;
          break;

        case 'contrarian':
          // Opposite of popular
          // 60% away team
          pickedTeamId = Math.random() > 0.6 ? homeTeam.team.id : awayTeam.team.id;
          break;

        default:
          pickedTeamId = homeTeam.team.id;
      }

      picks.set(game.id, pickedTeamId);
    });

    setLastGenerated(picks);
    setIsGenerating(false);
    onPicksGenerated(picks);
  };

  return (
    <Card className="border-purple-500/50 bg-gradient-to-br from-purple-500/5 to-pink-500/5">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Dices className="w-5 h-5 text-purple-500" />
          <CardTitle>Random Pick Generator</CardTitle>
        </div>
        <CardDescription>
          Need picks in a hurry? Let fate decide! 🎲
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {STRATEGIES.map((strategy) => {
            const Icon = strategy.icon;
            const isSelected = selectedStrategy === strategy.id;
            
            return (
              <button
                key={strategy.id}
                onClick={() => setSelectedStrategy(strategy.id)}
                className={`
                  p-4 rounded-lg border-2 transition-all text-left
                  ${isSelected 
                    ? 'border-purple-500 bg-purple-500/10 scale-105' 
                    : 'border-border hover:border-purple-500/50 hover:bg-purple-500/5'
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  <div className={`
                    p-2 rounded-lg shrink-0
                    ${isSelected ? 'bg-purple-500/20' : 'bg-secondary'}
                  `}>
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-purple-500' : ''}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">{strategy.name}</span>
                      <span className="text-lg">{strategy.emoji}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {strategy.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <Button
          onClick={() => generatePicks(selectedStrategy)}
          disabled={isGenerating || games.length === 0}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Dices className="w-5 h-5 mr-2 animate-spin" />
              Generating Picks...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Generate {games.length} Random Picks
            </>
          )}
        </Button>

        {lastGenerated && (
          <div className="p-4 rounded-lg bg-muted/50 border border-purple-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="bg-purple-500/10 text-purple-500">
                ✨ Picks Generated!
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Generated {lastGenerated.size} picks using <strong>{STRATEGIES.find(s => s.id === selectedStrategy)?.name}</strong> strategy.
              Review them below and save when ready!
            </p>
          </div>
        )}

        <div className="text-xs text-muted-foreground text-center p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
          ⚠️ <strong>Disclaimer:</strong> Random picks are for fun! No guarantee of winning.
          Use your own judgment for best results.
        </div>
      </CardContent>
    </Card>
  );
}
