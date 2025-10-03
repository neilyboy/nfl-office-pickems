import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/Chicago',
  });
}

export function formatTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/Chicago',
    timeZoneName: 'short',
  });
}

export function getCurrentCSTTime(): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' }));
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function getAvatarColorFromString(str: string): string {
  // Generate a consistent color from a string
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    '#3b82f6', // blue
    '#10b981', // green
    '#f59e0b', // amber
    '#ef4444', // red
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#06b6d4', // cyan
    '#f97316', // orange
  ];
  return colors[Math.abs(hash) % colors.length];
}

export function validateMdiIcon(icon: string): boolean {
  // Basic validation for MDI icon format
  return /^mdi:[a-z0-9-]+$/.test(icon);
}

export function getRandomEmoji(): string {
  const emojis = ['🏈', '⚡', '🔥', '💪', '🎯', '🚀', '⭐', '🏆', '💯', '🎮'];
  return emojis[Math.floor(Math.random() * emojis.length)];
}

export function calculateWinPercentage(wins: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((wins / total) * 100);
}

export function getDayOfWeek(date: Date | string): string {
  const d = new Date(date);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[d.getDay()];
}

export function groupGamesByDay(games: any[]): Map<string, any[]> {
  const grouped = new Map<string, any[]>();
  
  games.forEach(game => {
    const day = getDayOfWeek(game.date);
    if (!grouped.has(day)) {
      grouped.set(day, []);
    }
    grouped.get(day)!.push(game);
  });
  
  return grouped;
}
