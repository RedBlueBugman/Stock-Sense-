import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Info, 
  Sparkles, 
  Volume2, 
  Flame, 
  CheckCircle2,
  PackageSearch
} from 'lucide-react';
import { Product } from '../types/inventory';
import { useAlerts } from '../context/AlertContext';
import { playCriticalAlertSound, playWarningAlertSound, playInfoAlertSound } from '../utils/audio';

interface StockAlertTestPanelProps {
  products: Product[];
  onInspectProduct?: (product: Product) => void;
}

export const StockAlertTestPanel: React.FC<StockAlertTestPanelProps> = ({
  products,
  onInspectProduct,
}) => {
  const { checkProductStockAlert, triggerRandomAlert, addAlert } = useAlerts();

  return (
    <div className="rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-purple-500/20 p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Title & Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <PackageSearch className="w-4 h-4" />
            </div>
            <h3 className="text-xl font-extrabold text-white tracking-tight">
              Warehouse Stock Threshold Auditing &amp; Alert Generator
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Simulate automated stock level checks against minimum safety margins. Triggers contextual notifications, audio sirens, and floating toasts.
          </p>
        </div>

        {/* Quick Demo Utilities */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={triggerRandomAlert}
            className="px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm hover:scale-105 active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-300" />
            Trigger Random Alert
          </button>
        </div>
      </div>

      {/* 4 Dedicated Test Buttons for Products */}
      <div className="my-6">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3">
          1. Direct Product Stock Audit Triggers
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {products.map((product) => {
            const isZero = product.current_stock === 0;
            const isLow = product.current_stock < product.min_stock;

            let badgeColor = 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300';
            let statusText = 'Optimal Stock';
            let btnBorder = 'hover:border-emerald-500/60';

            if (isZero) {
              badgeColor = 'border-red-500/40 bg-red-500/20 text-red-300';
              statusText = 'CRITICAL (0 units)';
              btnBorder = 'hover:border-red-500/60 shadow-[0_0_15px_rgba(239,68,68,0.2)]';
            } else if (isLow) {
              badgeColor = 'border-amber-500/40 bg-amber-500/20 text-amber-300';
              statusText = `LOW (${product.current_stock}/${product.min_stock})`;
              btnBorder = 'hover:border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.2)]';
            }

            return (
              <motion.button
                key={product.id}
                whileHover={{ scale: 1.02, translateY: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  checkProductStockAlert(product);
                  if (onInspectProduct) onInspectProduct(product);
                }}
                className={`flex flex-col items-start p-4 rounded-2xl bg-slate-800/60 hover:bg-slate-800/90 border border-slate-700/80 transition-all text-left group cursor-pointer ${btnBorder}`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <span className="text-2xl">{product.emoji}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${badgeColor}`}
                  >
                    {statusText}
                  </span>
                </div>

                <div className="font-bold text-white text-sm group-hover:text-purple-300 transition-colors">
                  Check {product.name} Stock
                </div>

                <div className="text-[11px] font-mono text-purple-400 mt-1">
                  SKU: {product.sku}
                </div>

                <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between w-full border-t border-slate-700/50 pt-2">
                  <span>Audit Level:</span>
                  <span className="font-mono font-bold text-slate-200">
                    {product.current_stock} / {product.min_stock} min
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Audio & Alert Types Simulation Bar */}
      <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <Volume2 className="w-4 h-4 text-purple-400" />
          <span className="font-semibold text-slate-300">Auditory Siren &amp; Chime Controls:</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => {
              playCriticalAlertSound();
              addAlert({
                type: 'critical',
                title: 'CRITICAL HAZARD TEST',
                message: 'Warehouse Zone C fire suppression telemetry triggered.',
              });
            }}
            className="px-3 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900/60 border border-red-500/50 text-red-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Flame className="w-3.5 h-3.5 text-red-400" />
            Test Critical Siren
          </button>

          <button
            type="button"
            onClick={() => {
              playWarningAlertSound();
              addAlert({
                type: 'warning',
                title: 'CAPACITY THRESHOLD',
                message: 'Bin 14 reached 92% volumetric capacity.',
              });
            }}
            className="px-3 py-1.5 rounded-xl bg-amber-950/60 hover:bg-amber-900/60 border border-amber-500/50 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            Test Warning Tone
          </button>

          <button
            type="button"
            onClick={() => {
              playInfoAlertSound();
              addAlert({
                type: 'info',
                title: 'SYSTEM TELEMETRY',
                message: 'All edge gateways synced with cloud cluster.',
              });
            }}
            className="px-3 py-1.5 rounded-xl bg-blue-950/60 hover:bg-blue-900/60 border border-blue-500/50 text-blue-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Info className="w-3.5 h-3.5 text-blue-400" />
            Test Info Chime
          </button>
        </div>
      </div>
    </div>
  );
};
