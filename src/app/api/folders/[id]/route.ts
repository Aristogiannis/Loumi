import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getFolderById, updateFolder, deleteFolder } from '@/lib/db/queries/folders';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/folders/[id] - Get single folder
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const folder = await getFolderById(id, session.user.id);

    if (!folder) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    }

    return NextResponse.json({ folder });
  } catch (error) {
    console.error('GET /api/folders/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch folder' },
      { status: 500 }
    );
  }
}

// PATCH /api/folders/[id] - Update folder
export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { name, parentId } = body;

    const updateData: { name?: string; parentId?: string | null } = {};

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return NextResponse.json(
          { error: 'Folder name cannot be empty' },
          { status: 400 }
        );
      }
      if (name.trim().length > 100) {
        return NextResponse.json(
          { error: 'Folder name must be less than 100 characters' },
          { status: 400 }
        );
      }
      updateData.name = name.trim();
    }

    if (parentId !== undefined) {
      updateData.parentId = parentId;
    }

    const folder = await updateFolder(id, session.user.id, updateData);

    if (!folder) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    }

    return NextResponse.json({ folder });
  } catch (error) {
    console.error('PATCH /api/folders/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to update folder' },
      { status: 500 }
    );
  }
}

// DELETE /api/folders/[id] - Delete folder
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const folder = await getFolderById(id, session.user.id);
    if (!folder) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    }

    await deleteFolder(id, session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/folders/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to delete folder' },
      { status: 500 }
    );
  }
}
