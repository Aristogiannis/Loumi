'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreHorizontal,
  Pencil,
  Pin,
  Archive,
  Trash2,
  MessageSquare,
  Timer,
} from 'lucide-react';
import type { Conversation } from '@/types/chat';
import { cn } from '@/lib/utils';

interface ConversationItemProps {
  conversation: Conversation;
  onRename?: (id: string) => void;
  onPin?: (id: string) => void;
  onArchive?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function ConversationItem({
  conversation,
  onRename,
  onPin,
  onArchive,
  onDelete,
}: ConversationItemProps) {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);

  const isActive = pathname === `/c/${conversation.id}`;

  return (
    <div
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link
        href={`/c/${conversation.id}`}
        className={cn(
          'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
          isActive
            ? 'bg-loumi-50 text-loumi-700 dark:bg-loumi-950 dark:text-loumi-300'
            : 'text-foreground/70 hover:bg-muted hover:text-foreground'
        )}
      >
        {/* Icon */}
        {conversation.isBurner ? (
          <Timer className="h-4 w-4 shrink-0 text-orange-500" />
        ) : (
          <MessageSquare className="h-4 w-4 shrink-0" />
        )}

        {/* Title */}
        <span className="flex-1 truncate">{conversation.title}</span>

        {/* Pin indicator */}
        {conversation.pinned && (
          <Pin className="h-3 w-3 shrink-0 fill-current text-muted-foreground" />
        )}
      </Link>

      {/* Actions dropdown */}
      {(isHovered || isActive) && (
        <div className="absolute right-1 top-1/2 -translate-y-1/2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'h-6 w-6 p-0',
                  isActive ? 'hover:bg-loumi-100 dark:hover:bg-loumi-900' : 'hover:bg-muted'
                )}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {onRename && (
                <DropdownMenuItem onClick={() => onRename(conversation.id)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Rename
                </DropdownMenuItem>
              )}
              {onPin && (
                <DropdownMenuItem onClick={() => onPin(conversation.id)}>
                  <Pin
                    className={cn(
                      'mr-2 h-4 w-4',
                      conversation.pinned && 'fill-current'
                    )}
                  />
                  {conversation.pinned ? 'Unpin' : 'Pin'}
                </DropdownMenuItem>
              )}
              {onArchive && (
                <DropdownMenuItem onClick={() => onArchive(conversation.id)}>
                  <Archive className="mr-2 h-4 w-4" />
                  {conversation.archived ? 'Unarchive' : 'Archive'}
                </DropdownMenuItem>
              )}
              {onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete(conversation.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}
