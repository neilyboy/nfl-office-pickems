'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  ClipboardList, 
  MessageSquare, 
  Database, 
  LogOut,
  Home,
  ShieldCheck,
  Settings
} from 'lucide-react';
import { FeaturePermissions } from '@/components/admin/feature-permissions';

export function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalUsers: 0,
    currentWeek: 5,
    season: 2025,
    lunchesOwed: 0,
  });

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      const [statsResponse, standingsResponse, usersResponse] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/standings'),
        fetch('/api/admin/users'),
      ]);

      const statsData = await statsResponse.json();
      const standingsData = await standingsResponse.json();
      const usersData = await usersResponse.json();

      console.log('Admin Stats Data:', statsData);
      console.log('Admin Standings Data:', standingsData);
      console.log('Admin Users Data:', usersData);

      // Count total users from the users API (more accurate)
      const totalUsers = usersData.users?.length || 0;

      // Calculate total lunches owed
      let lunchesOwed = 0;
      if (statsData.lunchTracker) {
        statsData.lunchTracker.forEach((tracker: any) => {
          if (tracker.net < 0) {
            lunchesOwed += Math.abs(tracker.net);
          }
        });
      }

      const newStats = {
        totalUsers,
        currentWeek: standingsData.currentWeek || 5,
        season: standingsData.season || 2025,
        lunchesOwed,
      };

      console.log('Setting admin stats to:', newStats);
      setStats(newStats);
    } catch (error) {
      console.error('Failed to fetch admin stats:', error);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/');
  };

  const adminMenuItems = [
    {
      title: 'Manage Users',
      description: 'Add, edit, and delete users. Reset passwords.',
      icon: Users,
      href: '/admin/users',
      color: 'text-blue-500',
    },
    {
      title: 'Manage Picks',
      description: 'View and edit user picks for any week.',
      icon: ClipboardList,
      href: '/admin/picks',
      color: 'text-green-500',
    },
    {
      title: 'Chat Management',
      description: 'Clear chats, view archives, and manage messages.',
      icon: MessageSquare,
      href: '/admin/chat',
      color: 'text-purple-500',
    },
    {
      title: 'Backup & Restore',
      description: 'Create backups, restore data, and view archives.',
      icon: Database,
      href: '/admin/backup',
      color: 'text-orange-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">Manage your NFL pickems</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => router.push('/')}
              >
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold mb-2">Welcome, Admin! 👋</h2>
            <p className="text-muted-foreground">
              Choose an option below to manage your NFL office pickems
            </p>
          </div>

          {/* Admin Menu Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {adminMenuItems.map((item) => (
              <Card
                key={item.href}
                className="hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => router.push(item.href)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-lg bg-secondary/50 flex items-center justify-center group-hover:scale-110 transition-transform ${item.color}`}>
                        <item.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{item.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {item.description}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="w-full group-hover:bg-primary/10">
                    Open →
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.totalUsers === 0 ? 'No users yet' : 'Active users'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Current Week
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">Week {stats.currentWeek}</div>
                <p className="text-xs text-muted-foreground mt-1">{stats.season} Season</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Lunches Owed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.lunchesOwed}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.lunchesOwed === 0 ? 'No completed weeks yet 🍔' : 'Total owed'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Feature Permissions Section */}
          <div className="mt-12">
            <div className="mb-6 flex items-center gap-3">
              <Settings className="w-6 h-6 text-primary" />
              <div>
                <h3 className="text-2xl font-bold">Feature Permissions</h3>
                <p className="text-sm text-muted-foreground">
                  Control which features are available and who can access them
                </p>
              </div>
            </div>
            <FeaturePermissions />
          </div>
        </div>
      </main>
    </div>
  );
}
