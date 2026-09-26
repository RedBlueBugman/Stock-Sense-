'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useOperations } from '@/hooks/useOperations';
import { OperationTable } from '@/components/operations/OperationTable';
import { Plus, ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight, Wrench, Layers } from 'lucide-react';
import { ROUTES } from '@/constants/routes';

export default function OperationsPage() {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const { operations, isLoading } = useOperations({
    type: activeTab === 'all' ? undefined : activeTab,
    status: statusFilter || undefined,
  });

  const tabs = [
    { id: 'all', label: 'All Operations', icon: Layers },
    { id: 'receipt', label: 'Receipts', icon: ArrowDownToLine },
    { id: 'delivery', label: 'Deliveries', icon: ArrowUpFromLine },
    { id: 'internal', label: 'Transfers', icon: ArrowLeftRight },
    { id: 'adjustment', label: 'Adjustments', icon: Wrench },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Warehouse Operations</h1>
          <p className="text-sm text-slate-500">Track and validate stock receipts, shipments, and internal transfers</p>
        </div>
        <Link
          href={ROUTES.OPERATION_NEW}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" /> New Operation
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap border-b gap-2 text-sm font-semibold">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition ${
                isActive ? 'border-indigo-600 text-indigo-600 font-bold' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Operations List Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <OperationTable operations={operations} isLoading={isLoading} />
      </div>
    </div>
  );
}
