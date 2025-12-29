import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import type { ModelId, ModelConfig, ModelGroup, ModelProvider } from '@/types/models';

// Create provider instances
const openai = createOpenAI({
  apiKey: process.env['OPENAI_API_KEY'],
});

const anthropic = createAnthropic({
  apiKey: process.env['ANTHROPIC_API_KEY'],
});

const google = createGoogleGenerativeAI({
  apiKey: process.env['GOOGLE_AI_API_KEY'],
});

// Model configurations with full metadata
export const models: Record<ModelId, ModelConfig> = {
  // OpenAI Models
  'gpt-4o': {
    id: 'gpt-4o',
    providerId: 'gpt-4o',
    name: 'GPT-4o',
    description: 'Fastest, multimodal',
    provider: 'openai',
    supportsThinking: false,
    supportsWebSearch: true,
    maxTokens: 4096,
    contextWindow: 128000,
  },
  'gpt-4-turbo': {
    id: 'gpt-4-turbo',
    providerId: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    description: 'Powerful, cost-effective',
    provider: 'openai',
    supportsThinking: false,
    supportsWebSearch: true,
    maxTokens: 4096,
    contextWindow: 128000,
  },
  'o1': {
    id: 'o1',
    providerId: 'o1',
    name: 'O1',
    description: 'Advanced reasoning',
    provider: 'openai',
    supportsThinking: true,
    supportsWebSearch: true,
    maxTokens: 100000,
    contextWindow: 200000,
  },
  // Anthropic Models
  'claude-opus-4': {
    id: 'claude-opus-4',
    providerId: 'claude-opus-4-20250514',
    name: 'Claude Opus 4',
    description: 'Most capable',
    provider: 'anthropic',
    supportsThinking: true,
    supportsWebSearch: true,
    maxTokens: 8192,
    contextWindow: 200000,
  },
  'claude-sonnet-4': {
    id: 'claude-sonnet-4',
    providerId: 'claude-sonnet-4-20250514',
    name: 'Claude Sonnet 4',
    description: 'Balanced',
    provider: 'anthropic',
    supportsThinking: true,
    supportsWebSearch: true,
    maxTokens: 8192,
    contextWindow: 200000,
  },
  'claude-haiku-3.5': {
    id: 'claude-haiku-3.5',
    providerId: 'claude-3-5-haiku-20241022',
    name: 'Claude Haiku 3.5',
    description: 'Fast & efficient',
    provider: 'anthropic',
    supportsThinking: false,
    supportsWebSearch: true,
    maxTokens: 8192,
    contextWindow: 200000,
  },
  // Google Models
  'gemini-2-flash': {
    id: 'gemini-2-flash',
    providerId: 'gemini-2.0-flash-exp',
    name: 'Gemini 2.0 Flash',
    description: 'Cutting edge',
    provider: 'google',
    supportsThinking: true,
    supportsWebSearch: true,
    maxTokens: 8192,
    contextWindow: 1000000,
  },
  'gemini-1.5-pro': {
    id: 'gemini-1.5-pro',
    providerId: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    description: 'Long context',
    provider: 'google',
    supportsThinking: false,
    supportsWebSearch: true,
    maxTokens: 8192,
    contextWindow: 2000000,
  },
  'gemini-1.5-flash': {
    id: 'gemini-1.5-flash',
    providerId: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    description: 'Speed optimized',
    provider: 'google',
    supportsThinking: false,
    supportsWebSearch: true,
    maxTokens: 8192,
    contextWindow: 1000000,
  },
};

// Model groups for UI display
export const modelGroups: ModelGroup[] = [
  {
    provider: 'openai',
    name: 'OpenAI',
    models: [models['gpt-4o'], models['gpt-4-turbo'], models['o1']],
  },
  {
    provider: 'anthropic',
    name: 'Anthropic',
    models: [
      models['claude-opus-4'],
      models['claude-sonnet-4'],
      models['claude-haiku-3.5'],
    ],
  },
  {
    provider: 'google',
    name: 'Google',
    models: [
      models['gemini-2-flash'],
      models['gemini-1.5-pro'],
      models['gemini-1.5-flash'],
    ],
  },
];

// Get model instance for streaming
export function getModel(modelId: ModelId) {
  const config = models[modelId];
  if (!config) {
    throw new Error(`Unknown model: ${modelId}`);
  }

  switch (config.provider) {
    case 'openai':
      return openai(config.providerId);
    case 'anthropic':
      return anthropic(config.providerId);
    case 'google':
      return google(config.providerId);
    default:
      throw new Error(`Unknown provider for model: ${modelId}`);
  }
}

// Get model config by ID
export function getModelConfig(modelId: ModelId): ModelConfig {
  const config = models[modelId];
  if (!config) {
    throw new Error(`Unknown model: ${modelId}`);
  }
  return config;
}

// Validate model ID
export function isValidModelId(id: string): id is ModelId {
  return id in models;
}

// Get default model
export function getDefaultModel(): ModelId {
  return 'claude-sonnet-4';
}

// Provider colors for UI
export const providerColors: Record<ModelProvider, string> = {
  openai: '#10A37F',
  anthropic: '#D97757',
  google: '#4285F4',
};

// Provider gradient backgrounds for model selector
export const providerGradients: Record<ModelProvider, string> = {
  openai: 'from-emerald-500 to-teal-600',
  anthropic: 'from-orange-400 to-amber-600',
  google: 'from-blue-500 to-indigo-600',
};
