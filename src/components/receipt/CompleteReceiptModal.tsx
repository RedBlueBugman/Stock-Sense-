import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, PackageCheck, Boxes, ArrowRight, ShieldCheck, Sparkles, X } from 'lucide-react';
import { ReceiptSummaryData } from '../../types/receipt';

interface CompleteReceiptModalProps {
  isOpen: boolean;
  receiptData: ReceiptSummaryData | null;
  onClose: () => void;
  onStartNewReceipt: () => void;
}

export const CompleteReceiptModal: React.FC<CompleteReceiptModalProps> = ({
  isOpen,
  receiptData,
  onClose,
  onStartNewReceipt,
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

  if (!isOpen || !receiptData) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="complete-modal-title"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-lg bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(16,185,129,0.35)] backdrop-blur-2xl z-10 my-auto text-slate-100 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Ambient Glows */}
          <div className="absolute -top-24 -right-24 w-60 h-60 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Icon & Title */}
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border-2 border-emerald-500/50 flex items-center justify-center text-emerald-400 mb-4 shadow-[0_0_30px_rgba(16,185,129,0.5)]">
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </div>

            <h3 id="complete-modal-title" className="text-2xl font-black text-white tracking-tight">
              Receipt Completed Successfully
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Stock ledger and warehouse bin quantities have been updated in real-time.
            </p>
          </div>

          {/* Key Receipt Details Card */}
          <div className="my-6 p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-around text-center">
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-500">Receipt ID</span>
              <div className="text-sm sm:text-base font-mono font-black text-purple-400">
                {receiptData.id}
              </div>
            </div>
            <div className="w-[1px] h-8 bg-slate-800" />
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-500">Total Lines</span>
              <div className="text-sm sm:text-base font-mono font-black text-white">
                {receiptData.total_products} products
              </div>
            </div>
            <div className="w-[1px] h-8 bg-slate-800" />
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-500">Units Received</span>
              <div className="text-sm sm:text-base font-mono font-black text-emerald-400">
                {receiptData.total_units} units
              </div>
            </div>
          </div>

          {/* Itemized summary */}
          <div className="space-y-2 mb-6 max-h-44 overflow-y-auto pr-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Inbound Items Processed:
            </span>
            {receiptData.items.map((it) => (
              <div
                key={it.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/60 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{it.product.emoji}</span>
                  <span className="font-bold text-slate-200">{it.product.name}</span>
                  <span className="text-[10px] font-mono text-purple-400">({it.product.sku})</span>
                </div>
                <div className="font-mono font-bold text-emerald-400">
                  +{it.quantity} units
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
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
              onClick={onStartNewReceipt}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>New Inbound Receipt</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
