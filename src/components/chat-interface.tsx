'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { 
  ArrowLeft, 
  LogOut,
  MessageSquare,
  Smile,
  Activity,
  Send
} from 'lucide-react';
import { formatTime } from '@/lib/utils';
import { UserAvatar } from '@/components/user-avatar';

interface ChatInterfaceProps {
  user: {
    userId: number;
    username: string;
    firstName: string;
    lastName: string;
  };
}

interface ChatMessage {
  id: number;
  userId: number;
  user: {
    firstName: string;
    lastName: string;
    avatarColor: string;
    avatarType?: string;
    avatarValue?: string | null;
  };
  message: string;
  createdAt: string;
}

const COMMON_EMOJIS = ['😀', '😂', '🤣', '😊', '😎', '🤔', '👍', '👎', '🔥', '💯', '🏈', '🎉', '🍔', '🤷', '😱', '😭'];

export function ChatInterface({ user }: ChatInterfaceProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [week, setWeek] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchMessages(true);
    }, 5000); // 5 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async (silent = false) => {
    if (!silent) setLoading(true);

    try {
      const response = await fetch('/api/chat');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load messages');
      }

      setMessages(data.messages || []);
      setWeek(data.week);
    } catch (error: any) {
      if (!silent) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;

    setSending(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMessage.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      setNewMessage('');
      await fetchMessages(true);
      setShowEmojiPicker(false);
      inputRef.current?.focus();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  const handleEmojiClick = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    inputRef.current?.focus();
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/picks')}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 lg:w-6 lg:h-6" />
                  Week {week} Chat
                </h1>
                <p className="text-xs lg:text-sm text-muted-foreground">
                  {messages.length} message{messages.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto">
              <Button variant="outline" size="sm" onClick={() => router.push('/picks')}>
                <span className="sm:hidden">🏈</span>
                <span className="hidden sm:inline">🏈 Picks</span>
              </Button>
              <Button variant="outline" size="sm" onClick={() => router.push('/scores')}>
                <span className="sm:hidden">📊</span>
                <span className="hidden sm:inline">📊 Scores</span>
              </Button>
              <Button variant="outline" size="sm" onClick={() => router.push('/standings')}>
                <span className="sm:hidden">🏆</span>
                <span className="hidden sm:inline">🏆 Standings</span>
              </Button>
              <Button variant="outline" size="sm" onClick={() => router.push('/stats')}>
                <span className="sm:hidden">📈</span>
                <span className="hidden sm:inline">📈 Stats</span>
              </Button>
              <Button variant="outline" size="sm" onClick={() => router.push('/profile')}>
                <span className="sm:hidden">👤</span>
                <span className="hidden sm:inline">👤 Profile</span>
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline ml-2">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="h-[calc(100vh-200px)] flex flex-col">
          <CardHeader>
            <CardTitle>Group Chat</CardTitle>
            <CardDescription>
              Talk trash, celebrate wins, and discuss the games! 🏈
            </CardDescription>
          </CardHeader>
          
          {/* Messages Area */}
          <CardContent className="flex-1 overflow-y-auto space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <MessageSquare className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-lg font-semibold mb-2">No messages yet</p>
                <p className="text-muted-foreground">Be the first to say something!</p>
              </div>
            ) : (
              <>
                {messages.map((msg, index) => {
                  const isCurrentUser = msg.userId === user.userId;
                  const showAvatar = index === 0 || messages[index - 1].userId !== msg.userId;
                  
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      {showAvatar ? (
                        <UserAvatar
                          firstName={msg.user.firstName}
                          lastName={msg.user.lastName}
                          avatarType={msg.user.avatarType}
                          avatarValue={msg.user.avatarValue}
                          avatarColor={msg.user.avatarColor}
                          size="md"
                          className="flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 flex-shrink-0" />
                      )}
                      
                      <div className={`flex-1 max-w-[70%] ${isCurrentUser ? 'text-right' : 'text-left'}`}>
                        {showAvatar && (
                          <div className={`flex items-center gap-2 mb-1 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                            <span className="text-sm font-semibold">
                              {isCurrentUser ? 'You' : `${msg.user.firstName} ${msg.user.lastName}`}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatMessageTime(msg.createdAt)}
                            </span>
                          </div>
                        )}
                        <div
                          className={`inline-block px-4 py-2 rounded-2xl ${
                            isCurrentUser
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-secondary text-secondary-foreground'
                          }`}
                        >
                          <p className="text-sm break-words whitespace-pre-wrap">{msg.message}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </>
            )}
          </CardContent>

          {/* Message Input */}
          <div className="border-t p-4">
            {showEmojiPicker && (
              <div className="mb-4 p-3 bg-secondary/50 rounded-lg">
                <div className="flex flex-wrap gap-2">
                  {COMMON_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleEmojiClick(emoji)}
                      className="text-2xl hover:scale-125 transition-transform"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <Smile className="w-5 h-5" />
              </Button>
              
              <Input
                ref={inputRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                disabled={sending}
                maxLength={500}
                className="flex-1"
              />
              
              <Button
                type="submit"
                disabled={sending || !newMessage.trim()}
                size="icon"
              >
                {sending ? (
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </form>
            
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-muted-foreground">
                {newMessage.length}/500 characters
              </p>
              <Badge variant="secondary" className="gap-2">
                <Activity className={`w-3 h-3 ${autoRefresh ? 'animate-pulse text-green-500' : ''}`} />
                Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
              </Badge>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
