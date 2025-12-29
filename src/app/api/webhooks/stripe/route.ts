import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe/config';
import {
  createSubscription,
  updateSubscription,
  getSubscriptionByStripeId,
} from '@/lib/db/queries/subscriptions';
import { updateUserPrivacyTier } from '@/lib/db/queries/users';
import type { TierType } from '@/lib/stripe/config';

const webhookSecret = process.env['STRIPE_WEBHOOK_SECRET']!;

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentSucceeded(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.['userId'] || session.client_reference_id;
  const tier = session.metadata?.['tier'] as TierType;

  if (!userId) {
    console.error('No userId found in checkout session');
    return;
  }

  // If there's a subscription, it will be handled by subscription.created event
  // Just log for now
  console.log(`Checkout completed for user ${userId}, tier: ${tier}`);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.['userId'];
  const tier = subscription.metadata?.['tier'] as TierType;

  if (!userId) {
    console.error('No userId found in subscription metadata');
    return;
  }

  const customerId =
    typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer.id;

  // Check if subscription exists in our database
  const existingSubscription = await getSubscriptionByStripeId(subscription.id);

  if (existingSubscription) {
    // Update existing subscription
    await updateSubscription(subscription.id, {
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    });
  } else {
    // Create new subscription
    await createSubscription({
      userId,
      tier: tier || 'private',
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscription.id,
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    });
  }

  // Update user's privacy tier if subscription is active
  if (subscription.status === 'active' && tier) {
    await updateUserPrivacyTier(userId, tier);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.['userId'];

  if (!userId) {
    console.error('No userId found in subscription metadata');
    return;
  }

  // Update subscription status
  await updateSubscription(subscription.id, {
    status: 'canceled',
  });

  // Downgrade user to community tier
  await updateUserPrivacyTier(userId, 'community');
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log(`Payment succeeded for invoice ${invoice.id}`);
  // Could send a confirmation email here
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log(`Payment failed for invoice ${invoice.id}`);
  // Could send a payment failed email here
}
