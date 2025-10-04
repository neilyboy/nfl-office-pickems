'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, BellOff, Check, X } from 'lucide-react';
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  hasNotificationsEnabled,
  setNotificationsEnabled,
} from '@/lib/notifications';

export function NotificationPrompt() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    const supported = isNotificationSupported();
    setIsSupported(supported);
    
    if (supported) {
      const perm = getNotificationPermission();
      setPermission(perm);
      setIsEnabled(hasNotificationsEnabled());
      
      // Show prompt if permission is default and user hasn't dismissed it
      const dismissed = localStorage.getItem('notification-prompt-dismissed');
      setShowPrompt(perm === 'default' && !dismissed);
    }
  }, []);

  const handleEnable = async () => {
    setIsRequesting(true);
    
    try {
      const perm = await requestNotificationPermission();
      setPermission(perm);
      
      if (perm === 'granted') {
        setNotificationsEnabled(true);
        setIsEnabled(true);
        setShowPrompt(false);
      }
    } finally {
      setIsRequesting(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('notification-prompt-dismissed', 'true');
    setShowPrompt(false);
  };

  const handleToggle = async () => {
    if (!isEnabled && permission !== 'granted') {
      // Need to request permission first
      await handleEnable();
    } else {
      // Just toggle the preference
      const newEnabled = !isEnabled;
      setNotificationsEnabled(newEnabled);
      setIsEnabled(newEnabled);
    }
  };

  // Don't show anything if not supported
  if (!isSupported) return null;

  // Inline notification toggle (always shown in settings)
  if (!showPrompt) {
    return (
      <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
        <div className="flex items-center gap-3">
          {isEnabled ? (
            <Bell className="w-5 h-5 text-primary" />
          ) : (
            <BellOff className="w-5 h-5 text-muted-foreground" />
          )}
          <div>
            <p className="font-semibold">Notifications</p>
            <p className="text-sm text-muted-foreground">
              {permission === 'granted'
                ? isEnabled
                  ? 'Stay updated with game alerts and reminders'
                  : 'Notifications are disabled'
                : permission === 'denied'
                ? 'Notifications are blocked by your browser'
                : 'Enable to receive alerts'}
            </p>
          </div>
        </div>
        
        {permission !== 'denied' && (
          <Button
            variant={isEnabled ? 'default' : 'outline'}
            size="sm"
            onClick={handleToggle}
            disabled={isRequesting}
          >
            {isRequesting ? 'Requesting...' : isEnabled ? 'Enabled' : 'Enable'}
          </Button>
        )}
        
        {permission === 'denied' && (
          <Badge variant="secondary">Blocked</Badge>
        )}
      </div>
    );
  }

  // Full prompt card (shown on first visit)
  return (
    <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-secondary/5">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <Bell className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle>Enable Notifications?</CardTitle>
              <CardDescription>Stay updated with your NFL Pick'em league</CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDismiss}
            className="shrink-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Check className="w-4 h-4 text-green-500" />
            <span>Get reminded when games are starting</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Check className="w-4 h-4 text-green-500" />
            <span>Never miss the pick deadline</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Check className="w-4 h-4 text-green-500" />
            <span>See your weekly results instantly</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Check className="w-4 h-4 text-green-500" />
            <span>Celebrate achievement unlocks</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleEnable}
            disabled={isRequesting}
            className="flex-1"
          >
            {isRequesting ? 'Requesting...' : 'Enable Notifications'}
          </Button>
          <Button
            variant="outline"
            onClick={handleDismiss}
            disabled={isRequesting}
          >
            Not Now
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          You can change this anytime in your profile settings
        </p>
      </CardContent>
    </Card>
  );
}
