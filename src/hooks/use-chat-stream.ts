'use client';

import { useCallback, useState, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useChatStore } from '@/stores/chat-store';
import { conversationKeys, useCreateMessage } from './use-conversations';
import type { Message } from '@/types/chat';
import type { ModelId } from '@/types/models';

interface ChatStreamOptions {
  conversationId: string;
  onError?: (error: Error) => void;
  onFinish?: (message: Message) => void;
}

interface StreamingState {
  isStreaming: boolean;
  content: string;
  thinking: string | null;
  error: Error | null;
}

export function useChatStream({ conversationId, onError, onFinish }: ChatStreamOptions) {
  const queryClient = useQueryClient();
  const createMessageMutation = useCreateMessage();
  const abortControllerRef = useRef<AbortController | null>(null);

  const { currentModel, enableWebSearch, enableThinking, setIsStreaming, setStreamingMessageId } =
    useChatStore();

  const [streamingState, setStreamingState] = useState<StreamingState>({
    isStreaming: false,
    content: '',
    thinking: null,
    error: null,
  });

  const sendMessage = useCallback(
    async (content: string, messages: Message[]) => {
      // Create abort controller for cancellation
      abortControllerRef.current = new AbortController();

      // Reset streaming state
      setStreamingState({
        isStreaming: true,
        content: '',
        thinking: null,
        error: null,
      });
      setIsStreaming(true);

      // Save user message first
      await createMessageMutation.mutateAsync({
        conversationId,
        data: {
          role: 'user',
          content,
        },
      });

      // Prepare messages for API
      const apiMessages = [
        ...messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        { role: 'user' as const, content },
      ];

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: apiMessages,
            modelId: currentModel,
            conversationId,
            enableWebSearch,
            enableThinking,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to send message');
        }

        if (!response.body) {
          throw new Error('No response body');
        }

        // Read streaming response
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulatedContent = '';
        let accumulatedThinking = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (!line.trim() || !line.startsWith('0:')) continue;

            try {
              // Parse the data stream format (0: prefix is from Vercel AI SDK)
              const jsonStr = line.slice(2).trim();
              if (jsonStr.startsWith('"')) {
                // Text content
                const textContent = JSON.parse(jsonStr);
                accumulatedContent += textContent;
                setStreamingState((prev) => ({
                  ...prev,
                  content: accumulatedContent,
                }));
              }
            } catch {
              // Handle special event formats
              if (line.includes('reasoning')) {
                try {
                  const match = line.match(/reasoning":"([^"]+)"/);
                  if (match) {
                    accumulatedThinking += match[1];
                    setStreamingState((prev) => ({
                      ...prev,
                      thinking: accumulatedThinking,
                    }));
                  }
                } catch {
                  // Ignore parsing errors for reasoning
                }
              }
            }
          }
        }

        // Streaming complete
        setStreamingState((prev) => ({
          ...prev,
          isStreaming: false,
        }));
        setIsStreaming(false);
        setStreamingMessageId(null);

        // Refresh messages from server
        queryClient.invalidateQueries({
          queryKey: conversationKeys.messages(conversationId),
        });

        // Create the final message object for callback
        const finalMessage: Message = {
          id: crypto.randomUUID(),
          conversationId,
          role: 'assistant',
          content: accumulatedContent,
          model: currentModel,
          thinking: accumulatedThinking || undefined,
          createdAt: new Date(),
        };

        onFinish?.(finalMessage);
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          // Request was cancelled, don't treat as error
          setStreamingState((prev) => ({
            ...prev,
            isStreaming: false,
          }));
          setIsStreaming(false);
          return;
        }

        const err = error instanceof Error ? error : new Error('Unknown error');
        setStreamingState((prev) => ({
          ...prev,
          isStreaming: false,
          error: err,
        }));
        setIsStreaming(false);
        onError?.(err);
      }
    },
    [
      conversationId,
      currentModel,
      enableWebSearch,
      enableThinking,
      createMessageMutation,
      queryClient,
      setIsStreaming,
      setStreamingMessageId,
      onError,
      onFinish,
    ]
  );

  const cancelStream = useCallback(() => {
    abortControllerRef.current?.abort();
    setStreamingState((prev) => ({
      ...prev,
      isStreaming: false,
    }));
    setIsStreaming(false);
  }, [setIsStreaming]);

  return {
    sendMessage,
    cancelStream,
    ...streamingState,
  };
}
