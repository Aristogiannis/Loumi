import type { ModelId } from './models';
import type { PIIType } from './privacy';

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  model?: ModelId;
  tokensUsed?: number;
  thinking?: string;
  webSearchResults?: WebSearchResult[];
  piiDetected?: PIIType[];
  createdAt: Date;
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  model: ModelId;
  folderId?: string | null;
  pinned: boolean;
  archived: boolean;
  isBurner: boolean;
  burnerExpiresAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  messages?: Message[];
  _count?: {
    messages: number;
  };
}

export interface Folder {
  id: string;
  userId: string;
  name: string;
  parentId?: string | null;
  createdAt: Date;
  conversations?: Conversation[];
  children?: Folder[];
}

export interface WebSearchResult {
  title: string;
  url: string;
  content: string;
  favicon?: string;
  domain: string;
}

export interface StreamingState {
  isStreaming: boolean;
  isThinking: boolean;
  currentThinking: string;
  currentResponse: string;
}

export interface ChatSettings {
  modelId: ModelId;
  enableWebSearch: boolean;
  enableThinking: boolean;
}

export interface ConversationGroup {
  label: string;
  conversations: Conversation[];
}

export function groupConversationsByDate(conversations: Conversation[]): ConversationGroup[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  const groups: ConversationGroup[] = [
    { label: 'Today', conversations: [] },
    { label: 'Yesterday', conversations: [] },
    { label: 'Previous 7 Days', conversations: [] },
    { label: 'Previous 30 Days', conversations: [] },
    { label: 'Older', conversations: [] },
  ];

  for (const conv of conversations) {
    const date = new Date(conv.updatedAt);
    if (date >= today) {
      groups[0]!.conversations.push(conv);
    } else if (date >= yesterday) {
      groups[1]!.conversations.push(conv);
    } else if (date >= lastWeek) {
      groups[2]!.conversations.push(conv);
    } else if (date >= lastMonth) {
      groups[3]!.conversations.push(conv);
    } else {
      groups[4]!.conversations.push(conv);
    }
  }

  return groups.filter((g) => g.conversations.length > 0);
}
