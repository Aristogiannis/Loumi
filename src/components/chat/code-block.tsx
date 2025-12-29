'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CodeBlockProps {
  language: string;
  code: string;
  className?: string;
}

// Simple syntax highlighting based on language
const getLanguageColor = (language: string): string => {
  const colors: Record<string, string> = {
    javascript: 'text-yellow-500',
    typescript: 'text-blue-500',
    python: 'text-green-500',
    rust: 'text-orange-500',
    go: 'text-cyan-500',
    java: 'text-red-500',
    cpp: 'text-purple-500',
    c: 'text-purple-400',
    html: 'text-orange-400',
    css: 'text-blue-400',
    json: 'text-green-400',
    sql: 'text-pink-500',
    bash: 'text-zinc-400',
    shell: 'text-zinc-400',
  };
  return colors[language.toLowerCase()] || 'text-muted-foreground';
};

export function CodeBlock({ language, code, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn('group relative my-4 overflow-hidden rounded-lg border bg-zinc-950', className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-4 py-2">
        <span className={cn('text-xs font-medium', getLanguageColor(language))}>
          {language}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-6 gap-1.5 px-2 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              Copy
            </>
          )}
        </Button>
      </div>

      {/* Code */}
      <div className="overflow-x-auto">
        <pre className="p-4 text-sm leading-relaxed">
          <code className="font-mono text-zinc-100">{code}</code>
        </pre>
      </div>
    </div>
  );
}

// Inline code component
export function InlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">
      {children}
    </code>
  );
}
