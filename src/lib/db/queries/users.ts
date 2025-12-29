import { eq } from 'drizzle-orm';
import { db } from '../index';
import { users, subscriptions, type User, type NewUser } from '../schema';
import type { PrivacyTier } from '@/types/privacy';

export async function getUserById(id: string): Promise<User | undefined> {
  const result = await db.query.users.findFirst({
    where: eq(users.id, id),
    with: {
      subscription: true,
    },
  });
  return result;
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const result = await db.query.users.findFirst({
    where: eq(users.email, email),
  });
  return result;
}

export async function createUser(data: NewUser): Promise<User> {
  const [user] = await db.insert(users).values(data).returning();
  return user!;
}

export async function updateUser(
  id: string,
  data: Partial<Pick<User, 'name' | 'image' | 'privacyTier' | 'encryptionKeyHash'>>
): Promise<User | undefined> {
  const [user] = await db
    .update(users)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning();
  return user;
}

export async function updateUserPrivacyTier(
  id: string,
  tier: PrivacyTier
): Promise<User | undefined> {
  const [user] = await db
    .update(users)
    .set({ privacyTier: tier, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning();
  return user;
}

export async function updateUserEncryptionKeyHash(
  id: string,
  hash: string
): Promise<User | undefined> {
  const [user] = await db
    .update(users)
    .set({ encryptionKeyHash: hash, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning();
  return user;
}

export async function deleteUser(id: string): Promise<void> {
  await db.delete(users).where(eq(users.id, id));
}

export async function getUserWithSubscription(id: string) {
  return await db.query.users.findFirst({
    where: eq(users.id, id),
    with: {
      subscription: true,
    },
  });
}
