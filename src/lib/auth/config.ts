import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import Resend from 'next-auth/providers/resend';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import type { Adapter } from 'next-auth/adapters';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import type { PrivacyTier } from '@/types/privacy';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db) as Adapter,
  providers: [
    Google({
      clientId: process.env['AUTH_GOOGLE_ID'],
      clientSecret: process.env['AUTH_GOOGLE_SECRET'],
    }),
    GitHub({
      clientId: process.env['AUTH_GITHUB_ID'],
      clientSecret: process.env['AUTH_GITHUB_SECRET'],
    }),
    Resend({
      apiKey: process.env['AUTH_RESEND_KEY'],
      from: 'Loumi <noreply@loumi.app>',
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
    verifyRequest: '/login/verify',
  },
  callbacks: {
    async session({ session, user }) {
      // Fetch user's privacy tier from database
      const dbUser = await db.query.users.findFirst({
        where: eq(users.id, user.id),
        columns: {
          id: true,
          privacyTier: true,
        },
      });

      session.user.id = user.id;
      session.user.privacyTier = (dbUser?.privacyTier as PrivacyTier) ?? 'community';

      return session;
    },
    async signIn({ user, account, profile }) {
      // Allow sign in
      return true;
    },
  },
  events: {
    async createUser({ user }) {
      // New user created - they start with community tier
      // Subscription will be created on first request if needed
      console.log(`New user created: ${user.email}`);
    },
  },
  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // Update session every 24 hours
  },
  trustHost: true,
});
