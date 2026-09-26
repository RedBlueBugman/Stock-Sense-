'use client';

import React from 'react';
import { useDashboard } from '@/hooks/useDashboard';
import { useWarehouses } from '@/hooks/useWarehouses';
import { useUiStore } from '@/stores/uiStore';
import { KPIGrid } from '@/components/dashboard/KPIGrid';
import { MovementChart } from '@/components/dashboard/MovementChart';
import { RecentOperations } from '@/components/dashboard/RecentOperations';
import { RefreshCw, TrendingUp, AlertOctagon, Plus, Package } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';

export default function DashboardPage() {
  const { selectedWarehouseId, setSelectedWarehouseId } = useUiStore();
  const { kpis, trend, recentOps, lowStock, refetchAll } = useDashboard(selectedWarehouseId);
  const { warehouses } = useWarehouses();

  return (
    <div className="space-y-6">
      {/* Page Header & Global Filter Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Inventory Dashboard</h1>
          <p className="text-sm text-slate-500">Live warehouse throughput & stock telemetry</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Warehouse Selector */}
          <select
            value={selectedWarehouseId || ''}
            onChange={(e) => setSelectedWarehouseId(e.target.value || undefined)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium shadow-sm outline-none focus:border-indigo-600"
          >
            <option value="">All Warehouses</option>
            {warehouses.map((wh) => (
              <option key={wh.id} value={wh.id}>
                {wh.name} ({wh.code})
              </option>
            ))}
          </select>

          {/* Quick Actions */}
          <Link
            href={ROUTES.PRODUCT_NEW}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" /> Add Product
          </Link>

          <button
            onClick={refetchAll}
            title="Refresh Data"
            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 shadow-sm hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Section 1: KPI Grid */}
      <KPIGrid kpis={kpis} />

      {/* Section 2: Charts & Movement Trends */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Movement Chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-600" />
              <h2 className="font-bold text-slate-900">30-Day Movement Trend</h2>
            </div>
            <span className="text-xs text-slate-400">Aggregated stock moves</span>
          </div>
          <MovementChart trend={trend} />
        </div>

        {/* Low Stock Alerts */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2 text-amber-600">
              <AlertOctagon className="h-5 w-5" />
              <h2 className="font-bold text-slate-900">Low Stock Warnings</h2>
            </div>
            <Link href={`${ROUTES.PRODUCTS}?stock_status=low`} className="text-xs font-bold text-indigo-600 hover:underline">
              View All
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {lowStock.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">All product stock levels are healthy.</p>
            ) : (
              lowStock.slice(0, 5).map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{p.name}</p>
                    <p className="text-xs text-slate-400 font-mono">{p.sku}</p>
                  </div>
                  <div className="text-right">
                    <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">
                      Qty: {p.stock_qty ?? p.stockQty ?? 0}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">Min: {p.reorder_min ?? p.reorderMin ?? 0}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Section 3: Recent Operations */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-slate-900">Recent Warehouse Operations</h2>
          <Link href={ROUTES.OPERATIONS} className="text-xs font-bold text-indigo-600 hover:underline">
            View All Operations
          </Link>
        </div>
        <RecentOperations operations={recentOps} />
      </div>
    </div>
  );
}
