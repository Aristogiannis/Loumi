'use client';

import { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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
import { Input } from '@/components/ui/input';
import {
  Plus,
  Settings,
  Archive,
  Pin,
  Sparkles,
  FolderPlus,
  Timer,
} from 'lucide-react';
import { SearchConversations } from './search-conversations';
import { ConversationItem } from './conversation-item';
import { FolderTree } from './folder-tree';
import { useConversations, useUpdateConversation, useDeleteConversation } from '@/hooks/use-conversations';
import { useUIStore } from '@/stores/ui-store';
import { useToast } from '@/hooks/use-toast';
import { groupConversationsByDate, type ConversationGroup } from '@/types/chat';
import { cn } from '@/lib/utils';

export function ConversationSidebar() {
  const router = useRouter();
  const { toast } = useToast();
  const { sidebarOpen, sidebarWidth } = useUIStore();

  // State
  const [search, setSearch] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');

  // Queries
  const { data: conversations = [], isLoading } = useConversations({
    archived: showArchived,
    search: search || undefined,
  });

  // Mutations
  const updateConversation = useUpdateConversation();
  const deleteConversation = useDeleteConversation();

  // Group conversations
  const groupedConversations = useMemo(() => {
    if (search) {
      // Don't group when searching
      return [{ label: 'Search Results', conversations }];
    }

    // Separate pinned conversations
    const pinned = conversations.filter((c) => c.pinned);
    const unpinned = conversations.filter((c) => !c.pinned);

    const groups: ConversationGroup[] = [];

    if (pinned.length > 0) {
      groups.push({ label: 'Pinned', conversations: pinned });
    }

    // Group the rest by date
    groups.push(...groupConversationsByDate(unpinned));

    return groups;
  }, [conversations, search]);

  // Handlers
  const handleRename = useCallback((id: string) => {
    const conversation = conversations.find((c) => c.id === id);
    if (conversation) {
      setSelectedConversationId(id);
      setNewTitle(conversation.title);
      setRenameDialogOpen(true);
    }
  }, [conversations]);

  const handleRenameSubmit = useCallback(async () => {
    if (!selectedConversationId || !newTitle.trim()) return;
    try {
      await updateConversation.mutateAsync({
        id: selectedConversationId,
        data: { title: newTitle.trim() },
      });
      setRenameDialogOpen(false);
      setSelectedConversationId(null);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to rename conversation',
        variant: 'destructive',
      });
    }
  }, [selectedConversationId, newTitle, updateConversation, toast]);

  const handlePin = useCallback(async (id: string) => {
    const conversation = conversations.find((c) => c.id === id);
    if (!conversation) return;
    try {
      await updateConversation.mutateAsync({
        id,
        data: { pinned: !conversation.pinned },
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update conversation',
        variant: 'destructive',
      });
    }
  }, [conversations, updateConversation, toast]);

  const handleArchive = useCallback(async (id: string) => {
    const conversation = conversations.find((c) => c.id === id);
    if (!conversation) return;
    try {
      await updateConversation.mutateAsync({
        id,
        data: { archived: !conversation.archived },
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to archive conversation',
        variant: 'destructive',
      });
    }
  }, [conversations, updateConversation, toast]);

  const handleDeleteClick = useCallback((id: string) => {
    setSelectedConversationId(id);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedConversationId) return;
    try {
      await deleteConversation.mutateAsync(selectedConversationId);
      setDeleteDialogOpen(false);
      setSelectedConversationId(null);
      // Navigate home if we deleted the current conversation
      router.push('/');
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete conversation',
        variant: 'destructive',
      });
    }
  }, [selectedConversationId, deleteConversation, router, toast]);

  if (!sidebarOpen) return null;

  return (
    <aside
      className="flex h-full flex-col border-r bg-muted/30"
      style={{ width: sidebarWidth }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-loumi-400 to-loumi-600">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold">Loumi</span>
        </Link>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
                <Link href="/">
                  <Plus className="h-4 w-4" />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">New chat</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Search */}
      <div className="px-4 pb-2">
        <SearchConversations value={search} onChange={setSearch} />
      </div>

      {/* Quick actions */}
      <div className="flex gap-1 px-4 pb-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={showArchived ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setShowArchived(!showArchived)}
                className="h-7 flex-1 gap-1.5 text-xs"
              >
                <Archive className="h-3.5 w-3.5" />
                Archived
              </Button>
            </TooltipTrigger>
            <TooltipContent>{showArchived ? 'Hide' : 'Show'} archived</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <Separator />

      {/* Conversations list */}
      <ScrollArea className="flex-1 px-2 py-2">
        {isLoading ? (
          <div className="space-y-2 px-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-10 animate-pulse rounded-lg bg-muted"
              />
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            {search ? (
              <>No conversations found for "{search}"</>
            ) : showArchived ? (
              <>No archived conversations</>
            ) : (
              <>
                No conversations yet.
                <br />
                Start a new chat!
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {groupedConversations.map((group) => (
              <div key={group.label}>
                <h3 className="mb-1 px-3 text-xs font-medium text-muted-foreground">
                  {group.label}
                </h3>
                <div className="space-y-0.5">
                  {group.conversations.map((conversation) => (
                    <ConversationItem
                      key={conversation.id}
                      conversation={conversation}
                      onRename={handleRename}
                      onPin={handlePin}
                      onArchive={handleArchive}
                      onDelete={handleDeleteClick}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      <Separator />
      <div className="p-2">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="w-full justify-start gap-2"
        >
          <Link href="/settings">
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </Button>
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
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </aside>
  );
}
