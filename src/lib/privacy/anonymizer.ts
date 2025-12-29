import type { PIIType, PIIMap, SanitizationResult } from '@/types/privacy';
import { detectPII, shouldBlockPII, shouldSanitizePII } from './pii-detector';

export function sanitizeText(text: string): SanitizationResult {
  const detections = detectPII(text);

  // Check if any blocked PII types are present
  if (shouldBlockPII(detections)) {
    return {
      sanitizedText: text,
      piiMap: {},
      detections,
      blocked: true,
    };
  }

  const piiMap: PIIMap = {};
  const counters: Partial<Record<PIIType, number>> = {};
  let sanitizedText = text;
  let offset = 0;

  for (const detection of detections) {
    // Only sanitize types that should be sanitized
    if (!shouldSanitizePII(detection)) {
      continue;
    }

    // Generate placeholder
    counters[detection.type] = (counters[detection.type] || 0) + 1;
    const placeholder = `[${detection.type.toUpperCase()}_${counters[detection.type]}]`;

    // Store mapping for restoration
    piiMap[placeholder] = detection.originalValue;
    detection.sanitizedValue = placeholder;

    // Replace in text
    const start = detection.position.start + offset;
    const end = detection.position.end + offset;
    sanitizedText =
      sanitizedText.slice(0, start) + placeholder + sanitizedText.slice(end);
    offset += placeholder.length - (detection.position.end - detection.position.start);
  }

  return {
    sanitizedText,
    piiMap,
    detections: detections.filter((d) => shouldSanitizePII(d)),
    blocked: false,
  };
}

export function restorePII(text: string, piiMap: PIIMap): string {
  let restoredText = text;

  for (const [placeholder, original] of Object.entries(piiMap)) {
    // Use replaceAll to handle multiple occurrences
    restoredText = restoredText.replaceAll(placeholder, original);
  }

  return restoredText;
}

export function mergePIIMaps(...maps: PIIMap[]): PIIMap {
  return Object.assign({}, ...maps);
}

export interface MessageSanitizationResult {
  messages: Array<{ role: string; content: string }>;
  piiMap: PIIMap;
  detectedPII: PIIType[];
  blocked: boolean;
  blockedTypes?: PIIType[];
}

export function sanitizeMessages(
  messages: Array<{ role: string; content: string }>
): MessageSanitizationResult {
  const combinedPiiMap: PIIMap = {};
  const detectedPII: PIIType[] = [];
  const blockedTypes: PIIType[] = [];

  const processedMessages = messages.map((msg) => {
    // Only sanitize user messages
    if (msg.role !== 'user') {
      return msg;
    }

    const result = sanitizeText(msg.content);

    if (result.blocked) {
      // Collect blocked types
      result.detections.forEach((d) => {
        if (!blockedTypes.includes(d.type)) {
          blockedTypes.push(d.type);
        }
      });
      return { ...msg, blocked: true };
    }

    // Merge PII map
    Object.assign(combinedPiiMap, result.piiMap);

    // Collect detected PII types
    result.detections.forEach((d) => {
      if (!detectedPII.includes(d.type)) {
        detectedPII.push(d.type);
      }
    });

    return { ...msg, content: result.sanitizedText };
  });

  // Check if any messages were blocked
  const hasBlockedMessage = processedMessages.some(
    (msg: any) => msg.blocked === true
  );

  if (hasBlockedMessage) {
    return {
      messages,
      piiMap: {},
      detectedPII: [],
      blocked: true,
      blockedTypes,
    };
  }

  return {
    messages: processedMessages.map(({ role, content }) => ({ role, content })),
    piiMap: combinedPiiMap,
    detectedPII,
    blocked: false,
  };
}
