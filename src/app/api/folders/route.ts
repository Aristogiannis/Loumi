import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getFoldersByUserId, createFolder } from '@/lib/db/queries/folders';

// GET /api/folders - List folders
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const folders = await getFoldersByUserId(session.user.id);

    return NextResponse.json({ folders });
  } catch (error) {
    console.error('GET /api/folders error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch folders' },
      { status: 500 }
    );
  }
}

// POST /api/folders - Create folder
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, parentId = null } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Folder name is required' },
        { status: 400 }
      );
    }

    if (name.trim().length > 100) {
      return NextResponse.json(
        { error: 'Folder name must be less than 100 characters' },
        { status: 400 }
      );
    }

    const folder = await createFolder({
      userId: session.user.id,
      name: name.trim(),
      parentId,
    });

    return NextResponse.json({ folder }, { status: 201 });
  } catch (error) {
    console.error('POST /api/folders error:', error);
    return NextResponse.json(
      { error: 'Failed to create folder' },
      { status: 500 }
    );
  }
}
