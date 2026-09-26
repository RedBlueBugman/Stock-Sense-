'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => (
  <div
    onClick={onClick}
    className={cn(
      'bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 dark:bg-slate-900 dark:border-slate-800',
      className
    )}
  >
    {children}
  </div>
);
