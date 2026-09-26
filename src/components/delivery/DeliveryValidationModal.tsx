import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertOctagon, X, AlertTriangle, ArrowRight } from 'lucide-react';
import { Product } from '../../types/inventory';

interface DeliveryValidationModalProps {
  isOpen: boolean;
  errors: Array<{ product: Product; requested: number; available: number }>;
  onClose: () => void;
}

export const DeliveryValidationModal: React.FC<DeliveryValidationModalProps> = ({
  isOpen,
  errors,
  onClose,
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

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="validation-error-title"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Modal Window with Shake Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, x: 0 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            x: [0, -10, 10, -8, 8, -4, 4, 0]
          }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="relative w-full max-w-lg bg-slate-900 border-2 border-red-500/80 rounded-3xl p-6 sm:p-8 shadow-[0_25px_70px_-15px_rgba(239,68,68,0.4)] backdrop-blur-2xl z-10 my-auto text-slate-100 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-60 h-60 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-3xl bg-red-500/20 border-2 border-red-500 flex items-center justify-center text-red-400 mb-4 shadow-[0_0_30px_rgba(239,68,68,0.7)]">
              <AlertOctagon className="w-10 h-10 stroke-[2.5] animate-bounce" />
            </div>

            <h3 id="validation-error-title" className="text-2xl font-black text-white tracking-tight">
              Cannot Ship Order: Insufficient Stock
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-sm">
              The warehouse does not possess enough physical units to fulfill the requested shipping quantities.
            </p>
          </div>

          {/* Error List Breakdown */}
          <div className="my-6 space-y-2.5">
            <span className="text-xs font-bold text-red-300 uppercase tracking-wider block">
              Stock Deficit Breakdown:
            </span>

            {errors.map(({ product, requested, available }) => (
              <div
                key={product.id}
                className="p-3.5 rounded-2xl bg-red-950/50 border border-red-500/40 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{product.emoji}</span>
                  <div>
                    <strong className="text-white block font-bold">{product.name}</strong>
                    <span className="text-[10px] font-mono text-purple-300">{product.sku}</span>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <div className="text-red-300 font-bold">
                    Need <span className="underline decoration-red-500 font-black">{requested}</span> units
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Only <strong className="text-white">{available}</strong> available
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-slate-400 text-center mb-6">
            Please adjust the quantities in the table or receive additional stock via an Inbound Receipt before shipping.
          </p>

          {/* Action */}
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-sm shadow-lg transition-colors cursor-pointer"
          >
            Adjust Quantities
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
