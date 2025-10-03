'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Lock, LogIn } from 'lucide-react';
import { AdminPinDialog } from '@/components/admin-pin-dialog';

export default function HomePage() {
  const router = useRouter();
  const [setupComplete, setSetupComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAdminDialog, setShowAdminDialog] = useState(false);

  useEffect(() => {
    checkSetup();
  }, []);

  const checkSetup = async () => {
    try {
      const response = await fetch('/api/admin/setup');
      const data = await response.json();
      setSetupComplete(data.setupComplete);
    } catch (error) {
      console.error('Error checking setup:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!setupComplete) {
    router.push('/setup');
    return null;
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🏈</span>
              <div>
                <h1 className="text-2xl font-bold">NFL Office Pickems</h1>
                <p className="text-sm text-muted-foreground">Weekly NFL picks competition</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => router.push('/login')}
              >
                <LogIn className="w-4 h-4 mr-2" />
                User Login
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowAdminDialog(true)}
              >
                <Lock className="w-4 h-4 mr-2" />
                Admin
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="text-center py-20">
          <h2 className="text-4xl font-bold mb-4">Welcome to NFL Office Pickems! 🏆</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Pick the winners each week. Most correct wins, least correct buys lunch! 🍔
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" onClick={() => router.push('/login')}>
              <LogIn className="w-5 h-5 mr-2" />
              Login to Make Picks
            </Button>
            <Button size="lg" variant="outline" onClick={() => router.push('/scores')}>
              📊 Live Scores
            </Button>
            <Button size="lg" variant="outline" onClick={() => router.push('/chat')}>
              💬 Chat
            </Button>
          </div>
        </div>

        {/* Quick Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
          <div className="bg-card border rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer" onClick={() => router.push('/picks')}>
            <div className="text-3xl mb-2">🏈</div>
            <h3 className="font-semibold mb-1">Make Picks</h3>
            <p className="text-muted-foreground text-sm">Pick weekly winners</p>
          </div>
          <div className="bg-card border rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer" onClick={() => router.push('/scores')}>
            <div className="text-3xl mb-2">📊</div>
            <h3 className="font-semibold mb-1">Live Scores</h3>
            <p className="text-muted-foreground text-sm">Real-time updates</p>
          </div>
          <div className="bg-card border rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer" onClick={() => router.push('/chat')}>
            <div className="text-3xl mb-2">💬</div>
            <h3 className="font-semibold mb-1">Chat</h3>
            <p className="text-muted-foreground text-sm">Talk with friends</p>
          </div>
        </div>

        {/* Features List */}
        <div className="max-w-2xl mx-auto mt-16">
          <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-card border rounded-lg">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">1</div>
              <div>
                <h3 className="font-semibold mb-1">Pick Your Winners</h3>
                <p className="text-sm text-muted-foreground">Every week, pick which team you think will win each game. Picks lock 5 minutes before the first game.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-card border rounded-lg">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">2</div>
              <div>
                <h3 className="font-semibold mb-1">Track Live Scores</h3>
                <p className="text-sm text-muted-foreground">Watch the leaderboard update in real-time as games finish. See who's winning and losing!</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-card border rounded-lg">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">3</div>
              <div>
                <h3 className="font-semibold mb-1">Loser Buys Lunch!</h3>
                <p className="text-sm text-muted-foreground">The person with the worst record each week buys lunch for the office. Stakes are real! 🍔</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-20 py-6 text-center text-sm text-muted-foreground">
        <p>NFL Office Pickems • Loser buys lunch! 🏈</p>
      </footer>

      {/* Admin PIN Dialog */}
      <AdminPinDialog open={showAdminDialog} onOpenChange={setShowAdminDialog} />
    </div>
  );
}
