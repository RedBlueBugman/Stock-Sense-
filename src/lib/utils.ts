import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString?: string | null, formatStr = 'MMM dd, yyyy') {
  if (!dateString) return '—';
  try {
    return format(parseISO(dateString), formatStr);
  } catch (e) {
    return dateString;
  }
}

export function formatDateTime(dateString?: string | null) {
  return formatDate(dateString, 'MMM dd, yyyy HH:mm');
}

export function formatNumber(num?: number | null) {
  if (num === null || num === undefined) return '0';
  return new Intl.NumberFormat('en-US').format(num);
}

export function formatCurrency(num?: number | null) {
  if (num === null || num === undefined) return '$0.00';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
}
