'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { 
  ArrowLeft, 
  User,
  Lock,
  Palette,
  Trophy,
  LogOut,
  Save
} from 'lucide-react';
import { getInitials } from '@/lib/utils';
import { BadgeDisplay } from '@/components/badge-display';
import { calculateUserBadges } from '@/lib/badges';

interface ProfileInterfaceProps {
  user: {
    userId: number;
    username: string;
    firstName: string;
    lastName: string;
  };
}

const AVATAR_COLORS = [
  '#EF4444', // red
  '#F97316', // orange
  '#F59E0B', // amber
  '#84CC16', // lime
  '#10B981', // emerald
  '#14B8A6', // teal
  '#06B6D4', // cyan
  '#3B82F6', // blue
  '#6366F1', // indigo
  '#8B5CF6', // violet
  '#A855F7', // purple
  '#EC4899', // pink
];

const AVATAR_EMOJIS = [
  // Sports & Activities (25)
  '🏈', '⚽', '🏀', '⚾', '🎾', '🏐', '🏉', '🥎', '🏏', '🏒',
  '🥊', '🥋', '🎱', '🏓', '🏸', '🏹', '🎿', '⛷️', '🏂', '🤼',
  '🤺', '🤸', '⛳', '🎯', '🎣',
  // Animals (40)
  '🦅', '🐻', '🐯', '🦁', '🐺', '🦊', '🐴', '🦌', '🐆', '🐊',
  '🦈', '🐉', '🐲', '🦖', '🦕', '🐘', '🦏', '🦛', '🐢', '🐍',
  '🦎', '🐙', '🦑', '🦞', '🦀', '🦐', '🐝', '🐛', '🦋', '🐌',
  '🐞', '🐜', '🦗', '🕷️', '🦂', '🐇', '🐿️', '🦔', '🦇', '🦉',
  // Faces & Expressions (40)
  '😎', '🤠', '🥳', '🤩', '😤', '🤯', '😈', '👽', '🤖', '👻',
  '💀', '☠️', '👹', '👺', '🤡', '💩', '👾', '🎃', '😺', '😸',
  '😻', '😼', '😽', '🙀', '😿', '😹', '🦸', '🦹', '🧙', '🧚',
  '🧛', '🧜', '🧝', '🧞', '🧟', '🦾', '🦿', '🧠', '🦷', '👀',
  // Symbols & Objects (50)
  '🔥', '⚡', '💪', '👑', '🎯', '🎪', '🎲', '🎰', '🏆', '🥇',
  '🥈', '🥉', '🏅', '⭐', '🌟', '💫', '✨', '🎭', '🎨', '🎬',
  '🎤', '🎧', '🎼', '🎹', '🥁', '🎺', '🎸', '🎻', '🎮', '🕹️',
  '🎲', '♠️', '♥️', '♦️', '♣️', '🃏', '🀄', '🎴', '🔮', '🎁',
  '🎈', '🎉', '🎊', '🎀', '💎', '💍', '👑', '🔱', '⚔️', '🛡️',
  // Nature & Weather (30)
  '☀️', '🌙', '⭐', '🌟', '💫', '✨', '🌈', '☄️', '🌠', '🌌',
  '🪐', '⚡', '🔥', '💧', '🌊', '🌪️', '🌀', '🌋', '🏔️', '⛰️',
  '🗻', '🏕️', '🏖️', '🏝️', '🏜️', '🌲', '🌳', '🌴', '🌵', '🍀',
];

const AVATAR_TYPE_LABELS = {
  initials: 'Initials with Color',
  emoji: 'Emoji Avatar',
};

