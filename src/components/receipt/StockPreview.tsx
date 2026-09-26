import React from 'react';
import { ArrowUpRight, TrendingUp, AlertCircle, ShieldAlert } from 'lucide-react';
import { Product } from '../../types/inventory';
import { calculateNewStock } from '../../utils/stockCalculations';

interface StockPreviewProps {
  product: Product;
  quantity: number;
}

export const StockPreview: React.FC<StockPreviewProps> = ({ product, quantity }) => {
  const { current, newStock, isOverstock, isRestockedFromZero, isLowStockResolved } =
    calculateNewStock(product, quantity);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2 font-mono">
        {/* Current stock */}
        <span
          className={`text-xs sm:text-sm font-semibold ${
            current === 0
              ? 'text-red-400 font-bold'
              : current < product.min_stock
              ? 'text-amber-400'
              : 'text-slate-300'
          }`}
        >
          {current}
        </span>

        {/* Green transition arrow */}
        <span className="flex items-center text-emerald-400 text-xs sm:text-sm font-black">
          <ArrowUpRight className="w-4 h-4 stroke-[3] animate-pulse" />
        </span>

        {/* Projected New Stock */}
        <span className="text-xs sm:text-sm font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
          {newStock}
        </span>
      </div>

      {/* Dynamic Status Badges */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {isRestockedFromZero && (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            <TrendingUp className="w-3 h-3" /> RESTOCK
          </span>
        )}
        {isLowStockResolved && !isRestockedFromZero && (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            SAFETY MET
          </span>
        )}
        {isOverstock && (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <AlertCircle className="w-3 h-3" /> CAP REACHED
          </span>
        )}
      </div>
    </div>
  );
};
