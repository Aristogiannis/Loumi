'use client';

import { useEffect } from 'react';
import { ConversationSidebar } from '@/components/sidebar/conversation-sidebar';
import { useUIStore } from '@/stores/ui-store';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { cn } from '@/lib/utils';

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sidebarOpen, setIsMobile } = useUIStore();

  // Initialize keyboard shortcuts
  useKeyboardShortcuts();

  // Handle responsive sidebar
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [setIsMobile]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <ConversationSidebar />

      {/* Main content */}
      <main
        className={cn(
          'flex-1 overflow-hidden transition-all duration-200',
          !sidebarOpen && 'ml-0'
        )}
      >
        {children}
      </main>
    </div>
  );
}
