import { NextResponse } from 'next/server';
import { clearAdminSession } from '@/lib/session';

/**
 * POST - Logout admin
 */
export async function POST() {
  try {
    await clearAdminSession();
    
    return NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}
