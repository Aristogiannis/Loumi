import type { Conversation, Message } from '@/types/chat';

export interface ExportedConversation {
  metadata: {
    title: string;
    model: string;
    createdAt: string;
    updatedAt: string;
    exportedAt: string;
    messageCount: number;
    source: string;
  };
  messages: Array<{
    role: string;
    content: string;
    model?: string;
    tokensUsed?: number;
    thinking?: string;
    createdAt: string;
  }>;
}

export function exportToJson(
  conversation: Conversation,
  messages: Message[]
): ExportedConversation {
  return {
    metadata: {
      title: conversation.title,
      model: conversation.model,
      createdAt: conversation.createdAt.toISOString(),
      updatedAt: conversation.updatedAt.toISOString(),
      exportedAt: new Date().toISOString(),
      messageCount: messages.length,
      source: 'Loumi',
    },
    messages: messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
      model: msg.model,
      tokensUsed: msg.tokensUsed,
      thinking: msg.thinking,
      createdAt: msg.createdAt.toISOString(),
    })),
  };
}

export function exportToJsonString(
  conversation: Conversation,
  messages: Message[]
): string {
  return JSON.stringify(exportToJson(conversation, messages), null, 2);
}

export function generateJsonFilename(conversation: Conversation): string {
  const sanitizedTitle = conversation.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);

  const date = new Date().toISOString().split('T')[0];

  return `loumi-${sanitizedTitle}-${date}.json`;
}
