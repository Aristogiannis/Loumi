import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getUserWithSubscription } from '@/lib/db/queries/users';
import { getSubscriptionByUserId } from '@/lib/db/queries/subscriptions';
import { TierComparison } from '@/components/settings/tier-comparison';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';
import type { TierType } from '@/lib/stripe/config';

export default async function BillingSettingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const user = await getUserWithSubscription(session.user.id);
  const subscription = await getSubscriptionByUserId(session.user.id);

  const currentTier = (user?.privacyTier as TierType) || 'community';
  const hasActiveSubscription = subscription?.status === 'active';

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Billing</h2>
        <p className="text-muted-foreground">
          Manage your subscription and billing information.
        </p>
      </div>

      <Separator />

      {subscription && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Current Subscription</h3>
          <div className="p-4 border rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium capitalize">{currentTier} Plan</p>
                <p className="text-sm text-muted-foreground">
                  {subscription.status === 'active' && 'Your subscription is active'}
                  {subscription.status === 'canceled' && 'Your subscription has been canceled'}
                  {subscription.status === 'past_due' && 'Payment past due'}
                  {subscription.status === 'trialing' && 'Currently in trial period'}
                </p>
              </div>
              <SubscriptionStatusBadge status={subscription.status} />
            </div>

            {subscription.currentPeriodEnd && (
              <div className="text-sm text-muted-foreground">
                {subscription.status === 'active' ? (
                  <>
                    Next billing date:{' '}
                    {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                  </>
                ) : subscription.status === 'canceled' ? (
                  <>
                    Access until:{' '}
                    {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                  </>
                ) : null}
              </div>
            )}
          </div>
        </div>
      )}

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Available Plans</h3>
        <p className="text-sm text-muted-foreground">
          Choose the plan that best fits your privacy needs.
        </p>
        <TierComparison
          currentTier={currentTier}
          hasActiveSubscription={hasActiveSubscription}
        />
      </div>
    </div>
  );
}

function SubscriptionStatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'active':
      return (
        <Badge variant="default" className="bg-green-500">
          <CheckCircle className="h-3 w-3 mr-1" />
          Active
        </Badge>
      );
    case 'canceled':
      return (
        <Badge variant="secondary">
          <AlertCircle className="h-3 w-3 mr-1" />
          Canceled
        </Badge>
      );
    case 'past_due':
      return (
        <Badge variant="destructive">
          <AlertCircle className="h-3 w-3 mr-1" />
          Past Due
        </Badge>
      );
    case 'trialing':
      return (
        <Badge variant="outline">
          <Clock className="h-3 w-3 mr-1" />
          Trial
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}
