'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  // Sidebar
  sidebarOpen: boolean;
  sidebarWidth: number;

  // Theme
  theme: 'light' | 'dark' | 'system';

  // Command palette
  commandPaletteOpen: boolean;

  // Mobile
  isMobile: boolean;

  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSidebarWidth: (width: number) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setIsMobile: (mobile: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      sidebarWidth: 260,
      theme: 'system',
      commandPaletteOpen: false,
      isMobile: false,

      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      setSidebarWidth: (width) => set({ sidebarWidth: width }),

      setTheme: (theme) => set({ theme }),

      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

      setIsMobile: (mobile) => set({
        isMobile: mobile,
        sidebarOpen: mobile ? false : true,
      }),
    }),
    {
      name: 'loumi-ui-store',
      partialize: (state) => ({
        sidebarWidth: state.sidebarWidth,
        theme: state.theme,
      }),
    }
  )
);
