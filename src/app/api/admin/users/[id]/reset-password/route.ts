import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashCredential, DEFAULT_PASSWORD } from '@/lib/auth';
import { getAdminSession } from '@/lib/session';

/**
 * POST - Reset user password to default
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const isAdmin = await getAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(params.id);

    // Hash default password
    const hashedPassword = await hashCredential(DEFAULT_PASSWORD);

    // Update user
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        mustChangePassword: true,
        passwordResetRequested: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Password reset to default',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}
