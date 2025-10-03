import { NextResponse } from 'next/server';
import { clearUserSession } from '@/lib/session';

/**
 * POST - User logout
 */
export async function POST() {
  try {
    await clearUserSession();
    
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
