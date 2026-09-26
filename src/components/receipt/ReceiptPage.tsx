import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Scan, 
  Sparkles, 
  Calendar, 
  Truck, 
  Package, 
  Boxes, 
  CheckCircle2, 
  FileText, 
  AlertCircle,
  Plus,
  RefreshCw,
  Zap,
  Tag
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Product } from '../../types/inventory';
import { ReceiptItem, ReceiptSummaryData } from '../../types/receipt';
import { ReceiptItemRow } from './ReceiptItemRow';
import { ReceiptSummary } from './ReceiptSummary';
import { CompleteReceiptModal } from './CompleteReceiptModal';
import { BarcodeScannerModal } from '../BarcodeScannerModal';
import { useAlerts } from '../../context/AlertContext';
import { calculateNewStock } from '../../utils/stockCalculations';

interface ReceiptPageProps {
  products: Product[];
  onUpdateProducts: (updatedProducts: Product[]) => void;
}

export const ReceiptPage: React.FC<ReceiptPageProps> = ({
  products,
  onUpdateProducts,
}) => {
  const [receiptId, setReceiptId] = useState<string>('RCP-001');
  const [receiptCounter, setReceiptCounter] = useState<number>(1);
  const [vendorName, setVendorName] = useState<string>('Apex Industrial Supply Corp');
  const [status, setStatus] = useState<'draft' | 'completed'>('draft');
  const [receiptItems, setReceiptItems] = useState<ReceiptItem[]>([]);
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [completedSummary, setCompletedSummary] = useState<ReceiptSummaryData | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);

  const { addAlert } = useAlerts();

  // Keyboard shortcut Ctrl/Cmd + K to open scanner, Ctrl/Cmd + Enter to complete
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsScannerOpen(true);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleCompleteReceipt();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [receiptItems, isSubmitting]);

  // Handle item scanned from BarcodeScannerModal
  const handleScanProduct = (scannedProduct: Product) => {
    // Look up product from current global state
    const currentProductState = products.find((p) => p.id === scannedProduct.id) || scannedProduct;

    setReceiptItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.product.id === currentProductState.id);
      if (existingIndex >= 0) {
        // Increment quantity if already present
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: Math.min(9999, updated[existingIndex].quantity + 1),
        };
        return updated;
      } else {
        // Add new line item
        return [
          ...prev,
          {
            id: `ITEM-${Date.now()}-${currentProductState.id}`,
            product: currentProductState,
            quantity: 1,
          },
        ];
      }
    });

    // Provide user feedback toast
    addAlert({
      type: 'info',
      title: 'Item Added to Inbound Receipt',
      message: `${currentProductState.name} (${currentProductState.sku}) scanned for receipt ${receiptId}.`,
      productName: currentProductState.name,
    });
  };

  // Adjust quantity
  const handleQuantityChange = (productId: number, newQty: number) => {
    setReceiptItems((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  // Remove item
  const handleRemoveItem = (productId: number) => {
    setReceiptItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // Cancel receipt
  const handleCancelReceipt = () => {
    if (window.confirm('Are you sure you want to clear this draft receipt?')) {
      setReceiptItems([]);
      setStatus('draft');
    }
  };

  // Prepopulate Demo Scenario
  const handleLoadDemoReceipt = () => {
    const steelRods = products.find((p) => p.sku === 'SR001') || products[0];
    const officeChairs = products.find((p) => p.sku === 'CH003') || products[2];
    const workbenches = products.find((p) => p.sku === 'TB004') || products[3];

    setReceiptItems([
      { id: `ITEM-DEMO-1`, product: steelRods, quantity: 50 },
      { id: `ITEM-DEMO-2`, product: officeChairs, quantity: 20 },
      { id: `ITEM-DEMO-3`, product: workbenches, quantity: 10 },
    ]);
    setStatus('draft');

    addAlert({
      type: 'info',
      title: 'Demo Receipt Pre-Loaded',
      message: 'Added Steel Rods × 50, Office Chairs × 20, and Workbenches × 10.',
    });
  };

  // Complete Receipt Workflow
  const handleCompleteReceipt = () => {
    if (receiptItems.length === 0) {
      addAlert({
        type: 'warning',
        title: 'Empty Receipt',
        message: 'Please add at least one scanned item before completing receipt.',
      });
      return;
    }

    setIsSubmitting(true);

    // 1-second processing delay simulation
    setTimeout(() => {
      // 1. Calculate updated products state
      const updatedProductsList = products.map((prod) => {
        const itemReceived = receiptItems.find((it) => it.product.id === prod.id);
        if (itemReceived) {
          const newQty = prod.current_stock + itemReceived.quantity;
          return {
            ...prod,
            current_stock: newQty,
            lastUpdated: 'Just now (Receipt)',
          };
        }
        return prod;
      });

      // 2. Commit global stock update
      onUpdateProducts(updatedProductsList);

      // 3. Trigger contextual alerts for each received item
      receiptItems.forEach((it) => {
        const initialStock = it.product.current_stock;
        const newStock = initialStock + it.quantity;

        if (initialStock === 0 && newStock > 0) {
          addAlert({
            type: 'info',
            title: `RESTOCKED: ${it.product.name}`,
            message: `Out-of-stock condition resolved: ${initialStock} → ${newStock} units received.`,
            productName: it.product.name,
          });
        } else if (it.product.max_stock && newStock > it.product.max_stock) {
          addAlert({
            type: 'warning',
            title: `OVERSTOCK NOTICE: ${it.product.name}`,
            message: `${it.product.name} exceeds max capacity (${newStock}/${it.product.max_stock} units).`,
            productName: it.product.name,
          });
        } else if (initialStock < it.product.min_stock && newStock >= it.product.min_stock) {
          addAlert({
            type: 'info',
            title: `Safety Stock Restored: ${it.product.name}`,
            message: `Inventory reached healthy operating level (${newStock} units).`,
            productName: it.product.name,
          });
        }
      });

      // 4. Create summary record
      const summary: ReceiptSummaryData = {
        id: receiptId,
        type: 'receipt',
        status: 'completed',
        vendor: vendorName,
        items: [...receiptItems],
        total_products: receiptItems.length,
        total_units: receiptItems.reduce((s, it) => s + it.quantity, 0),
        timestamp: new Date(),
      };

      setCompletedSummary(summary);
      setStatus('completed');
      setIsSubmitting(false);
      setIsSuccessModalOpen(true);

      // 5. Confetti animation
      try {
        confetti({
          particleCount: 75,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#10B981', '#8B5CF6', '#34D399', '#60A5FA'],
        });
      } catch {
        // safe fallback
      }
    }, 1000);
  };

  // Start fresh new receipt
  const handleStartNewReceipt = () => {
    const nextNum = receiptCounter + 1;
    setReceiptCounter(nextNum);
    setReceiptId(`RCP-${String(nextNum).padStart(3, '0')}`);
    setReceiptItems([]);
    setStatus('draft');
    setIsSuccessModalOpen(false);
  };

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="space-y-8">
      {/* SECTION A: TOP ACTIONS & RECEIPT HEADER */}
      <section className="rounded-3xl bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border border-purple-500/20 p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Titles */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">📦</span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                New Receipt - Incoming Stock
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Scan items as they arrive from vendor to update physical stock and verify inventory levels.
            </p>
          </div>

          {/* Action CTAs: Scan & Demo */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={handleLoadDemoReceipt}
              className="px-4 py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-200 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Load Demo Receipt</span>
            </button>

            <button
              type="button"
              onClick={() => setIsScannerOpen(true)}
              className={`relative group px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-[0_0_25px_rgba(139,92,246,0.5)] hover:shadow-[0_0_35px_rgba(139,92,246,0.8)] flex items-center gap-2.5 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer ${
                receiptItems.length === 0 ? 'animate-bounce' : ''
              }`}
            >
              <Scan className="w-5 h-5 text-purple-200" />
              <span>Scan Barcode</span>
              <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 rounded bg-purple-900/60 text-[10px] font-mono border border-purple-400/30">
                Ctrl+K
              </kbd>
            </button>
          </div>
        </div>

        {/* Receipt Meta Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {/* Receipt ID */}
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Receipt Reference
            </span>
            <div className="text-lg font-mono font-black text-purple-400 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              {receiptId}
            </div>
          </div>

          {/* Date */}
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Date Received
            </span>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-400" />
              {todayFormatted}
            </div>
          </div>

          {/* Status Badge */}
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 flex flex-col justify-center">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Receipt Status
            </span>
            <div>
              {status === 'draft' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  Draft (In Progress)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Completed
                </span>
              )}
            </div>
          </div>

          {/* Vendor Field */}
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Inbound Vendor / Supplier
            </span>
            <div className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-purple-400 flex-shrink-0" />
              <input
                type="text"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                placeholder="Vendor Name"
                className="w-full bg-transparent text-xs font-bold text-slate-200 focus:outline-none focus:text-white border-b border-slate-700 focus:border-purple-500 py-0.5"
              />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION B: SCANNED ITEMS TABLE */}
      <section className="rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl overflow-hidden backdrop-blur-xl">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-white tracking-wide">
              Scanned Inbound Line Items
            </h3>
          </div>
          <span className="text-xs font-mono font-bold bg-purple-500/10 text-purple-300 px-3 py-0.5 rounded-full border border-purple-500/20">
            {receiptItems.length} Products Added
          </span>
        </div>

        {receiptItems.length === 0 ? (
          /* Empty State */
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-3xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4 shadow-inner">
              <Scan className="w-8 h-8 animate-pulse" />
            </div>
            <h4 className="text-base font-bold text-white">No items scanned yet</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Click &quot;Scan Barcode&quot; to scan incoming vendor crates or click &quot;Load Demo Receipt&quot; to simulate a multi-product delivery.
            </p>
            <button
              type="button"
              onClick={() => setIsScannerOpen(true)}
              className="mt-5 px-5 py-2.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/50 text-purple-200 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
            >
              <Scan className="w-4 h-4" />
              Scan First Item
            </button>
          </div>
        ) : (
          /* Table View */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 text-slate-400 font-mono uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 sm:px-6">Product</th>
                  <th className="py-3 px-4 sm:px-6">Quantity Received</th>
                  <th className="py-3 px-4 sm:px-6">Current Stock</th>
                  <th className="py-3 px-4 sm:px-6">Stock Projection (Live)</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                <AnimatePresence>
                  {receiptItems.map((item) => (
                    <ReceiptItemRow
                      key={item.id}
                      item={item}
                      onQuantityChange={handleQuantityChange}
                      onRemoveItem={handleRemoveItem}
                    />
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* SECTION C: BOTTOM ACTIONS & SUMMARY */}
      {receiptItems.length > 0 && (
        <section>
          <ReceiptSummary
            items={receiptItems}
            isSubmitting={isSubmitting}
            onCancelReceipt={handleCancelReceipt}
            onCompleteReceipt={handleCompleteReceipt}
          />
        </section>
      )}

      {/* Barcode Scanner Modal Integration */}
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleScanProduct}
      />

      {/* Success Confirmation Modal */}
      <CompleteReceiptModal
        isOpen={isSuccessModalOpen}
        receiptData={completedSummary}
        onClose={() => setIsSuccessModalOpen(false)}
        onStartNewReceipt={handleStartNewReceipt}
      />
    </div>
  );
};
