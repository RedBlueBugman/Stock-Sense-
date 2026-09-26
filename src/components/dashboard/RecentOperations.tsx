'use client';

import React from 'react';
import Link from 'next/link';
import { StockOperation } from '@/types/api';
import { OPERATION_STATUS_CONFIG } from '@/constants/statuses';
import { formatDate } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';
import { ROUTES } from '@/constants/routes';

export function RecentOperations({ operations }: { operations: StockOperation[] }) {
  if (!operations || operations.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-slate-400">
        No recent operations recorded yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b bg-slate-50/50 text-xs uppercase text-slate-400">
          <tr>
            <th className="py-3 px-4">Reference</th>
            <th className="py-3 px-4">Type</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4">Partner</th>
            <th className="py-3 px-4">Date</th>
            <th className="py-3 px-4 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {operations.map((op) => {
            const statusConfig = OPERATION_STATUS_CONFIG[op.status] || OPERATION_STATUS_CONFIG.draft;
            const ref = op.reference || `OP-${op.id.slice(0, 6)}`;
            const type = op.operation_type || 'receipt';

            return (
              <tr key={op.id} className="hover:bg-slate-50/80 transition">
                <td className="py-3 px-4 font-mono font-bold text-slate-900">{ref}</td>
                <td className="py-3 px-4 capitalize font-medium text-slate-700">{type}</td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${statusConfig.color}`}>
                    {statusConfig.label}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-600">{op.partner_name || '—'}</td>
                <td className="py-3 px-4 text-slate-500">{formatDate(op.created_at)}</td>
                <td className="py-3 px-4 text-right">
                  <Link
                    href={ROUTES.OPERATION_DETAIL(op.id)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    View <ArrowRight className="h-3 w-3" />
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
