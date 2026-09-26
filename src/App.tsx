import React, { useState, useEffect, useRef } from 'react';
import { 
  Scan, 
  Package, 
  Boxes, 
  Sparkles, 
  Volume2, 
  RefreshCw, 
  QrCode, 
  Activity, 
  FilePlus, 
  Truck,
  LayoutDashboard,
  CheckCircle2,
  Bell,
  Printer,
  FileDown,
  ArrowRight,
  Plus
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Product, ScanRecord } from './types/inventory';
import { MOCK_PRODUCTS } from './data/mockProducts';
import { BarcodeScannerModal } from './components/BarcodeScannerModal';
import { ScannedProductCard } from './components/ScannedProductCard';
import { InventoryStats } from './components/InventoryStats';
import { RecentScansTable } from './components/RecentScansTable';
import { AlertBell } from './components/AlertBell';
import { AlertToastContainer } from './components/AlertToastContainer';
import { StockAlertTestPanel } from './components/StockAlertTestPanel';
import { ReceiptPage } from './components/receipt/ReceiptPage';
import { DeliveryPage } from './components/delivery/DeliveryPage';
import { PrintableQRModal } from './components/PrintableQRModal';
import { AddProductModal } from './components/AddProductModal';
import { AlertProvider, useAlerts } from './context/AlertContext';
import { playScannerBeep } from './utils/audio';

