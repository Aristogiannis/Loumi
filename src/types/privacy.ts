export type PrivacyTier = 'community' | 'private' | 'sovereign';

export type PIIType =
  | 'email'
  | 'phone'
  | 'ssn'
  | 'creditCard'
  | 'apiKey'
  | 'name'
  | 'address';

export interface PIIDetectionResult {
  type: PIIType;
  originalValue: string;
  sanitizedValue: string;
  position: { start: number; end: number };
}

export interface PIIMap {
  [placeholder: string]: string; // e.g., "[EMAIL_1]": "john@example.com"
}

export interface SanitizationResult {
  sanitizedText: string;
  piiMap: PIIMap;
  detections: PIIDetectionResult[];
  blocked: boolean;
}

export interface PrivacyRouteResult {
  store: 'server' | 'local';
  anonymize: boolean;
  poolCredentials?: boolean;
  encrypt?: boolean;
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  action: string;
  provider: string;
  model: string;
  tokensInput?: number;
  tokensOutput?: number;
  piiDetected?: PIIType[];
  credentialPoolId?: string;
  conversationId?: string;
  timestamp: Date;
}

export const PRIVACY_TIER_CONFIG: Record<PrivacyTier, {
  name: string;
  description: string;
  features: string[];
  color: string;
}> = {
  community: {
    name: 'Community',
    description: 'Pay less, share more',
    features: [
      'Full access to all 9 models',
      'Data collected for research',
      'Transparent data dashboard',
      'Never sold to advertisers',
    ],
    color: 'tier-community',
  },
  private: {
    name: 'Private',
    description: 'Privacy without complexity',
    features: [
      'Full access to all 9 models',
      'Data stored but anonymized',
      'Automatic PII sanitization',
      'Pooled credentials',
    ],
    color: 'tier-private',
  },
  sovereign: {
    name: 'Sovereign',
    description: 'Your data never leaves your device',
    features: [
      'Full access to all 9 models',
      'Zero server storage',
      'End-to-end encryption',
      'Complete offline access',
    ],
    color: 'tier-sovereign',
  },
} as const;
