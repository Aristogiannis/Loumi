'use client';

import { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageBubble } from './message-bubble';
import type { Message } from '@/types/chat';
import { cn } from '@/lib/utils';

interface MessageListProps {
  messages: Message[];
  streamingContent?: string;
  streamingThinking?: string;
  isStreaming?: boolean;
  className?: string;
}

export function MessageList({
  messages,
  streamingContent,
  streamingThinking,
  isStreaming = false,
  className,
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive or streaming
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, streamingContent]);

  // Create a streaming message for display
  const streamingMessage: Message | null =
    isStreaming && streamingContent
      ? {
          id: 'streaming',
          conversationId: '',
          role: 'assistant',
          content: streamingContent,
          thinking: streamingThinking || undefined,
          createdAt: new Date(),
        }
      : null;

  return (
    <ScrollArea className={cn('flex-1', className)} ref={scrollRef}>
      <div className="mx-auto max-w-3xl">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {streamingMessage && (
          <MessageBubble message={streamingMessage} isStreaming={true} />
        )}
        <div ref={bottomRef} className="h-4" />
      </div>
    </ScrollArea>
  );
}
