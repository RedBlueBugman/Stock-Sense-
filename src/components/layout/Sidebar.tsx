'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  ArrowLeftRight, 
  Wrench, 
  History, 
  Warehouse as WarehouseIcon, 
  Settings, 
  User, 
  Box, 
  ClipboardList,
  ChevronDown
} from 'lucide-react';
import { useUiStore } from '@/stores/uiStore';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/constants/routes';

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen } = useUiStore();
  const [operationsOpen, setOperationsOpen] = React.useState(true);

  const navItems = [
    { label: 'Dashboard', href: ROUTES.DASHBOARD, icon: LayoutDashboard },
    { label: 'Products', href: ROUTES.PRODUCTS, icon: Package },
  ];

  const operationSubItems = [
    { label: 'All Operations', href: ROUTES.OPERATIONS, icon: ClipboardList },
    { label: 'Receipts', href: ROUTES.RECEIPTS, icon: ArrowDownToLine },
    { label: 'Deliveries', href: ROUTES.DELIVERIES, icon: ArrowUpFromLine },
    { label: 'Transfers', href: ROUTES.TRANSFERS, icon: ArrowLeftRight },
    { label: 'Adjustments', href: ROUTES.ADJUSTMENTS, icon: Wrench },
  ];

  const secondaryNavItems = [
    { label: 'Move History', href: ROUTES.MOVE_HISTORY, icon: History },
    { label: 'Warehouses', href: ROUTES.WAREHOUSES, icon: WarehouseIcon },
    { label: 'Settings', href: ROUTES.SETTINGS, icon: Settings },
    { label: 'Profile', href: ROUTES.PROFILE, icon: User },
  ];

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 flex flex-col border-r bg-white transition-all duration-300 shadow-sm dark:bg-slate-900',
        sidebarOpen ? 'w-64' : 'w-20'
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center gap-3 border-b px-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white shadow">
          <Box className="h-6 w-6" />
        </div>
        {sidebarOpen && (
          <div className="flex flex-col">
            <span className="font-bold text-lg text-slate-900 dark:text-white leading-tight">StockSense</span>
            <span className="text-xs text-slate-500 font-medium tracking-wide uppercase">WMS Enterprise</span>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800'
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          );
        })}

        {/* Operations Accordion */}
        <div>
          <button
            onClick={() => setOperationsOpen(!operationsOpen)}
            className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <div className="flex items-center gap-3">
              <ClipboardList className="h-5 w-5 shrink-0" />
              {sidebarOpen && <span>Operations</span>}
            </div>
            {sidebarOpen && (
              <ChevronDown
                className={cn('h-4 w-4 transition-transform', operationsOpen ? 'rotate-180' : '')}
              />
            )}
          </button>

          {operationsOpen && sidebarOpen && (
            <div className="mt-1 ml-4 border-l pl-3 space-y-1">
              {operationSubItems.map((sub) => {
                const SubIcon = sub.icon;
                const isSubActive = pathname === sub.href;
                return (
                  <Link
                    key={sub.href}
                    href={sub.href}
                    className={cn(
                      'flex items-center gap-2.5 rounded-md px-2.5 py-2 text-xs font-medium transition-colors',
                      isSubActive
                        ? 'bg-indigo-50 text-indigo-700 font-semibold dark:bg-indigo-950/50 dark:text-indigo-300'
                        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400'
                    )}
                  >
                    <SubIcon className="h-4 w-4 shrink-0" />
                    <span>{sub.label}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="pt-2 border-t my-2" />

        {secondaryNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800'
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
