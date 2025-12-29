import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  getConversationById,
  updateConversation,
  deleteConversation,
} from '@/lib/db/queries/conversations';
import { isValidModelId } from '@/lib/ai/providers';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/conversations/[id] - Get single conversation with messages
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const conversation = await getConversationById(id, session.user.id);

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ conversation });
  } catch (error) {
    console.error('GET /api/conversations/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversation' },
      { status: 500 }
    );
  }
}

// PATCH /api/conversations/[id] - Update conversation
export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { title, model, folderId, pinned, archived } = body;

    // Build update data
    const updateData: Record<string, unknown> = {};

    if (title !== undefined) updateData['title'] = title;
    if (model !== undefined) {
      if (!isValidModelId(model)) {
        return NextResponse.json({ error: 'Invalid model' }, { status: 400 });
      }
      updateData['model'] = model;
    }
    if (folderId !== undefined) updateData['folderId'] = folderId;
    if (pinned !== undefined) updateData['pinned'] = pinned;
    if (archived !== undefined) updateData['archived'] = archived;

    const conversation = await updateConversation(
      id,
      session.user.id,
      updateData
    );

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ conversation });
  } catch (error) {
    console.error('PATCH /api/conversations/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to update conversation' },
      { status: 500 }
    );
  }
}

// DELETE /api/conversations/[id] - Delete conversation
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify conversation exists and belongs to user
    const conversation = await getConversationById(id, session.user.id);
    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    await deleteConversation(id, session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/conversations/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to delete conversation' },
      { status: 500 }
    );
  }
}
