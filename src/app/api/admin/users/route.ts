import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashCredential, DEFAULT_PASSWORD, isValidUsername } from '@/lib/auth';
import { getAdminSession } from '@/lib/session';
import { getRandomEmoji } from '@/lib/utils';

/**
 * GET - List all users
 */
export async function GET() {
  try {
    const isAdmin = await getAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        avatarType: true,
        avatarValue: true,
        avatarColor: true,
        mustChangePassword: true,
        passwordResetRequested: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

/**
 * POST - Create new user
 */
export async function POST(request: Request) {
  try {
    const isAdmin = await getAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { username, password, firstName, lastName, avatarColor } = data;

    // Validate username
    if (!isValidUsername(username)) {
      return NextResponse.json(
        { error: 'Username must be 3-20 characters (letters, numbers, underscore only)' },
        { status: 400 }
      );
    }

    // Check if username exists
    const existing = await prisma.user.findUnique({
      where: { username },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashCredential(password || DEFAULT_PASSWORD);

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        firstName,
        lastName,
        avatarType: 'initials',
        avatarValue: null,
        avatarColor: avatarColor || '#3b82f6',
        mustChangePassword: true,
      },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        avatarType: true,
        avatarValue: true,
        avatarColor: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
