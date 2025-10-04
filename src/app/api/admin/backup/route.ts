import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminSession } from '@/lib/session';
import { promises as fs } from 'fs';
import path from 'path';

// Check if running in Docker (DATABASE_URL points to /app/data)
const isDarwin = process.env.DATABASE_URL?.includes('/app/data');
const DATA_DIR = isDarwin 
  ? '/app/data'  // Docker path
  : path.join(process.cwd(), 'prisma', 'data'); // Dev path
const BACKUP_DIR = path.join(DATA_DIR, 'backups');

// Ensure backup directory exists
async function ensureBackupDir() {
  try {
    await fs.mkdir(BACKUP_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to create backup directory:', error);
  }
}

/**
 * GET - List all backups
 */
export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const backups = await prisma.systemBackup.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ backups });
  } catch (error) {
    console.error('Get backups error:', error);
    return NextResponse.json(
      { error: 'Failed to load backups' },
      { status: 500 }
    );
  }
}

/**
 * POST - Create a new backup
 */
export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await ensureBackupDir();

    // Generate backup filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFilename = `backup-${timestamp}.db`;
    const backupPath = path.join(BACKUP_DIR, backupFilename);
    const dbPath = path.join(DATA_DIR, 'nfl-pickems.db');

    // Copy the database file
    await fs.copyFile(dbPath, backupPath);

    // Get file size
    const stats = await fs.stat(backupPath);
    const sizeInBytes = stats.size;

    // Record backup in database
    const backup = await prisma.systemBackup.create({
      data: {
        filename: backupFilename,
        size: sizeInBytes,
        createdBy: 'admin',
      },
    });

    console.log(`Backup created: ${backupFilename} (${sizeInBytes} bytes)`);

    return NextResponse.json({ 
      message: 'Backup created successfully',
      backup 
    });
  } catch (error) {
    console.error('Create backup error:', error);
    return NextResponse.json(
      { error: 'Failed to create backup' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Delete a backup
 */
export async function DELETE(request: Request) {
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

    // Delete the file
    const backupPath = path.join(BACKUP_DIR, backup.filename);
    try {
      await fs.unlink(backupPath);
    } catch (error) {
      console.error('Failed to delete backup file:', error);
      // Continue to delete from database even if file doesn't exist
    }

    // Delete from database
    await prisma.systemBackup.delete({
      where: { id: parseInt(backupId) },
    });

    console.log(`Backup deleted: ${backup.filename}`);

    return NextResponse.json({ message: 'Backup deleted successfully' });
  } catch (error) {
    console.error('Delete backup error:', error);
    return NextResponse.json(
      { error: 'Failed to delete backup' },
      { status: 500 }
    );
  }
}
