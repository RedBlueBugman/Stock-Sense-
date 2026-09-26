'use client';

import React from 'react';
import { useMoveHistory } from '@/hooks/useMoveHistory';
import { formatDate } from '@/lib/utils';
import { History, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export default function MoveHistoryPage() {
  const { data: moves, isLoading } = useMoveHistory();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Stock Ledger — Move History</h1>
        <p className="text-sm text-slate-500">Immutable double-entry stock movement journal</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-sm text-slate-400">Loading immutable ledger moves...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/50 text-xs uppercase text-slate-400 border-b">
                <tr>
                  <th className="py-3 px-4">Date / Time</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">From Location</th>
                  <th className="py-3 px-4">To Location</th>
                  <th className="py-3 px-4 text-right">Quantity Change</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {moves?.map((m: any) => {
                  const isPositive = m.quantity > 0;
                  return (
                    <tr key={m.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 text-slate-500 text-xs">{formatDate(m.created_at, 'MMM dd, yyyy HH:mm')}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{m.product_name}</td>
                      <td className="py-3 px-4 text-slate-600">{m.source_location_name || 'Vendor'}</td>
                      <td className="py-3 px-4 text-slate-600">{m.dest_location_name || 'Storage'}</td>
                      <td className={`py-3 px-4 font-bold text-right font-mono ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {isPositive ? `+${m.quantity}` : m.quantity} {m.unitOfMeasure || 'pcs'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                          {m.status || 'done'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
