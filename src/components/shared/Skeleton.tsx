import React from 'react';
import { cn } from '@/lib/utils';

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('bg-slate-200 animate-pulse rounded-xl', className)} />
);

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="space-y-2.5 p-4">
    {Array.from({ length: rows }).map((_, i) => (
      <Skeleton key={i} className="h-10 w-full" />
    ))}
  </div>
);
