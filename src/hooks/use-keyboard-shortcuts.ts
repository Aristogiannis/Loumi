'use client';

import { useEffect, useCallback } from 'react';
import { useUIStore } from '@/stores/ui-store';
import { useChatStore } from '@/stores/chat-store';

type ShortcutHandler = () => void;

interface ShortcutConfig {
  key: string;
  metaKey?: boolean;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  handler: ShortcutHandler;
  description: string;
}

export function useKeyboardShortcuts() {
  const { toggleSidebar, setCommandPaletteOpen } = useUIStore();
  const { toggleWebSearch, toggleThinking } = useChatStore();

  const shortcuts: ShortcutConfig[] = [
    {
      key: 'k',
      metaKey: true,
      handler: () => setCommandPaletteOpen(true),
      description: 'Open command palette',
    },
    {
      key: '/',
      metaKey: true,
      handler: toggleSidebar,
      description: 'Toggle sidebar',
    },
    {
      key: 'w',
      metaKey: true,
      shiftKey: true,
      handler: toggleWebSearch,
      description: 'Toggle web search',
    },
    {
      key: 't',
      metaKey: true,
      shiftKey: true,
      handler: toggleThinking,
      description: 'Toggle thinking mode',
    },
    {
      key: 'n',
      metaKey: true,
      handler: () => {
        window.location.href = '/';
      },
      description: 'New conversation',
    },
  ];

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true'
      ) {
        // Allow command palette shortcut even in input fields
        if (!(event.metaKey && event.key === 'k')) {
          return;
        }
      }

      for (const shortcut of shortcuts) {
        const metaMatch = shortcut.metaKey ? event.metaKey || event.ctrlKey : true;
        const ctrlMatch = shortcut.ctrlKey ? event.ctrlKey : true;
        const shiftMatch = shortcut.shiftKey ? event.shiftKey : !event.shiftKey;
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();

        if (metaMatch && ctrlMatch && shiftMatch && keyMatch) {
          event.preventDefault();
          shortcut.handler();
          return;
        }
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return shortcuts;
}

// Hook for focus management
export function useFocusInput() {
  const focusInput = useCallback(() => {
    const input = document.querySelector<HTMLTextAreaElement>('[data-chat-input]');
    input?.focus();
  }, []);

  return focusInput;
}
