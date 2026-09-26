import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Plus, Minus, AlertCircle } from 'lucide-react';
import { DeliveryItem } from '../../types/delivery';
import { Product } from '../../types/inventory';
import { StockValidation } from './StockValidation';

interface DeliveryItemRowProps {
  item: DeliveryItem;
  liveProduct?: Product;
  onQuantityChange: (productId: number, newQty: number) => void;
  onRemoveItem: (productId: number) => void;
}

export const DeliveryItemRow: React.FC<DeliveryItemRowProps> = ({
  item,
  liveProduct,
  onQuantityChange,
  onRemoveItem,
}) => {
  const [isConfirmingRemove, setIsConfirmingRemove] = useState<boolean>(false);
  const currentProduct = liveProduct || item.product;
  const { quantity } = item;
  
  const isInsufficient = quantity > currentProduct.current_stock;
  const isZeroOrNegative = quantity <= 0;
  const isInvalid = isInsufficient || isZeroOrNegative;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    if (rawVal === '') {
      onQuantityChange(currentProduct.id, 0);
      return;
    }
    const parsed = parseInt(rawVal, 10);
    if (!isNaN(parsed)) {
      onQuantityChange(currentProduct.id, parsed);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      onQuantityChange(currentProduct.id, quantity - 1);
    }
  };

  const handleIncrement = () => {
    onQuantityChange(currentProduct.id, (quantity || 0) + 1);
  };

  return (
    <motion.tr
      layout
      initial={{ opacity: 0, y: -12, scale: 0.98 }}
      animate={{ 
        opacity: 1, 
        y: 0, 
        scale: 1,
        backgroundColor: isInvalid ? 'rgba(239, 68, 68, 0.12)' : 'transparent'
      }}
      exit={{ opacity: 0, x: 40, scale: 0.95, transition: { duration: 0.25 } }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={`border-b border-slate-800/80 transition-colors group ${
        isInvalid ? 'bg-red-950/30' : 'hover:bg-slate-800/50'
      }`}
    >
      {/* Product Info */}
      <td className="py-4 px-4 sm:px-6">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-2xl shadow-inner flex-shrink-0 group-hover:scale-105 transition-transform">
            {currentProduct.emoji}
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors truncate">
              {currentProduct.name}
            </h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs font-mono text-blue-400 font-semibold bg-blue-500/10 px-1.5 py-0.2 rounded border border-blue-500/20">
                {currentProduct.sku}
              </span>
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                {currentProduct.category}
              </span>
            </div>
          </div>
        </div>
      </td>

      {/* Quantity To Ship Column with Real-time Validation */}
      <td className="py-4 px-4 sm:px-6">
        <div className="flex flex-col gap-1">
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
              value={quantity === 0 ? '' : quantity}
              onChange={handleInputChange}
              aria-label={`Quantity to ship for ${currentProduct.name}`}
              placeholder="0"
              className={`w-20 h-8 text-center font-mono font-bold text-sm bg-slate-950 rounded-lg text-white outline-none transition-all shadow-inner [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                isInvalid
                  ? 'border-2 border-red-500 text-red-300 focus:ring-2 focus:ring-red-500 shadow-[0_0_12px_rgba(239,68,68,0.6)] animate-pulse'
                  : 'border border-blue-500/40 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/40'
              }`}
            />

            <button
              type="button"
              onClick={handleIncrement}
              aria-label="Increase quantity"
              className="w-8 h-8 rounded-lg bg-blue-600/30 hover:bg-blue-600/60 text-blue-200 hover:text-white border border-blue-500/50 flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Real-time Inline Error Message with Specific Product and Quantity Details */}
          {isZeroOrNegative && (
            <span className="text-[10px] font-bold text-red-400 flex items-center gap-1 mt-0.5">
              <AlertCircle className="w-3 h-3 flex-shrink-0" />
              Must be at least 1 unit
            </span>
          )}

          {isInsufficient && !isZeroOrNegative && (
            <span className="text-[10px] font-bold text-red-400 flex items-center gap-1 mt-0.5">
              <AlertCircle className="w-3 h-3 flex-shrink-0" />
              Only {currentProduct.current_stock} available for {currentProduct.name} (Need {quantity})
            </span>
          )}
        </div>
      </td>

      {/* Available Stock in Warehouse */}
      <td className="py-4 px-4 sm:px-6 font-mono text-xs sm:text-sm text-slate-300">
        <span className={`font-bold ${currentProduct.current_stock === 0 ? 'text-red-400 font-extrabold' : 'text-slate-200'}`}>
          {currentProduct.current_stock}
        </span>
        <span className="text-slate-500 text-xs ml-1">in stock</span>
      </td>

      {/* Remaining Stock & Status Badge */}
      <td className="py-4 px-4 sm:px-6">
        <StockValidation product={currentProduct} quantity={quantity} />
      </td>

      {/* Action (Remove) */}
      <td className="py-4 px-4 sm:px-6 text-right">
        {isConfirmingRemove ? (
          <div className="flex items-center justify-end gap-1.5">
            <button
              type="button"
              onClick={() => onRemoveItem(currentProduct.id)}
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
            title={`Remove ${currentProduct.name} from delivery`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </td>
    </motion.tr>
  );
};

