'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { 
  Database,
  Download,
  Trash2,
  Upload,
  AlertTriangle,
  Save,
  RefreshCw,
  ArrowLeft,
  LogOut,
  Home
} from 'lucide-react';

interface Backup {
  id: number;
  filename: string;
  size: number;
  createdAt: string;
  createdBy: string;
}

export function AdminBackup() {
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [backups, setBackups] = useState<Backup[]>([]);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    try {
      const response = await fetch('/api/admin/backup');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load backups');
      }

      setBackups(data.backups || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    setCreating(true);
    try {
      const response = await fetch('/api/admin/backup', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create backup');
      }

      toast({
        title: 'Backup Created! 💾',
        description: `Backup saved as ${data.backup.filename}`,
      });

      await fetchBackups();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  const handleDownloadBackup = async (backup: Backup) => {
    try {
      const response = await fetch(`/api/admin/backup/download?id=${backup.id}`);

      if (!response.ok) {
        throw new Error('Failed to download backup');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = backup.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Download Started 📥',
        description: `Downloading ${backup.filename}`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteBackup = async (backup: Backup) => {
    if (!confirm(`Are you sure you want to delete backup "${backup.filename}"? This cannot be undone.`)) {
      return;
    }

    setDeletingId(backup.id);
    try {
      const response = await fetch(`/api/admin/backup?id=${backup.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete backup');
      }

      toast({
        title: 'Backup Deleted 🗑️',
        description: 'Backup file has been removed',
      });

      await fetchBackups();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleRestoreBackup = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!confirm(
      '⚠️ WARNING: This will REPLACE your current database with the backup file.\n\n' +
      'A safety backup of your current database will be created automatically.\n\n' +
      'Are you sure you want to continue?'
    )) {
      event.target.value = '';
      return;
    }

    setRestoring(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/backup/restore', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to restore backup');
      }

      toast({
        title: 'Database Restored! ✅',
        description: 'The page will reload in 2 seconds...',
      });

      // Reload page after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      setRestoring(false);
    }

    // Reset file input
    event.target.value = '';
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading backups...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/admin')}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Database className="w-6 h-6" />
                  Backup & Restore
                </h1>
                <p className="text-sm text-muted-foreground">
                  Manage database backups
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.push('/admin')}>
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Warning Card */}
        <Card className="mb-6 border-amber-500/50 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-5 h-5" />
              Important Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>• <strong>Backups</strong> create a copy of your entire database (users, picks, chat, settings)</p>
            <p>• <strong>Restore</strong> replaces your current database with a backup file</p>
            <p>• A safety backup is automatically created before any restore operation</p>
            <p>• Regular backups are recommended before major data changes</p>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Save className="w-5 h-5 text-green-500" />
                Create Backup
              </CardTitle>
              <CardDescription>
                Save a copy of your current database
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleCreateBackup}
                disabled={creating}
                className="w-full"
              >
                {creating && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
                {creating ? 'Creating Backup...' : 'Create New Backup'}
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-500" />
                Restore from File
              </CardTitle>
              <CardDescription>
                Upload a backup file to restore
              </CardDescription>
            </CardHeader>
            <CardContent>
              <input
                ref={fileInputRef}
                type="file"
                accept=".db"
                onChange={handleRestoreBackup}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={restoring}
                variant="outline"
                className="w-full"
              >
                {restoring && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
                {restoring ? 'Restoring...' : 'Upload & Restore'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Backups List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Backup History</span>
              <Badge variant="secondary">{backups.length} backup{backups.length !== 1 ? 's' : ''}</Badge>
            </CardTitle>
            <CardDescription>
              Download or delete previous backups
            </CardDescription>
          </CardHeader>
          <CardContent>
            {backups.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Database className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No backups yet</p>
                <p className="text-sm">Create your first backup to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {backups.map((backup) => (
                  <div
                    key={backup.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{backup.filename}</p>
                      <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                        <span>{formatDate(backup.createdAt)}</span>
                        <span>•</span>
                        <span>{formatFileSize(backup.size)}</span>
                        <span>•</span>
                        <span>by {backup.createdBy}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadBackup(backup)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteBackup(backup)}
                        disabled={deletingId === backup.id}
                      >
                        {deletingId === backup.id ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tips Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">💡 Best Practices</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• Create a backup before making bulk changes or starting a new season</p>
            <p>• Download important backups to your computer for extra safety</p>
            <p>• Keep at least 2-3 recent backups to have restore options</p>
            <p>• Test restore process occasionally to ensure backups work correctly</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
