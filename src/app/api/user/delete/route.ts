import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { deleteUser } from '@/lib/db/queries/users';
import { getSubscriptionByUserId, deleteSubscription } from '@/lib/db/queries/subscriptions';
import { stripe } from '@/lib/stripe/config';

export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's subscription
    const subscription = await getSubscriptionByUserId(session.user.id);

    // Cancel Stripe subscription if exists
    if (subscription?.stripeSubscriptionId) {
      try {
        await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
      } catch (stripeError) {
        console.error('Failed to cancel Stripe subscription:', stripeError);
        // Continue with deletion even if Stripe cancellation fails
      }
    }

    // Delete subscription record
    if (subscription) {
      await deleteSubscription(subscription.id);
    }

    // Delete user (this cascades to conversations, messages, etc.)
    await deleteUser(session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/user/delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    );
  }
}
