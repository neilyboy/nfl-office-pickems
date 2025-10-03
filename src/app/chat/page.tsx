import { redirect } from 'next/navigation';
import { getUserSession } from '@/lib/session';
import { ChatInterface } from '@/components/chat-interface';

export default async function ChatPage() {
  const session = await getUserSession();
  
  if (!session) {
    redirect('/login');
  }

  return <ChatInterface user={session} />;
}
