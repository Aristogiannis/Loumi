import type { PIIType, PIIDetectionResult } from '@/types/privacy';

// PII detection patterns
const PII_PATTERNS: Record<PIIType, RegExp> = {
  email: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
  phone: /\b(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
  ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
  creditCard: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
  apiKey: /\b(sk-|pk_|api[_-]?key|secret[_-]?key)[a-zA-Z0-9_-]{20,}\b/gi,
  // Name detection is complex and could lead to false positives
  // For now, we'll leave it as a no-op pattern
  name: /(?!.*)/g, // Never matches - names require NLP
  address: /(?!.*)/g, // Never matches - addresses require NLP
};

// PII types that should block transmission entirely (too sensitive)
const BLOCK_PII_TYPES: PIIType[] = ['ssn', 'creditCard', 'apiKey'];

// PII types that should be sanitized (replaced with placeholder)
const SANITIZE_PII_TYPES: PIIType[] = ['email', 'phone'];

export function detectPII(text: string): PIIDetectionResult[] {
  const results: PIIDetectionResult[] = [];

  for (const [type, pattern] of Object.entries(PII_PATTERNS)) {
    // Skip patterns that never match
    if (type === 'name' || type === 'address') continue;

    const regex = new RegExp(pattern.source, pattern.flags);
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      results.push({
        type: type as PIIType,
        originalValue: match[0],
        sanitizedValue: '', // Will be set during sanitization
        position: { start: match.index, end: match.index + match[0].length },
      });
    }
  }

  // Sort by position to process in order
  return results.sort((a, b) => a.position.start - b.position.start);
}

export function shouldBlockPII(detections: PIIDetectionResult[]): boolean {
  return detections.some((d) => BLOCK_PII_TYPES.includes(d.type));
}

export function shouldSanitizePII(detection: PIIDetectionResult): boolean {
  return SANITIZE_PII_TYPES.includes(detection.type);
}

export function getBlockedPIITypes(
  detections: PIIDetectionResult[]
): PIIType[] {
  return detections
    .filter((d) => BLOCK_PII_TYPES.includes(d.type))
    .map((d) => d.type);
}

export function getPIITypeLabel(type: PIIType): string {
  const labels: Record<PIIType, string> = {
    email: 'Email address',
    phone: 'Phone number',
    ssn: 'Social Security Number',
    creditCard: 'Credit card number',
    apiKey: 'API key or secret',
    name: 'Personal name',
    address: 'Physical address',
  };
  return labels[type];
}
