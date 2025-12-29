import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createCheckoutSession } from '@/lib/stripe/checkout';
import { TIER_CONFIG, type TierType } from '@/lib/stripe/config';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { tier } = body as { tier: TierType };

    // Validate tier
    if (!tier || !TIER_CONFIG[tier]) {
      return NextResponse.json(
        { error: 'Invalid tier specified' },
        { status: 400 }
      );
    }

    // Get the return URL from the request or use default
    const origin = req.headers.get('origin') || process.env['NEXTAUTH_URL'] || '';
    const returnUrl = `${origin}/settings/billing`;

    const result = await createCheckoutSession({
      userId: session.user.id,
      userEmail: session.user.email,
      tier,
      returnUrl,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('POST /api/stripe/checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
