import type { PrivacyTier } from './privacy';
import type { DefaultSession, DefaultUser } from 'next-auth';
import type { DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      privacyTier: PrivacyTier;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    privacyTier: PrivacyTier;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string;
    privacyTier: PrivacyTier;
  }
}
