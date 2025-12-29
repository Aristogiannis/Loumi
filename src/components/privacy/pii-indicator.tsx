'use client';

import { useState } from 'react';
import { ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import type { PIIType } from '@/types/privacy';
import { cn } from '@/lib/utils';

interface PIIIndicatorProps {
  detectedTypes: PIIType[];
  className?: string;
}

const piiLabels: Record<PIIType, string> = {
  email: 'Email addresses',
  phone: 'Phone numbers',
  ssn: 'Social Security Numbers',
  creditCard: 'Credit card numbers',
  apiKey: 'API keys',
  name: 'Names',
  address: 'Addresses',
};

export function PIIIndicator({ detectedTypes, className }: PIIIndicatorProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (detectedTypes.length === 0) return null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={className}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'h-6 gap-1.5 px-2 text-xs',
            'text-green-600 hover:bg-green-50 hover:text-green-700',
            'dark:text-green-400 dark:hover:bg-green-950 dark:hover:text-green-300'
          )}
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          {detectedTypes.length} PII item{detectedTypes.length > 1 ? 's' : ''} protected
          {isOpen ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-2 rounded-lg border border-green-200 bg-green-50/50 p-3 dark:border-green-900 dark:bg-green-950/30">
          <p className="mb-2 text-xs font-medium text-green-800 dark:text-green-200">
            The following sensitive data was detected and anonymized:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {detectedTypes.map((type) => (
              <Badge
                key={type}
                variant="outline"
                className="border-green-300 bg-green-100 text-green-700 dark:border-green-800 dark:bg-green-900/50 dark:text-green-300"
              >
                {piiLabels[type]}
              </Badge>
            ))}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// Compact inline version
export function PIIIndicatorInline({ detectedTypes, className }: PIIIndicatorProps) {
  if (detectedTypes.length === 0) return null;

  return (
    <Badge
      variant="outline"
      className={cn(
        'gap-1 border-green-300 bg-green-50 text-green-700',
        'dark:border-green-800 dark:bg-green-900/30 dark:text-green-400',
        className
      )}
    >
      <ShieldCheck className="h-3 w-3" />
      {detectedTypes.length} protected
    </Badge>
  );
}
