import React from 'react';
import { motion } from 'framer-motion';
import { 
  PackageCheck, 
  MapPin, 
  AlertTriangle, 
  Tag, 
  Layers, 
  Barcode as BarcodeIcon, 
  Clock, 
  TrendingUp, 
  DollarSign, 
  CheckCircle2,
  Boxes
} from 'lucide-react';
import { Product } from '../types/inventory';
import { QRCodeDisplay } from './QRCodeDisplay';

interface ScannedProductCardProps {
  product: Product;
  onStockChange?: (productId: number, delta: number) => void;
  onRescanRequest?: () => void;
}

export const ScannedProductCard: React.FC<ScannedProductCardProps> = ({
  product,
  onStockChange,
  onRescanRequest,
}) => {
  const isLowStock = product.current_stock <= product.min_stock;
  const stockPercentage = Math.min(100, Math.round((product.current_stock / (product.min_stock * 2)) * 100));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full rounded-2xl bg-slate-900/90 border border-purple-500/30 p-6 sm:p-8 shadow-[0_15px_40px_-10px_rgba(139,92,246,0.25)] overflow-hidden backdrop-blur-xl"
    >
      {/* Decorative ambient gradient backdrop */}
      <div className="absolute -top-24 -right-24 w-60 h-60 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Tag */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-3xl shadow-inner">
            {product.emoji}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-mono font-bold border border-purple-500/30">
                {product.sku}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                <BarcodeIcon className="w-3.5 h-3.5 text-purple-400" />
                {product.barcode}
              </span>
            </div>
            <h3 className="text-2xl font-extrabold text-white mt-1">
              {product.name}
            </h3>
          </div>
        </div>

        {/* Live Status Badge */}
        <div className="flex items-center gap-2">
          {isLowStock ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
              <AlertTriangle className="w-4 h-4 animate-bounce" />
              <span>LOW STOCK WARNING</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>OPTIMAL LEVEL</span>
            </div>
          )}
        </div>
      </div>

      {/* Middle Grid of Product Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
        {/* Category */}
        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <Tag className="w-3.5 h-3.5 text-purple-400" />
            <span>Category</span>
          </div>
          <div className="text-sm font-bold text-white truncate">
            {product.category}
          </div>
        </div>

        {/* Location */}
        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <MapPin className="w-3.5 h-3.5 text-purple-400" />
            <span>Storage Location</span>
          </div>
          <div className="text-sm font-bold text-white truncate">
            {product.location || 'Zone A - General'}
          </div>
        </div>

        {/* Unit Value */}
        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <DollarSign className="w-3.5 h-3.5 text-purple-400" />
            <span>Unit Price</span>
          </div>
          <div className="text-sm font-bold text-white font-mono">
            ${product.unitPrice?.toFixed(2) || '45.00'}
          </div>
        </div>

        {/* Batch / Lot */}
        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            <span>Batch / Lot #</span>
          </div>
          <div className="text-sm font-bold text-purple-300 font-mono">
            {product.batchNumber || 'LOT-2026-01'}
          </div>
        </div>
      </div>

      {/* Stock Level Bar & Controls */}
      <div className="p-5 rounded-xl bg-slate-800/80 border border-slate-700/80 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 flex-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <Boxes className="w-4 h-4 text-purple-400" />
              Stock vs Minimum Reorder Threshold:
            </span>
            <span className="font-mono font-bold text-white">
              <span className={isLowStock ? 'text-amber-400 font-black' : 'text-emerald-400'}>
                {product.current_stock}
              </span>
              <span className="text-slate-500"> / {product.min_stock} min required</span>
            </span>
          </div>

          {/* Progress track */}
          <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-700">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${stockPercentage}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`h-full rounded-full ${
                isLowStock
                  ? 'bg-gradient-to-r from-amber-500 to-orange-400 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                  : 'bg-gradient-to-r from-purple-500 to-indigo-400 shadow-[0_0_10px_rgba(139,92,246,0.5)]'
              }`}
            />
          </div>
        </div>

        {/* Quick Adjustment Buttons */}
        {onStockChange && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onStockChange(product.id, -1)}
              disabled={product.current_stock <= 0}
              className="px-3 py-2 rounded-lg bg-slate-700/70 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-600 disabled:opacity-40 transition-colors"
            >
              - 1 (Dispatch)
            </button>
            <button
              onClick={() => onStockChange(product.id, +1)}
              className="px-3 py-2 rounded-lg bg-purple-600/80 hover:bg-purple-600 text-white text-xs font-bold border border-purple-500 transition-colors shadow-sm"
            >
              + 1 (Receive)
            </button>
          </div>
        )}
      </div>

      {/* Footer Meta */}
      <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>Last Audited: <strong className="text-slate-300">{product.lastUpdated}</strong></span>
        </div>
        <div className="flex items-center gap-3">
          {onRescanRequest && (
            <button
              onClick={onRescanRequest}
              className="text-xs text-purple-400 hover:text-purple-300 font-semibold underline underline-offset-4 flex items-center gap-1 cursor-pointer"
            >
              <PackageCheck className="w-3.5 h-3.5" />
              Scan Another Item
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
