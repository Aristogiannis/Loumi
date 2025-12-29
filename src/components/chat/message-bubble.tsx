'use client';

import { useState, useMemo } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  User,
  Bot,
  Sparkles,
  Brain,
  Zap,
} from 'lucide-react';
import type { Message } from '@/types/chat';
import type { ModelId } from '@/types/models';
import { models } from '@/lib/ai/providers';
import { cn } from '@/lib/utils';
import { CodeBlock } from './code-block';
import { ThinkingDisplay } from './thinking-display';
import { WebSearchResults } from './web-search-results';

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
}

const providerIcons: Record<string, React.ReactNode> = {
  openai: <Sparkles className="h-3 w-3" />,
  anthropic: <Brain className="h-3 w-3" />,
  google: <Zap className="h-3 w-3" />,
};

export function MessageBubble({ message, isStreaming = false }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';
  const modelConfig = message.model ? models[message.model as ModelId] : null;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Parse content for code blocks
  const renderedContent = useMemo(() => {
    const content = message.content;
    const parts: React.ReactNode[] = [];
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        parts.push(
          <span key={`text-${lastIndex}`} className="whitespace-pre-wrap">
            {content.slice(lastIndex, match.index)}
          </span>
        );
      }

      // Add code block
      const language = match[1] || 'plaintext';
      const code = (match[2] ?? '').trim();
      parts.push(
        <CodeBlock key={`code-${match.index}`} language={language} code={code} />
      );

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push(
        <span key={`text-${lastIndex}`} className="whitespace-pre-wrap">
          {content.slice(lastIndex)}
        </span>
      );
    }

    return parts.length > 0 ? parts : <span className="whitespace-pre-wrap">{content}</span>;
  }, [message.content]);

  return (
    <div
      className={cn(
        'group flex gap-4 px-4 py-6',
        isUser ? 'bg-background' : 'bg-muted/30'
      )}
    >
      {/* Avatar */}
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback
          className={cn(
            'text-xs',
            isUser
              ? 'bg-loumi-100 text-loumi-700 dark:bg-loumi-900 dark:text-loumi-300'
              : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
          )}
        >
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>

      {/* Content */}
      <div className="flex-1 space-y-2 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {isUser ? 'You' : 'Loumi'}
          </span>
          {modelConfig && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              {providerIcons[modelConfig.provider]}
              {modelConfig.name}
            </span>
          )}
          {isStreaming && (
            <span className="flex items-center gap-1 text-xs text-loumi-500">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-loumi-500" />
              Thinking...
            </span>
          )}
        </div>

        {/* Thinking (if present) */}
        {message.thinking && <ThinkingDisplay thinking={message.thinking} />}

        {/* Web search results (if present) */}
        {message.webSearchResults && message.webSearchResults.length > 0 && (
          <WebSearchResults results={message.webSearchResults} />
        )}

        {/* Message content */}
        <div className="prose prose-sm max-w-none dark:prose-invert">
          {renderedContent}
          {isStreaming && (
            <span className="ml-1 inline-block h-4 w-0.5 animate-pulse bg-loumi-500" />
          )}
        </div>

        {/* Actions */}
        {!isUser && !isStreaming && (
          <div className="flex items-center gap-1 pt-2 opacity-0 transition-opacity group-hover:opacity-100">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    className="h-7 w-7 p-0"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Copy message</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>
    </div>
  );
}
