import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getConversationById } from '@/lib/db/queries/conversations';
import { getMessagesByConversationId } from '@/lib/db/queries/messages';
import { exportToMarkdown, generateMarkdownFilename } from '@/lib/export/markdown';
import { exportToJsonString, generateJsonFilename } from '@/lib/export/json';
import type { Message } from '@/types/chat';
import type { ModelId } from '@/types/models';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format') || 'markdown';

    // Validate format
    if (!['markdown', 'json'].includes(format)) {
      return NextResponse.json(
        { error: 'Invalid format. Use "markdown" or "json"' },
        { status: 400 }
      );
    }

    // Get conversation
    const conversation = await getConversationById(id, session.user.id);
    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Get messages
    const dbMessages = await getMessagesByConversationId(id, 1000, 0);

    // Transform to Message type
    const messages: Message[] = dbMessages.map((msg) => ({
      id: msg.id,
      conversationId: msg.conversationId,
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content,
      model: msg.model as ModelId | undefined,
      tokensUsed: msg.tokensUsed ?? undefined,
      thinking: msg.thinking ?? undefined,
      webSearchResults: undefined,
      piiDetected: undefined,
      createdAt: msg.createdAt,
    }));

    // Convert conversation to proper type
    const conv = {
      id: conversation.id,
      userId: conversation.userId,
      title: conversation.title,
      model: conversation.model as ModelId,
      folderId: conversation.folderId,
      pinned: conversation.pinned,
      archived: conversation.archived,
      isBurner: conversation.isBurner,
      burnerExpiresAt: conversation.burnerExpiresAt,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    };

    // Generate export
    if (format === 'json') {
      const content = exportToJsonString(conv, messages);
      const filename = generateJsonFilename(conv);

      return new Response(content, {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    } else {
      const content = exportToMarkdown(conv, messages);
      const filename = generateMarkdownFilename(conv);

      return new Response(content, {
        headers: {
          'Content-Type': 'text/markdown',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }
  } catch (error) {
    console.error('GET /api/conversations/[id]/export error:', error);
    return NextResponse.json(
      { error: 'Failed to export conversation' },
      { status: 500 }
    );
  }
}
