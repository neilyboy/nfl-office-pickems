import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashCredential, isValidUsername } from '@/lib/auth';
import { getAdminSession } from '@/lib/session';

/**
 * PUT - Update user
 */
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const isAdmin = await getAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(params.id);
    const data = await request.json();
    const { username, firstName, lastName, avatarColor, password } = data;

    // Validate username if changed
    if (username && !isValidUsername(username)) {
      return NextResponse.json(
        { error: 'Invalid username format' },
        { status: 400 }
      );
    }

    // Check if username is taken by another user
    if (username) {
      const existing = await prisma.user.findFirst({
        where: {
          username,
          NOT: { id: userId },
        },
      });

      if (existing) {
        return NextResponse.json(
          { error: 'Username already taken' },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {
      username,
      firstName,
      lastName,
      avatarColor,
    };

    // Hash new password if provided
    if (password) {
      updateData.password = await hashCredential(password);
      updateData.mustChangePassword = true;
    }

    // Update user
    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        avatarType: true,
        avatarValue: true,
        avatarColor: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Delete user
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const isAdmin = await getAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(params.id);

    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
