import { eq, and, desc, asc, like, or, sql, count } from 'drizzle-orm';
import { db } from '../index';
import {
  conversations,
  messages,
  type Conversation,
  type NewConversation,
} from '../schema';

export interface GetConversationsOptions {
  userId: string;
  archived?: boolean;
  pinned?: boolean;
  folderId?: string | null;
  search?: string;
  limit?: number;
  offset?: number;
}

export async function getConversationsByUserId(
  options: GetConversationsOptions
): Promise<Conversation[]> {
  const { userId, archived = false, pinned, folderId, search, limit = 50, offset = 0 } = options;

  const conditions = [
    eq(conversations.userId, userId),
    eq(conversations.archived, archived),
  ];

  if (pinned !== undefined) {
    conditions.push(eq(conversations.pinned, pinned));
  }

  if (folderId !== undefined) {
    conditions.push(
      folderId === null
        ? sql`${conversations.folderId} IS NULL`
        : eq(conversations.folderId, folderId)
    );
  }

  if (search) {
    conditions.push(like(conversations.title, `%${search}%`));
  }

  const result = await db.query.conversations.findMany({
    where: and(...conditions),
    orderBy: [desc(conversations.pinned), desc(conversations.updatedAt)],
    limit,
    offset,
  });

  return result;
}

export async function getConversationById(
  id: string,
  userId: string
): Promise<Conversation | undefined> {
  const result = await db.query.conversations.findFirst({
    where: and(eq(conversations.id, id), eq(conversations.userId, userId)),
    with: {
      messages: {
        orderBy: [asc(messages.createdAt)],
      },
      folder: true,
    },
  });
  return result;
}

export async function createConversation(
  data: NewConversation
): Promise<Conversation> {
  const [conversation] = await db.insert(conversations).values(data).returning();
  return conversation!;
}

export async function updateConversation(
  id: string,
  userId: string,
  data: Partial<Pick<Conversation, 'title' | 'model' | 'folderId' | 'pinned' | 'archived'>>
): Promise<Conversation | undefined> {
  const [conversation] = await db
    .update(conversations)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(conversations.id, id), eq(conversations.userId, userId)))
    .returning();
  return conversation;
}

export async function deleteConversation(id: string, userId: string): Promise<void> {
  await db
    .delete(conversations)
    .where(and(eq(conversations.id, id), eq(conversations.userId, userId)));
}

export async function archiveConversation(
  id: string,
  userId: string
): Promise<Conversation | undefined> {
  return updateConversation(id, userId, { archived: true });
}

export async function pinConversation(
  id: string,
  userId: string,
  pinned: boolean
): Promise<Conversation | undefined> {
  return updateConversation(id, userId, { pinned });
}

export async function moveConversationToFolder(
  id: string,
  userId: string,
  folderId: string | null
): Promise<Conversation | undefined> {
  return updateConversation(id, userId, { folderId });
}

export async function updateConversationTitle(
  id: string,
  userId: string,
  title: string
): Promise<Conversation | undefined> {
  return updateConversation(id, userId, { title });
}

export async function searchConversations(
  userId: string,
  query: string,
  limit = 20
): Promise<Conversation[]> {
  // Search in both conversation titles and message content
  const result = await db
    .select({
      id: conversations.id,
      userId: conversations.userId,
      title: conversations.title,
      model: conversations.model,
      folderId: conversations.folderId,
      pinned: conversations.pinned,
      archived: conversations.archived,
      isBurner: conversations.isBurner,
      burnerExpiresAt: conversations.burnerExpiresAt,
      createdAt: conversations.createdAt,
      updatedAt: conversations.updatedAt,
    })
    .from(conversations)
    .leftJoin(messages, eq(conversations.id, messages.conversationId))
    .where(
      and(
        eq(conversations.userId, userId),
        eq(conversations.archived, false),
        or(
          sql`${conversations.title} ILIKE ${`%${query}%`}`,
          sql`${messages.content} ILIKE ${`%${query}%`}`
        )
      )
    )
    .groupBy(conversations.id)
    .orderBy(desc(conversations.updatedAt))
    .limit(limit);

  return result;
}

export async function getConversationCount(userId: string): Promise<number> {
  const [result] = await db
    .select({ count: count() })
    .from(conversations)
    .where(and(eq(conversations.userId, userId), eq(conversations.archived, false)));
  return result?.count ?? 0;
}

export async function cleanupBurnerConversations(): Promise<number> {
  const now = new Date();
  const result = await db
    .delete(conversations)
    .where(
      and(
        eq(conversations.isBurner, true),
        sql`${conversations.burnerExpiresAt} <= ${now}`
      )
    )
    .returning();
  return result.length;
}
