'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';

export function DangerZone() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (confirmText !== 'DELETE') return;

    setIsDeleting(true);

    try {
      const response = await fetch('/api/user/delete', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete account');
      }

      toast({
        title: 'Account deleted',
        description: 'Your account has been permanently deleted.',
      });

      // Sign out and redirect to home
      await signOut({ callbackUrl: '/' });
    } catch (error) {
      console.error('Delete account error:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete account. Please try again.',
        variant: 'destructive',
      });
      setIsDeleting(false);
    }
  };

  return (
    <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-6">
      <div className="flex items-start gap-4">
        <AlertTriangle className="h-6 w-6 text-destructive shrink-0 mt-0.5" />
        <div className="space-y-3 flex-1">
          <div>
            <h3 className="text-lg font-semibold text-destructive">Danger Zone</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Account</DialogTitle>
                <DialogDescription>
                  This action is permanent and cannot be undone. All your data, including
                  conversations, messages, and settings will be permanently deleted.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4">
                  <p className="text-sm font-medium text-destructive">
                    Warning: This will permanently delete:
                  </p>
                  <ul className="text-sm text-muted-foreground mt-2 list-disc list-inside space-y-1">
                    <li>All conversations and messages</li>
                    <li>All folders and organization</li>
                    <li>Audit logs and usage history</li>
                    <li>Subscription and billing data</li>
                    <li>All account settings</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm">
                    Type <span className="font-mono font-bold">DELETE</span> to confirm
                  </Label>
                  <Input
                    id="confirm"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="DELETE"
                    disabled={isDeleting}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsOpen(false);
                    setConfirmText('');
                  }}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  disabled={confirmText !== 'DELETE' || isDeleting}
                >
                  {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Delete Account Forever
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
