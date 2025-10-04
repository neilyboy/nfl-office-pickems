import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserSession } from '@/lib/session';

/**
 * GET - Get all users with their permissions
 */
export async function GET() {
  try {
    const session = await getUserSession();
    if (!session || !session.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized - Admin only' }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        canUseRandomPicker: true,
        canSeeUpsetAlerts: true,
        canSeePowerRankings: true,
        canUseMatchupSim: true,
      },
      orderBy: {
        firstName: 'asc',
      },
    });

    return NextResponse.json({ users });
  } catch (error: any) {
    console.error('Error fetching user permissions:', error);
    return NextResponse.json({ error: 'Failed to fetch permissions' }, { status: 500 });
  }
}

/**
 * PUT - Update user permissions (Admin only)
 */
export async function PUT(request: Request) {
  try {
    const session = await getUserSession();
    if (!session || !session.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized - Admin only' }, { status: 403 });
    }

    const body = await request.json();
    const { userId, permissions } = body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        canUseRandomPicker: permissions.canUseRandomPicker,
        canSeeUpsetAlerts: permissions.canSeeUpsetAlerts,
        canSeePowerRankings: permissions.canSeePowerRankings,
        canUseMatchupSim: permissions.canUseMatchupSim,
      },
    });

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error('Error updating user permissions:', error);
    return NextResponse.json({ error: 'Failed to update permissions' }, { status: 500 });
  }
}
