'use client';

import { useSession } from 'next-auth/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import type { PrivacyTier } from '@/types/privacy';

export function usePrivacyTier() {
  const { data: session, update: updateSession } = useSession();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const currentTier = (session?.user?.privacyTier as PrivacyTier) ?? 'community';

  const updateTierMutation = useMutation({
    mutationFn: async (newTier: PrivacyTier) => {
      const response = await fetch('/api/user/privacy-tier', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: newTier }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update privacy tier');
      }

      return response.json();
    },
    onSuccess: async (_, newTier) => {
      // Update session to reflect new tier
      await updateSession({ privacyTier: newTier });

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['conversations'] });

      toast({
        title: 'Privacy tier updated',
        description: `Your privacy tier is now set to ${newTier}.`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update privacy tier',
        variant: 'destructive',
      });
    },
  });

  return {
    currentTier,
    updateTier: updateTierMutation.mutate,
    isUpdating: updateTierMutation.isPending,
    isCommunity: currentTier === 'community',
    isPrivate: currentTier === 'private',
    isSovereign: currentTier === 'sovereign',
  };
}
