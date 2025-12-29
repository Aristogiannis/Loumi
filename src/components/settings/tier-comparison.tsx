'use client';

import { useState } from 'react';
import { Check, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { TIER_CONFIG, type TierType } from '@/lib/stripe/config';
import { cn } from '@/lib/utils';

interface TierComparisonProps {
  currentTier: TierType;
  hasActiveSubscription: boolean;
}

const allFeatures = [
  { key: 'models', label: 'Access to all 9 AI models', tiers: ['community', 'private', 'sovereign'] },
  { key: 'conversations', label: 'Unlimited conversations', tiers: ['community', 'private', 'sovereign'] },
  { key: 'pii', label: 'PII detection & sanitization', tiers: ['private', 'sovereign'] },
  { key: 'pooled', label: 'Pooled API credentials', tiers: ['private', 'sovereign'] },
  { key: 'thinking', label: 'Extended thinking mode', tiers: ['private', 'sovereign'] },
  { key: 'websearch', label: 'Web search integration', tiers: ['private', 'sovereign'] },
  { key: 'export', label: 'Export to Markdown/JSON', tiers: ['private', 'sovereign'] },
  { key: 'local', label: 'Local-only data storage', tiers: ['sovereign'] },
  { key: 'encryption', label: 'End-to-end encryption', tiers: ['sovereign'] },
  { key: 'burner', label: 'Burner sessions', tiers: ['sovereign'] },
  { key: 'audit', label: 'Full audit trail', tiers: ['sovereign'] },
  { key: 'noretention', label: 'No server data retention', tiers: ['sovereign'] },
];

export function TierComparison({ currentTier, hasActiveSubscription }: TierComparisonProps) {
  const { toast } = useToast();
  const [loadingTier, setLoadingTier] = useState<TierType | null>(null);

  const handleUpgrade = async (tier: TierType) => {
    if (tier === 'community') return;

    setLoadingTier(tier);

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: 'Error',
        description: 'Failed to start checkout. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoadingTier(null);
    }
  };

  const handleManageSubscription = async () => {
    setLoadingTier(currentTier);

    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to create portal session');
      }

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Portal error:', error);
      toast({
        title: 'Error',
        description: 'Failed to open billing portal. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoadingTier(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        {(Object.keys(TIER_CONFIG) as TierType[]).map((tier) => {
          const config = TIER_CONFIG[tier];
          const isCurrentTier = tier === currentTier;
          const isPopular = tier === 'private';

          return (
            <Card
              key={tier}
              className={cn(
                'relative',
                isCurrentTier && 'border-primary',
                isPopular && 'border-2 border-primary/50'
              )}
            >
              {isPopular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                  Most Popular
                </Badge>
              )}
              {isCurrentTier && (
                <Badge variant="secondary" className="absolute -top-3 right-4">
                  Current Plan
                </Badge>
              )}

              <CardHeader>
                <CardTitle className="text-xl">{config.name}</CardTitle>
                <CardDescription>
                  <span className="text-3xl font-bold text-foreground">
                    ${config.price}
                  </span>
                  {config.price > 0 && (
                    <span className="text-muted-foreground">/month</span>
                  )}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3">
                {allFeatures.map((feature) => {
                  const hasFeature = feature.tiers.includes(tier);

                  return (
                    <div key={feature.key} className="flex items-center gap-2">
                      {hasFeature ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground/50" />
                      )}
                      <span
                        className={cn(
                          'text-sm',
                          !hasFeature && 'text-muted-foreground/50'
                        )}
                      >
                        {feature.label}
                      </span>
                    </div>
                  );
                })}
              </CardContent>

              <CardFooter>
                {isCurrentTier ? (
                  hasActiveSubscription && tier !== 'community' ? (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleManageSubscription}
                      disabled={loadingTier !== null}
                    >
                      {loadingTier === tier && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Manage Subscription
                    </Button>
                  ) : (
                    <Button variant="secondary" className="w-full" disabled>
                      Current Plan
                    </Button>
                  )
                ) : tier === 'community' ? (
                  <Button variant="outline" className="w-full" disabled>
                    Free Plan
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    onClick={() => handleUpgrade(tier)}
                    disabled={loadingTier !== null}
                  >
                    {loadingTier === tier && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Upgrade to {config.name}
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
