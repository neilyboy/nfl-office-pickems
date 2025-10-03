import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/session';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'prisma', 'data');
const BACKUP_DIR = path.join(DATA_DIR, 'backups');

/**
 * POST - Restore from a backup file
 */
export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file is a .db file
    if (!file.name.endsWith('.db')) {
      return NextResponse.json({ error: 'Invalid file type. Must be a .db file' }, { status: 400 });
    }

    // Create a safety backup of current database first
    const dbPath = path.join(DATA_DIR, 'nfl-pickems.db');
    const safetyBackupPath = path.join(BACKUP_DIR, `safety-backup-${Date.now()}.db`);
    
    await fs.mkdir(BACKUP_DIR, { recursive: true });
    await fs.copyFile(dbPath, safetyBackupPath);
    console.log(`Safety backup created at: ${safetyBackupPath}`);

    // Read the uploaded file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Write to database path (overwrite current database)
    await fs.writeFile(dbPath, buffer);

    console.log(`Database restored from: ${file.name}`);

    return NextResponse.json({ 
      message: 'Database restored successfully. Please refresh the page.',
      safetyBackup: path.basename(safetyBackupPath)
    });
  } catch (error) {
    console.error('Restore backup error:', error);
    return NextResponse.json(
      { error: 'Failed to restore backup' },
      { status: 500 }
    );
  }
}
