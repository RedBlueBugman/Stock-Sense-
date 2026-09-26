import React, { useState, useEffect } from 'react';
import { 
  Scan, 
  Package, 
  Boxes, 
  Sparkles, 
  Volume2, 
  RefreshCw, 
  QrCode, 
  Activity, 
  History, 
  CheckCircle2, 
  ArrowRight,
  Siren,
  AlertTriangle
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
import { AlertProvider, useAlerts } from './context/AlertContext';
import { playScannerBeep } from './utils/audio';

const DashboardContent: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [activeScannedProduct, setActiveScannedProduct] = useState<Product | null>(null);
  const [scannedProducts, setScannedProducts] = useState<Product[]>([]);
  const [scanHistory, setScanHistory] = useState<ScanRecord[]>([]);

  const { checkProductStockAlert, addAlert } = useAlerts();

  // Keyboard shortcut: Press 'S' to open scanner
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if ((e.key === 's' || e.key === 'S') && !isScannerOpen) {
        e.preventDefault();
        setIsScannerOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isScannerOpen]);

  // INTEGRATION WITH BARCODE SCANNER:
  // When barcode scanner returns a product:
  // 1. Add product to scanned list
  // 2. Set active inspected product
  // 3. Trigger alert check -> Toast appears -> Bell badge updates!
  const handleScanSuccess = (scannedProduct: Product) => {
    // Cross-reference with current inventory state
    const currentProductState = products.find((p) => p.id === scannedProduct.id) || scannedProduct;

    // 1. Add product to scanned list
    setScannedProducts((prev) => [currentProductState, ...prev]);
    setActiveScannedProduct(currentProductState);

    // 2. Add to scan audit log
    const newRecord: ScanRecord = {
      id: `SCAN-${Date.now()}`,
      product: currentProductState,
      timestamp: new Date(),
      status: currentProductState.current_stock === 0 ? 'alert' : currentProductState.current_stock < currentProductState.min_stock ? 'warning' : 'success',
      scanType: 'AUDIT',
    };
    setScanHistory((prev) => [newRecord, ...prev]);

    // 3. Trigger alert check (CRITICAL if 0, WARNING if low, INFO if optimal)
    checkProductStockAlert(currentProductState);

    // 4. Subtle celebratory visual feedback
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#8B5CF6', '#EC4899', '#34D399', '#60A5FA', '#EF4444'],
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

          // Trigger dynamic alerts on stock transitions
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
          } else if (delta > 0 && newStock === p.min_stock) {
            addAlert({
              type: 'info',
              title: 'Threshold Restored',
              message: `${p.name} inventory replenished to safe threshold (${newStock} units).`,
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
    setScannedProducts([]);
    setScanHistory([]);
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col selection:bg-purple-600 selection:text-white pb-16">
      {/* Toast Notifications Floating Container */}
      <AlertToastContainer />

      {/* Top Warehouse Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 p-0.5 shadow-[0_0_18px_rgba(139,92,246,0.6)]">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-purple-400">
                <Scan className="w-5 h-5 text-purple-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                  Stock<span className="text-purple-400">Sense</span>
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/30">
                  HACKATHON DEMO
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Optical Barcode Scanner &amp; Dynamic Alert Gateway</p>
            </div>
          </div>

          {/* Top Actions & Alerts Bell */}
          <div className="flex items-center gap-3">
            {/* Integrated Notification Bell with Unread Badge */}
            <AlertBell />

            <button
              onClick={() => playScannerBeep()}
              title="Test scanner beep sound"
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 hover:border-purple-500 text-slate-300 hover:text-white text-xs font-medium hidden sm:flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5 text-purple-400" />
              <span>Beep Test</span>
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
              <kbd className="hidden md:inline-block ml-1 px-1.5 py-0.5 rounded bg-purple-900/70 text-[10px] font-mono border border-purple-400/30">
                S
              </kbd>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Dashboard */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8 flex-1 w-full">
        
        {/* Dynamic Alert Test Control Panel */}
        <section>
          <StockAlertTestPanel
            products={products}
            onInspectProduct={(prod) => setActiveScannedProduct(prod)}
          />
        </section>

        {/* High-Level Inventory KPI Stats */}
        <section>
          <InventoryStats products={products} scanRecords={scanHistory} />
        </section>

        {/* Scanned Product Result Display Area */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-bold text-white tracking-wide">
                Current Scanned Item Inspection &amp; Stock Operations
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
              <h4 className="text-sm font-bold text-white">No Item Scanned Yet</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-md">
                Click &quot;Scan Barcode&quot; or tap any product card below to inspect real-time metrics and trigger integrated threshold alerts.
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

        {/* Available Products Inventory Cards Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Boxes className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-bold text-white tracking-wide">
                Warehouse Catalog &amp; Live Stock Operations
              </h3>
            </div>
            <span className="text-xs text-slate-400">4 Items Registered</span>
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

                  {/* Stock counter & Quick scan trigger */}
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
                        <Scan className="w-3 h-3" /> Scan
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Live Optical Scan Event Log */}
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
            <span>StockSense Warehouse Systems • Barcode Optical Scanner &amp; Dynamic Alert Gateway</span>
          </div>
          <p className="text-[11px] text-slate-600">Built with React Context API, Tailwind CSS, Framer Motion &amp; Web Audio API</p>
        </div>
      </footer>

      {/* THE BARCODE SCANNER MODAL COMPONENT */}
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleScanSuccess}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AlertProvider>
      <DashboardContent />
    </AlertProvider>
  );
};

export default App;
