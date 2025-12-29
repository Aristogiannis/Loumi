import Stripe from 'stripe';

// Server-side Stripe client (lazy initialization)
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env['STRIPE_SECRET_KEY'];
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY environment variable is not set');
    }
    _stripe = new Stripe(key, {
      apiVersion: '2025-02-24.acacia',
      typescript: true,
    });
  }
  return _stripe;
}

// For backwards compatibility
export const stripe = {
  get webhooks() {
    return getStripe().webhooks;
  },
  get checkout() {
    return getStripe().checkout;
  },
  get billingPortal() {
    return getStripe().billingPortal;
  },
  get subscriptions() {
    return getStripe().subscriptions;
  },
  get customers() {
    return getStripe().customers;
  },
};

// Price IDs for each privacy tier
export const PRICE_IDS = {
  community: process.env['STRIPE_PRICE_COMMUNITY'] || 'price_community',
  private: process.env['STRIPE_PRICE_PRIVATE'] || 'price_private',
  sovereign: process.env['STRIPE_PRICE_SOVEREIGN'] || 'price_sovereign',
} as const;

// Tier configuration with features
export const TIER_CONFIG = {
  community: {
    name: 'Community',
    price: 0,
    priceId: PRICE_IDS.community,
    features: [
      'Access to all 9 AI models',
      'Unlimited conversations',
      'Basic conversation management',
      'Server-side storage',
      'Community support',
    ],
    limits: {
      messagesPerDay: 100,
      tokensPerMonth: 100000,
    },
  },
  private: {
    name: 'Private',
    price: 19,
    priceId: PRICE_IDS.private,
    features: [
      'Everything in Community',
      'PII detection & sanitization',
      'Pooled API credentials',
      'Extended thinking mode',
      'Web search integration',
      'Export to Markdown/JSON',
      'Priority support',
    ],
    limits: {
      messagesPerDay: 500,
      tokensPerMonth: 500000,
    },
  },
  sovereign: {
    name: 'Sovereign',
    price: 49,
    priceId: PRICE_IDS.sovereign,
    features: [
      'Everything in Private',
      'Local-only data storage',
      'End-to-end encryption',
      'Burner sessions',
      'Full audit trail',
      'No server-side data retention',
      'Premium support',
    ],
    limits: {
      messagesPerDay: -1, // Unlimited
      tokensPerMonth: -1, // Unlimited
    },
  },
} as const;

export type TierType = keyof typeof TIER_CONFIG;

// Subscription status types
export type SubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'past_due'
  | 'paused'
  | 'trialing'
  | 'unpaid';
