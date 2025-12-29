import { stripe, PRICE_IDS, type TierType } from './config';

interface CreateCheckoutSessionParams {
  userId: string;
  userEmail: string;
  tier: TierType;
  returnUrl: string;
}

export async function createCheckoutSession({
  userId,
  userEmail,
  tier,
  returnUrl,
}: CreateCheckoutSessionParams) {
  const priceId = PRICE_IDS[tier];

  // Free tier doesn't need checkout
  if (tier === 'community') {
    return { url: returnUrl };
  }

  const session = await stripe.checkout.sessions.create({
    customer_email: userEmail,
    client_reference_id: userId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${returnUrl}?success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${returnUrl}?canceled=true`,
    metadata: {
      userId,
      tier,
    },
    subscription_data: {
      metadata: {
        userId,
        tier,
      },
    },
  });

  return { url: session.url, sessionId: session.id };
}

interface CreatePortalSessionParams {
  customerId: string;
  returnUrl: string;
}

export async function createPortalSession({
  customerId,
  returnUrl,
}: CreatePortalSessionParams) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return { url: session.url };
}

export async function getSubscription(subscriptionId: string) {
  return stripe.subscriptions.retrieve(subscriptionId);
}

export async function cancelSubscription(subscriptionId: string) {
  return stripe.subscriptions.cancel(subscriptionId);
}

export async function getCustomerByEmail(email: string) {
  const customers = await stripe.customers.list({ email, limit: 1 });
  return customers.data[0] || null;
}

export async function createCustomer(email: string, userId: string) {
  return stripe.customers.create({
    email,
    metadata: { userId },
  });
}
