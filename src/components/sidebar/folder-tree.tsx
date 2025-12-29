'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  MoreHorizontal,
  Pencil,
  Trash2,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Conversation } from '@/types/chat';
import { ConversationItem } from './conversation-item';

interface FolderData {
  id: string;
  name: string;
  parentId: string | null;
}

interface FolderTreeProps {
  folders: FolderData[];
  conversations: Conversation[];
  onCreateFolder?: (parentId: string | null) => void;
  onRenameFolder?: (id: string) => void;
  onDeleteFolder?: (id: string) => void;
  onRenameConversation?: (id: string) => void;
  onPinConversation?: (id: string) => void;
  onArchiveConversation?: (id: string) => void;
  onDeleteConversation?: (id: string) => void;
}

interface FolderNodeProps {
  folder: FolderData;
  conversations: Conversation[];
  childFolders: FolderData[];
  allFolders: FolderData[];
  allConversations: Conversation[];
  onCreateFolder?: (parentId: string | null) => void;
  onRenameFolder?: (id: string) => void;
  onDeleteFolder?: (id: string) => void;
  onRenameConversation?: (id: string) => void;
  onPinConversation?: (id: string) => void;
  onArchiveConversation?: (id: string) => void;
  onDeleteConversation?: (id: string) => void;
  depth?: number;
}

function FolderNode({
  folder,
  conversations,
  childFolders,
  allFolders,
  allConversations,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  onRenameConversation,
  onPinConversation,
  onArchiveConversation,
  onDeleteConversation,
  depth = 0,
}: FolderNodeProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const hasChildren = conversations.length > 0 || childFolders.length > 0;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div
        className="group relative flex items-center gap-1"
        style={{ paddingLeft: `${depth * 12}px` }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 flex-1 justify-start gap-2 px-2"
          >
            {isOpen ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
            {isOpen ? (
              <FolderOpen className="h-4 w-4 text-amber-500" />
            ) : (
              <Folder className="h-4 w-4 text-amber-500" />
            )}
            <span className="flex-1 truncate text-left">{folder.name}</span>
          </Button>
        </CollapsibleTrigger>

        {/* Folder actions */}
        {isHovered && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {onCreateFolder && (
                <DropdownMenuItem onClick={() => onCreateFolder(folder.id)}>
                  <Plus className="mr-2 h-4 w-4" />
                  New subfolder
                </DropdownMenuItem>
              )}
              {onRenameFolder && (
                <DropdownMenuItem onClick={() => onRenameFolder(folder.id)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Rename
                </DropdownMenuItem>
              )}
              {onDeleteFolder && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDeleteFolder(folder.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <CollapsibleContent>
        <div className="mt-1 space-y-1">
          {/* Child folders */}
          {childFolders.map((childFolder) => {
            const childConversations = allConversations.filter(
              (c) => c.folderId === childFolder.id
            );
            const grandchildFolders = allFolders.filter(
              (f) => f.parentId === childFolder.id
            );
            return (
              <FolderNode
                key={childFolder.id}
                folder={childFolder}
                conversations={childConversations}
                childFolders={grandchildFolders}
                allFolders={allFolders}
                allConversations={allConversations}
                onCreateFolder={onCreateFolder}
                onRenameFolder={onRenameFolder}
                onDeleteFolder={onDeleteFolder}
                onRenameConversation={onRenameConversation}
                onPinConversation={onPinConversation}
                onArchiveConversation={onArchiveConversation}
                onDeleteConversation={onDeleteConversation}
                depth={depth + 1}
              />
            );
          })}

          {/* Conversations in this folder */}
          <div style={{ paddingLeft: `${(depth + 1) * 12}px` }}>
            {conversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                onRename={onRenameConversation}
                onPin={onPinConversation}
                onArchive={onArchiveConversation}
                onDelete={onDeleteConversation}
              />
            ))}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function FolderTree({
  folders,
  conversations,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  onRenameConversation,
  onPinConversation,
  onArchiveConversation,
  onDeleteConversation,
}: FolderTreeProps) {
  // Get root folders (no parent)
  const rootFolders = folders.filter((f) => !f.parentId);

  return (
    <div className="space-y-1">
      {rootFolders.map((folder) => {
        const folderConversations = conversations.filter(
          (c) => c.folderId === folder.id
        );
        const childFolders = folders.filter((f) => f.parentId === folder.id);

        return (
          <FolderNode
            key={folder.id}
            folder={folder}
            conversations={folderConversations}
            childFolders={childFolders}
            allFolders={folders}
            allConversations={conversations}
            onCreateFolder={onCreateFolder}
            onRenameFolder={onRenameFolder}
            onDeleteFolder={onDeleteFolder}
            onRenameConversation={onRenameConversation}
            onPinConversation={onPinConversation}
            onArchiveConversation={onArchiveConversation}
            onDeleteConversation={onDeleteConversation}
          />
        );
      })}
    </div>
  );
}
