import React from 'react';
import { ArrowDownRight, AlertTriangle, AlertOctagon, CheckCircle2 } from 'lucide-react';
import { Product } from '../../types/inventory';
import { calculateRemainingStock } from '../../utils/deliveryCalculations';

interface StockValidationProps {
  product: Product;
  quantity: number;
}

export const StockValidation: React.FC<StockValidationProps> = ({ product, quantity }) => {
  const { available, remaining, status } = calculateRemainingStock(product, quantity);

  return (
    <div className="flex flex-col gap-1.5">
      {/* Stock projection calculation: e.g. 65 ↘ 15 in RED */}
      <div className="flex items-center gap-2 font-mono">
        <span className="text-xs sm:text-sm font-semibold text-slate-300">
          {available}
        </span>

        {/* Downward Red Transition Arrow */}
        <span className="flex items-center text-xs sm:text-sm font-black text-red-500">
          <ArrowDownRight className="w-4 h-4 stroke-[3] text-red-500 animate-pulse" />
        </span>

        {/* Projected Remaining Stock */}
        <span className={`text-xs sm:text-sm font-extrabold px-2 py-0.5 rounded-md border ${
          status === 'insufficient'
            ? 'bg-red-500/25 text-red-300 border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)]'
            : status === 'critical'
            ? 'bg-orange-500/20 text-orange-300 border-orange-500/50'
            : status === 'warning'
            ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
            : 'bg-red-950/40 text-red-400 border-red-500/30'
        }`}>
          {remaining < 0 ? `Deficit (${Math.abs(remaining)})` : remaining}
        </span>
      </div>

      {/* Dynamic Status Badges */}
      <div>
        {status === 'insufficient' && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-black bg-red-600 text-white border border-red-400 shadow-[0_0_12px_rgba(239,68,68,0.6)] animate-pulse">
            <AlertOctagon className="w-3 h-3" /> INSUFFICIENT
          </span>
        )}

        {status === 'critical' && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500/20 text-orange-300 border border-orange-500/40">
            <AlertTriangle className="w-3 h-3" /> WILL BE OUT OF STOCK
          </span>
        )}

        {status === 'warning' && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <AlertTriangle className="w-3 h-3" /> LOW STOCK AFTER SHIPMENT
          </span>
        )}

        {status === 'ok' && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
            <CheckCircle2 className="w-3 h-3" /> OK
          </span>
        )}
      </div>
    </div>
  );
};

