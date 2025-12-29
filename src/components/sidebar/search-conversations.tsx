'use client';

import { useState, useCallback, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SearchConversationsProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function SearchConversations({
  value,
  onChange,
  className,
}: SearchConversationsProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = useCallback(() => {
    onChange('');
  }, [onChange]);

  return (
    <div className={cn('relative', className)}>
      <Search
        className={cn(
          'absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors',
          isFocused ? 'text-loumi-500' : 'text-muted-foreground'
        )}
      />
      <Input
        type="text"
        placeholder="Search conversations..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={cn(
          'h-9 pl-9 pr-8 text-sm',
          isFocused && 'ring-1 ring-loumi-500'
        )}
      />
      {value && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0"
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}
