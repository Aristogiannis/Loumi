import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getAuditLogsByUserId } from '@/lib/db/queries/audit-logs';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action') || undefined;
    const provider = searchParams.get('provider') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const { logs, total } = await getAuditLogsByUserId({
      userId: session.user.id,
      action,
      provider,
      limit,
      offset,
    });

    return NextResponse.json({ logs, total });
  } catch (error) {
    console.error('GET /api/audit error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audit logs' },
      { status: 500 }
    );
  }
}
