import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyCredential } from '@/lib/auth';
import { setAdminSession } from '@/lib/session';

/**
 * POST - Verify admin PIN or password
 */
export async function POST(request: Request) {
  try {
    const { pin, password } = await request.json();

    // Get admin settings
    const adminSettings = await prisma.adminSettings.findFirst({
      where: { id: 1 },
    });

    if (!adminSettings) {
      return NextResponse.json(
        { error: 'Admin not configured' },
        { status: 400 }
      );
    }

    // Verify PIN or password
    let isValid = false;
    
    if (pin) {
      isValid = await verifyCredential(pin, adminSettings.pin);
    } else if (password) {
      isValid = await verifyCredential(password, adminSettings.password);
    } else {
      return NextResponse.json(
        { error: 'PIN or password required' },
        { status: 400 }
      );
    }

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Set admin session
    await setAdminSession();

    return NextResponse.json({
      success: true,
      message: 'Admin authenticated',
    });
  } catch (error) {
    console.error('Admin auth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
