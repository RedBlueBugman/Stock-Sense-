'use client';

import React from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useUiStore } from '@/stores/uiStore';
import { cn } from '@/lib/utils';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { sidebarOpen } = useUiStore();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <div
        className={cn(
          'flex flex-col min-h-screen transition-all duration-300',
          sidebarOpen ? 'pl-64' : 'pl-20'
        )}
      >
        <TopBar />
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
