'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { Mail, Github, Loader2, Users, Shield, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PRIVACY_TIER_CONFIG, type PrivacyTier } from '@/types/privacy';

const tierIcons = {
  community: Users,
  private: Shield,
  sovereign: Lock,
};

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [selectedTier, setSelectedTier] = useState<PrivacyTier>('community');
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading('email');
    try {
      // For registration, we'll use the same magic link flow
      // The tier selection can be saved after sign-in or during onboarding
      await signIn('resend', { email, callbackUrl: `/?tier=${selectedTier}` });
    } catch {
      setIsLoading(null);
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    setIsLoading(provider);
    try {
      await signIn(provider, { callbackUrl: `/?tier=${selectedTier}` });
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
          Create your account
        </h1>
        <p className="text-muted-foreground text-sm">
          Choose your privacy level and get started
        </p>
      </div>

      {/* Privacy Tier Selection */}
      <div className="space-y-3">
        <label className="text-sm font-medium">Choose your privacy tier</label>
        <div className="space-y-2">
          {(Object.keys(PRIVACY_TIER_CONFIG) as PrivacyTier[]).map((tier) => {
            const config = PRIVACY_TIER_CONFIG[tier];
            const Icon = tierIcons[tier];
            return (
              <button
                key={tier}
                type="button"
                onClick={() => setSelectedTier(tier)}
                className={cn(
                  'w-full p-3 rounded-lg border text-left transition-all',
                  selectedTier === tier
                    ? 'border-loumi-500 bg-loumi-50 dark:bg-loumi-900/20 ring-1 ring-loumi-500'
                    : 'border-border hover:border-loumi-300 hover:bg-muted/50'
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                      tier === 'community' && 'bg-neutral-100 dark:bg-neutral-800',
                      tier === 'private' && 'bg-blue-50 dark:bg-blue-900/30',
                      tier === 'sovereign' && 'bg-emerald-50 dark:bg-emerald-900/30'
                    )}
                  >
                    <Icon
                      className={cn(
                        'w-4 h-4',
                        tier === 'community' && 'text-neutral-600 dark:text-neutral-400',
                        tier === 'private' && 'text-blue-600 dark:text-blue-400',
                        tier === 'sovereign' && 'text-emerald-600 dark:text-emerald-400'
                      )}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{config.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {tier === 'community' && '1X pricing'}
                        {tier === 'private' && '2X pricing'}
                        {tier === 'sovereign' && '3X pricing'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {config.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground">
          You can change your tier anytime in settings.
        </p>
      </div>

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

      {/* Login Link */}
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link
          href="/login"
          className="text-loumi-500 hover:text-loumi-600 font-medium"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
