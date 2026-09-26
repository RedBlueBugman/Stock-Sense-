'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  placeholder?: string;
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, placeholder, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <select
          ref={ref}
          className={cn(
            'w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 outline-none transition duration-150 focus:border-indigo-600 focus:bg-white disabled:bg-slate-100 disabled:cursor-not-allowed',
            error && 'border-rose-500 focus:border-rose-600',
            className
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-xs text-rose-600 font-medium">{error}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';
