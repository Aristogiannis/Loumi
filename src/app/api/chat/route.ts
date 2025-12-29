import { streamText, type CoreMessage } from 'ai';
import { auth } from '@/lib/auth';
import { getModel, getModelConfig, isValidModelId } from '@/lib/ai/providers';
import { webSearchTool } from '@/lib/ai/tools';
import {
  processMessagesForPrivacy,
  restoreResponsePII,
  shouldStoreOnServer,
  getCredentialPoolId,
} from '@/lib/ai/middleware/privacy-router';
import { createAuditLog } from '@/lib/db/queries/audit-logs';
import { createMessage } from '@/lib/db/queries/messages';
import { updateConversation } from '@/lib/db/queries/conversations';
import type { ModelId } from '@/types/models';

export const maxDuration = 60; // 60 seconds timeout

export async function POST(req: Request) {
  try {
    // Authenticate user
    const session = await auth();
    if (!session?.user?.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Parse request body
    const body = await req.json();
    const {
      messages,
      modelId,
      conversationId,
      enableWebSearch = false,
      enableThinking = false,
    } = body;

    // Validate model ID
    if (!isValidModelId(modelId)) {
      return new Response(`Invalid model: ${modelId}`, { status: 400 });
    }

    const modelConfig = getModelConfig(modelId as ModelId);
    const privacyTier = session.user.privacyTier;

    // Process messages through privacy layer
    const privacyResult = processMessagesForPrivacy({
      tier: privacyTier,
      messages,
    });

    // Check if message was blocked due to sensitive content
    if (privacyResult.blocked) {
      return new Response(
        JSON.stringify({
          error: 'Message blocked',
          message:
            'Your message contains sensitive information that cannot be transmitted.',
          blockedTypes: privacyResult.blockedTypes,
        }),
        {
          status: 422,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Build tools based on feature flags and model support
    const useTools = enableWebSearch && modelConfig.supportsWebSearch;

    // Configure thinking mode for supported models
    const thinkingConfig =
      enableThinking && modelConfig.supportsThinking
        ? { enabled: true as const }
        : undefined;

    // Get credential pool ID for Private tier
    const credentialPoolId = getCredentialPoolId(privacyTier);

    // Stream the response
    const result = streamText({
      model: getModel(modelId as ModelId),
      messages: privacyResult.messages as CoreMessage[],
      ...(useTools && { tools: { webSearch: webSearchTool } }),
      maxSteps: useTools ? 5 : 1,
      onFinish: async ({ text, usage, reasoning }) => {
        try {
          // Restore PII in the response for storage
          const restoredText = restoreResponsePII(text, privacyResult.piiMap);

          // Helper to safely convert token counts (handle NaN/undefined)
          const safeTokenCount = (value: number | undefined): number | null => {
            if (value === undefined || value === null || Number.isNaN(value)) {
              return null;
            }
            return Math.floor(value);
          };

          // Log to audit trail
          await createAuditLog({
            userId: session.user.id,
            action: 'chat_completion',
            provider: modelConfig.provider,
            model: modelId,
            tokensInput: safeTokenCount(usage?.promptTokens),
            tokensOutput: safeTokenCount(usage?.completionTokens),
            piiDetected:
              privacyResult.detectedPII.length > 0
                ? privacyResult.detectedPII
                : null,
            credentialPoolId,
            conversationId,
          });

          // Store message if server-side storage is enabled
          if (shouldStoreOnServer(privacyTier) && conversationId) {
            await createMessage({
              conversationId,
              role: 'assistant',
              content: restoredText,
              model: modelId,
              tokensUsed: safeTokenCount(usage?.totalTokens),
              thinking: reasoning || null,
              piiDetected:
                privacyResult.detectedPII.length > 0
                  ? privacyResult.detectedPII
                  : null,
            });

            // Update conversation's updatedAt
            await updateConversation(conversationId, session.user.id, {});
          }
        } catch (error) {
          console.error('Error in onFinish callback:', error);
        }
      },
    });

    // Return streaming response with additional headers
    return result.toDataStreamResponse({
      headers: {
        'X-Privacy-Tier': privacyTier,
        'X-Model': modelId,
        'X-PII-Sanitized': String(privacyResult.detectedPII.length),
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return new Response(
          JSON.stringify({
            error: 'Configuration error',
            message: 'AI provider not configured properly.',
          }),
          {
            status: 503,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      if (error.message.includes('rate limit')) {
        return new Response(
          JSON.stringify({
            error: 'Rate limited',
            message: 'Too many requests. Please try again in a moment.',
          }),
          {
            status: 429,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    }

    return new Response(
      JSON.stringify({
        error: 'Internal error',
        message: 'An unexpected error occurred.',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
