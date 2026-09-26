'use client';

import React from 'react';
import { useWarehouses } from '@/hooks/useWarehouses';
import { Warehouse as WarehouseIcon, MapPin, Plus } from 'lucide-react';

export default function WarehousesPage() {
  const { warehouses, isLoading } = useWarehouses();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Warehouses & Locations</h1>
          <p className="text-sm text-slate-500">Physical facility storage topology</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {warehouses.map((wh) => (
          <div key={wh.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                  <WarehouseIcon className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900">{wh.name}</h2>
                  <span className="font-mono text-xs font-bold text-indigo-600">{wh.code}</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> {wh.address || 'Standard Logistics Zone'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
