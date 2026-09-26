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
  AlertOctagon,
  AlertTriangle,
  Building,
  MapPin
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Product } from '../../types/inventory';
import { DeliveryItem, DeliverySummaryData } from '../../types/delivery';
import { DeliveryItemRow } from './DeliveryItemRow';
import { DeliverySummary } from './DeliverySummary';
import { DeliveryValidationModal } from './DeliveryValidationModal';
import { ShipSuccessModal } from './ShipSuccessModal';
import { BarcodeScannerModal } from '../BarcodeScannerModal';
import { useAlerts } from '../../context/AlertContext';
import { calculateRemainingStock, validateDeliveryOrder } from '../../utils/deliveryCalculations';
import { playCriticalAlertSound, playWarningAlertSound, playScannerBeep } from '../../utils/audio';

interface DeliveryPageProps {
  products: Product[];
  onUpdateProducts: (updatedProducts: Product[]) => void;
}

export const DeliveryPage: React.FC<DeliveryPageProps> = ({
  products,
  onUpdateProducts,
}) => {
  const [deliveryId, setDeliveryId] = useState<string>('DEL-001');
  const [deliveryCounter, setDeliveryCounter] = useState<number>(1);
  const [customerName, setCustomerName] = useState<string>('Customer #1234 - Apex Logistics Inc');
  const [shippingAddress, setShippingAddress] = useState<string>('Bay 4, 100 Industrial Parkway');
  const [status, setStatus] = useState<'draft' | 'shipped'>('draft');
  const [deliveryItems, setDeliveryItems] = useState<DeliveryItem[]>([]);
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [completedSummary, setCompletedSummary] = useState<DeliverySummaryData | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<Array<{ product: Product; requested: number; available: number }>>([]);

  const { addAlert } = useAlerts();

  // Helper to resolve live product state
  const getLiveProduct = (productId: number) => {
    return products.find((p) => p.id === productId);
  };

  // Check if ANY item in current delivery has insufficient stock or invalid quantity
  const hasInsufficientStock = deliveryItems.some((it) => {
    const liveProd = getLiveProduct(it.product.id) || it.product;
    return it.quantity > liveProd.current_stock || it.quantity <= 0;
  });

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsScannerOpen(true);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!hasInsufficientStock && deliveryItems.length > 0 && !isSubmitting) {
          handleShipOrder();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deliveryItems, hasInsufficientStock, isSubmitting, products]);

  // Handle item scanned from BarcodeScannerModal (STRICT ZERO-STOCK VALIDATION FIRST)
  const handleScanProduct = (scannedProduct: Product) => {
    const liveProduct = products.find((p) => p.id === scannedProduct.id) || scannedProduct;

    // 1. Cannot scan items that are out of stock (current_stock = 0)
    if (liveProduct.current_stock <= 0) {
      playCriticalAlertSound();
      addAlert({
        type: 'critical',
        title: 'OUT OF STOCK: CANNOT SHIP',
        message: `❌ Cannot ship ${liveProduct.name}. 0 units available in warehouse.`,
        productName: liveProduct.name,
      });
      return;
    }

    setDeliveryItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.product.id === liveProduct.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + 1;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          product: liveProduct,
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            id: `DEL-ITEM-${Date.now()}-${liveProduct.id}`,
            product: liveProduct,
            quantity: 1,
          },
        ];
      }
    });
  };

  // Adjust quantity immediately on user input
  const handleQuantityChange = (productId: number, newQty: number) => {
    setDeliveryItems((prev) =>
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
    setDeliveryItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // Cancel delivery
  const handleCancelDelivery = () => {
    if (window.confirm('Are you sure you want to clear this draft delivery?')) {
      setDeliveryItems([]);
      setStatus('draft');
    }
  };

  // Prepopulate Demo Valid Delivery Scenario
  const handleLoadDemoDelivery = () => {
    const steelRods = products.find((p) => p.sku === 'SR001') || products[0];
    const officeChairs = products.find((p) => p.sku === 'CH003') || products[2];
    const workbenches = products.find((p) => p.sku === 'TB004') || products[3];

    // Safe quantity allocations based on current stock (e.g. 50, 15, 10)
    setDeliveryItems([
      { id: `DEL-DEMO-1`, product: steelRods, quantity: Math.min(50, Math.max(1, steelRods.current_stock)) },
      { id: `DEL-DEMO-2`, product: officeChairs, quantity: Math.min(15, Math.max(1, officeChairs.current_stock)) },
      { id: `DEL-DEMO-3`, product: workbenches, quantity: Math.min(10, Math.max(1, workbenches.current_stock)) },
    ]);
    setStatus('draft');
  };

  // Prepopulate Demo Invalid (Insufficient Stock) Delivery Scenario to show validation
  const handleLoadInvalidDemo = () => {
    const steelRods = products.find((p) => p.sku === 'SR001') || products[0];
    const officeChairs = products.find((p) => p.sku === 'CH003') || products[2];

    setDeliveryItems([
      { id: `DEL-INV-1`, product: officeChairs, quantity: officeChairs.current_stock + 30 }, // Exceeds available
      { id: `DEL-INV-2`, product: steelRods, quantity: steelRods.current_stock + 35 }, // Exceeds available
    ]);
    setStatus('draft');

    playWarningAlertSound();
    addAlert({
      type: 'warning',
      title: 'Invalid Delivery Demo Loaded',
      message: 'Notice red error highlights and disabled Ship button due to insufficient stock.',
    });
  };

  // Ship Order Workflow with Strict Pre-flight Validation
  const handleShipOrder = () => {
    // 1. Pre-flight validation against live products
    const validation = validateDeliveryOrder(deliveryItems, products);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      setIsErrorModalOpen(true);
      playCriticalAlertSound();
      
      const specificErrorDetails = validation.errors
        .map((e) => `${e.product.name} (Need ${e.requested}, only ${e.available} available)`)
        .join('; ');

      addAlert({
        type: 'critical',
        title: 'SHIPMENT BLOCKED: INSUFFICIENT STOCK',
        message: `Order cannot be shipped due to stock deficits: ${specificErrorDetails}`,
      });
      return;
    }

    setIsSubmitting(true);

    // 800ms processing delay simulation
    setTimeout(() => {
      // 1. Calculate and update global stock state (DEDUCTING quantities)
      const updatedProductsList = products.map((prod) => {
        const itemShipped = deliveryItems.find((it) => it.product.id === prod.id);
        if (itemShipped) {
          const newQty = Math.max(0, prod.current_stock - itemShipped.quantity);
          return {
            ...prod,
            current_stock: newQty,
            lastUpdated: 'Just now (Shipped Out)',
          };
        }
        return prod;
      });

      // Commit to parent state immediately
      onUpdateProducts(updatedProductsList);

      // 2. Trigger contextual alerts ONLY AFTER SUCCESSFUL SHIPMENT
      deliveryItems.forEach((it) => {
        const liveProd = products.find((p) => p.id === it.product.id) || it.product;
        const remainingStock = liveProd.current_stock - it.quantity;

        if (remainingStock === 0) {
          addAlert({
            type: 'critical',
            title: `OUT OF STOCK: ${liveProd.name}`,
            message: `🚨 ${liveProd.name} is now completely out of stock (0 units remaining) after shipment ${deliveryId}.`,
            productName: liveProd.name,
          });
        } else if (remainingStock < liveProd.min_stock) {
          addAlert({
            type: 'warning',
            title: `Low Stock Alert: ${liveProd.name}`,
            message: `⚠️ ${liveProd.name} dropped to ${remainingStock}/${liveProd.min_stock} units remaining after shipment ${deliveryId}.`,
            productName: liveProd.name,
          });
        }
      });

      const totalUnits = deliveryItems.reduce((s, it) => s + it.quantity, 0);

      // 3. Dispatch Delivery Success Alert
      addAlert({
        type: 'info',
        title: `Delivery Dispatched: ${deliveryId}`,
        message: `🚚 Dispatched ${totalUnits} units across ${deliveryItems.length} products to ${customerName}.`,
      });

      // 4. Create summary record
      const summary: DeliverySummaryData = {
        id: deliveryId,
        type: 'delivery',
        status: 'shipped',
        customer: customerName,
        shippingAddress: shippingAddress,
        items: [...deliveryItems],
        total_products: deliveryItems.length,
        total_units: totalUnits,
        timestamp: new Date(),
      };

      setCompletedSummary(summary);
      setStatus('shipped');
      setIsSubmitting(false);

      // 5. Open Success Modal & Play Confetti
      setIsSuccessModalOpen(true);
      playScannerBeep();

      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.5, x: 0.5 },
          zIndex: 99999,
          colors: ['#3B82F6', '#60A5FA', '#93C5FD', '#10B981', '#8B5CF6'],
        });
      } catch {
        // safe fallback
      }
    }, 800);
  };


  // Start fresh new delivery order
  const handleStartNewDelivery = () => {
    const nextNum = deliveryCounter + 1;
    setDeliveryCounter(nextNum);
    setDeliveryId(`DEL-${String(nextNum).padStart(3, '0')}`);
    setDeliveryItems([]);
    setStatus('draft');
    setIsSuccessModalOpen(false);
  };

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="space-y-6">
      {/* SECTION A: TOP ACTIONS & DELIVERY HEADER */}
      <section className="rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-blue-500/25 p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Titles */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🚚</span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                New Delivery - Outgoing Stock
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Scan items to dispatch and ship to customers. Strictly verifies inventory availability before dispatch.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={handleLoadDemoDelivery}
              className="px-3.5 py-2.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm hover:scale-105 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Load Valid Delivery</span>
            </button>

            <button
              type="button"
              onClick={handleLoadInvalidDemo}
              className="px-3.5 py-2.5 rounded-xl bg-red-950/50 hover:bg-red-900/50 border border-red-500/40 text-red-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Test insufficient stock error handling"
            >
              <AlertOctagon className="w-3.5 h-3.5 text-red-400" />
              <span>Load Invalid Demo</span>
            </button>

            <button
              type="button"
              onClick={() => setIsScannerOpen(true)}
              className={`relative group px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-[0_0_25px_rgba(59,130,246,0.5)] hover:shadow-[0_0_35px_rgba(59,130,246,0.8)] flex items-center gap-2.5 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer ${
                deliveryItems.length === 0 ? 'animate-bounce' : ''
              }`}
            >
              <Scan className="w-5 h-5 text-blue-200" />
              <span>Scan Item to Ship</span>
              <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 rounded bg-blue-900/60 text-[10px] font-mono border border-blue-400/30">
                Ctrl+K
              </kbd>
            </button>
          </div>
        </div>

        {/* Delivery Metadata Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {/* Delivery ID */}
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Delivery Reference
            </span>
            <div className="text-lg font-mono font-black text-blue-400 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              {deliveryId}
            </div>
          </div>

          {/* Date */}
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Dispatch Date
            </span>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              {todayFormatted}
            </div>
          </div>

          {/* Status Badge */}
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 flex flex-col justify-center">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Order Status
            </span>
            <div>
              {status === 'draft' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  Draft (Preparing)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                  <Truck className="w-3.5 h-3.5" />
                  Shipped
                </span>
              )}
            </div>
          </div>

          {/* Customer Field */}
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Destination Customer
            </span>
            <div className="flex items-center gap-1.5">
              <Building className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Customer Name"
                className="w-full bg-transparent text-xs font-bold text-slate-200 focus:outline-none focus:text-white border-b border-slate-700 focus:border-blue-500 py-0.5"
              />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION B: ITEMS TO SHIP TABLE */}
      <section className="rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl overflow-hidden backdrop-blur-xl">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-white tracking-wide">
              Items to Ship ({deliveryItems.length})
            </h3>
          </div>
          
          {hasInsufficientStock ? (
            <span className="text-xs font-mono font-bold bg-red-500/20 text-red-300 px-3 py-0.5 rounded-full border border-red-500/40 flex items-center gap-1.5 animate-pulse">
              <AlertOctagon className="w-3 h-3" /> Insufficient Stock Detected
            </span>
          ) : (
            <span className="text-xs font-mono font-bold bg-blue-500/10 text-blue-300 px-3 py-0.5 rounded-full border border-blue-500/20">
              {deliveryItems.length} Products Added
            </span>
          )}
        </div>

        {deliveryItems.length === 0 ? (
          /* Empty State */
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4 shadow-inner">
              <Truck className="w-8 h-8 animate-pulse" />
            </div>
            <h4 className="text-base font-bold text-white">No items added yet</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Click &quot;Scan Item to Ship&quot; to scan items for customer delivery, or click &quot;Load Valid Delivery&quot; to test.
            </p>
            <button
              type="button"
              onClick={() => setIsScannerOpen(true)}
              className="mt-5 px-5 py-2.5 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/50 text-blue-200 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Scan className="w-4 h-4" />
              Scan Item to Ship
            </button>
          </div>
        ) : (
          /* Animated Table View */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 text-slate-400 font-mono uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Product</th>
                  <th className="py-3.5 px-4 sm:px-6">Quantity to Ship</th>
                  <th className="py-3.5 px-4 sm:px-6">Available Stock</th>
                  <th className="py-3.5 px-4 sm:px-6">Remaining Stock (Live)</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                <AnimatePresence mode="popLayout">
                  {deliveryItems.map((item) => (
                    <DeliveryItemRow
                      key={item.id}
                      item={item}
                      liveProduct={getLiveProduct(item.product.id)}
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
      {deliveryItems.length > 0 && (
        <section>
          <DeliverySummary
            items={deliveryItems}
            isSubmitting={isSubmitting}
            hasInsufficientStock={hasInsufficientStock}
            onCancelDelivery={handleCancelDelivery}
            onShipOrder={handleShipOrder}
          />
        </section>
      )}

      {/* Barcode Scanner Modal Integration */}
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleScanProduct}
        products={products}
      />

      {/* Validation Error Modal */}
      <DeliveryValidationModal
        isOpen={isErrorModalOpen}
        errors={validationErrors}
        onClose={() => setIsErrorModalOpen(false)}
      />

      {/* Ship Success Modal */}
      <ShipSuccessModal
        isOpen={isSuccessModalOpen}
        deliveryData={completedSummary}
        onClose={() => setIsSuccessModalOpen(false)}
        onStartNewDelivery={handleStartNewDelivery}
      />
    </div>
  );
};
