'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/contexts/theme-context';
import { BASE_THEMES, NFL_TEAM_THEMES, Theme } from '@/lib/themes';
import { Palette, Check, Moon, Sun, Contrast } from 'lucide-react';

export function ThemeSelector() {
  const { currentTheme, setTheme, themeId } = useTheme();

  const renderThemeCard = (theme: Theme, isSelected: boolean) => (
    <button
      key={theme.id}
      onClick={() => setTheme(theme.id)}
      className={`relative p-4 rounded-lg border-2 transition-all hover:scale-105 ${
        isSelected
          ? 'border-primary shadow-lg shadow-primary/50'
          : 'border-muted hover:border-primary/50'
      }`}
    >
      {isSelected && (
        <div className="absolute top-2 right-2">
          <div className="bg-primary rounded-full p-1">
            <Check className="w-3 h-3 text-white" />
          </div>
        </div>
      )}
      
      <div className="space-y-3">
        {/* Color Preview */}
        <div className="flex gap-1 h-8 rounded overflow-hidden">
          <div className="flex-1" style={{ backgroundColor: theme.colors.primary }} />
          <div className="flex-1" style={{ backgroundColor: theme.colors.secondary }} />
          <div className="flex-1" style={{ backgroundColor: theme.colors.accent }} />
        </div>
        
        {/* Theme Name */}
        <div className="text-sm font-semibold text-center">{theme.name}</div>
        
        {/* Theme Type Badge */}
        {theme.type === 'team' && (
          <Badge variant="outline" className="text-xs w-full justify-center">
            NFL Team
          </Badge>
        )}
      </div>
    </button>
  );

  const baseThemes = Object.values(BASE_THEMES);
  const teamThemes = Object.values(NFL_TEAM_THEMES);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-primary" />
          Theme Customization
        </CardTitle>
        <CardDescription>
          Choose your preferred theme or represent your favorite NFL team!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="base" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="base" className="flex items-center gap-2">
              <Moon className="w-4 h-4" />
              Base Themes
            </TabsTrigger>
            <TabsTrigger value="teams" className="flex items-center gap-2">
              🏈 NFL Teams
            </TabsTrigger>
          </TabsList>

          <TabsContent value="base" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {baseThemes.map((theme) => renderThemeCard(theme, theme.id === themeId))}
            </div>
          </TabsContent>

          <TabsContent value="teams" className="mt-4">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Choose from all 32 NFL teams with authentic team colors!
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-[500px] overflow-y-auto pr-2">
                {teamThemes.map((theme) => renderThemeCard(theme, theme.id === themeId))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Current Theme Info */}
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Current Theme</p>
              <p className="text-xs text-muted-foreground">{currentTheme.name}</p>
            </div>
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded" style={{ backgroundColor: currentTheme.colors.primary }} />
              <div className="w-8 h-8 rounded" style={{ backgroundColor: currentTheme.colors.secondary }} />
              <div className="w-8 h-8 rounded" style={{ backgroundColor: currentTheme.colors.accent }} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
