'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface KPICardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color: 'indigo' | 'amber' | 'rose' | 'emerald' | 'blue';
  href?: string;
  subtitle?: string;
}

const colorMap = {
  indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400',
  amber: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400',
  rose: 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400',
  emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400',
  blue: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400',
};

export function KPICard({ title, value, icon: Icon, color, href = '#', subtitle }: KPICardProps) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{title}</span>
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl border', colorMap[color])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-4">
        <div className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{value}</div>
        {subtitle && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
      </div>
    </Link>
  );
}
