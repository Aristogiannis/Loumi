import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getConversationById } from '@/lib/db/queries/conversations';
import {
  getMessagesByConversationId,
  createMessage,
} from '@/lib/db/queries/messages';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/conversations/[id]/messages - Get messages for conversation
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Verify conversation belongs to user
    const conversation = await getConversationById(id, session.user.id);
    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    const messages = await getMessagesByConversationId(id, limit, offset);

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('GET /api/conversations/[id]/messages error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// POST /api/conversations/[id]/messages - Add message to conversation
export async function POST(req: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { role, content, model, tokensUsed, thinking, webSearchResults } =
      body;

    // Validate required fields
    if (!role || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate role
    if (!['user', 'assistant', 'system'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Verify conversation belongs to user
    const conversation = await getConversationById(id, session.user.id);
    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    const message = await createMessage({
      conversationId: id,
      role,
      content,
      model: model || null,
      tokensUsed: tokensUsed || null,
      thinking: thinking || null,
      webSearchResults: webSearchResults || null,
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error('POST /api/conversations/[id]/messages error:', error);
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 }
    );
  }
}
