'use client';

import Dexie, { type Table } from 'dexie';
import type { Message, Conversation } from '@/types/chat';
import type { ModelId } from '@/types/models';

// Local database schema for Sovereign tier
export interface LocalConversation {
  id: string;
  title: string;
  model: ModelId;
  folderId?: string | null;
  pinned: boolean;
  archived: boolean;
  isBurner: boolean;
  burnerExpiresAt?: number | null;
  createdAt: number;
  updatedAt: number;
  encrypted?: boolean;
}

export interface LocalMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string; // May be encrypted
  model?: ModelId;
  tokensUsed?: number;
  thinking?: string;
  createdAt: number;
  encrypted?: boolean;
}

export interface LocalFolder {
  id: string;
  name: string;
  parentId?: string | null;
  createdAt: number;
}

export interface LocalAuditLog {
  id: string;
  action: string;
  provider: string;
  model: string;
  tokensInput?: number;
  tokensOutput?: number;
  piiDetected?: string[];
  createdAt: number;
}

export interface EncryptionKey {
  id: string;
  key: string; // Exported CryptoKey as base64
  createdAt: number;
}

class SovereignDatabase extends Dexie {
  conversations!: Table<LocalConversation, string>;
  messages!: Table<LocalMessage, string>;
  folders!: Table<LocalFolder, string>;
  auditLogs!: Table<LocalAuditLog, string>;
  encryptionKeys!: Table<EncryptionKey, string>;

  constructor() {
    super('loumi-sovereign');

    this.version(1).stores({
      conversations: 'id, folderId, pinned, archived, updatedAt',
      messages: 'id, conversationId, createdAt',
      folders: 'id, parentId',
      auditLogs: 'id, action, createdAt',
      encryptionKeys: 'id',
    });
  }
}

// Singleton instance
let db: SovereignDatabase | null = null;

export function getSovereignDb(): SovereignDatabase {
  if (typeof window === 'undefined') {
    throw new Error('SovereignDatabase is only available in browser');
  }
  if (!db) {
    db = new SovereignDatabase();
  }
  return db;
}

// Conversation operations
export async function getLocalConversations(options?: {
  archived?: boolean;
  pinned?: boolean;
  folderId?: string | null;
}): Promise<LocalConversation[]> {
  const db = getSovereignDb();
  let query = db.conversations.orderBy('updatedAt').reverse();

  const conversations = await query.toArray();

  return conversations.filter((c) => {
    if (options?.archived !== undefined && c.archived !== options.archived) return false;
    if (options?.pinned !== undefined && c.pinned !== options.pinned) return false;
    if (options?.folderId !== undefined && c.folderId !== options.folderId) return false;
    return true;
  });
}

export async function getLocalConversationById(id: string): Promise<LocalConversation | undefined> {
  const db = getSovereignDb();
  return db.conversations.get(id);
}

export async function createLocalConversation(
  conversation: Omit<LocalConversation, 'createdAt' | 'updatedAt'>
): Promise<LocalConversation> {
  const db = getSovereignDb();
  const now = Date.now();
  const newConversation: LocalConversation = {
    ...conversation,
    createdAt: now,
    updatedAt: now,
  };
  await db.conversations.add(newConversation);
  return newConversation;
}

export async function updateLocalConversation(
  id: string,
  updates: Partial<LocalConversation>
): Promise<void> {
  const db = getSovereignDb();
  await db.conversations.update(id, {
    ...updates,
    updatedAt: Date.now(),
  });
}

export async function deleteLocalConversation(id: string): Promise<void> {
  const db = getSovereignDb();
  await db.transaction('rw', [db.conversations, db.messages], async () => {
    await db.messages.where('conversationId').equals(id).delete();
    await db.conversations.delete(id);
  });
}

// Message operations
export async function getLocalMessages(
  conversationId: string,
  limit = 100,
  offset = 0
): Promise<LocalMessage[]> {
  const db = getSovereignDb();
  return db.messages
    .where('conversationId')
    .equals(conversationId)
    .offset(offset)
    .limit(limit)
    .sortBy('createdAt');
}

export async function createLocalMessage(
  message: Omit<LocalMessage, 'createdAt'>
): Promise<LocalMessage> {
  const db = getSovereignDb();
  const newMessage: LocalMessage = {
    ...message,
    createdAt: Date.now(),
  };
  await db.messages.add(newMessage);

  // Update conversation's updatedAt
  await db.conversations.update(message.conversationId, {
    updatedAt: Date.now(),
  });

  return newMessage;
}

// Audit log operations
export async function createLocalAuditLog(
  log: Omit<LocalAuditLog, 'createdAt'>
): Promise<void> {
  const db = getSovereignDb();
  await db.auditLogs.add({
    ...log,
    createdAt: Date.now(),
  });
}

export async function getLocalAuditLogs(
  limit = 100,
  offset = 0
): Promise<LocalAuditLog[]> {
  const db = getSovereignDb();
  return db.auditLogs
    .orderBy('createdAt')
    .reverse()
    .offset(offset)
    .limit(limit)
    .toArray();
}

// Cleanup expired burner conversations
export async function cleanupExpiredBurners(): Promise<number> {
  const db = getSovereignDb();
  const now = Date.now();

  const expiredIds = await db.conversations
    .filter((c) => c.isBurner && c.burnerExpiresAt != null && c.burnerExpiresAt < now)
    .primaryKeys();

  for (const id of expiredIds) {
    await deleteLocalConversation(id);
  }

  return expiredIds.length;
}

// Clear all data
export async function clearAllLocalData(): Promise<void> {
  const db = getSovereignDb();
  await db.transaction('rw', [db.conversations, db.messages, db.folders, db.auditLogs], async () => {
    await db.conversations.clear();
    await db.messages.clear();
    await db.folders.clear();
    await db.auditLogs.clear();
  });
}
