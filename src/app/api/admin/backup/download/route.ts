import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/session';
import { promises as fs } from 'fs';
import path from 'path';
import { prisma } from '@/lib/db';

const DATA_DIR = path.join(process.cwd(), 'prisma', 'data');
const BACKUP_DIR = path.join(DATA_DIR, 'backups');

/**
 * GET - Download a backup file
 */
export async function GET(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const backupId = searchParams.get('id');

    if (!backupId) {
      return NextResponse.json({ error: 'Backup ID required' }, { status: 400 });
    }

    // Find the backup record
    const backup = await prisma.systemBackup.findUnique({
      where: { id: parseInt(backupId) },
    });

    if (!backup) {
      return NextResponse.json({ error: 'Backup not found' }, { status: 404 });
    }

    // Read the backup file
    const backupPath = path.join(BACKUP_DIR, backup.filename);
    const fileBuffer = await fs.readFile(backupPath);

    // Return file as download
    return new NextResponse(fileBuffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${backup.filename}"`,
        'Content-Length': backup.size.toString(),
      },
    });
  } catch (error) {
    console.error('Download backup error:', error);
    return NextResponse.json(
      { error: 'Failed to download backup' },
      { status: 500 }
    );
  }
}
