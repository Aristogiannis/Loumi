'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePrivacyTier } from './use-privacy-tier';
import {
  getSovereignDb,
  getLocalConversations,
  getLocalConversationById,
  createLocalConversation,
  updateLocalConversation,
  deleteLocalConversation,
  getLocalMessages,
  createLocalMessage,
  cleanupExpiredBurners,
  type LocalConversation,
  type LocalMessage,
} from '@/lib/local-storage/sovereign-db';
import { encryptionManager } from '@/lib/privacy/encryption';
import type { ModelId } from '@/types/models';

export function useLocalStorage() {
  const { isSovereign } = usePrivacyTier();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isEncrypted, setIsEncrypted] = useState(false);

  // Initialize encryption for sovereign tier
  useEffect(() => {
    if (isSovereign && typeof window !== 'undefined') {
      // Check if encryption is already initialized
      if (encryptionManager.isInitialized()) {
        setIsEncrypted(true);
        setIsInitialized(true);
      } else {
        // For now, use a generated key (in production, prompt user for password)
        encryptionManager.initialize().then(() => {
          setIsEncrypted(true);
          setIsInitialized(true);
        });
      }

      // Cleanup expired burner conversations
      cleanupExpiredBurners().catch(console.error);
    } else {
      setIsInitialized(true);
    }
  }, [isSovereign]);

  // Get conversations from local storage
  const getConversations = useCallback(
    async (options?: {
      archived?: boolean;
      pinned?: boolean;
      folderId?: string | null;
    }) => {
      if (!isSovereign) return [];
      return getLocalConversations(options);
    },
    [isSovereign]
  );

  // Get a single conversation
  const getConversation = useCallback(
    async (id: string) => {
      if (!isSovereign) return undefined;
      return getLocalConversationById(id);
    },
    [isSovereign]
  );

  // Create a conversation
  const createConversation = useCallback(
    async (data: {
      id: string;
      title: string;
      model: ModelId;
      folderId?: string | null;
      isBurner?: boolean;
      burnerDuration?: number;
    }) => {
      if (!isSovereign) throw new Error('Local storage only available for sovereign tier');

      const conversation: Omit<LocalConversation, 'createdAt' | 'updatedAt'> = {
        id: data.id,
        title: data.title,
        model: data.model,
        folderId: data.folderId ?? null,
        pinned: false,
        archived: false,
        isBurner: data.isBurner ?? false,
        burnerExpiresAt: data.burnerDuration
          ? Date.now() + data.burnerDuration * 60 * 60 * 1000
          : null,
        encrypted: isEncrypted,
      };

      return createLocalConversation(conversation);
    },
    [isSovereign, isEncrypted]
  );

  // Update a conversation
  const updateConversationLocal = useCallback(
    async (id: string, updates: Partial<LocalConversation>) => {
      if (!isSovereign) throw new Error('Local storage only available for sovereign tier');
      return updateLocalConversation(id, updates);
    },
    [isSovereign]
  );

  // Delete a conversation
  const deleteConversationLocal = useCallback(
    async (id: string) => {
      if (!isSovereign) throw new Error('Local storage only available for sovereign tier');
      return deleteLocalConversation(id);
    },
    [isSovereign]
  );

  // Get messages for a conversation
  const getMessagesLocal = useCallback(
    async (conversationId: string, limit = 100, offset = 0) => {
      if (!isSovereign) return [];
      const messages = await getLocalMessages(conversationId, limit, offset);

      // Decrypt messages if encrypted
      if (isEncrypted) {
        return Promise.all(
          messages.map(async (msg) => {
            if (msg.encrypted) {
              const decryptedContent = await encryptionManager.decrypt(msg.content);
              return { ...msg, content: decryptedContent };
            }
            return msg;
          })
        );
      }

      return messages;
    },
    [isSovereign, isEncrypted]
  );

  // Create a message
  const createMessageLocal = useCallback(
    async (data: {
      id: string;
      conversationId: string;
      role: 'user' | 'assistant' | 'system';
      content: string;
      model?: ModelId;
      tokensUsed?: number;
      thinking?: string;
    }) => {
      if (!isSovereign) throw new Error('Local storage only available for sovereign tier');

      let content = data.content;
      let thinking = data.thinking;

      // Encrypt content if enabled
      if (isEncrypted) {
        content = await encryptionManager.encrypt(data.content);
        if (thinking) {
          thinking = await encryptionManager.encrypt(thinking);
        }
      }

      const message: Omit<LocalMessage, 'createdAt'> = {
        id: data.id,
        conversationId: data.conversationId,
        role: data.role,
        content,
        model: data.model,
        tokensUsed: data.tokensUsed,
        thinking,
        encrypted: isEncrypted,
      };

      return createLocalMessage(message);
    },
    [isSovereign, isEncrypted]
  );

  return {
    isInitialized,
    isEncrypted,
    isSovereign,
    getConversations,
    getConversation,
    createConversation,
    updateConversation: updateConversationLocal,
    deleteConversation: deleteConversationLocal,
    getMessages: getMessagesLocal,
    createMessage: createMessageLocal,
  };
}
