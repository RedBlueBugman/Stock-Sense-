import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Plus, 
  Sparkles, 
  QrCode, 
  CheckCircle2, 
  Package, 
  Tag, 
  Layers, 
  Hash, 
  Printer, 
  Download,
  Boxes,
  ArrowRight
} from 'lucide-react';
import { Product } from '../types/inventory';
import { QRCodeDisplay } from './QRCodeDisplay';
import confetti from 'canvas-confetti';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (newProduct: Product) => void;
  existingProductsCount: number;
}

const CATEGORY_OPTIONS = [
  'Raw Materials',
  'Lumber & Timber',
  'Finished Goods',
  'Heavy Equipment',
  'Electronics & Sensors',
  'Fasteners & Hardware',
  'Safety & PPE',
  'Packaging Supplies'
];

const EMOJI_OPTIONS = ['🔩', '🪵', '🪑', '🛠️', '⚡', '🦺', '📦', '🔋', '🏷️', '🧱', '🧪', '⚙️', '💡', '🔧'];

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onAddProduct,
  existingProductsCount,
}) => {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [emoji, setEmoji] = useState(EMOJI_OPTIONS[0]);
  const [initialStock, setInitialStock] = useState<number>(30);
  const [minStock, setMinStock] = useState<number>(15);
  const [maxStock, setMaxStock] = useState<number>(100);
  const [location, setLocation] = useState('Aisle 2 - Rack B3');
  
  // Post-addition generated QR view state
  const [createdProduct, setCreatedProduct] = useState<Product | null>(null);

  // Auto-generate a SKU suggestion when name changes
  useEffect(() => {
    if (!sku && name.trim()) {
      const clean = name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      const prefix = clean.slice(0, 2) || 'PR';
      setSku(`${prefix}${String(existingProductsCount + 1).padStart(3, '0')}`);
    }
  }, [name, sku, existingProductsCount]);

  // Reset form
  const resetForm = () => {
    setName('');
    setSku('');
    setCategory(CATEGORY_OPTIONS[0]);
    setEmoji(EMOJI_OPTIONS[0]);
    setInitialStock(30);
    setMinStock(15);
    setMaxStock(100);
    setLocation('Aisle 2 - Rack B3');
    setCreatedProduct(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Quick fill sample
  const handleLoadSample = () => {
    const samples = [
      { name: 'Titanium Fasteners', emoji: '⚙️', category: 'Fasteners & Hardware', stock: 50, min: 20, max: 150, loc: 'Bin 14-C' },
      { name: 'Industrial Safety Helmet', emoji: '🦺', category: 'Safety & PPE', stock: 25, min: 10, max: 60, loc: 'Shelf 03-A' },
      { name: 'Lithium Pack 24V', emoji: '🔋', category: 'Electronics & Sensors', stock: 18, min: 12, max: 50, loc: 'Zone E Secure' },
      { name: 'Hydraulic Cylinder Rods', emoji: '🔩', category: 'Heavy Equipment', stock: 40, min: 15, max: 100, loc: 'Rack H-09' }
    ];
    const picked = samples[Math.floor(Math.random() * samples.length)];
    setName(picked.name);
    setEmoji(picked.emoji);
    setCategory(picked.category);
    setInitialStock(picked.stock);
    setMinStock(picked.min);
    setMaxStock(picked.max);
    setLocation(picked.loc);
    
    const prefix = picked.name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 2).toUpperCase();
    setSku(`${prefix}${String(existingProductsCount + 1).padStart(3, '0')}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const finalSku = sku.trim() || `SKU${Date.now().toString().slice(-4)}`;
    const newProd: Product = {
      id: Date.now(),
      sku: finalSku,
      name: name.trim(),
      barcode: finalSku,
      category,
      current_stock: Math.max(0, initialStock),
      min_stock: Math.max(1, minStock),
      max_stock: Math.max(initialStock, maxStock),
      emoji,
      location,
      lastUpdated: 'Just now (Added)',
    };

    onAddProduct(newProd);
    setCreatedProduct(newProd);

    try {
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.5, x: 0.5 },
        zIndex: 99999,
        colors: ['#8B5CF6', '#3B82F6', '#10B981'],
      });
    } catch {
      // safe fallback
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
          onClick={handleClose}
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-xl bg-slate-900 border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(139,92,246,0.3)] backdrop-blur-2xl z-10 my-auto text-slate-100 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-60 h-60 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {!createdProduct ? (
            /* PRODUCT CREATION FORM */
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">
                      Add New Physical Inventory Item
                    </h3>
                    <p className="text-xs text-slate-400">
                      Registers item and instantly generates dynamic QR tag for scanning.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="px-2.5 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>Fill Sample</span>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 mt-5">
                {/* Name & Emoji */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Titanium Fasteners"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors shadow-inner"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                      Emoji
                    </label>
                    <select
                      value={emoji}
                      onChange={(e) => setEmoji(e.target.value)}
                      aria-label="Select product emoji"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-2 text-base text-center text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                    >
                      {EMOJI_OPTIONS.map((em) => (
                        <option key={em} value={em}>
                          {em}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* SKU & Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                      SKU / Barcode *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="e.g., TF005"
                        value={sku}
                        onChange={(e) => setSku(e.target.value.toUpperCase())}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 font-mono text-xs font-bold text-purple-300 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 uppercase transition-colors shadow-inner"
                      />
                      <span className="absolute right-3 top-2.5 text-[10px] text-slate-500 font-mono">
                        QR PAYLOAD
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                      Warehouse Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      aria-label="Select warehouse category"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                    >
                      {CATEGORY_OPTIONS.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Stock Controls */}
                <div className="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Initial Stock
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={initialStock}
                      onChange={(e) => setInitialStock(parseInt(e.target.value, 10) || 0)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-xs font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Min Threshold
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={minStock}
                      onChange={(e) => setMinStock(parseInt(e.target.value, 10) || 1)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-xs font-bold text-amber-400 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Max Capacity
                    </label>
                    <input
                      type="number"
                      min={initialStock}
                      value={maxStock}
                      onChange={(e) => setMaxStock(parseInt(e.target.value, 10) || 100)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-xs font-bold text-blue-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Storage Location */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Bin / Shelf Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Aisle 3 - Bay B2"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-300 focus:outline-none focus:border-purple-500 shadow-inner"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-extrabold shadow-[0_0_20px_rgba(139,92,246,0.5)] flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Save & Generate QR Code</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* POST-CREATION QR CODE GENERATED VIEW */
            <div className="text-center py-2">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border-2 border-emerald-500/50 flex items-center justify-center text-emerald-400 mx-auto mb-3 shadow-[0_0_25px_rgba(16,185,129,0.5)]">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <h3 className="text-xl font-black text-white tracking-tight">
                Item Registered & QR Generated!
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {createdProduct.name} has been added to physical inventory.
              </p>

              {/* Generated QR Card Preview */}
              <div className="my-5 p-5 rounded-2xl bg-slate-950 border border-purple-500/40 flex flex-col items-center justify-center max-w-xs mx-auto shadow-2xl">
                <div className="relative p-2 bg-white rounded-xl shadow-md">
                  <QRCodeDisplay sku={createdProduct.barcode || createdProduct.sku} size={150} />
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-slate-900 border border-purple-500 rounded-full flex items-center justify-center text-lg shadow">
                    {createdProduct.emoji}
                  </div>
                </div>

                <div className="mt-3 text-center">
                  <span className="text-xs font-bold text-white block">
                    {createdProduct.name}
                  </span>
                  <span className="text-xs font-mono font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 inline-block mt-1">
                    {createdProduct.sku}
                  </span>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Initial Stock: <strong className="text-emerald-400 font-mono">{createdProduct.current_stock}</strong> units
                  </div>
                </div>
              </div>

              {/* Success CTAs */}
              <div className="flex items-center gap-2 max-w-xs mx-auto">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Done</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
