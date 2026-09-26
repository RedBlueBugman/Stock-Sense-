import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Plus, Minus, X } from 'lucide-react';
import { ReceiptItem } from '../../types/receipt';
import { StockPreview } from './StockPreview';

interface ReceiptItemRowProps {
  item: ReceiptItem;
  onQuantityChange: (productId: number, newQty: number) => void;
  onRemoveItem: (productId: number) => void;
}

export const ReceiptItemRow: React.FC<ReceiptItemRowProps> = ({
  item,
  onQuantityChange,
  onRemoveItem,
}) => {
  const [isConfirmingRemove, setIsConfirmingRemove] = useState<boolean>(false);
  const { product, quantity } = item;

  // Immediate input handler with real-time propagation
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    if (rawVal === '') {
      onQuantityChange(product.id, 1);
      return;
    }
    const parsed = parseInt(rawVal, 10);
    if (!isNaN(parsed)) {
      const clamped = Math.min(9999, Math.max(1, parsed));
      onQuantityChange(product.id, clamped);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      onQuantityChange(product.id, quantity - 1);
    }
  };

  const handleIncrement = () => {
    if (quantity < 9999) {
      onQuantityChange(product.id, quantity + 1);
    }
  };

  return (
    <motion.tr
      layout
      initial={{ opacity: 0, y: -12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.95, transition: { duration: 0.25, ease: 'easeInOut' } }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="border-b border-slate-800/80 hover:bg-slate-800/50 transition-colors group"
    >
      {/* Product Column */}
      <td className="py-4 px-4 sm:px-6">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-2xl shadow-inner flex-shrink-0 group-hover:scale-105 transition-transform">
            {product.emoji}
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors truncate">
              {product.name}
            </h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs font-mono text-purple-400 font-semibold bg-purple-500/10 px-1.5 py-0.2 rounded border border-purple-500/20">
                {product.sku}
              </span>
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                {product.category}
              </span>
            </div>
          </div>
        </div>
      </td>

      {/* Quantity Column */}
      <td className="py-4 px-4 sm:px-6">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleDecrement}
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 flex items-center justify-center disabled:opacity-30 transition-all cursor-pointer active:scale-95"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          <input
            type="number"
            min="1"
            max="9999"
            value={quantity}
            onChange={handleInputChange}
            aria-label={`Quantity for ${product.name}`}
            className="w-16 h-8 text-center font-mono font-bold text-sm bg-slate-950 border border-purple-500/40 focus:border-purple-400 focus:ring-2 focus:ring-purple-500/40 rounded-lg text-white outline-none transition-all shadow-inner [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />

          <button
            type="button"
            onClick={handleIncrement}
            disabled={quantity >= 9999}
            aria-label="Increase quantity"
            className="w-8 h-8 rounded-lg bg-purple-600/30 hover:bg-purple-600/60 text-purple-200 hover:text-white border border-purple-500/50 flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>

      {/* Current Stock Column */}
      <td className="py-4 px-4 sm:px-6 font-mono text-xs sm:text-sm text-slate-300">
        <span
          className={
            product.current_stock === 0
              ? 'text-red-400 font-bold'
              : product.current_stock < product.min_stock
              ? 'text-amber-400 font-semibold'
              : 'text-slate-300'
          }
        >
          {product.current_stock}
        </span>
        <span className="text-slate-500 text-xs ml-1">/ {product.min_stock} min</span>
      </td>

      {/* Stock Preview (Calculated Live) */}
      <td className="py-4 px-4 sm:px-6">
        <StockPreview product={product} quantity={quantity} />
      </td>

      {/* Action (Remove) */}
      <td className="py-4 px-4 sm:px-6 text-right">
        {isConfirmingRemove ? (
          <div className="flex items-center justify-end gap-1.5">
            <button
              type="button"
              onClick={() => onRemoveItem(product.id)}
              className="px-2.5 py-1 text-[11px] font-bold bg-red-600 hover:bg-red-500 text-white rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              Confirm
            </button>
            <button
              type="button"
              onClick={() => setIsConfirmingRemove(false)}
              className="px-2 py-1 text-[11px] text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsConfirmingRemove(true)}
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-950/40 rounded-lg border border-transparent hover:border-red-500/30 transition-all cursor-pointer"
            title={`Remove ${product.name} from receipt`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </td>
    </motion.tr>
  );
};
