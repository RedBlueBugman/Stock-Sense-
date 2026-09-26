'use client';

import React from 'react';
import Link from 'next/link';
import { StockOperation } from '@/types/api';
import { OPERATION_STATUS_CONFIG } from '@/constants/statuses';
import { formatDate } from '@/lib/utils';
import { ArrowRight, ClipboardList } from 'lucide-react';
import { ROUTES } from '@/constants/routes';

export function OperationTable({ operations, isLoading }: { operations: StockOperation[]; isLoading: boolean }) {
  if (isLoading) {
    return <div className="p-12 text-center text-sm text-slate-400">Loading operations list...</div>;
  }

  if (operations.length === 0) {
    return (
      <div className="p-12 text-center">
        <ClipboardList className="mx-auto h-12 w-12 text-slate-300" />
        <p className="mt-2 font-bold text-slate-700">No operations found</p>
        <p className="text-xs text-slate-400">Create a new receipt, delivery, or transfer to start recording moves.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b bg-slate-50/50 text-xs uppercase text-slate-400">
          <tr>
            <th className="py-3.5 px-4">Reference Code</th>
            <th className="py-3.5 px-4">Type</th>
            <th className="py-3.5 px-4">Status</th>
            <th className="py-3.5 px-4">Source → Destination</th>
            <th className="py-3.5 px-4">Partner</th>
            <th className="py-3.5 px-4">Scheduled Date</th>
            <th className="py-3.5 px-4 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {operations.map((op) => {
            const statusCfg = OPERATION_STATUS_CONFIG[op.status] || OPERATION_STATUS_CONFIG.draft;
            const ref = op.reference || op.referenceCode || `OP-${op.id.slice(0, 6).toUpperCase()}`;
            const type = op.operation_type || op.operationType || 'receipt';

            return (
              <tr key={op.id} className="hover:bg-slate-50/80 transition">
                <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{ref}</td>
                <td className="py-3.5 px-4 capitalize font-semibold text-slate-700">{type}</td>
                <td className="py-3.5 px-4">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${statusCfg.color}`}>
                    {statusCfg.label}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-slate-600">
                  {op.source_location_name || 'Vendor'} → {op.dest_location_name || 'Receiving Dock'}
                </td>
                <td className="py-3.5 px-4 text-slate-600">{op.partner_name || op.partner?.name || '—'}</td>
                <td className="py-3.5 px-4 text-slate-500">{formatDate(op.scheduledDate || op.created_at || op.createdAt)}</td>
                <td className="py-3.5 px-4 text-right">
                  <Link
                    href={ROUTES.OPERATION_DETAIL(op.id)}
                    className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50"
                  >
                    Details <ArrowRight className="h-3.5 w-3.5" />
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
