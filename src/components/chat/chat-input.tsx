'use client';

import { useState, useRef, useCallback, useEffect, type KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Send, Square, Globe, Lightbulb, Paperclip } from 'lucide-react';
import { useChatStore } from '@/stores/chat-store';
import { models } from '@/lib/ai/providers';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (message: string) => void;
  onCancel?: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  onCancel,
  disabled = false,
  placeholder = 'Message Loumi...',
}: ChatInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    isStreaming,
    currentModel,
    enableWebSearch,
    enableThinking,
    toggleWebSearch,
    toggleThinking,
  } = useChatStore();

  const modelConfig = models[currentModel];

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [value]);

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim();
    if (trimmed && !disabled && !isStreaming) {
      onSend(trimmed);
      setValue('');
      // Reset height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  }, [value, disabled, isStreaming, onSend]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  const handleCancel = useCallback(() => {
    onCancel?.();
  }, [onCancel]);

  return (
    <div className="relative w-full">
      <div className="relative flex flex-col rounded-2xl border bg-background shadow-sm transition-shadow focus-within:shadow-md">
        {/* Textarea */}
        <Textarea
          ref={textareaRef}
          data-chat-input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isStreaming}
          className="min-h-[52px] max-h-[200px] resize-none border-0 bg-transparent px-4 py-3.5 pr-24 text-base shadow-none focus-visible:ring-0"
          rows={1}
        />

        {/* Bottom bar with toggles and send button */}
        <div className="flex items-center justify-between border-t px-2 py-1.5">
          <div className="flex items-center gap-1">
            {/* Attach button (placeholder for future) */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                    disabled
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Attach files (coming soon)</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Web search toggle */}
            {modelConfig.supportsWebSearch && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={toggleWebSearch}
                      disabled={isStreaming}
                      className={cn(
                        'h-8 gap-1.5 px-2 text-xs',
                        enableWebSearch
                          ? 'bg-loumi-50 text-loumi-600 hover:bg-loumi-100 dark:bg-loumi-950 dark:text-loumi-400'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <Globe className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Search</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {enableWebSearch ? 'Disable' : 'Enable'} web search
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {/* Thinking mode toggle */}
            {modelConfig.supportsThinking && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={toggleThinking}
                      disabled={isStreaming}
                      className={cn(
                        'h-8 gap-1.5 px-2 text-xs',
                        enableThinking
                          ? 'bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-400'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <Lightbulb className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Think</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {enableThinking ? 'Disable' : 'Enable'} thinking mode
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          {/* Send/Stop button */}
          <div className="flex items-center gap-2">
            {isStreaming ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleCancel}
                className="h-8 gap-1.5 px-3"
              >
                <Square className="h-3.5 w-3.5" />
                Stop
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                onClick={handleSubmit}
                disabled={!value.trim() || disabled}
                className="h-8 w-8 rounded-lg bg-loumi-500 p-0 hover:bg-loumi-600 disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Helper text */}
      <p className="mt-2 text-center text-xs text-muted-foreground">
        Loumi can make mistakes. Consider checking important information.
      </p>
    </div>
  );
}
