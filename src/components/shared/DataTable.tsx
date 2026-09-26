'use client';

import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { Button } from '@/components/ui';

export interface ColumnDef<T> {
  header: string | React.ReactNode;
  accessorKey?: keyof T | string;
  id?: string;
  cell?: (info: { getValue: <V = any>() => V; row: { original: T } }) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data?: T[];
  pageSize?: number;
  onRowClick?: (row: T) => void;
  searchPlaceholder?: string;
}

export function DataTable<T extends Record<string, any>>({
  columns = [],
  data = [],
  pageSize = 10,
  onRowClick,
  searchPlaceholder = 'Filter records...',
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);
  const [pageIndex, setPageIndex] = useState(0);

  // 1. Filter data based on global search input
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return Array.isArray(data) ? data : [];
    const lower = searchTerm.toLowerCase();
    return (data || []).filter((item) =>
      Object.values(item).some((val) =>
        val !== null && val !== undefined && String(val).toLowerCase().includes(lower)
      )
    );
  }, [data, searchTerm]);

  // 2. Sort filtered data
  const sortedData = useMemo(() => {
    if (!sortKey || !sortDirection) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      return sortDirection === 'asc' ? 1 : -1;
    });
  }, [filteredData, sortKey, sortDirection]);

  // 3. Paginate
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const currentPageData = useMemo(() => {
    const start = pageIndex * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, pageIndex, pageSize]);

  const handleSort = (key?: string) => {
    if (!key) return;
    if (sortKey !== key) {
      setSortKey(key);
      setSortDirection('asc');
    } else if (sortDirection === 'asc') {
      setSortDirection('desc');
    } else {
      setSortKey(null);
      setSortDirection(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Global Filter Bar */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPageIndex(0);
          }}
          placeholder={searchPlaceholder}
          className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-600 focus:bg-white transition"
        />
      </div>

      {/* Table Canvas */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50/80 border-b border-slate-100 text-xs uppercase text-slate-500 font-semibold">
            <tr>
              {columns.map((col, idx) => {
                const key = (col.accessorKey as string) || col.id || `col-${idx}`;
                const isSorted = sortKey === key;
                return (
                  <th
                    key={key}
                    onClick={() => col.accessorKey && handleSort(col.accessorKey as string)}
                    className="px-4 py-3 cursor-pointer select-none hover:bg-slate-100/60 transition"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{typeof col.header === 'function' ? 'Header' : col.header}</span>
                      {col.accessorKey && (
                        <span className="text-[11px] text-slate-400">
                          {isSorted && sortDirection === 'asc'
                            ? ' ▲'
                            : isSorted && sortDirection === 'desc'
                            ? ' ▼'
                            : ' ⬍'}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {currentPageData.length === 0 ? (
              <tr>
                <td colSpan={Math.max(1, columns.length)} className="py-8 text-center text-slate-400 text-sm">
                  No matching records found.
                </td>
              </tr>
            ) : (
              currentPageData.map((row, rowIdx) => (
                <tr
                  key={(row as any).id || rowIdx}
                  onClick={() => onRowClick?.(row)}
                  className="hover:bg-slate-50/80 transition cursor-pointer"
                >
                  {columns.map((col, colIdx) => {
                    const key = (col.accessorKey as string) || col.id || `cell-${colIdx}`;
                    const val = col.accessorKey ? row[col.accessorKey as string] : undefined;
                    return (
                      <td key={key} className="px-4 py-3 text-slate-700">
                        {col.cell
                          ? col.cell({ getValue: () => val, row: { original: row } })
                          : val !== undefined
                          ? String(val)
                          : '—'}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between px-2 text-xs text-slate-500">
        <span>
          Page {pageIndex + 1} of {totalPages} ({filteredData.length} total entries)
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
            disabled={pageIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPageIndex((p) => Math.min(totalPages - 1, p + 1))}
            disabled={pageIndex >= totalPages - 1}
          >
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
