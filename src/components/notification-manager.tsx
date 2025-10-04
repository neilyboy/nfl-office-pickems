'use client';

import { useEffect, useRef } from 'react';
import {
  hasNotificationsEnabled,
  notifyGamesStarting,
  notifyMakePicks,
  notifyWeeklyResults,
} from '@/lib/notifications';

export function NotificationManager() {
  const lastCheckRef = useRef<string>('');
  const shownNotificationsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Don't run if notifications not enabled
    if (!hasNotificationsEnabled()) {
      return;
    }

    // Check for notifications every 5 minutes
    const checkNotifications = async () => {
      try {
        const response = await fetch('/api/notifications/check');
        const data = await response.json();

        if (!data.notifications || data.notifications.length === 0) {
          return;
        }

        // Process each notification
        data.notifications.forEach((notification: any) => {
          const notifId = `${notification.type}-${notification.week || 'general'}`;
          
          // Skip if already shown this session
          if (shownNotificationsRef.current.has(notifId)) {
            return;
          }

          // Mark as shown
          shownNotificationsRef.current.add(notifId);

          // Show the appropriate notification
          switch (notification.type) {
            case 'make-picks':
              notifyMakePicks(notification.week, notification.hoursUntilLock);
              break;

            case 'games-starting':
              // Don't use the scheduling function, show immediately
              if (typeof window !== 'undefined' && 'Notification' in window) {
                const { showNotification } = require('@/lib/notifications');
                showNotification({
                  type: 'games-starting',
                  title: '🏈 NFL Games Starting Soon!',
                  body: notification.message,
                  tag: `games-starting-week-${notification.week}`,
                  requireInteraction: false,
                });
              }
              break;

            case 'weekly-results':
              notifyWeeklyResults(
                notification.week,
                notification.correct,
                notification.total,
                notification.rank,
                notification.totalPlayers
              );
              break;
          }
        });
      } catch (error) {
        console.error('Error checking notifications:', error);
      }
    };

    // Check immediately on mount
    checkNotifications();

    // Then check every 5 minutes
    const interval = setInterval(checkNotifications, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // This component doesn't render anything
  return null;
}
