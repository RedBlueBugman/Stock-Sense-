import React from 'react';
import { Package, AlertCircle, ArrowUpRight, CheckCircle, ShieldCheck } from 'lucide-react';
import { Product, ScanRecord } from '../types/inventory';

interface InventoryStatsProps {
  products: Product[];
  scanRecords: ScanRecord[];
}

export const InventoryStats: React.FC<InventoryStatsProps> = ({ products, scanRecords }) => {
  const totalItems = products.reduce((sum, p) => sum + p.current_stock, 0);
  const lowStockCount = products.filter((p) => p.current_stock <= p.min_stock).length;
  const totalScans = scanRecords.length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total SKU Count */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active SKUs</span>
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Package className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-black text-white font-mono">{products.length}</span>
          <span className="text-xs text-purple-400">All Barcode-Tagged</span>
        </div>
      </div>

      {/* Total Physical Stock Units */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Units in Facility</span>
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-black text-white font-mono">{totalItems}</span>
          <span className="text-xs text-indigo-400">Units Tracked</span>
        </div>
      </div>

      {/* Low Stock Alerts */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Low Stock Warnings</span>
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <AlertCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">{lowStockCount}</span>
          <span className="text-xs text-slate-400">Reorder triggered</span>
        </div>
      </div>

      {/* Scans in Current Session */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Session Optical Scans</span>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">{totalScans}</span>
          <span className="text-xs text-emerald-400 flex items-center">
            <ArrowUpRight className="w-3 h-3" /> Live Synced
          </span>
        </div>
      </div>
    </div>
  );
};
