import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createPortalSession } from '@/lib/stripe/checkout';
import { getSubscriptionByUserId } from '@/lib/db/queries/subscriptions';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's subscription to find customer ID
    const subscription = await getSubscriptionByUserId(session.user.id);
    if (!subscription?.stripeCustomerId) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 400 }
      );
    }

    // Get the return URL from the request or use default
    const origin = req.headers.get('origin') || process.env['NEXTAUTH_URL'] || '';
    const returnUrl = `${origin}/settings/billing`;

    const result = await createPortalSession({
      customerId: subscription.stripeCustomerId,
      returnUrl,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('POST /api/stripe/portal error:', error);
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    );
  }
}
