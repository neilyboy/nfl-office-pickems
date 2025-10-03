import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * POST - Request password reset
 */
export async function POST(request: Request) {
  try {
    const { username } = await request.json();

    if (!username) {
      return NextResponse.json(
        { error: 'Username required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      // Don't reveal if user exists or not
      return NextResponse.json({
        success: true,
        message: 'If the username exists, admin will be notified',
      });
    }

    // Mark password reset as requested
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordResetRequested: true },
    });

    return NextResponse.json({
      success: true,
      message: 'Password reset requested',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Request failed' },
      { status: 500 }
    );
  }
}