export function ProfileInterface({ user }: ProfileInterfaceProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [selectedColor, setSelectedColor] = useState('');
  const [avatarType, setAvatarType] = useState<'initials' | 'emoji'>('initials');
  const [selectedEmoji, setSelectedEmoji] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const [userResponse, statsResponse] = await Promise.all([
        fetch('/api/profile'),
        fetch('/api/stats'),
      ]);

      const userData = await userResponse.json();
      const statsData = await statsResponse.json();

      if (!userResponse.ok || !statsResponse.ok) {
        throw new Error('Failed to load profile');
      }

      setUserData(userData);
      setSelectedColor(userData.avatarColor || AVATAR_COLORS[0]);
      setAvatarType(userData.avatarType || 'initials');
      setSelectedEmoji(userData.avatarValue || '🏈');
      
      // Find current user's stats
      const userStats = statsData.stats?.find((s: any) => s.userId === user.userId);
      setStats(userStats || null);
      setAnalytics(statsData.analytics || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAvatar = async () => {
    const hasChanges = 
      (avatarType === 'initials' && selectedColor !== userData.avatarColor) ||
      (avatarType === 'emoji' && (selectedEmoji !== userData.avatarValue || avatarType !== userData.avatarType));
    
    if (!hasChanges) return;

    setSaving(true);
    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          avatarType,
          avatarValue: avatarType === 'emoji' ? selectedEmoji : null,
          avatarColor: selectedColor,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update avatar');
      }

      toast({
        title: 'Avatar Updated! 🎨',
        description: 'Your avatar has been changed',
      });

      await fetchProfile();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in all password fields',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Passwords Don\'t Match',
        description: 'New password and confirmation must match',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: 'Password Too Short',
        description: 'Password must be at least 6 characters',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/profile/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to change password');
      }

      toast({
        title: 'Password Changed! 🔒',
        description: 'Your password has been updated successfully',
      });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/scores')}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold">My Profile</h1>
                <p className="text-xs lg:text-sm text-muted-foreground">
                  {user.firstName} {user.lastName}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto">
              <Button variant="outline" size="sm" onClick={() => router.push('/picks')}>
                <span className="sm:hidden">🏈</span>
                <span className="hidden sm:inline">🏈 Picks</span>
              </Button>
              <Button variant="outline" size="sm" onClick={() => router.push('/scores')}>
                <span className="sm:hidden">📊</span>
                <span className="hidden sm:inline">📊 Scores</span>
              </Button>
              <Button variant="outline" size="sm" onClick={() => router.push('/standings')}>
                <span className="sm:hidden">🏆</span>
                <span className="hidden sm:inline">🏆 Standings</span>
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline ml-2">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Info */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <Avatar className="w-24 h-24" style={{ backgroundColor: avatarType === 'initials' ? selectedColor : '#1e293b' }}>
                  <AvatarFallback style={{ backgroundColor: avatarType === 'initials' ? selectedColor : '#1e293b', color: 'white', fontSize: avatarType === 'emoji' ? '48px' : '32px' }}>
                    {avatarType === 'emoji' ? selectedEmoji : getInitials(user.firstName, user.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold">{user.firstName} {user.lastName}</h3>
                  <p className="text-muted-foreground">@{user.username}</p>
                  {stats && (
                    <div className="flex gap-4 mt-3">
                      <Badge variant="secondary">
                        {stats.totalWeeks} weeks played
                      </Badge>
                      <Badge variant="default">
                        {stats.totalCorrect} correct
                      </Badge>
                      <Badge variant="outline">
                        {stats.winRate}% win rate
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Season Stats */}
          {stats && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  Season Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Weeks Played</span>
                  <Badge variant="secondary">{stats.totalWeeks}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Correct</span>
                  <Badge variant="default">{stats.totalCorrect}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Incorrect</span>
                  <Badge variant="destructive">{stats.totalIncorrect}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Win Rate</span>
                  <Badge variant="outline">{stats.winRate}%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Best Week</span>
                  <Badge className="bg-green-500">{stats.bestWeek} correct</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Worst Week</span>
                  <Badge className="bg-orange-500">{stats.worstWeek} correct</Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Badges Section */}
          {analytics.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  Achievements
                </CardTitle>
                <CardDescription>
                  Badges you've earned this season
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BadgeDisplay
                  earnedBadges={calculateUserBadges(
                    analytics.find(a => a.userId === user.userId),
                    analytics
                  )}
                  compact={true}
                />
              </CardContent>
            </Card>
          )}

          {/* Avatar Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Avatar Customization
              </CardTitle>
              <CardDescription>
                Choose initials with color or emoji avatar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Avatar Type Tabs */}
              <div className="flex gap-2">
                <Button
                  variant={avatarType === 'initials' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAvatarType('initials')}
                  className="flex-1"
                >
                  🎨 Color
                </Button>
                <Button
                  variant={avatarType === 'emoji' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAvatarType('emoji')}
                  className="flex-1"
                >
                  😀 Emoji
                </Button>
              </div>

              {/* Color Selection */}
              {avatarType === 'initials' && (
                <div className="grid grid-cols-6 gap-2">
                  {AVATAR_COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-12 h-12 rounded-lg transition-all ${
                        selectedColor === color
                          ? 'ring-4 ring-primary scale-110'
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              )}

              {/* Emoji Selection */}
              {avatarType === 'emoji' && (
                <div className="grid grid-cols-6 gap-2 max-h-64 overflow-y-auto">
                  {AVATAR_EMOJIS.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => setSelectedEmoji(emoji)}
                      className={`w-12 h-12 text-2xl rounded-lg transition-all ${
                        selectedEmoji === emoji
                          ? 'ring-4 ring-primary scale-110 bg-primary/10'
                          : 'hover:scale-105 hover:bg-secondary/50'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}

              <Button
                onClick={handleUpdateAvatar}
                disabled={saving}
                className="w-full"
              >
                <Save className="w-4 h-4 mr-2" />
                Update Avatar
              </Button>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Change Password
              </CardTitle>
              <CardDescription>
                Update your account password
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
              </div>
              <Button
                onClick={handleChangePassword}
                disabled={saving || !currentPassword || !newPassword || !confirmPassword}
                className="w-full"
              >
                {saving ? 'Changing...' : 'Change Password'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
