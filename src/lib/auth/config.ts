import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import Resend from 'next-auth/providers/resend';
import Credentials from 'next-auth/providers/credentials';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import type { Adapter } from 'next-auth/adapters';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import type { PrivacyTier } from '@/types/privacy';
import { getUserByEmail, createUser } from '@/lib/db/queries/users';

const isDev = process.env['NODE_ENV'] === 'development';

// Fixed UUID for dev user - deterministic and valid UUID format
const DEV_USER_ID = '00000000-0000-0000-0000-000000000001';
const DEV_USER_EMAIL = 'dev@loumi.local';

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
    // Dev mode credentials provider - only available in development
    ...(isDev
      ? [
          Credentials({
            id: 'dev-credentials',
            name: 'Dev Mode',
            credentials: {
              email: { label: 'Email', type: 'email' },
            },
            async authorize() {
              // In dev mode, try to use DB user, but fall back to mock user if DB is unavailable
              try {
                let user = await getUserByEmail(DEV_USER_EMAIL);
                if (!user) {
                  // Create user with fixed dev UUID
                  const { db: database } = await import('@/lib/db');
                  const { users: usersTable } = await import('@/lib/db/schema');

                  const [newUser] = await database.insert(usersTable).values({
                    id: DEV_USER_ID,
                    email: DEV_USER_EMAIL,
                    name: 'Dev User',
                    privacyTier: 'community',
                  }).returning();

                  user = newUser!;
                }
                return {
                  id: user.id,
                  email: user.email,
                  name: user.name,
                  privacyTier: (user.privacyTier as PrivacyTier) ?? 'community',
                };
              } catch (error) {
                // Database not available - use mock user for dev testing
                console.warn('[Dev Auth] Database unavailable, using mock user:', error);

                return {
                  id: DEV_USER_ID,
                  email: DEV_USER_EMAIL,
                  name: 'Dev User',
                  privacyTier: 'community' as PrivacyTier,
                };
              }
            },
          }),
        ]
      : []),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
    verifyRequest: '/login/verify',
  },
  callbacks: {
    async jwt({ token, user }) {
      // JWT callback only runs in dev mode with credentials
      if (user?.id) {
        token.id = user.id;
        token.privacyTier = 'community';
      }
      return token;
    },
    async session({ session, token, user }) {
      // JWT session (dev mode with credentials)
      if (token?.id) {
        session.user.id = token.id as string;
        session.user.privacyTier = (token.privacyTier as PrivacyTier) ?? 'community';
      }
      // Database session (production with OAuth)
      else if (user) {
        const dbUser = await db.query.users.findFirst({
          where: eq(users.id, user.id),
          columns: {
            id: true,
            privacyTier: true,
          },
        });

        session.user.id = user.id;
        session.user.privacyTier = (dbUser?.privacyTier as PrivacyTier) ?? 'community';
      }

      return session;
    },
    async signIn() {
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
    // Use JWT in dev mode (required for credentials provider), database in production
    strategy: isDev ? 'jwt' : 'database',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // Update session every 24 hours
  },
  trustHost: true,
});
