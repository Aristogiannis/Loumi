'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RefreshCw, Filter, Calendar, Activity, Shield } from 'lucide-react';
import { AuditEntry } from './audit-entry';
import type { AuditLogEntry } from '@/types/privacy';
import { cn } from '@/lib/utils';

interface AuditTrailProps {
  className?: string;
}

async function fetchAuditLogs(params: {
  action?: string;
  provider?: string;
  limit?: number;
  offset?: number;
}): Promise<{ logs: AuditLogEntry[]; total: number }> {
  const searchParams = new URLSearchParams();
  if (params.action) searchParams.set('action', params.action);
  if (params.provider) searchParams.set('provider', params.provider);
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.offset) searchParams.set('offset', String(params.offset));

  const response = await fetch(`/api/audit?${searchParams}`);
  if (!response.ok) throw new Error('Failed to fetch audit logs');
  return response.json();
}

async function fetchAuditStats(): Promise<{
  totalRequests: number;
  totalTokensInput: number;
  totalTokensOutput: number;
  piiDetectionCount: number;
}> {
  const response = await fetch('/api/audit/stats');
  if (!response.ok) throw new Error('Failed to fetch audit stats');
  return response.json();
}

export function AuditTrail({ className }: AuditTrailProps) {
  const [filter, setFilter] = useState<{ action?: string; provider?: string }>({});
  const [page, setPage] = useState(0);
  const pageSize = 20;

  const {
    data: logsData,
    isLoading: logsLoading,
    refetch: refetchLogs,
  } = useQuery({
    queryKey: ['audit-logs', filter, page],
    queryFn: () =>
      fetchAuditLogs({
        ...filter,
        limit: pageSize,
        offset: page * pageSize,
      }),
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['audit-stats'],
    queryFn: fetchAuditStats,
  });

  const logs = logsData?.logs ?? [];
  const total = logsData?.total ?? 0;
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="Total Requests"
          value={stats?.totalRequests ?? 0}
          icon={Activity}
          loading={statsLoading}
        />
        <StatCard
          label="Input Tokens"
          value={formatNumber(stats?.totalTokensInput ?? 0)}
          icon={Calendar}
          loading={statsLoading}
        />
        <StatCard
          label="Output Tokens"
          value={formatNumber(stats?.totalTokensOutput ?? 0)}
          icon={Calendar}
          loading={statsLoading}
        />
        <StatCard
          label="PII Detections"
          value={stats?.piiDetectionCount ?? 0}
          icon={Shield}
          loading={statsLoading}
          highlight
        />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select
          value={filter.action ?? 'all'}
          onValueChange={(v) => setFilter((f) => ({ ...f, action: v === 'all' ? undefined : v }))}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All actions</SelectItem>
            <SelectItem value="chat_completion">Chat</SelectItem>
            <SelectItem value="pii_detected">PII Detected</SelectItem>
            <SelectItem value="pii_blocked">PII Blocked</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filter.provider ?? 'all'}
          onValueChange={(v) => setFilter((f) => ({ ...f, provider: v === 'all' ? undefined : v }))}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All providers</SelectItem>
            <SelectItem value="openai">OpenAI</SelectItem>
            <SelectItem value="anthropic">Anthropic</SelectItem>
            <SelectItem value="google">Google</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => refetchLogs()}
          className="ml-auto"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Log entries */}
      <ScrollArea className="h-[400px] rounded-lg border">
        {logsLoading ? (
          <div className="space-y-2 p-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No audit logs found
          </div>
        ) : (
          <div className="divide-y">
            {logs.map((log) => (
              <AuditEntry key={log.id} entry={log} />
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {page * pageSize + 1}-{Math.min((page + 1) * pageSize, total)} of {total}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  loading,
  highlight,
}: {
  label: string;
  value: number | string;
  icon: typeof Activity;
  loading?: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-lg border p-4',
        highlight && 'border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/30'
      )}
    >
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      {loading ? (
        <Skeleton className="mt-1 h-7 w-16" />
      ) : (
        <p className={cn('mt-1 text-2xl font-semibold', highlight && 'text-green-600 dark:text-green-400')}>
          {value}
        </p>
      )}
    </div>
  );
}

function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return String(num);
}
