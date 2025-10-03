'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Lock, KeyRound } from 'lucide-react';

interface AdminPinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdminPinDialog({ open, onOpenChange }: AdminPinDialogProps) {
  const [pin, setPin] = useState('');
  const [password, setPassword] = useState('');
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (pin.length < 4) {
      toast({
        title: 'Error',
        description: 'Please enter your PIN',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });

      const data = await response.json();

      if (!response.ok) {
        setAttempts(prev => prev + 1);
        
        if (attempts >= 2) {
          setShowPasswordReset(true);
          toast({
            title: 'Too many attempts',
            description: 'Please use your recovery password',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Error',
            description: data.error || 'Invalid PIN',
            variant: 'destructive',
          });
        }
        setPin('');
        return;
      }

      toast({
        title: 'Success! 🎉',
        description: 'Admin access granted',
      });

      onOpenChange(false);
      router.push('/admin');
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

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid password');
      }

      toast({
        title: 'Success! 🎉',
        description: 'Admin access granted via password',
      });

      onOpenChange(false);
      router.push('/admin');
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

  const handleClose = () => {
    setPin('');
    setPassword('');
    setShowPasswordReset(false);
    setAttempts(0);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">Admin Access</DialogTitle>
          <DialogDescription className="text-center">
            {showPasswordReset
              ? 'Enter your recovery password to reset PIN'
              : 'Enter your admin PIN to continue'}
          </DialogDescription>
        </DialogHeader>

        {!showPasswordReset ? (
          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div>
              <Label htmlFor="pin">Admin PIN</Label>
              <Input
                id="pin"
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter PIN"
                autoFocus
                className="text-center text-2xl tracking-widest"
              />
              {attempts > 0 && (
                <p className="text-xs text-destructive mt-1">
                  {3 - attempts} attempt(s) remaining
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPasswordReset(true)}
                className="flex-1"
                disabled={loading}
              >
                <KeyRound className="w-4 h-4 mr-2" />
                Use Password
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? 'Verifying...' : 'Continue'}
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div>
              <Label htmlFor="password">Recovery Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter recovery password"
                autoFocus
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPasswordReset(false)}
                className="flex-1"
                disabled={loading}
              >
                Back to PIN
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? 'Verifying...' : 'Reset & Login'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
