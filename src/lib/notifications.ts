/**
 * Browser Notification Utilities
 * Handle push notifications for the PWA
 */

export type NotificationType = 
  | 'games-starting'
  | 'make-picks'
  | 'weekly-results'
  | 'achievement'
  | 'general';

export interface NotificationData {
  type: NotificationType;
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: any;
  tag?: string;
  requireInteraction?: boolean;
}

/**
 * Check if browser supports notifications
 */
export function isNotificationSupported(): boolean {
  return 'Notification' in window && 'serviceWorker' in navigator;
}

/**
 * Get current notification permission status
 */
export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) {
    return 'denied';
  }
  return Notification.permission;
}

/**
 * Request notification permission from user
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) {
    console.warn('Notifications not supported');
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    console.log('Notification permission:', permission);
    
    // Save preference to localStorage
    localStorage.setItem('notification-permission', permission);
    
    return permission;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return 'denied';
  }
}

/**
 * Show a browser notification
 */
export async function showNotification(data: NotificationData): Promise<void> {
  if (!isNotificationSupported()) {
    console.warn('Notifications not supported');
    return;
  }

  if (Notification.permission !== 'granted') {
    console.warn('Notification permission not granted');
    return;
  }

  try {
    // If we have a service worker, use it for better notification support
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      
      await registration.showNotification(data.title, {
        body: data.body,
        icon: data.icon || '/icons/icon-192x192.svg',
        badge: data.badge || '/icons/icon-72x72.svg',
        tag: data.tag || `nfl-pickems-${data.type}`,
        requireInteraction: data.requireInteraction || false,
        data: data.data,
      } as any); // Using any to support newer notification features
    } else {
      // Fallback to basic notification
      new Notification(data.title, {
        body: data.body,
        icon: data.icon || '/icons/icon-192x192.svg',
      });
    }
  } catch (error) {
    console.error('Error showing notification:', error);
  }
}

/**
 * Schedule a notification for later
 */
export function scheduleNotification(
  data: NotificationData,
  scheduledTime: Date
): void {
  const now = new Date();
  const delay = scheduledTime.getTime() - now.getTime();

  if (delay <= 0) {
    // Time has passed, show immediately
    showNotification(data);
    return;
  }

  // Schedule for later
  setTimeout(() => {
    showNotification(data);
  }, delay);

  console.log(`Notification scheduled for ${scheduledTime.toLocaleString()}`);
}

/**
 * Show "Games Starting Soon" notification
 */
export function notifyGamesStarting(firstGameTime: Date, week: number): void {
  const oneHourBefore = new Date(firstGameTime.getTime() - 60 * 60 * 1000);
  
  scheduleNotification(
    {
      type: 'games-starting',
      title: '🏈 NFL Games Starting Soon!',
      body: `Week ${week} games start in 1 hour. Good luck with your picks!`,
      tag: `games-starting-week-${week}`,
      requireInteraction: false,
    },
    oneHourBefore
  );
}

/**
 * Show "Make Your Picks" reminder
 */
export function notifyMakePicks(week: number, hoursUntilLock: number): void {
  showNotification({
    type: 'make-picks',
    title: '⏰ Time to Make Your Picks!',
    body: `Week ${week} locks in ${hoursUntilLock} hours. Don't miss out!`,
    tag: `make-picks-week-${week}`,
    requireInteraction: true,
    data: { week, url: '/picks' },
  });
}

/**
 * Show weekly results notification
 */
export function notifyWeeklyResults(
  week: number,
  correct: number,
  total: number,
  rank: number,
  totalPlayers: number
): void {
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
  const emoji = percentage >= 70 ? '🎉' : percentage >= 50 ? '👍' : '💪';
  
  showNotification({
    type: 'weekly-results',
    title: `${emoji} Week ${week} Results`,
    body: `You got ${correct}/${total} correct (${percentage}%). Rank: #${rank}/${totalPlayers}`,
    tag: `weekly-results-week-${week}`,
    requireInteraction: false,
    data: { week, correct, total, rank },
  });
}

/**
 * Show achievement unlocked notification
 */
export function notifyAchievement(
  badgeName: string,
  badgeDescription: string,
  rarity: string
): void {
  const rarityEmoji = {
    common: '🥉',
    rare: '🥈',
    epic: '🥇',
    legendary: '💎',
  }[rarity] || '🏆';

  showNotification({
    type: 'achievement',
    title: `${rarityEmoji} Achievement Unlocked!`,
    body: `${badgeName} - ${badgeDescription}`,
    tag: `achievement-${badgeName}`,
    requireInteraction: false,
    data: { badgeName, rarity },
  });
}

/**
 * Clear all notifications for the app
 */
export async function clearAllNotifications(): Promise<void> {
  if (!isNotificationSupported()) return;
  
  try {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      const notifications = await registration.getNotifications();
      
      notifications.forEach(notification => notification.close());
      console.log(`Cleared ${notifications.length} notifications`);
    }
  } catch (error) {
    console.error('Error clearing notifications:', error);
  }
}

/**
 * Check if user has notifications enabled
 */
export function hasNotificationsEnabled(): boolean {
  const permission = getNotificationPermission();
  const userPreference = localStorage.getItem('notifications-enabled');
  
  return permission === 'granted' && userPreference !== 'false';
}

/**
 * Enable/disable notifications (user preference)
 */
export function setNotificationsEnabled(enabled: boolean): void {
  localStorage.setItem('notifications-enabled', enabled ? 'true' : 'false');
}
