'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Conversation, Message } from '@/types/chat';

// Query keys
export const conversationKeys = {
  all: ['conversations'] as const,
  lists: () => [...conversationKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...conversationKeys.lists(), filters] as const,
  details: () => [...conversationKeys.all, 'detail'] as const,
  detail: (id: string) => [...conversationKeys.details(), id] as const,
  messages: (id: string) => [...conversationKeys.detail(id), 'messages'] as const,
};

// Fetch conversations
async function fetchConversations(params?: {
  archived?: boolean;
  pinned?: boolean;
  folderId?: string | null;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<Conversation[]> {
  const searchParams = new URLSearchParams();
  if (params?.archived) searchParams.set('archived', 'true');
  if (params?.pinned !== undefined) searchParams.set('pinned', String(params.pinned));
  if (params?.folderId !== undefined) searchParams.set('folderId', params.folderId ?? 'null');
  if (params?.search) searchParams.set('search', params.search);
  if (params?.limit) searchParams.set('limit', String(params.limit));
  if (params?.offset) searchParams.set('offset', String(params.offset));

  const response = await fetch(`/api/conversations?${searchParams}`);
  if (!response.ok) throw new Error('Failed to fetch conversations');
  const data = await response.json();
  return data.conversations;
}

// Fetch single conversation
async function fetchConversation(id: string): Promise<Conversation> {
  const response = await fetch(`/api/conversations/${id}`);
  if (!response.ok) throw new Error('Failed to fetch conversation');
  const data = await response.json();
  return data.conversation;
}

// Fetch messages for conversation
async function fetchMessages(conversationId: string, limit = 100, offset = 0): Promise<Message[]> {
  const response = await fetch(
    `/api/conversations/${conversationId}/messages?limit=${limit}&offset=${offset}`
  );
  if (!response.ok) throw new Error('Failed to fetch messages');
  const data = await response.json();
  return data.messages;
}

// Create conversation
async function createConversation(data: {
  title?: string;
  modelId?: string;
  folderId?: string | null;
  isBurner?: boolean;
  burnerDuration?: number;
}): Promise<Conversation> {
  const response = await fetch('/api/conversations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create conversation');
  const result = await response.json();
  return result.conversation;
}

// Update conversation
async function updateConversation(
  id: string,
  data: {
    title?: string;
    model?: string;
    folderId?: string | null;
    pinned?: boolean;
    archived?: boolean;
  }
): Promise<Conversation> {
  const response = await fetch(`/api/conversations/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update conversation');
  const result = await response.json();
  return result.conversation;
}

// Delete conversation
async function deleteConversation(id: string): Promise<void> {
  const response = await fetch(`/api/conversations/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete conversation');
}

// Create message
async function createMessage(
  conversationId: string,
  data: {
    role: 'user' | 'assistant' | 'system';
    content: string;
    model?: string;
    tokensUsed?: number;
    thinking?: string;
  }
): Promise<Message> {
  const response = await fetch(`/api/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create message');
  const result = await response.json();
  return result.message;
}

// Hooks
export function useConversations(params?: {
  archived?: boolean;
  pinned?: boolean;
  folderId?: string | null;
  search?: string;
}) {
  return useQuery({
    queryKey: conversationKeys.list(params ?? {}),
    queryFn: () => fetchConversations(params),
  });
}

export function useConversation(id: string | null) {
  return useQuery({
    queryKey: conversationKeys.detail(id ?? ''),
    queryFn: () => fetchConversation(id!),
    enabled: !!id,
  });
}

export function useMessages(conversationId: string | null) {
  return useQuery({
    queryKey: conversationKeys.messages(conversationId ?? ''),
    queryFn: () => fetchMessages(conversationId!),
    enabled: !!conversationId,
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createConversation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
    },
  });
}

export function useUpdateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateConversation>[1] }) =>
      updateConversation(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: conversationKeys.detail(id) });
    },
  });
}

export function useDeleteConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteConversation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
    },
  });
}

export function useCreateMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      conversationId,
      data,
    }: {
      conversationId: string;
      data: Parameters<typeof createMessage>[1];
    }) => createMessage(conversationId, data),
    onSuccess: (_, { conversationId }) => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.messages(conversationId) });
    },
  });
}
