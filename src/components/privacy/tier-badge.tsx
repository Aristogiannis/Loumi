'use client';

import { Shield, Eye, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { PrivacyTier } from '@/types/privacy';
import { cn } from '@/lib/utils';

interface TierBadgeProps {
  tier: PrivacyTier;
  showTooltip?: boolean;
  className?: string;
}

const tierConfig: Record<
  PrivacyTier,
  {
    label: string;
    description: string;
    icon: typeof Shield;
    color: string;
    bgColor: string;
  }
> = {
  community: {
    label: 'Community',
    description: 'Data may be used for training. Basic tier with standard privacy.',
    icon: Eye,
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
  },
  private: {
    label: 'Private',
    description: 'PII is anonymized before sending. Data stored server-side with pooled credentials.',
    icon: Shield,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
  },
  sovereign: {
    label: 'Sovereign',
    description: 'Full encryption. Data stored locally only. Maximum privacy protection.',
    icon: Lock,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
  },
};

export function TierBadge({ tier, showTooltip = true, className }: TierBadgeProps) {
  const config = tierConfig[tier];
  const Icon = config.icon;

  const badge = (
    <Badge
      variant="secondary"
      className={cn(
        'gap-1 font-normal',
        config.bgColor,
        config.color,
        className
      )}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );

  if (!showTooltip) return badge;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="font-medium">{config.label} Tier</p>
          <p className="text-xs text-muted-foreground">{config.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Compact version for header
export function TierBadgeCompact({ tier, className }: TierBadgeProps) {
  const config = tierConfig[tier];
  const Icon = config.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'flex h-6 w-6 items-center justify-center rounded',
              config.bgColor,
              className
            )}
          >
            <Icon className={cn('h-3.5 w-3.5', config.color)} />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-medium">{config.label} Privacy Tier</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
