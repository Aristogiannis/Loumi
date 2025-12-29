'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  PanelLeft,
  Plus,
  MoreHorizontal,
  Share,
  Pencil,
  Archive,
  Pin,
  Trash2,
  Download,
} from 'lucide-react';
import { ModelSelectorCompact } from './model-selector';
import { useUIStore } from '@/stores/ui-store';
import { useChatStore } from '@/stores/chat-store';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface HeaderBarProps {
  title?: string;
  conversationId?: string;
  onRename?: () => void;
  onArchive?: () => void;
  onPin?: () => void;
  onDelete?: () => void;
  onExport?: () => void;
  onShare?: () => void;
  isPinned?: boolean;
  isArchived?: boolean;
}

export function HeaderBar({
  title,
  conversationId,
  onRename,
  onArchive,
  onPin,
  onDelete,
  onExport,
  onShare,
  isPinned = false,
  isArchived = false,
}: HeaderBarProps) {
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { isStreaming } = useChatStore();

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm">
      {/* Left section */}
      <div className="flex items-center gap-2">
        {/* Sidebar toggle */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSidebar}
                className="h-8 w-8 p-0"
              >
                <PanelLeft className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {sidebarOpen ? 'Hide' : 'Show'} sidebar
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* New chat button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="h-8 w-8 p-0"
                disabled={isStreaming}
              >
                <Link href="/">
                  <Plus className="h-4 w-4" />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">New chat</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Title (if conversation) */}
        {title && (
          <h1 className="ml-2 max-w-[200px] truncate text-sm font-medium sm:max-w-[300px]">
            {title}
          </h1>
        )}
      </div>

      {/* Center section - Model selector */}
      <div className="absolute left-1/2 -translate-x-1/2">
        <ModelSelectorCompact />
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        {conversationId && (
          <>
            {/* Share button */}
            {onShare && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onShare}
                      className="h-8 w-8 p-0"
                      disabled={isStreaming}
                    >
                      <Share className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Share</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {/* More actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  disabled={isStreaming}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {onRename && (
                  <DropdownMenuItem onClick={onRename}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Rename
                  </DropdownMenuItem>
                )}
                {onPin && (
                  <DropdownMenuItem onClick={onPin}>
                    <Pin className={cn('mr-2 h-4 w-4', isPinned && 'fill-current')} />
                    {isPinned ? 'Unpin' : 'Pin'}
                  </DropdownMenuItem>
                )}
                {onArchive && (
                  <DropdownMenuItem onClick={onArchive}>
                    <Archive className="mr-2 h-4 w-4" />
                    {isArchived ? 'Unarchive' : 'Archive'}
                  </DropdownMenuItem>
                )}
                {onExport && (
                  <DropdownMenuItem onClick={onExport}>
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={onDelete}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
      </div>
    </header>
  );
}
