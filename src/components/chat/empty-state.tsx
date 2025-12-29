'use client';

import { Button } from '@/components/ui/button';
import { Sparkles, Brain, Zap, Code, FileText, Lightbulb, ArrowRight } from 'lucide-react';
import { ModelSelector } from './model-selector';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  onSuggestionClick?: (suggestion: string) => void;
}

const suggestions = [
  {
    icon: Code,
    title: 'Write code',
    prompt: 'Write a Python function that sorts a list using quicksort',
    color: 'text-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-950',
  },
  {
    icon: FileText,
    title: 'Summarize',
    prompt: 'Summarize the key points of this document for me',
    color: 'text-green-500',
    bg: 'bg-green-50 dark:bg-green-950',
  },
  {
    icon: Lightbulb,
    title: 'Brainstorm',
    prompt: 'Help me brainstorm creative ideas for a mobile app',
    color: 'text-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-950',
  },
  {
    icon: Brain,
    title: 'Explain',
    prompt: 'Explain quantum computing in simple terms',
    color: 'text-purple-500',
    bg: 'bg-purple-50 dark:bg-purple-950',
  },
];

export function EmptyState({ onSuggestionClick }: EmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-8">
      {/* Logo and welcome */}
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-loumi-400 to-loumi-600 shadow-lg">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-2xl font-semibold">How can I help you today?</h1>
        <p className="mt-2 text-muted-foreground">
          Choose a model and start chatting, or try one of these suggestions.
        </p>
      </div>

      {/* Model selector */}
      <div className="mb-8">
        <ModelSelector />
      </div>

      {/* Suggestion cards */}
      <div className="grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion.title}
            onClick={() => onSuggestionClick?.(suggestion.prompt)}
            className={cn(
              'group flex items-start gap-3 rounded-xl border p-4 text-left transition-all',
              'hover:border-loumi-200 hover:bg-muted/50 hover:shadow-sm',
              'dark:hover:border-loumi-800'
            )}
          >
            <div className={cn('rounded-lg p-2', suggestion.bg)}>
              <suggestion.icon className={cn('h-5 w-5', suggestion.color)} />
            </div>
            <div className="flex-1">
              <h3 className="font-medium">{suggestion.title}</h3>
              <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
                {suggestion.prompt}
              </p>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-50" />
          </button>
        ))}
      </div>

      {/* Model features */}
      <div className="mt-8 flex items-center gap-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-green-500" />
          <span>OpenAI</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Brain className="h-3.5 w-3.5 text-orange-500" />
          <span>Anthropic</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Zap className="h-3.5 w-3.5 text-blue-500" />
          <span>Google</span>
        </div>
      </div>
    </div>
  );
}
