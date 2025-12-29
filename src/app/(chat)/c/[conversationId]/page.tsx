import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getConversationById } from '@/lib/db/queries/conversations';
import { getMessagesByConversationId } from '@/lib/db/queries/messages';
import { ChatInterface } from '@/components/chat/chat-interface';
import type { Message } from '@/types/chat';
import type { ModelId } from '@/types/models';

interface ConversationPageProps {
  params: Promise<{ conversationId: string }>;
}

export async function generateMetadata({ params }: ConversationPageProps) {
  const { conversationId } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    return { title: 'Unauthorized | Loumi' };
  }

  const conversation = await getConversationById(conversationId, session.user.id);

  if (!conversation) {
    return { title: 'Not Found | Loumi' };
  }

  return {
    title: `${conversation.title} | Loumi`,
  };
}

export default async function ConversationPage({ params }: ConversationPageProps) {
  const { conversationId } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    notFound();
  }

  const conversation = await getConversationById(conversationId, session.user.id);

  if (!conversation) {
    notFound();
  }

  // Fetch initial messages server-side
  const dbMessages = await getMessagesByConversationId(conversationId, 100, 0);

  // Transform database messages to chat message format
  const messages: Message[] = dbMessages.map((msg) => ({
    id: msg.id,
    conversationId: msg.conversationId,
    role: msg.role as 'user' | 'assistant' | 'system',
    content: msg.content,
    model: (msg.model as Message['model']) || undefined,
    tokensUsed: msg.tokensUsed || undefined,
    thinking: msg.thinking || undefined,
    webSearchResults: msg.webSearchResults as Message['webSearchResults'],
    piiDetected: msg.piiDetected as Message['piiDetected'],
    createdAt: msg.createdAt,
  }));

  return (
    <ChatInterface
      conversation={{
        id: conversation.id,
        userId: conversation.userId,
        title: conversation.title,
        model: conversation.model as ModelId,
        folderId: conversation.folderId,
        pinned: conversation.pinned,
        archived: conversation.archived,
        isBurner: conversation.isBurner,
        burnerExpiresAt: conversation.burnerExpiresAt,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
      }}
      initialMessages={messages}
    />
  );
}
