import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getAuditStats } from '@/lib/db/queries/audit-logs';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stats = await getAuditStats(session.user.id);

    return NextResponse.json(stats);
  } catch (error) {
    console.error('GET /api/audit/stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audit stats' },
      { status: 500 }
    );
  }
}
