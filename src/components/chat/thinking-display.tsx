'use client';

import { useState } from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThinkingDisplayProps {
  thinking: string;
  defaultOpen?: boolean;
  className?: string;
}

export function ThinkingDisplay({
  thinking,
  defaultOpen = false,
  className,
}: ThinkingDisplayProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // Calculate thinking stats
  const wordCount = thinking.split(/\s+/).filter(Boolean).length;
  const thinkingTime = Math.ceil(wordCount / 200); // Rough estimate: 200 words per second

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={className}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'h-8 w-full justify-start gap-2 rounded-lg border px-3 text-xs',
            'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100',
            'dark:border-amber-900 dark:bg-amber-950 dark:text-amber-400 dark:hover:bg-amber-900'
          )}
        >
          <Lightbulb className="h-3.5 w-3.5" />
          <span>Thinking process</span>
          <span className="ml-auto text-amber-500/70">{wordCount} words</span>
          {isOpen ? (
            <ChevronDown className="h-3.5 w-3.5" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5" />
          )}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div
          className={cn(
            'mt-2 max-h-64 overflow-y-auto rounded-lg border p-3 text-sm',
            'border-amber-200 bg-amber-50/50',
            'dark:border-amber-900 dark:bg-amber-950/50'
          )}
        >
          <pre className="whitespace-pre-wrap font-sans text-amber-900 dark:text-amber-200">
            {thinking}
          </pre>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// Streaming thinking display
export function ThinkingDisplayStreaming({
  thinking,
  className,
}: {
  thinking: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-lg border p-3 text-sm',
        'border-amber-200 bg-amber-50/50',
        'dark:border-amber-900 dark:bg-amber-950/50',
        className
      )}
    >
      <div className="mb-2 flex items-center gap-2">
        <Lightbulb className="h-3.5 w-3.5 animate-pulse text-amber-500" />
        <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
          Thinking...
        </span>
      </div>
      <pre className="max-h-48 overflow-y-auto whitespace-pre-wrap font-sans text-amber-900 dark:text-amber-200">
        {thinking}
        <span className="ml-1 inline-block h-3 w-0.5 animate-pulse bg-amber-500" />
      </pre>
    </div>
  );
}
