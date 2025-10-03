import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashCredential, isValidPin, isValidPassword } from '@/lib/auth';

/**
 * GET - Check if initial setup is complete
 */
export async function GET() {
  try {
    const adminSettings = await prisma.adminSettings.findFirst({
      where: { id: 1 },
    });

    return NextResponse.json({
      setupComplete: !!adminSettings,
    });
  } catch (error) {
    console.error('Setup check error:', error);
    return NextResponse.json(
      { error: 'Failed to check setup status' },
      { status: 500 }
    );
  }
}

/**
 * POST - Complete initial setup
 */
export async function POST(request: Request) {
  try {
    const { pin, password } = await request.json();

    // Validate inputs
    if (!isValidPin(pin)) {
      return NextResponse.json(
        { error: 'PIN must be 4 or 6 digits' },
        { status: 400 }
      );
    }

    if (!isValidPassword(password)) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Check if setup already complete
    const existing = await prisma.adminSettings.findFirst({
      where: { id: 1 },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Setup already complete' },
        { status: 400 }
      );
    }

    // Hash credentials
    const hashedPin = await hashCredential(pin);
    const hashedPassword = await hashCredential(password);

    // Create admin settings
    await prisma.adminSettings.create({
      data: {
        id: 1,
        pin: hashedPin,
        password: hashedPassword,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Setup completed successfully',
    });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { error: 'Failed to complete setup' },
      { status: 500 }
    );
  }
}
