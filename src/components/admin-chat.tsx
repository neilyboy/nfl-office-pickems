'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { 
  MessageSquare,
  Trash2,
  Archive,
  ArrowLeft,
  LogOut,
  Home,
  AlertTriangle,
  Eye,
  RefreshCw
} from 'lucide-react';
import { getInitials } from '@/lib/utils';

interface ChatMessage {
  id: number;
  userId: number;
  message: string;
  createdAt: string;
  user: {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    avatarColor: string;
  };
}

interface ChatArchive {
  id: number;
  week: number;
  season: number;
  archivedAt: string;
  messages: string;
}

interface WeekStat {
  week: number;
  count: number;
}

export function AdminChat() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(0);
  const [season, setSeason] = useState(0);
  const [currentMessages, setCurrentMessages] = useState<ChatMessage[]>([]);
  const [weekStats, setWeekStats] = useState<WeekStat[]>([]);
  const [archives, setArchives] = useState<ChatArchive[]>([]);
  const [viewingArchive, setViewingArchive] = useState<ChatArchive | null>(null);

  useEffect(() => {
    fetchChatData();
  }, []);

  const fetchChatData = async () => {
    try {
      const response = await fetch('/api/admin/chat');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load chat data');
      }

      setCurrentWeek(data.currentWeek);
      setSeason(data.season);
      setCurrentMessages(data.currentMessages || []);
      setWeekStats(data.weekStats || []);
      setArchives(data.archives || []);
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

  const handleClearChat = async () => {
    if (!confirm(
      `⚠️ WARNING: This will permanently delete all ${currentMessages.length} messages from Week ${currentWeek}.\n\n` +
      'Consider archiving instead if you want to preserve the chat history.\n\n' +
      'Are you sure you want to continue?'
    )) {
      return;
    }

    setClearing(true);
    try {
      const response = await fetch('/api/admin/chat?clearCurrent=true', {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to clear chat');
      }

      toast({
        title: 'Chat Cleared! 🗑️',
        description: `Deleted ${data.count} messages`,
      });

      await fetchChatData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setClearing(false);
    }
  };

  const handleArchiveChat = async () => {
    if (!confirm(
      `Archive Week ${currentWeek} chat?\n\n` +
      `This will save ${currentMessages.length} messages to the archive and remove them from active chat.\n\n` +
      'You can view archived chats later, but they cannot be restored to active chat.'
    )) {
      return;
    }

    setArchiving(true);
    try {
      const response = await fetch('/api/admin/chat', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to archive chat');
      }

      toast({
        title: 'Chat Archived! 📦',
        description: data.message,
      });

      await fetchChatData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setArchiving(false);
    }
  };

  const handleDeleteArchive = async (archive: ChatArchive) => {
    if (!confirm(
      `Delete Week ${archive.week} archive?\n\n` +
      'This will permanently delete the archived chat. This cannot be undone.'
    )) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/chat?archiveId=${archive.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete archive');
      }

      toast({
        title: 'Archive Deleted',
        description: 'Chat archive has been removed',
      });

      await fetchChatData();
      if (viewingArchive?.id === archive.id) {
        setViewingArchive(null);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleViewArchive = (archive: ChatArchive) => {
    setViewingArchive(archive);
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
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
          <p className="text-muted-foreground">Loading chat data...</p>
        </div>
      </div>
    );
  }

  // Parse archived messages if viewing
  const archivedMessages: ChatMessage[] = viewingArchive
    ? JSON.parse(viewingArchive.messages)
    : [];

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
                onClick={() => viewingArchive ? setViewingArchive(null) : router.push('/admin')}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <MessageSquare className="w-6 h-6" />
                  {viewingArchive ? `Week ${viewingArchive.week} Archive` : 'Chat Management'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {viewingArchive
                    ? `${archivedMessages.length} archived messages`
                    : `Week ${currentWeek} • ${season} Season`}
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
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {viewingArchive ? (
          /* Viewing Archive */
          <Card>
            <CardHeader>
              <CardTitle>Archived Messages</CardTitle>
              <CardDescription>
                Archived on {formatDate(viewingArchive.archivedAt)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {archivedMessages.map((msg, idx) => (
                  <div key={idx} className="flex gap-3 p-3 rounded-lg bg-secondary/20">
                    <Avatar>
                      <AvatarFallback style={{ backgroundColor: msg.user.avatarColor }}>
                        {getInitials(msg.user.firstName, msg.user.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">
                          {msg.user.firstName} {msg.user.lastName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(msg.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm">{msg.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Main Chat Management */
          <>
            {/* Warning Card */}
            <Card className="mb-6 border-amber-500/50 bg-amber-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="w-5 h-5" />
                  Chat Management Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>• <strong>Clear Chat</strong> permanently deletes all messages (cannot be recovered)</p>
                <p>• <strong>Archive</strong> saves messages and removes them from active chat</p>
                <p>• Archives can be viewed later but not restored to active chat</p>
                <p>• Consider archiving at the end of each week to keep chat history</p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Current Week Messages */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Week {currentWeek} Chat</CardTitle>
                        <CardDescription>
                          {currentMessages.length} active message{currentMessages.length !== 1 ? 's' : ''}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleArchiveChat}
                          disabled={archiving || currentMessages.length === 0}
                        >
                          {archiving ? (
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Archive className="w-4 h-4 mr-2" />
                          )}
                          Archive
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={handleClearChat}
                          disabled={clearing || currentMessages.length === 0}
                        >
                          {clearing ? (
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4 mr-2" />
                          )}
                          Clear
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {currentMessages.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No messages this week</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[500px] overflow-y-auto">
                        {currentMessages.map((msg) => (
                          <div key={msg.id} className="flex gap-3 p-3 rounded-lg bg-secondary/20">
                            <Avatar>
                              <AvatarFallback style={{ backgroundColor: msg.user.avatarColor }}>
                                {getInitials(msg.user.firstName, msg.user.lastName)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">
                                  {msg.user.firstName} {msg.user.lastName}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(msg.createdAt)}
                                </span>
                              </div>
                              <p className="text-sm">{msg.message}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Week Statistics */}
                <Card>
                  <CardHeader>
                    <CardTitle>Messages by Week</CardTitle>
                    <CardDescription>{season} Season</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {weekStats.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No messages yet
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {weekStats.map((stat) => (
                          <div
                            key={stat.week}
                            className="flex items-center justify-between p-2 rounded-lg bg-secondary/20"
                          >
                            <span className="text-sm font-medium">Week {stat.week}</span>
                            <Badge variant={stat.week === currentWeek ? 'default' : 'secondary'}>
                              {stat.count} msg{stat.count !== 1 ? 's' : ''}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Archives */}
                <Card>
                  <CardHeader>
                    <CardTitle>Archives</CardTitle>
                    <CardDescription>
                      {archives.length} archived week{archives.length !== 1 ? 's' : ''}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {archives.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No archives yet
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {archives.map((archive) => {
                          const messages = JSON.parse(archive.messages);
                          return (
                            <div
                              key={archive.id}
                              className="flex items-center justify-between p-2 rounded-lg bg-secondary/20"
                            >
                              <div className="flex-1">
                                <p className="text-sm font-medium">Week {archive.week}</p>
                                <p className="text-xs text-muted-foreground">
                                  {messages.length} messages
                                </p>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewArchive(archive)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteArchive(archive)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