const UnifiedDashboardContent: React.FC = () => {
  const [activeWorkflowTab, setActiveWorkflowTab] = useState<'receipt' | 'delivery' | 'all'>('all');
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [isQRDocModalOpen, setIsQRDocModalOpen] = useState<boolean>(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState<boolean>(false);
  const [activeScannedProduct, setActiveScannedProduct] = useState<Product | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanRecord[]>([]);

  const { checkProductStockAlert, addAlert } = useAlerts();

  // Keyboard shortcut: Press 'S' to open scanner, 'P' to open QR sheet
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if ((e.key === 's' || e.key === 'S') && !isScannerOpen) {
        e.preventDefault();
        setIsScannerOpen(true);
      }
      if ((e.key === 'p' || e.key === 'P') && !isQRDocModalOpen) {
        e.preventDefault();
        setIsQRDocModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isScannerOpen, isQRDocModalOpen]);

  // Handle successful optical scan
  const handleScanSuccess = (scannedProduct: Product) => {
    const currentProductState = products.find((p) => p.id === scannedProduct.id) || scannedProduct;
    setActiveScannedProduct(currentProductState);

    // Add to scan audit log
    const newRecord: ScanRecord = {
      id: `SCAN-${Date.now()}`,
      product: currentProductState,
      timestamp: new Date(),
      status: currentProductState.current_stock === 0 ? 'alert' : currentProductState.current_stock < currentProductState.min_stock ? 'warning' : 'success',
      scanType: 'AUDIT',
    };
    setScanHistory((prev) => [newRecord, ...prev]);

    // Trigger dynamic stock alert check
    checkProductStockAlert(currentProductState);

    // Confetti celebration
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
        zIndex: 99999,
        colors: ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B'],
      });
    } catch {
      // safe fallback
    }
  };

  // Adjust stock count (+1 or -1) with real-time alert evaluation
  const handleStockChange = (productId: number, delta: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const newStock = Math.max(0, p.current_stock + delta);
          const updated: Product = {
            ...p,
            current_stock: newStock,
            lastUpdated: 'Just now',
          };
          
          if (activeScannedProduct?.id === productId) {
            setActiveScannedProduct(updated);
          }

          // Trigger dynamic alerts on transitions
          if (newStock === 0 && p.current_stock > 0) {
            addAlert({
              type: 'critical',
              title: 'OUT OF STOCK',
              message: `${p.name} stock reached 0 after dispatch operation.`,
              productName: p.name,
            });
          } else if (newStock < p.min_stock && p.current_stock >= p.min_stock) {
            addAlert({
              type: 'warning',
              title: 'Low Stock Warning',
              message: `${p.name} dropped below minimum threshold (${newStock}/${p.min_stock} units).`,
              productName: p.name,
            });
          }

          return updated;
        }
        return p;
      })
    );
  };

  // Reset to default sample
  const handleResetData = () => {
    setProducts(MOCK_PRODUCTS);
    setActiveScannedProduct(null);
    setScanHistory([]);
  };

  // Add a new product to the live inventory
  const handleAddProduct = (newProduct: Product) => {
    setProducts((prev) => [...prev, newProduct]);
    addAlert({
      type: 'info',
      title: `Item Added: ${newProduct.name}`,
      message: `${newProduct.name} (${newProduct.sku}) has been registered with ${newProduct.current_stock} units. QR code generated.`,
      productName: newProduct.name,
    });
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col selection:bg-purple-600 selection:text-white pb-20">
      {/* Toast Notifications Floating Stack */}
      <AlertToastContainer />

      {/* Top Warehouse Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-blue-500 p-0.5 shadow-[0_0_20px_rgba(139,92,246,0.6)]">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-purple-400">
                  <Scan className="w-5 h-5 text-purple-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                    Stock<span className="text-purple-400">Sense</span>
                  </h1>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                    COMPLETE SUITE
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block">Receipts • Deliveries • Optical Scanner • Alert Gateway</p>
              </div>
            </div>

            {/* Workflow Navigation Tabs */}
            <nav className="hidden lg:flex items-center bg-slate-900/90 border border-slate-800 rounded-xl p-1 ml-4 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveWorkflowTab('all')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeWorkflowTab === 'all'
                    ? 'bg-slate-700 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>All Workflows (Unified)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveWorkflowTab('receipt')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeWorkflowTab === 'receipt'
                    ? 'bg-purple-600 text-white shadow'
                    : 'text-slate-400 hover:text-purple-300'
                }`}
              >
                <FilePlus className="w-3.5 h-3.5 text-purple-300" />
                <span>Inbound Receipts</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveWorkflowTab('delivery')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeWorkflowTab === 'delivery'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-blue-300'
                }`}
              >
                <Truck className="w-3.5 h-3.5 text-blue-300" />
                <span>Outgoing Deliveries</span>
              </button>
            </nav>
          </div>

          {/* Top Actions & QR Sheet */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* View/Print QR Tags Document Button */}
            <button
              type="button"
              onClick={() => setIsQRDocModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 border border-purple-500/40 text-purple-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
              title="Open Printable 4 QR Tags Document"
            >
              <QrCode className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden md:inline">Print/View 4 QR Tags</span>
            </button>

            {/* Notification Bell with Badge & Dropdown */}
            <AlertBell />

            <button
              onClick={() => playScannerBeep()}
              title="Test scanner beep sound"
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 hover:border-purple-500 text-slate-300 hover:text-white text-xs font-medium hidden sm:flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5 text-purple-400" />
              <span>Beep</span>
            </button>

            <button
              onClick={handleResetData}
              title="Reset inventory state"
              className="p-2 rounded-lg bg-slate-900 border border-slate-700/80 hover:border-slate-600 text-slate-400 hover:text-slate-200 text-xs transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            {/* Prominent Scan Barcode Button */}
            <button
              onClick={() => setIsScannerOpen(true)}
              className="relative group px-4 sm:px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold shadow-[0_0_25px_rgba(139,92,246,0.45)] hover:shadow-[0_0_30px_rgba(139,92,246,0.75)] flex items-center gap-2 transition-all transform active:scale-95 cursor-pointer"
            >
              <Scan className="w-4 h-4 animate-pulse text-purple-200" />
              <span>Scan Barcode</span>
              <kbd className="hidden lg:inline-block ml-1 px-1.5 py-0.5 rounded bg-purple-900/70 text-[10px] font-mono border border-purple-400/30">
                S
              </kbd>
            </button>
          </div>
        </div>

        {/* Mobile Workflow Filter Tabs */}
        <div className="flex lg:hidden border-t border-slate-800 bg-slate-950 px-4 py-2 gap-2 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveWorkflowTab('all')}
            className={`flex-1 py-1.5 rounded-lg text-center ${
              activeWorkflowTab === 'all' ? 'bg-slate-700 text-white' : 'text-slate-400 bg-slate-900'
            }`}
          >
            All Unified
          </button>
          <button
            type="button"
            onClick={() => setActiveWorkflowTab('receipt')}
            className={`flex-1 py-1.5 rounded-lg text-center ${
              activeWorkflowTab === 'receipt' ? 'bg-purple-600 text-white' : 'text-slate-400 bg-slate-900'
            }`}
          >
            📦 Inbound
          </button>
          <button
            type="button"
            onClick={() => setActiveWorkflowTab('delivery')}
            className={`flex-1 py-1.5 rounded-lg text-center ${
              activeWorkflowTab === 'delivery' ? 'bg-blue-600 text-white' : 'text-slate-400 bg-slate-900'
            }`}
          >
            🚚 Outbound
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-12 flex-1 w-full">
        
        {/* TOP KPI OVERVIEW */}
        <section>
          <InventoryStats products={products} scanRecords={scanHistory} />
        </section>

        {/* WORKFLOW 1: INBOUND RECEIPT CREATION (PURPLE THEME) */}
        {(activeWorkflowTab === 'all' || activeWorkflowTab === 'receipt') && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-purple-500 shadow-[0_0_8px_#a855f7]" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-purple-400">
                  Vendor Inbound Processing
                </h3>
              </div>
            </div>
            <ReceiptPage
              products={products}
              onUpdateProducts={(updated) => setProducts(updated)}
            />
          </section>
        )}

        {/* WORKFLOW 2: OUTGOING DELIVERY CREATION (BLUE THEME WITH STRICT STOCK VALIDATION) */}
        {(activeWorkflowTab === 'all' || activeWorkflowTab === 'delivery') && (
          <section className="space-y-4 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-blue-400">
                  Customer Outbound Dispatch &amp; Stock Verification
                </h3>
              </div>
            </div>
            <DeliveryPage
              products={products}
              onUpdateProducts={(updated) => setProducts(updated)}
            />
          </section>
        )}

        {/* WORKFLOW 3: LIVE WAREHOUSE CATALOG & STOCK OPERATIONS */}
        <section className="space-y-4 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Boxes className="w-5 h-5 text-purple-400" />
              <h3 className="text-xl font-extrabold text-white tracking-tight">
                Live Warehouse Physical Inventory
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAddProductModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/35 border border-emerald-500/40 text-emerald-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer hover:scale-105 active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
              <button
                type="button"
                onClick={() => setIsQRDocModalOpen(true)}
                className="text-xs text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print All QR Codes</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {products.map((item) => {
              const isZero = item.current_stock === 0;
              const isLow = item.current_stock < item.min_stock;
              const isCurrentlySelected = activeScannedProduct?.id === item.id;

              return (
                <div
                  key={item.id}
                  className={`p-5 rounded-2xl border transition-all duration-200 relative group overflow-hidden ${
                    isCurrentlySelected
                      ? 'bg-slate-800/95 border-purple-500 shadow-[0_0_25px_rgba(139,92,246,0.35)]'
                      : isZero
                      ? 'bg-slate-900/90 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)] hover:border-red-400'
                      : 'bg-slate-900/70 border-slate-800 hover:border-purple-500/50 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-2xl">
                      {item.emoji}
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                      isZero
                        ? 'bg-red-500/20 text-red-300 border-red-500/40'
                        : isLow
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                    }`}>
                      {item.sku}
                    </span>
                  </div>

                  <div className="mt-4">
                    <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                      {item.name}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">{item.category}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-500 text-[11px]">Stock: </span>
                      <span className={`font-mono font-bold ${isZero ? 'text-red-400 font-black' : isLow ? 'text-amber-400 font-black' : 'text-emerald-400'}`}>
                        {item.current_stock}
                      </span>
                      <span className="text-slate-500 text-[10px]"> / {item.min_stock} min</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          handleScanSuccess(item);
                          playScannerBeep();
                        }}
                        className="px-2.5 py-1 rounded-lg bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 hover:text-white text-[11px] font-semibold border border-purple-500/30 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Scan className="w-3 h-3" /> Audit Scan
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* WORKFLOW 4: SCANNED PRODUCT INSPECTION */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-purple-400" />
              <h3 className="text-xl font-extrabold text-white tracking-tight">
                Optical Item Inspection &amp; Direct Stock Movement
              </h3>
            </div>
            {activeScannedProduct && (
              <span className="text-xs text-purple-300 font-mono">
                Active SKU: {activeScannedProduct.sku}
              </span>
            )}
          </div>

          {activeScannedProduct ? (
            <ScannedProductCard
              product={activeScannedProduct}
              onStockChange={handleStockChange}
              onRescanRequest={() => setIsScannerOpen(true)}
            />
          ) : (
            <div className="rounded-3xl border-2 border-dashed border-slate-800 bg-slate-900/40 p-8 text-center flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3 shadow-inner">
                <QrCode className="w-7 h-7 animate-pulse" />
              </div>
              <h4 className="text-sm font-bold text-white">No Item Selected for Direct Inspection</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-md">
                Hold any QR code in front of your camera or click &quot;Audit Scan&quot; on any catalog item to inspect bin location and adjustments.
              </p>
              <button
                onClick={() => setIsScannerOpen(true)}
                className="mt-4 px-4 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/50 text-purple-200 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Scan className="w-4 h-4" />
                Launch Optical Viewfinder
              </button>
            </div>
          )}
        </section>

        {/* WORKFLOW 5: AUTOMATED THRESHOLD AUDIT & ALERT GENERATOR */}
        <section className="space-y-4">
          <StockAlertTestPanel
            products={products}
            onInspectProduct={(prod) => setActiveScannedProduct(prod)}
          />
        </section>

        {/* WORKFLOW 6: LIVE SCAN AUDIT EVENT STREAM */}
        <section className="space-y-4">
          <RecentScansTable
            records={scanHistory}
            onSelectProduct={(product) => setActiveScannedProduct(product)}
          />
        </section>

      </main>

      {/* FOOTER */}
      <footer className="mt-16 border-t border-slate-800/80 bg-slate-950/70 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>StockSense Warehouse Systems • Inbound Receipts, Outbound Deliveries &amp; Alert Gateway</span>
          </div>
          <p className="text-[11px] text-slate-600">Built for Odoo Hackathon Demo • React, Tailwind CSS, Framer Motion &amp; Web Audio API</p>
        </div>
      </footer>

      {/* LIVE CAMERA BARCODE SCANNER MODAL */}
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleScanSuccess}
        products={products}
      />

      {/* PRINTABLE / DISPLAYABLE 4 QR TAGS DOCUMENT MODAL */}
      <PrintableQRModal
        isOpen={isQRDocModalOpen}
        onClose={() => setIsQRDocModalOpen(false)}
        products={products}
      />

      {/* ADD NEW PRODUCT MODAL */}
      <AddProductModal
        isOpen={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
        onAddProduct={handleAddProduct}
        existingProductsCount={products.length}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AlertProvider>
      <UnifiedDashboardContent />
    </AlertProvider>
  );
};

export default App;
