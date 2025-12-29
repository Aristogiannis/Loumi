import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  getConversationsByUserId,
  createConversation,
} from '@/lib/db/queries/conversations';
import { isValidModelId, getDefaultModel } from '@/lib/ai/providers';

// GET /api/conversations - List conversations
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const archived = searchParams.get('archived') === 'true';
    const pinned = searchParams.get('pinned');
    const folderId = searchParams.get('folderId');
    const search = searchParams.get('search') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const conversations = await getConversationsByUserId({
      userId: session.user.id,
      archived,
      pinned: pinned === null ? undefined : pinned === 'true',
      folderId: folderId === 'null' ? null : folderId || undefined,
      search,
      limit,
      offset,
    });

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('GET /api/conversations error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}

// POST /api/conversations - Create new conversation
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      title = 'New conversation',
      modelId = getDefaultModel(),
      folderId = null,
      isBurner = false,
      burnerDuration = null, // Duration in hours
    } = body;

    // Validate model ID
    if (!isValidModelId(modelId)) {
      return NextResponse.json({ error: 'Invalid model' }, { status: 400 });
    }

    // Calculate burner expiration if applicable
    let burnerExpiresAt: Date | null = null;
    if (isBurner && burnerDuration) {
      burnerExpiresAt = new Date(Date.now() + burnerDuration * 60 * 60 * 1000);
    }

    const conversation = await createConversation({
      userId: session.user.id,
      title,
      model: modelId,
      folderId,
      isBurner,
      burnerExpiresAt,
    });

    return NextResponse.json({ conversation }, { status: 201 });
  } catch (error) {
    console.error('POST /api/conversations error:', error);
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    );
  }
}
