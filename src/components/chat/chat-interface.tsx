'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { HeaderBar } from './header-bar';
import { MessageList } from './message-list';
import { ChatInput } from './chat-input';
import { EmptyState } from './empty-state';
import { useChatStream } from '@/hooks/use-chat-stream';
import { useMessages, useCreateConversation, useUpdateConversation, useDeleteConversation } from '@/hooks/use-conversations';
import { useChatStore } from '@/stores/chat-store';
import { useToast } from '@/hooks/use-toast';
import type { Conversation, Message } from '@/types/chat';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ChatInterfaceProps {
  conversation?: Conversation | null;
  initialMessages?: Message[];
}

export function ChatInterface({ conversation, initialMessages = [] }: ChatInterfaceProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { currentModel, setCurrentConversationId } = useChatStore();

  // Dialogs
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  // Mutations
  const createConversation = useCreateConversation();
  const updateConversation = useUpdateConversation();
  const deleteConversation = useDeleteConversation();

  // Messages query
  const { data: messagesData } = useMessages(conversation?.id ?? null);
  const messages = messagesData ?? initialMessages;

  // Chat streaming
  const {
    sendMessage,
    cancelStream,
    isStreaming,
    content: streamingContent,
    thinking: streamingThinking,
    error: streamError,
  } = useChatStream({
    conversationId: conversation?.id ?? '',
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Set current conversation ID in store
  useEffect(() => {
    setCurrentConversationId(conversation?.id ?? null);
    return () => setCurrentConversationId(null);
  }, [conversation?.id, setCurrentConversationId]);

  // Handle sending a message
  const handleSend = useCallback(
    async (content: string) => {
      if (!conversation) {
        // Create new conversation first
        try {
          const newConversation = await createConversation.mutateAsync({
            title: content.slice(0, 100),
            modelId: currentModel,
          });
          router.push(`/c/${newConversation.id}`);
          // The actual message sending will happen after navigation
          // Store the message content to send after conversation is created
          localStorage.setItem('pending_message', content);
        } catch (error) {
          toast({
            title: 'Error',
            description: 'Failed to create conversation',
            variant: 'destructive',
          });
        }
        return;
      }

      sendMessage(content, messages);
    },
    [conversation, createConversation, currentModel, messages, router, sendMessage, toast]
  );

  // Check for pending message after navigation
  useEffect(() => {
    if (conversation && messages.length === 0) {
      const pendingMessage = localStorage.getItem('pending_message');
      if (pendingMessage) {
        localStorage.removeItem('pending_message');
        sendMessage(pendingMessage, []);
      }
    }
  }, [conversation, messages.length, sendMessage]);

  // Handlers for conversation actions
  const handleRename = useCallback(() => {
    setNewTitle(conversation?.title ?? '');
    setRenameDialogOpen(true);
  }, [conversation?.title]);

  const handleRenameSubmit = useCallback(async () => {
    if (!conversation || !newTitle.trim()) return;
    try {
      await updateConversation.mutateAsync({
        id: conversation.id,
        data: { title: newTitle.trim() },
      });
      setRenameDialogOpen(false);
      toast({ title: 'Conversation renamed' });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to rename conversation',
        variant: 'destructive',
      });
    }
  }, [conversation, newTitle, updateConversation, toast]);

  const handlePin = useCallback(async () => {
    if (!conversation) return;
    try {
      await updateConversation.mutateAsync({
        id: conversation.id,
        data: { pinned: !conversation.pinned },
      });
      toast({ title: conversation.pinned ? 'Unpinned' : 'Pinned' });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update conversation',
        variant: 'destructive',
      });
    }
  }, [conversation, updateConversation, toast]);

  const handleArchive = useCallback(async () => {
    if (!conversation) return;
    try {
      await updateConversation.mutateAsync({
        id: conversation.id,
        data: { archived: !conversation.archived },
      });
      toast({ title: conversation.archived ? 'Unarchived' : 'Archived' });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update conversation',
        variant: 'destructive',
      });
    }
  }, [conversation, updateConversation, toast]);

  const handleDelete = useCallback(async () => {
    if (!conversation) return;
    try {
      await deleteConversation.mutateAsync(conversation.id);
      router.push('/');
      toast({ title: 'Conversation deleted' });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete conversation',
        variant: 'destructive',
      });
    }
  }, [conversation, deleteConversation, router, toast]);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <HeaderBar
        title={conversation?.title}
        conversationId={conversation?.id}
        onRename={conversation ? handleRename : undefined}
        onPin={conversation ? handlePin : undefined}
        onArchive={conversation ? handleArchive : undefined}
        onDelete={conversation ? () => setDeleteDialogOpen(true) : undefined}
        isPinned={conversation?.pinned}
        isArchived={conversation?.archived}
      />

      {/* Messages or Empty State */}
      {messages.length === 0 && !isStreaming ? (
        <EmptyState onSuggestionClick={handleSend} />
      ) : (
        <MessageList
          messages={messages}
          streamingContent={streamingContent}
          streamingThinking={streamingThinking ?? undefined}
          isStreaming={isStreaming}
        />
      )}

      {/* Input */}
      <div className="border-t bg-background p-4">
        <div className="mx-auto max-w-3xl">
          <ChatInput
            onSend={handleSend}
            onCancel={cancelStream}
            disabled={createConversation.isPending}
          />
        </div>
      </div>

      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename conversation</DialogTitle>
            <DialogDescription>
              Enter a new title for this conversation.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Conversation title"
            onKeyDown={(e) => e.key === 'Enter' && handleRenameSubmit()}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRenameSubmit} disabled={!newTitle.trim()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              conversation and all its messages.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
