'use client';

import { Badge } from '@/components/ui/badge';
import { Sparkles, Brain, Zap, Shield, AlertTriangle, Clock } from 'lucide-react';
import type { AuditLogEntry } from '@/types/privacy';
import { cn } from '@/lib/utils';

interface AuditEntryProps {
  entry: AuditLogEntry;
}

const providerIcons: Record<string, typeof Sparkles> = {
  openai: Sparkles,
  anthropic: Brain,
  google: Zap,
};

const actionConfig: Record<
  string,
  { label: string; color: string; icon: typeof Shield }
> = {
  chat_completion: {
    label: 'Chat',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    icon: Sparkles,
  },
  pii_detected: {
    label: 'PII Detected',
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    icon: Shield,
  },
  pii_blocked: {
    label: 'PII Blocked',
    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    icon: AlertTriangle,
  },
};

const defaultAction = {
  label: 'Chat',
  color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  icon: Sparkles,
};

export function AuditEntry({ entry }: AuditEntryProps) {
  const ProviderIcon = providerIcons[entry.provider] ?? Sparkles;
  const action = actionConfig[entry.action] ?? defaultAction;
  const ActionIcon = action.icon;

  const formattedDate = new Date(entry.timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="flex items-start gap-4 p-4 hover:bg-muted/50">
      {/* Icon */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
        <ProviderIcon className="h-5 w-5 text-muted-foreground" />
      </div>

      {/* Content */}
      <div className="flex-1 space-y-1.5">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className={cn('text-xs', action.color)}>
            <ActionIcon className="mr-1 h-3 w-3" />
            {action.label}
          </Badge>
          {entry.model && (
            <span className="text-sm font-medium">{entry.model}</span>
          )}
          {entry.credentialPoolId && (
            <Badge variant="outline" className="text-xs">
              Pool: {entry.credentialPoolId}
            </Badge>
          )}
        </div>

        {/* Tokens */}
        {(entry.tokensInput || entry.tokensOutput) && (
          <div className="flex gap-3 text-xs text-muted-foreground">
            {entry.tokensInput && <span>In: {entry.tokensInput.toLocaleString()}</span>}
            {entry.tokensOutput && <span>Out: {entry.tokensOutput.toLocaleString()}</span>}
          </div>
        )}

        {/* PII detected */}
        {entry.piiDetected && entry.piiDetected.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {entry.piiDetected.map((type, i) => (
              <Badge
                key={i}
                variant="outline"
                className="text-xs border-green-300 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/30 dark:text-green-400"
              >
                {type}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Timestamp */}
      <div className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
        <Clock className="h-3 w-3" />
        {formattedDate}
      </div>
    </div>
  );
}
