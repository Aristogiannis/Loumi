import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getUserWithSubscription } from '@/lib/db/queries/users';
import { TierBadge } from '@/components/privacy/tier-badge';
import { AuditTrail } from '@/components/privacy/audit-trail';
import { Separator } from '@/components/ui/separator';
import type { PrivacyTier } from '@/types/privacy';

export default async function PrivacySettingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const user = await getUserWithSubscription(session.user.id);
  const privacyTier = (user?.privacyTier as PrivacyTier) || 'community';

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Privacy</h2>
        <p className="text-muted-foreground">
          View your privacy settings and audit trail.
        </p>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Current Privacy Tier</h3>
        <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/30">
          <TierBadge tier={privacyTier} />
          <div>
            <p className="font-medium capitalize">{privacyTier} Tier</p>
            <p className="text-sm text-muted-foreground">
              {privacyTier === 'community' &&
                'Your data is stored on our servers. Basic privacy features.'}
              {privacyTier === 'private' &&
                'PII detection and sanitization enabled. Pooled credentials.'}
              {privacyTier === 'sovereign' &&
                'Local-only storage with end-to-end encryption.'}
            </p>
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Privacy Features</h3>
        <div className="grid gap-4">
          <PrivacyFeatureCard
            title="PII Detection"
            description="Automatically detect personal information in your messages"
            enabled={privacyTier !== 'community'}
          />
          <PrivacyFeatureCard
            title="Data Anonymization"
            description="Sanitize sensitive data before sending to AI providers"
            enabled={privacyTier !== 'community'}
          />
          <PrivacyFeatureCard
            title="Local Storage"
            description="Store all data locally on your device"
            enabled={privacyTier === 'sovereign'}
          />
          <PrivacyFeatureCard
            title="End-to-End Encryption"
            description="Encrypt all your data with a key only you control"
            enabled={privacyTier === 'sovereign'}
          />
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Audit Trail</h3>
        <p className="text-sm text-muted-foreground">
          View a log of all AI interactions and privacy-related events.
        </p>
        <AuditTrail />
      </div>
    </div>
  );
}

function PrivacyFeatureCard({
  title,
  description,
  enabled,
}: {
  title: string;
  description: string;
  enabled: boolean;
}) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div
        className={`px-3 py-1 rounded-full text-xs font-medium ${
          enabled
            ? 'bg-green-500/10 text-green-600'
            : 'bg-muted text-muted-foreground'
        }`}
      >
        {enabled ? 'Enabled' : 'Disabled'}
      </div>
    </div>
  );
}
