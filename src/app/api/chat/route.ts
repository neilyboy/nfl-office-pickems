import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserSession } from '@/lib/session';
import { getCurrentWeek } from '@/lib/espn-api';

/**
 * GET - Get chat messages for current week
 */
export async function GET() {
  try {
    const session = await getUserSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current week
    const { week, season } = await getCurrentWeek();

    // Get messages for this week
    const messages = await prisma.chatMessage.findMany({
      where: {
        week,
        season,
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            avatarColor: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
      take: 500, // Limit to last 500 messages
    });

    return NextResponse.json({
      week,
      season,
      messages,
    });
  } catch (error) {
    console.error('Get chat messages error:', error);
    return NextResponse.json(
      { error: 'Failed to load messages' },
      { status: 500 }
    );
  }
}

/**
 * POST - Send a chat message
 */
export async function POST(request: Request) {
  try {
    const session = await getUserSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    if (message.length > 500) {
      return NextResponse.json(
        { error: 'Message too long (max 500 characters)' },
        { status: 400 }
      );
    }

    // Get current week
    const { week, season } = await getCurrentWeek();

    // Create message
    const chatMessage = await prisma.chatMessage.create({
      data: {
        userId: session.userId,
        week,
        season,
        message: message.trim(),
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            avatarColor: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: chatMessage,
    });
  } catch (error) {
    console.error('Send chat message error:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
