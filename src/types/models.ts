export type ModelProvider = 'openai' | 'anthropic' | 'google';

export type ModelId =
  | 'gpt-4o'
  | 'gpt-4-turbo'
  | 'o1'
  | 'claude-opus-4'
  | 'claude-sonnet-4'
  | 'claude-haiku-3.5'
  | 'gemini-2-flash'
  | 'gemini-1.5-pro'
  | 'gemini-1.5-flash';

export interface ModelConfig {
  id: ModelId;
  providerId: string; // Actual provider model ID (e.g., 'claude-sonnet-4-20250514')
  name: string;
  description: string;
  provider: ModelProvider;
  supportsThinking: boolean;
  supportsWebSearch: boolean;
  maxTokens: number;
  contextWindow: number;
}

export interface ModelGroup {
  provider: ModelProvider;
  name: string;
  models: ModelConfig[];
}

export const PROVIDER_COLORS: Record<ModelProvider, string> = {
  openai: '#10A37F',
  anthropic: '#D97757',
  google: '#4285F4',
} as const;

export const PROVIDER_NAMES: Record<ModelProvider, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  google: 'Google',
} as const;
