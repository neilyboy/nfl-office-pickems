import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminSession } from '@/lib/session';
import { getCurrentWeek } from '@/lib/espn-api';

/**
 * GET - Get chat statistics and message counts by week
 */
export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { week: currentWeek, season } = await getCurrentWeek();

    // Get current week messages
    const currentMessages = await prisma.chatMessage.findMany({
      where: {
        week: currentWeek,
        season,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatarColor: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get all message counts by week for current season
    const allMessages = await prisma.chatMessage.findMany({
      where: { season },
      select: {
        week: true,
        id: true,
      },
    });

    const messagesByWeek = new Map<number, number>();
    allMessages.forEach(msg => {
      messagesByWeek.set(msg.week, (messagesByWeek.get(msg.week) || 0) + 1);
    });

    const weekStats = Array.from(messagesByWeek.entries())
      .map(([week, count]) => ({ week, count }))
      .sort((a, b) => b.week - a.week);

    // Get archived chats
    const archives = await prisma.chatArchive.findMany({
      where: { season },
      orderBy: { week: 'desc' },
    });

    return NextResponse.json({
      currentWeek,
      season,
      currentMessages,
      weekStats,
      archives,
    });
  } catch (error) {
    console.error('Get chat management error:', error);
    return NextResponse.json(
      { error: 'Failed to load chat data' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Clear current week's chat or delete an archive
 */
export async function DELETE(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const archiveId = searchParams.get('archiveId');
    const clearCurrent = searchParams.get('clearCurrent');

    if (archiveId) {
      // Delete an archive
      await prisma.chatArchive.delete({
        where: { id: parseInt(archiveId) },
      });

      return NextResponse.json({ message: 'Archive deleted successfully' });
    }

    if (clearCurrent === 'true') {
      // Clear current week's messages
      const { week, season } = await getCurrentWeek();

      const deleted = await prisma.chatMessage.deleteMany({
        where: {
          week,
          season,
        },
      });

      console.log(`Cleared ${deleted.count} messages from Week ${week}`);

      return NextResponse.json({ 
        message: `Cleared ${deleted.count} messages`,
        count: deleted.count
      });
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error) {
    console.error('Delete chat error:', error);
    return NextResponse.json(
      { error: 'Failed to delete chat data' },
      { status: 500 }
    );
  }
}

/**
 * POST - Archive current week's chat
 */
export async function POST() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { week, season } = await getCurrentWeek();

    // Get all messages for current week
    const messages = await prisma.chatMessage.findMany({
      where: {
        week,
        season,
      },
      include: {
        user: {
          select: {
            username: true,
            firstName: true,
            lastName: true,
            avatarColor: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    if (messages.length === 0) {
      return NextResponse.json({ error: 'No messages to archive' }, { status: 400 });
    }

    // Check if archive already exists
    const existingArchive = await prisma.chatArchive.findUnique({
      where: {
        week_season: { week, season },
      },
    });

    if (existingArchive) {
      return NextResponse.json({ error: 'Archive already exists for this week' }, { status: 400 });
    }

    // Create archive
    const archive = await prisma.chatArchive.create({
      data: {
        week,
        season,
        messages: JSON.stringify(messages),
      },
    });

    // Delete original messages
    await prisma.chatMessage.deleteMany({
      where: {
        week,
        season,
      },
    });

    console.log(`Archived ${messages.length} messages from Week ${week}`);

    return NextResponse.json({
      message: `Archived ${messages.length} messages`,
      archive,
    });
  } catch (error) {
    console.error('Archive chat error:', error);
    return NextResponse.json(
      { error: 'Failed to archive chat' },
      { status: 500 }
    );
  }
}
