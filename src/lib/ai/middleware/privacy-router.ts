import type { PrivacyTier, PrivacyRouteResult, PIIType, PIIMap } from '@/types/privacy';
import { sanitizeMessages, restorePII } from '@/lib/privacy/anonymizer';

export interface PrivacyRoutingContext {
  tier: PrivacyTier;
  messages: Array<{ role: string; content: string }>;
}

export interface PrivacyRoutedResult {
  messages: Array<{ role: string; content: string }>;
  piiMap: PIIMap;
  route: PrivacyRouteResult;
  detectedPII: PIIType[];
  blocked: boolean;
  blockedTypes?: PIIType[];
}

export function getPrivacyRoute(tier: PrivacyTier): PrivacyRouteResult {
  switch (tier) {
    case 'community':
      return {
        store: 'server',
        anonymize: false,
      };
    case 'private':
      return {
        store: 'server',
        anonymize: true,
        poolCredentials: true,
      };
    case 'sovereign':
      return {
        store: 'local',
        anonymize: true,
        encrypt: true,
      };
  }
}

export function processMessagesForPrivacy(
  context: PrivacyRoutingContext
): PrivacyRoutedResult {
  const route = getPrivacyRoute(context.tier);

  // Community tier: no anonymization needed
  if (!route.anonymize) {
    return {
      messages: context.messages,
      piiMap: {},
      route,
      detectedPII: [],
      blocked: false,
    };
  }

  // Private and Sovereign tiers: sanitize PII
  const sanitizationResult = sanitizeMessages(context.messages);

  if (sanitizationResult.blocked) {
    return {
      messages: context.messages,
      piiMap: {},
      route,
      detectedPII: [],
      blocked: true,
      blockedTypes: sanitizationResult.blockedTypes,
    };
  }

  return {
    messages: sanitizationResult.messages,
    piiMap: sanitizationResult.piiMap,
    route,
    detectedPII: sanitizationResult.detectedPII,
    blocked: false,
  };
}

export function restoreResponsePII(
  response: string,
  piiMap: PIIMap
): string {
  if (Object.keys(piiMap).length === 0) {
    return response;
  }
  return restorePII(response, piiMap);
}

export function shouldStoreOnServer(tier: PrivacyTier): boolean {
  return tier !== 'sovereign';
}

export function shouldLogToAuditTrail(tier: PrivacyTier): boolean {
  // All tiers get audit logging
  return true;
}

export function getCredentialPoolId(tier: PrivacyTier): string | undefined {
  if (tier === 'private') {
    // Return a pool ID for credential pooling
    // In production, this would rotate through a pool of credentials
    return `pool-${Math.floor(Math.random() * 10)}`;
  }
  return undefined;
}
