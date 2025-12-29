import { eq } from 'drizzle-orm';
import { db } from '../index';
import {
  subscriptions,
  users,
  type Subscription,
  type NewSubscription,
} from '../schema';
import type { PrivacyTier } from '@/types/privacy';

export async function getSubscriptionByUserId(
  userId: string
): Promise<Subscription | undefined> {
  const result = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.userId, userId),
  });
  return result;
}

export async function getSubscriptionByStripeCustomerId(
  stripeCustomerId: string
): Promise<Subscription | undefined> {
  const result = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.stripeCustomerId, stripeCustomerId),
  });
  return result;
}

export async function getSubscriptionByStripeSubscriptionId(
  stripeSubscriptionId: string
): Promise<Subscription | undefined> {
  const result = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId),
  });
  return result;
}

// Alias for getSubscriptionByStripeSubscriptionId
export const getSubscriptionByStripeId = getSubscriptionByStripeSubscriptionId;

export async function createSubscription(
  data: NewSubscription
): Promise<Subscription> {
  const [subscription] = await db.insert(subscriptions).values(data).returning();

  // Also update user's privacy tier
  await db
    .update(users)
    .set({ privacyTier: data.tier, updatedAt: new Date() })
    .where(eq(users.id, data.userId));

  return subscription!;
}

type SubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'past_due'
  | 'trialing'
  | 'incomplete'
  | 'incomplete_expired'
  | 'unpaid'
  | 'paused';

export async function updateSubscription(
  id: string,
  data: Partial<{
    tier: PrivacyTier;
    stripeSubscriptionId: string;
    stripePriceId: string;
    status: SubscriptionStatus;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
  }>
): Promise<Subscription | undefined> {
  const [subscription] = await db
    .update(subscriptions)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(subscriptions.id, id))
    .returning();

  // If tier changed, update user's privacy tier too
  if (data.tier && subscription) {
    await db
      .update(users)
      .set({ privacyTier: data.tier, updatedAt: new Date() })
      .where(eq(users.id, subscription.userId));
  }

  return subscription;
}

export async function updateSubscriptionByStripeId(
  stripeSubscriptionId: string,
  data: Partial<{
    tier: PrivacyTier;
    status: SubscriptionStatus;
    stripePriceId: string;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
  }>
): Promise<Subscription | undefined> {
  const [subscription] = await db
    .update(subscriptions)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId))
    .returning();

  // If tier changed, update user's privacy tier too
  if (data.tier && subscription) {
    await db
      .update(users)
      .set({ privacyTier: data.tier, updatedAt: new Date() })
      .where(eq(users.id, subscription.userId));
  }

  return subscription;
}

export async function cancelSubscription(id: string): Promise<Subscription | undefined> {
  return updateSubscription(id, { status: 'canceled' });
}

export async function deleteSubscription(id: string): Promise<void> {
  const subscription = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.id, id),
  });

  if (subscription) {
    // Reset user to community tier
    await db
      .update(users)
      .set({ privacyTier: 'community', updatedAt: new Date() })
      .where(eq(users.id, subscription.userId));
  }

  await db.delete(subscriptions).where(eq(subscriptions.id, id));
}

export async function getOrCreateSubscription(
  userId: string,
  tier: PrivacyTier = 'community'
): Promise<Subscription> {
  const existing = await getSubscriptionByUserId(userId);
  if (existing) return existing;

  return createSubscription({
    userId,
    tier,
    status: 'active',
  });
}
