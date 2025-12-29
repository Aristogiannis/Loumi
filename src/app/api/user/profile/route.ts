import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { updateUser } from '@/lib/db/queries/users';

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name } = body;

    if (name !== undefined) {
      if (typeof name !== 'string') {
        return NextResponse.json(
          { error: 'Invalid name format' },
          { status: 400 }
        );
      }

      if (name.trim().length > 100) {
        return NextResponse.json(
          { error: 'Name must be less than 100 characters' },
          { status: 400 }
        );
      }
    }

    const user = await updateUser(session.user.id, {
      name: name?.trim() || null,
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('PATCH /api/user/profile error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
