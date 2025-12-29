import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { updateUser } from '@/lib/db/queries/users';
import type { PrivacyTier } from '@/types/privacy';

const validTiers: PrivacyTier[] = ['community', 'private', 'sovereign'];

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { tier } = body;

    if (!tier || !validTiers.includes(tier)) {
      return NextResponse.json(
        { error: 'Invalid privacy tier' },
        { status: 400 }
      );
    }

    // Check if user has appropriate subscription for the tier
    // For now, allow all tier changes (subscription check can be added later)

    const updatedUser = await updateUser(session.user.id, {
      privacyTier: tier,
    });

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Failed to update user' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, tier });
  } catch (error) {
    console.error('PATCH /api/user/privacy-tier error:', error);
    return NextResponse.json(
      { error: 'Failed to update privacy tier' },
      { status: 500 }
    );
  }
}
