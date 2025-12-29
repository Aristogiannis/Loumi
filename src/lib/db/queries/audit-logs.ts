import { eq, desc, and, gte, lte, sql, count, sum } from 'drizzle-orm';
import { db } from '../index';
import { auditLogs, type AuditLog, type NewAuditLog } from '../schema';

export interface GetAuditLogsOptions {
  userId: string;
  startDate?: Date;
  endDate?: Date;
  provider?: string;
  action?: string;
  limit?: number;
  offset?: number;
}

export async function getAuditLogsByUserId(
  options: GetAuditLogsOptions
): Promise<{ logs: AuditLog[]; total: number }> {
  const {
    userId,
    startDate,
    endDate,
    provider,
    action,
    limit = 50,
    offset = 0,
  } = options;

  const conditions = [eq(auditLogs.userId, userId)];

  if (startDate) {
    conditions.push(gte(auditLogs.timestamp, startDate));
  }

  if (endDate) {
    conditions.push(lte(auditLogs.timestamp, endDate));
  }

  if (provider) {
    conditions.push(eq(auditLogs.provider, provider));
  }

  if (action) {
    conditions.push(eq(auditLogs.action, action));
  }

  // Get total count
  const [countResult] = await db
    .select({ count: count() })
    .from(auditLogs)
    .where(and(...conditions));

  // Get paginated results
  const logs = await db.query.auditLogs.findMany({
    where: and(...conditions),
    orderBy: [desc(auditLogs.timestamp)],
    limit,
    offset,
  });

  return { logs, total: countResult?.count ?? 0 };
}

export async function createAuditLog(data: NewAuditLog): Promise<AuditLog> {
  const [log] = await db.insert(auditLogs).values(data).returning();
  return log!;
}

export interface AuditLogStats {
  totalRequests: number;
  totalTokensInput: number;
  totalTokensOutput: number;
  requestsByProvider: Record<string, number>;
  piiDetectionCount: number;
}

export async function getAuditLogStats(
  userId: string,
  startDate?: Date,
  endDate?: Date
): Promise<AuditLogStats> {
  const conditions = [eq(auditLogs.userId, userId)];

  if (startDate) {
    conditions.push(gte(auditLogs.timestamp, startDate));
  }

  if (endDate) {
    conditions.push(lte(auditLogs.timestamp, endDate));
  }

  // Get total stats
  const [totals] = await db
    .select({
      totalRequests: count(),
      totalTokensInput: sql<number>`COALESCE(SUM(${auditLogs.tokensInput}), 0)::int`,
      totalTokensOutput: sql<number>`COALESCE(SUM(${auditLogs.tokensOutput}), 0)::int`,
    })
    .from(auditLogs)
    .where(and(...conditions));

  // Get requests by provider
  const providerStats = await db
    .select({
      provider: auditLogs.provider,
      count: count(),
    })
    .from(auditLogs)
    .where(and(...conditions))
    .groupBy(auditLogs.provider);

  const requestsByProvider: Record<string, number> = {};
  for (const stat of providerStats) {
    requestsByProvider[stat.provider] = stat.count;
  }

  // Get PII detection count
  const [piiStats] = await db
    .select({
      count: count(),
    })
    .from(auditLogs)
    .where(
      and(
        ...conditions,
        sql`${auditLogs.piiDetected} IS NOT NULL AND jsonb_array_length(${auditLogs.piiDetected}) > 0`
      )
    );

  return {
    totalRequests: totals?.totalRequests ?? 0,
    totalTokensInput: totals?.totalTokensInput ?? 0,
    totalTokensOutput: totals?.totalTokensOutput ?? 0,
    requestsByProvider,
    piiDetectionCount: piiStats?.count ?? 0,
  };
}

export async function deleteAuditLogsByUserId(userId: string): Promise<void> {
  await db.delete(auditLogs).where(eq(auditLogs.userId, userId));
}

export async function getRecentAuditLogs(
  userId: string,
  limit = 10
): Promise<AuditLog[]> {
  const { logs } = await getAuditLogsByUserId({ userId, limit });
  return logs;
}

// Alias for getAuditLogStats
export const getAuditStats = getAuditLogStats;
