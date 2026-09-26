'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useOperationDetail } from '@/hooks/useOperations';
import { OPERATION_STATUS_CONFIG } from '@/constants/statuses';
import { ArrowLeft, CheckCircle2, ShieldAlert, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';

export default function OperationDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { operation, isLoading, transitionState, isTransitioning } = useOperationDetail(id);

  if (isLoading) {
    return <div className="p-12 text-center text-sm text-slate-400">Loading operation details...</div>;
  }

  if (!operation) {
    return <div className="p-12 text-center text-sm text-slate-400">Operation not found.</div>;
  }

  const status = operation.status || 'draft';
  const statusCfg = OPERATION_STATUS_CONFIG[status] || OPERATION_STATUS_CONFIG.draft;
  const ref = operation.reference || operation.referenceCode || `OP-${id.slice(0, 6).toUpperCase()}`;

  const steps = ['draft', 'waiting', 'ready', 'done'];
  const currentStepIdx = steps.indexOf(status);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href={ROUTES.OPERATIONS} className="rounded-xl border p-2 text-slate-500 hover:bg-slate-100">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-mono">{ref}</h1>
              <span className={`inline-flex items-center rounded-full px-3 py-0.5 text-xs font-bold border ${statusCfg.color}`}>
                {statusCfg.label}
              </span>
            </div>
            <p className="text-xs text-slate-500 capitalize">{operation.operation_type || 'Receipt'} Movement</p>
          </div>
        </div>

        {/* Action Validation Buttons */}
        <div className="flex items-center gap-2">
          {status === 'draft' && (
            <button
              onClick={() => transitionState({ nextStatus: 'waiting' })}
              disabled={isTransitioning}
              className="rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-700"
            >
              Confirm to Waiting
            </button>
          )}

          {status === 'waiting' && (
            <button
              onClick={() => transitionState({ nextStatus: 'ready' })}
              disabled={isTransitioning}
              className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700"
            >
              Assign & Reserve
            </button>
          )}

          {status === 'ready' && (
            <button
              onClick={() => transitionState({ nextStatus: 'done' })}
              disabled={isTransitioning}
              className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-lg shadow-emerald-500/25"
            >
              ✨ Validate & Apply Stock Move
            </button>
          )}

          {status !== 'done' && status !== 'cancelled' && (
            <button
              onClick={() => transitionState({ nextStatus: 'cancelled' })}
              disabled={isTransitioning}
              className="rounded-xl border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Horizontal Status Progression Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          {steps.map((stepName, idx) => {
            const isPassed = currentStepIdx >= idx;
            const isCurrent = currentStepIdx === idx;
            return (
              <div key={stepName} className="flex-1 flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs ${
                      isPassed ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'
                    } ${isCurrent ? 'ring-4 ring-indigo-100' : ''}`}
                  >
                    {idx + 1}
                  </div>
                  <span className="text-[11px] font-semibold uppercase mt-1 text-slate-600">{stepName}</span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-4 rounded ${currentStepIdx > idx ? 'bg-indigo-600' : 'bg-slate-200'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Items in Operation */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="font-bold text-slate-900">Operation Line Items</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-400">
              <tr>
                <th className="p-3">Product</th>
                <th className="p-3">Quantity</th>
                <th className="p-3">Unit</th>
                <th className="p-3">Source Location</th>
                <th className="p-3">Destination Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(operation.moves || []).map((m: any, i: number) => (
                <tr key={i}>
                  <td className="p-3 font-semibold text-slate-800">{m.product_name || 'Standard Product'}</td>
                  <td className="p-3 font-bold text-indigo-600">{m.quantity}</td>
                  <td className="p-3 uppercase text-xs text-slate-500">{m.unitOfMeasure || 'pcs'}</td>
                  <td className="p-3 text-slate-600">{m.source_location_name || operation.source_location_name || 'Vendor'}</td>
                  <td className="p-3 text-slate-600">{m.dest_location_name || operation.dest_location_name || 'Receiving Dock'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
