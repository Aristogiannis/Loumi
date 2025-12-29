import { eq, asc, desc, and, sql } from 'drizzle-orm';
import { db } from '../index';
import { messages, conversations, type Message, type NewMessage } from '../schema';

export async function getMessagesByConversationId(
  conversationId: string,
  limit?: number,
  offset?: number
): Promise<Message[]> {
  const result = await db.query.messages.findMany({
    where: eq(messages.conversationId, conversationId),
    orderBy: [asc(messages.createdAt)],
    limit,
    offset,
  });
  return result;
}

export async function getMessageById(id: string): Promise<Message | undefined> {
  const result = await db.query.messages.findFirst({
    where: eq(messages.id, id),
  });
  return result;
}

export async function createMessage(data: NewMessage): Promise<Message> {
  const [message] = await db.insert(messages).values(data).returning();

  // Update conversation's updatedAt timestamp
  await db
    .update(conversations)
    .set({ updatedAt: new Date() })
    .where(eq(conversations.id, data.conversationId));

  return message!;
}

export async function createMessages(data: NewMessage[]): Promise<Message[]> {
  if (data.length === 0) return [];

  const result = await db.insert(messages).values(data).returning();

  // Update conversation's updatedAt timestamp for the first message's conversation
  if (data[0]) {
    await db
      .update(conversations)
      .set({ updatedAt: new Date() })
      .where(eq(conversations.id, data[0].conversationId));
  }

  return result;
}

export async function updateMessage(
  id: string,
  data: Partial<Pick<Message, 'content' | 'thinking' | 'webSearchResults' | 'tokensUsed'>>
): Promise<Message | undefined> {
  const [message] = await db
    .update(messages)
    .set(data)
    .where(eq(messages.id, id))
    .returning();
  return message;
}

export async function deleteMessage(id: string): Promise<void> {
  await db.delete(messages).where(eq(messages.id, id));
}

export async function deleteMessagesByConversationId(
  conversationId: string
): Promise<void> {
  await db.delete(messages).where(eq(messages.conversationId, conversationId));
}

export async function getLastMessageInConversation(
  conversationId: string
): Promise<Message | undefined> {
  const result = await db.query.messages.findFirst({
    where: eq(messages.conversationId, conversationId),
    orderBy: [desc(messages.createdAt)],
  });
  return result;
}

export async function getMessageCount(conversationId: string): Promise<number> {
  const [result] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(messages)
    .where(eq(messages.conversationId, conversationId));
  return result?.count ?? 0;
}

export async function getTotalTokensUsed(conversationId: string): Promise<number> {
  const [result] = await db
    .select({ total: sql<number>`COALESCE(SUM(${messages.tokensUsed}), 0)::int` })
    .from(messages)
    .where(eq(messages.conversationId, conversationId));
  return result?.total ?? 0;
}
