'use client';

import { Suspense, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, Github, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const error = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading('email');
    try {
      await signIn('resend', { email, callbackUrl });
    } catch {
      setIsLoading(null);
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    setIsLoading(provider);
    try {
      await signIn(provider, { callbackUrl });
    } catch {
      setIsLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Logo and Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-loumi-500 to-loumi-600 mb-2">
          <span className="text-white font-bold text-xl">L</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome to Loumi
        </h1>
        <p className="text-muted-foreground text-sm">
          Sign in to access all AI models with privacy protection
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg">
          {error === 'OAuthSignin' && 'Error connecting to provider. Please try again.'}
          {error === 'OAuthCallback' && 'Error during authentication. Please try again.'}
          {error === 'OAuthCreateAccount' && 'Could not create account. Please try again.'}
          {error === 'EmailCreateAccount' && 'Could not create account. Please try again.'}
          {error === 'Callback' && 'Authentication error. Please try again.'}
          {error === 'OAuthAccountNotLinked' && 'This email is already linked to another account.'}
          {error === 'SessionRequired' && 'Please sign in to continue.'}
          {!['OAuthSignin', 'OAuthCallback', 'OAuthCreateAccount', 'EmailCreateAccount', 'Callback', 'OAuthAccountNotLinked', 'SessionRequired'].includes(error) && 'An error occurred. Please try again.'}
        </div>
      )}

      {/* Email Form */}
      <form onSubmit={handleEmailSignIn} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email address
          </label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-loumi-500 focus:border-transparent"
            disabled={isLoading !== null}
            required
          />
        </div>
        <button
          type="submit"
          disabled={isLoading !== null || !email}
          className={cn(
            'w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors',
            'bg-loumi-500 text-white hover:bg-loumi-600',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          {isLoading === 'email' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Mail className="w-4 h-4" />
          )}
          Continue with Email
        </button>
      </form>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      {/* OAuth Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => handleOAuthSignIn('google')}
          disabled={isLoading !== null}
          className={cn(
            'flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium',
            'border bg-background hover:bg-accent transition-colors',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          {isLoading === 'google' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          )}
          Google
        </button>
        <button
          onClick={() => handleOAuthSignIn('github')}
          disabled={isLoading !== null}
          className={cn(
            'flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium',
            'border bg-background hover:bg-accent transition-colors',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          {isLoading === 'github' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Github className="w-4 h-4" />
          )}
          GitHub
        </button>
      </div>

      {/* Register Link */}
      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link
          href="/register"
          className="text-loumi-500 hover:text-loumi-600 font-medium"
        >
          Sign up
        </Link>
      </p>

      {/* Privacy Notice */}
      <p className="text-center text-xs text-muted-foreground">
        By continuing, you agree to our{' '}
        <Link href="/terms" className="underline hover:text-foreground">
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link href="/privacy" className="underline hover:text-foreground">
          Privacy Policy
        </Link>
      </p>
    </div>
  );
}

function LoginSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-muted" />
        <div className="h-7 w-48 bg-muted rounded mx-auto" />
        <div className="h-4 w-64 bg-muted rounded mx-auto" />
      </div>
      <div className="space-y-4">
        <div className="h-10 bg-muted rounded-lg" />
        <div className="h-10 bg-muted rounded-lg" />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginSkeleton />}>
      <LoginForm />
    </Suspense>
  );
}
