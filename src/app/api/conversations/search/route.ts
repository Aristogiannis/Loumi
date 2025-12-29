import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { searchConversations } from '@/lib/db/queries/conversations';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: 'Search query must be at least 2 characters' },
        { status: 400 }
      );
    }

    const conversations = await searchConversations(
      session.user.id,
      query.trim(),
      limit
    );

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('GET /api/conversations/search error:', error);
    return NextResponse.json(
      { error: 'Failed to search conversations' },
      { status: 500 }
    );
  }
}
