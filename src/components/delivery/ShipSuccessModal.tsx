import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Truck, Boxes, ArrowRight, X, MapPin, Building } from 'lucide-react';
import { DeliverySummaryData } from '../../types/delivery';

interface ShipSuccessModalProps {
  isOpen: boolean;
  deliveryData: DeliverySummaryData | null;
  onClose: () => void;
  onStartNewDelivery: () => void;
}

export const ShipSuccessModal: React.FC<ShipSuccessModalProps> = ({
  isOpen,
  deliveryData,
  onClose,
  onStartNewDelivery,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !deliveryData) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delivery-success-title"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-lg bg-slate-900 border border-blue-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(59,130,246,0.35)] backdrop-blur-2xl z-10 my-auto text-slate-100 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Ambient Glows */}
          <div className="absolute -top-24 -right-24 w-60 h-60 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Animated Truck & Header */}
          <div className="flex flex-col items-center text-center">
            {/* Truck slide animation */}
            <div className="relative w-full h-16 flex items-center justify-center overflow-hidden mb-2">
              <motion.div
                initial={{ x: -120, opacity: 0 }}
                animate={{ x: [ -120, 0, 0, 140 ], opacity: [0, 1, 1, 0] }}
                transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 1 }}
                className="w-16 h-16 rounded-3xl bg-blue-500/20 border-2 border-blue-500/50 flex items-center justify-center text-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.6)]"
              >
                <Truck className="w-9 h-9 stroke-[2.5]" />
              </motion.div>
            </div>

            <h3 id="delivery-success-title" className="text-2xl font-black text-white tracking-tight">
              Delivery Shipped Successfully
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Physical units have been deducted from warehouse bin locations.
            </p>
          </div>

          {/* Key Delivery Details Card */}
          <div className="my-6 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-around text-center">
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-500">Delivery ID</span>
              <div className="text-sm sm:text-base font-mono font-black text-blue-400">
                {deliveryData.id}
              </div>
            </div>
            <div className="w-[1px] h-8 bg-slate-800" />
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-500">Total Products</span>
              <div className="text-sm sm:text-base font-mono font-black text-white">
                {deliveryData.total_products} lines
              </div>
            </div>
            <div className="w-[1px] h-8 bg-slate-800" />
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-500">Units Shipped</span>
              <div className="text-sm sm:text-base font-mono font-black text-blue-400">
                {deliveryData.total_units} units
              </div>
            </div>
          </div>

          {/* Customer & Address Details */}
          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1.5 text-xs text-slate-300 mb-6">
            <div className="flex items-center gap-2">
              <Building className="w-3.5 h-3.5 text-blue-400" />
              <span>Customer: <strong className="text-white">{deliveryData.customer || 'Customer #1234'}</strong></span>
            </div>
            {deliveryData.shippingAddress && (
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                <span>Destination: {deliveryData.shippingAddress}</span>
              </div>
            )}
          </div>

          {/* Itemized summary */}
          <div className="space-y-2 mb-6 max-h-40 overflow-y-auto pr-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Dispatched Outbound Items:
            </span>
            {deliveryData.items.map((it) => (
              <div
                key={it.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/50 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{it.product.emoji}</span>
                  <span className="font-bold text-slate-200">{it.product.name}</span>
                  <span className="text-[10px] font-mono text-blue-400">({it.product.sku})</span>
                </div>
                <div className="font-mono font-bold text-rose-400">
                  -{it.quantity} units
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={onStartNewDelivery}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>New Delivery Order</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
