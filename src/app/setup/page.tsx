'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

export default function SetupPage() {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (pin !== confirmPin) {
      toast({
        title: 'Error',
        description: 'PINs do not match',
        variant: 'destructive',
      });
      return;
    }

    if (!/^\d{4}$|^\d{6}$/.test(pin)) {
      toast({
        title: 'Error',
        description: 'PIN must be 4 or 6 digits',
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 8) {
      toast({
        title: 'Error',
        description: 'Password must be at least 8 characters',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Setup failed');
      }

      toast({
        title: 'Success! 🎉',
        description: 'Admin credentials created successfully',
      });

      setTimeout(() => {
        router.push('/');
      }, 1000);
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

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-secondary/20">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="text-6xl mb-4">🏈</div>
          <CardTitle className="text-3xl">First-Time Setup</CardTitle>
          <CardDescription>
            Create your admin credentials to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSetup} className="space-y-4">
            <div>
              <Label htmlFor="pin">Admin PIN (4 or 6 digits)</Label>
              <Input
                id="pin"
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter PIN"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                This PIN will be used for quick admin access
              </p>
            </div>

            <div>
              <Label htmlFor="confirmPin">Confirm PIN</Label>
              <Input
                id="confirmPin"
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                placeholder="Confirm PIN"
                required
              />
            </div>

            <div>
              <Label htmlFor="password">Recovery Password (min 8 characters)</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                This password can be used to reset your PIN if forgotten
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              size="lg" 
              disabled={loading}
            >
              {loading ? 'Setting up...' : 'Complete Setup 🚀'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
