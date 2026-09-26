import React from 'react';
import { motion } from 'framer-motion';
import { Truck, XCircle, Loader2, PackageCheck, AlertOctagon, ArrowRight, ShieldAlert } from 'lucide-react';
import { DeliveryItem } from '../../types/delivery';

interface DeliverySummaryProps {
  items: DeliveryItem[];
  isSubmitting: boolean;
  hasInsufficientStock: boolean;
  onCancelDelivery: () => void;
  onShipOrder: () => void;
}

export const DeliverySummary: React.FC<DeliverySummaryProps> = ({
  items,
  isSubmitting,
  hasInsufficientStock,
  onCancelDelivery,
  onShipOrder,
}) => {
  const totalProducts = items.length;
  const totalUnits = items.reduce((sum, item) => sum + item.quantity, 0);
  const warningItemsCount = items.filter((it) => it.quantity > it.product.current_stock).length;

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 shadow-xl backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
      {/* Metric Breakdown */}
      <div className="flex flex-wrap items-center gap-6 sm:gap-10">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <PackageCheck className="w-3.5 h-3.5 text-blue-400" />
            Products in Order
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-white font-mono">{totalProducts}</span>
            <span className="text-xs text-slate-400">SKU Lines</span>
          </div>
        </div>

        <div className="h-10 w-[1px] bg-slate-800 hidden sm:block" />

        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-blue-400" />
            Total Units to Ship
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-blue-400 font-mono">{totalUnits}</span>
            <span className="text-xs text-blue-400">Outgoing Units</span>
          </div>
        </div>

        {hasInsufficientStock && (
          <>
            <div className="h-10 w-[1px] bg-slate-800 hidden sm:block" />
            <div>
              <span className="text-xs font-semibold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertOctagon className="w-3.5 h-3.5 text-red-400" />
                Stock Deficits
              </span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black text-red-400 font-mono">{warningItemsCount}</span>
                <span className="text-xs text-red-400 font-bold">Unfulfillable</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onCancelDelivery}
          disabled={isSubmitting || items.length === 0}
          className="px-5 py-3 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs sm:text-sm disabled:opacity-40 transition-colors flex items-center gap-2 cursor-pointer"
        >
          <XCircle className="w-4 h-4 text-slate-400" />
          <span>Cancel Delivery</span>
        </button>

        <button
          type="button"
          onClick={onShipOrder}
          disabled={isSubmitting || items.length === 0 || hasInsufficientStock}
          className={`relative px-7 py-3 rounded-xl font-extrabold text-xs sm:text-sm transition-all flex items-center gap-2.5 cursor-pointer transform active:scale-95 ${
            hasInsufficientStock
              ? 'bg-red-950/60 border border-red-500/50 text-red-300 cursor-not-allowed opacity-75 shadow-none'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-[0_0_25px_rgba(59,130,246,0.4)] hover:shadow-[0_0_35px_rgba(59,130,246,0.7)]'
          }`}
          title={hasInsufficientStock ? 'Cannot ship order with insufficient stock' : 'Ship delivery order'}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Processing Outbound...</span>
            </>
          ) : hasInsufficientStock ? (
            <>
              <AlertOctagon className="w-4 h-4 text-red-400" />
              <span>Fix Stock Deficit to Ship</span>
            </>
          ) : (
            <>
              <Truck className="w-4 h-4 stroke-[2.5]" />
              <span>Ship Order</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
