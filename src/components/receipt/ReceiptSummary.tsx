import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2, PackageCheck, Boxes, ArrowRight } from 'lucide-react';
import { ReceiptItem } from '../../types/receipt';

interface ReceiptSummaryProps {
  items: ReceiptItem[];
  isSubmitting: boolean;
  onCancelReceipt: () => void;
  onCompleteReceipt: () => void;
}

export const ReceiptSummary: React.FC<ReceiptSummaryProps> = ({
  items,
  isSubmitting,
  onCancelReceipt,
  onCompleteReceipt,
}) => {
  const totalProducts = items.length;
  const totalUnits = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 shadow-xl backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
      {/* Metric Breakdown */}
      <div className="flex flex-wrap items-center gap-6 sm:gap-10">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <PackageCheck className="w-3.5 h-3.5 text-purple-400" />
            Total Products
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-white font-mono">{totalProducts}</span>
            <span className="text-xs text-slate-400">SKU Lines</span>
          </div>
        </div>

        <div className="h-10 w-[1px] bg-slate-800 hidden sm:block" />

        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Boxes className="w-3.5 h-3.5 text-emerald-400" />
            Total Incoming Units
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">{totalUnits}</span>
            <span className="text-xs text-emerald-400">Physical Units</span>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onCancelReceipt}
          disabled={isSubmitting || items.length === 0}
          className="px-5 py-3 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs sm:text-sm disabled:opacity-40 transition-colors flex items-center gap-2 cursor-pointer"
        >
          <XCircle className="w-4 h-4 text-slate-400" />
          <span>Cancel Receipt</span>
        </button>

        <button
          type="button"
          onClick={onCompleteReceipt}
          disabled={isSubmitting || items.length === 0}
          className="relative px-7 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs sm:text-sm shadow-[0_0_25px_rgba(16,185,129,0.4)] hover:shadow-[0_0_35px_rgba(16,185,129,0.7)] disabled:opacity-40 transition-all flex items-center gap-2.5 cursor-pointer transform active:scale-95"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Processing Inbound...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              <span>Complete Receipt</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
