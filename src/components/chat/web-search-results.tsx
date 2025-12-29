'use client';

import { useState } from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, Globe, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WebSearchResult } from '@/types/chat';

interface WebSearchResultsProps {
  results: WebSearchResult[];
  defaultOpen?: boolean;
  className?: string;
}

export function WebSearchResults({
  results,
  defaultOpen = false,
  className,
}: WebSearchResultsProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (!results || results.length === 0) return null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={className}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'h-8 w-full justify-start gap-2 rounded-lg border px-3 text-xs',
            'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100',
            'dark:border-blue-900 dark:bg-blue-950 dark:text-blue-400 dark:hover:bg-blue-900'
          )}
        >
          <Globe className="h-3.5 w-3.5" />
          <span>Web search</span>
          <span className="ml-auto text-blue-500/70">{results.length} sources</span>
          {isOpen ? (
            <ChevronDown className="h-3.5 w-3.5" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5" />
          )}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-2 space-y-2">
          {results.map((result, index) => (
            <a
              key={index}
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'flex items-start gap-3 rounded-lg border p-3 transition-colors',
                'border-blue-100 bg-blue-50/50 hover:bg-blue-100/50',
                'dark:border-blue-900 dark:bg-blue-950/50 dark:hover:bg-blue-900/50'
              )}
            >
              {/* Favicon */}
              {result.favicon ? (
                <img
                  src={result.favicon}
                  alt=""
                  className="h-4 w-4 shrink-0 rounded"
                />
              ) : (
                <Globe className="h-4 w-4 shrink-0 text-blue-500" />
              )}

              {/* Content */}
              <div className="flex-1 overflow-hidden">
                <div className="flex items-center gap-2">
                  <h4 className="truncate text-sm font-medium text-blue-900 dark:text-blue-100">
                    {result.title}
                  </h4>
                  <ExternalLink className="h-3 w-3 shrink-0 text-blue-400" />
                </div>
                <p className="mt-0.5 truncate text-xs text-blue-600 dark:text-blue-400">
                  {result.domain}
                </p>
                {result.content && (
                  <p className="mt-1 line-clamp-2 text-xs text-blue-800/70 dark:text-blue-200/70">
                    {result.content}
                  </p>
                )}
              </div>
            </a>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// Compact inline citation
export function WebSearchCitation({ result }: { result: WebSearchResult }) {
  return (
    <a
      href={result.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs',
        'bg-blue-100 text-blue-700 hover:bg-blue-200',
        'dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800'
      )}
    >
      {result.favicon ? (
        <img src={result.favicon} alt="" className="h-3 w-3 rounded" />
      ) : (
        <Globe className="h-3 w-3" />
      )}
      <span className="max-w-[100px] truncate">{result.domain}</span>
    </a>
  );
}
