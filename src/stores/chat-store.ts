'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ModelId } from '@/types/models';
import type { Message, Conversation } from '@/types/chat';

interface ChatState {
  // Current conversation state
  currentConversationId: string | null;
  currentModel: ModelId;

  // Feature toggles
  enableWebSearch: boolean;
  enableThinking: boolean;

  // Streaming state
  isStreaming: boolean;
  streamingMessageId: string | null;

  // Messages (for optimistic updates)
  pendingMessages: Message[];

  // Actions
  setCurrentConversationId: (id: string | null) => void;
  setCurrentModel: (model: ModelId) => void;
  toggleWebSearch: () => void;
  toggleThinking: () => void;
  setIsStreaming: (streaming: boolean) => void;
  setStreamingMessageId: (id: string | null) => void;
  addPendingMessage: (message: Message) => void;
  clearPendingMessages: () => void;
  removePendingMessage: (id: string) => void;
  reset: () => void;
}

const initialState = {
  currentConversationId: null,
  currentModel: 'gpt-4o' as ModelId,
  enableWebSearch: false,
  enableThinking: false,
  isStreaming: false,
  streamingMessageId: null,
  pendingMessages: [],
};

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      ...initialState,

      setCurrentConversationId: (id) => set({ currentConversationId: id }),

      setCurrentModel: (model) => set({ currentModel: model }),

      toggleWebSearch: () => set((state) => ({
        enableWebSearch: !state.enableWebSearch
      })),

      toggleThinking: () => set((state) => ({
        enableThinking: !state.enableThinking
      })),

      setIsStreaming: (streaming) => set({ isStreaming: streaming }),

      setStreamingMessageId: (id) => set({ streamingMessageId: id }),

      addPendingMessage: (message) => set((state) => ({
        pendingMessages: [...state.pendingMessages, message],
      })),

      clearPendingMessages: () => set({ pendingMessages: [] }),

      removePendingMessage: (id) => set((state) => ({
        pendingMessages: state.pendingMessages.filter((m) => m.id !== id),
      })),

      reset: () => set(initialState),
    }),
    {
      name: 'loumi-chat-store',
      partialize: (state) => ({
        currentModel: state.currentModel,
        enableWebSearch: state.enableWebSearch,
        enableThinking: state.enableThinking,
      }),
    }
  )
);
