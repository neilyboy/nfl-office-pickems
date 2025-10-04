'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Settings, Users, Save, Dices, AlertTriangle, Trophy, Swords } from 'lucide-react';

export function FeaturePermissions() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Global settings
  const [globalSettings, setGlobalSettings] = useState({
    randomPickerEnabled: true,
    upsetAlertsEnabled: true,
    powerRankingsEnabled: true,
    matchupSimulatorEnabled: true,
  });

  // User permissions
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      // Fetch global settings
      const settingsRes = await fetch('/api/admin/feature-settings');
      const settingsData = await settingsRes.json();
      if (settingsData.settings) {
        setGlobalSettings(settingsData.settings);
      }

      // Fetch user permissions
      const usersRes = await fetch('/api/admin/user-permissions');
      const usersData = await usersRes.json();
      if (usersData.users) {
        setUsers(usersData.users);
      }

      setLoading(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load settings',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  const saveGlobalSettings = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/feature-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(globalSettings),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Global settings updated',
        });
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const updateUserPermissions = async (userId: number, permissions: any) => {
    try {
      const response = await fetch('/api/admin/user-permissions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, permissions }),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'User permissions updated',
        });
        // Update local state
        setUsers(users.map(u => u.id === userId ? { ...u, ...permissions } : u));
      } else {
        throw new Error('Failed to update');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update permissions',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Global Feature Toggles */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            <CardTitle>Global Feature Settings</CardTitle>
          </div>
          <CardDescription>
            Enable or disable features for the entire league
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {/* Random Picker */}
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="flex items-center gap-3">
                <Dices className={`w-5 h-5 ${globalSettings.randomPickerEnabled ? 'text-purple-500' : 'text-muted-foreground'}`} />
                <div>
                  <Label className="text-base font-semibold">Random Pick Generator</Label>
                  <p className="text-sm text-muted-foreground">
                    5 different strategies to auto-fill picks
                  </p>
                </div>
              </div>
              <Switch
                checked={globalSettings.randomPickerEnabled}
                onCheckedChange={(checked) => setGlobalSettings({ ...globalSettings, randomPickerEnabled: checked })}
              />
            </div>

            {/* Upset Alerts */}
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="flex items-center gap-3">
                <AlertTriangle className={`w-5 h-5 ${globalSettings.upsetAlertsEnabled ? 'text-yellow-500' : 'text-muted-foreground'}`} />
                <div>
                  <Label className="text-base font-semibold">Upset Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    AI-powered upset predictions
                  </p>
                </div>
              </div>
              <Switch
                checked={globalSettings.upsetAlertsEnabled}
                onCheckedChange={(checked) => setGlobalSettings({ ...globalSettings, upsetAlertsEnabled: checked })}
              />
            </div>

            {/* Power Rankings */}
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="flex items-center gap-3">
                <Trophy className={`w-5 h-5 ${globalSettings.powerRankingsEnabled ? 'text-primary' : 'text-muted-foreground'}`} />
                <div>
                  <Label className="text-base font-semibold">Power Rankings</Label>
                  <p className="text-sm text-muted-foreground">
                    Dynamic weekly rankings with momentum
                  </p>
                </div>
              </div>
              <Switch
                checked={globalSettings.powerRankingsEnabled}
                onCheckedChange={(checked) => setGlobalSettings({ ...globalSettings, powerRankingsEnabled: checked })}
              />
            </div>

            {/* Matchup Simulator */}
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="flex items-center gap-3">
                <Swords className={`w-5 h-5 ${globalSettings.matchupSimulatorEnabled ? 'text-blue-500' : 'text-muted-foreground'}`} />
                <div>
                  <Label className="text-base font-semibold">Matchup Simulator</Label>
                  <p className="text-sm text-muted-foreground">
                    Head-to-head matchup predictor
                  </p>
                </div>
              </div>
              <Switch
                checked={globalSettings.matchupSimulatorEnabled}
                onCheckedChange={(checked) => setGlobalSettings({ ...globalSettings, matchupSimulatorEnabled: checked })}
              />
            </div>
          </div>

          <Button onClick={saveGlobalSettings} disabled={saving} className="w-full">
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Global Settings'}
          </Button>
        </CardContent>
      </Card>

      {/* Per-User Permissions */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            <CardTitle>User Permissions</CardTitle>
          </div>
          <CardDescription>
            Control which users can access each feature
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="p-4 rounded-lg border">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-semibold">{user.firstName} {user.lastName}</p>
                    <p className="text-sm text-muted-foreground">@{user.username}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="flex flex-col items-center gap-2 p-3 rounded bg-muted/50">
                    <Dices className="w-4 h-4" />
                    <span className="text-xs text-center">Random Picker</span>
                    <Switch
                      checked={user.canUseRandomPicker}
                      onCheckedChange={(checked) => updateUserPermissions(user.id, { ...user, canUseRandomPicker: checked })}
                      disabled={!globalSettings.randomPickerEnabled}
                    />
                  </div>

                  <div className="flex flex-col items-center gap-2 p-3 rounded bg-muted/50">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-xs text-center">Upset Alerts</span>
                    <Switch
                      checked={user.canSeeUpsetAlerts}
                      onCheckedChange={(checked) => updateUserPermissions(user.id, { ...user, canSeeUpsetAlerts: checked })}
                      disabled={!globalSettings.upsetAlertsEnabled}
                    />
                  </div>

                  <div className="flex flex-col items-center gap-2 p-3 rounded bg-muted/50">
                    <Trophy className="w-4 h-4" />
                    <span className="text-xs text-center">Power Rankings</span>
                    <Switch
                      checked={user.canSeePowerRankings}
                      onCheckedChange={(checked) => updateUserPermissions(user.id, { ...user, canSeePowerRankings: checked })}
                      disabled={!globalSettings.powerRankingsEnabled}
                    />
                  </div>

                  <div className="flex flex-col items-center gap-2 p-3 rounded bg-muted/50">
                    <Swords className="w-4 h-4" />
                    <span className="text-xs text-center">Matchup Sim</span>
                    <Switch
                      checked={user.canUseMatchupSim}
                      onCheckedChange={(checked) => updateUserPermissions(user.id, { ...user, canUseMatchupSim: checked })}
                      disabled={!globalSettings.matchupSimulatorEnabled}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
