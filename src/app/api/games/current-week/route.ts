import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/session';
import { getCurrentWeek, getWeekGames, getWeekLockTime, isWeekLocked } from '@/lib/espn-api';

/**
 * GET - Get games for a specific week (or current week if not specified)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const weekParam = searchParams.get('week');
    
    const { week: currentWeek, season } = await getCurrentWeek();
    const week = weekParam ? parseInt(weekParam) : currentWeek;
    
    // Validate week range
    if (week < 1 || week > 18) {
      return NextResponse.json(
        { error: 'Week must be between 1 and 18' },
        { status: 400 }
      );
    }
    
    const games = await getWeekGames(week, season);

    // Calculate lock time
    const lockTime = getWeekLockTime(games);
    const locked = isWeekLocked(games);

    return NextResponse.json({
      week,
      season,
      currentWeek,
      games,
      lockTime: lockTime?.toISOString(),
      isLocked: locked,
    });
  } catch (error) {
    console.error('Get current week error:', error);
    return NextResponse.json(
      { status: 500 }
    );
  }
}
