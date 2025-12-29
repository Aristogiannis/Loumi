'use client';

import { ProfileForm } from '@/components/settings/profile-form';
import { DangerZone } from '@/components/settings/danger-zone';
import { Separator } from '@/components/ui/separator';

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Profile</h2>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <Separator />

      <ProfileForm />

      <Separator />

      <DangerZone />
    </div>
  );
}
