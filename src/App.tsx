import React, { useState, useEffect } from 'react';
import { 
  Scan, 
  Package, 
  Boxes, 
  ShieldCheck, 
  Sparkles, 
  Volume2, 
  Layers, 
  RefreshCw,
  QrCode,
  ArrowRight,
  Terminal,
  Activity
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Product, ScanRecord } from './types/inventory';
import { MOCK_PRODUCTS } from './data/mockProducts';
import { BarcodeScannerModal } from './components/BarcodeScannerModal';
import { ScannedProductCard } from './components/ScannedProductCard';
import { InventoryStats } from './components/InventoryStats';
import { RecentScansTable } from './components/RecentScansTable';
import { playScannerBeep } from './utils/audio';

export const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [activeScannedProduct, setActiveScannedProduct] = useState<Product | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanRecord[]>([]);

  // Keyboard shortcut: Press 'S' to open scanner
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
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

  // Handle successful scan from BarcodeScannerModal
  const handleScanSuccess = (scannedItem: Product) => {
    // 1. Set as active scanned product for detailed view
    // Cross-reference with updated current stock
    const currentProductState = products.find((p) => p.id === scannedItem.id) || scannedItem;
    setActiveScannedProduct(currentProductState);

    // 2. Add to scan history
    const newRecord: ScanRecord = {
      id: `SCAN-${Date.now()}`,
      product: currentProductState,
      timestamp: new Date(),
      status: currentProductState.current_stock <= currentProductState.min_stock ? 'warning' : 'success',
      scanType: 'AUDIT',
    };
    setScanHistory((prev) => [newRecord, ...prev]);

    // 3. Subtle confetti celebration on scan
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#8B5CF6', '#A78BFA', '#34D399', '#60A5FA'],
      });
    } catch {
      // safe fallback
    }
  };

  // Adjust stock count (+1 or -1)
  const handleStockChange = (productId: number, delta: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const newStock = Math.max(0, p.current_stock + delta);
          const updated = {
            ...p,
            current_stock: newStock,
            lastUpdated: 'Just now',
          };
          if (activeScannedProduct?.id === productId) {
            setActiveScannedProduct(updated);
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

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col selection:bg-purple-600 selection:text-white pb-16">
      {/* Top Warehouse Navigation Bar */}
      <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 p-0.5 shadow-[0_0_15px_rgba(139,92,246,0.5)]">
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
                  WAREHOUSE EDGE v2.4
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Industrial Barcode &amp; RFID Scanner Engine</p>
            </div>
          </div>

          {/* Top Actions & Audio Test */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => playScannerBeep()}
              title="Test industrial beep sound"
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 hover:border-purple-500 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">Test Beep</span>
            </button>

            <button
              onClick={handleResetData}
              title="Reset inventory state"
              className="p-2 rounded-lg bg-slate-900 border border-slate-700/80 hover:border-slate-600 text-slate-400 hover:text-slate-200 text-xs transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            {/* Prominent Scan Barcode Button */}
            <button
              onClick={() => setIsScannerOpen(true)}
              className="relative group px-4 sm:px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:shadow-[0_0_25px_rgba(139,92,246,0.7)] flex items-center gap-2 transition-all transform active:scale-95 cursor-pointer"
            >
              <Scan className="w-4 h-4 animate-pulse text-purple-200" />
              <span>Scan Barcode</span>
              <kbd className="hidden md:inline-block ml-1 px-1.5 py-0.5 rounded bg-purple-900/60 text-[10px] font-mono border border-purple-400/30">
                S
              </kbd>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Dashboard */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8 flex-1 w-full">
        
        {/* Hero Banner with Quick Scan CTA */}
        <section className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border border-purple-500/20 p-6 sm:p-10 overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold">
                <Activity className="w-3.5 h-3.5 text-purple-400 animate-spin" />
                <span>Optical Scanner Ready • Sub-500ms Frame Detection</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Simulated Barcode Scanner for <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-300 to-purple-200">StockSense Warehouse</span>
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Test the realistic barcode viewfinder modal, real-time laser scanning animations, instant Web Audio scanner beeps, and rapid item verification for warehouse operations.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={() => setIsScannerOpen(true)}
                className="px-6 py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-[0_0_30px_rgba(139,92,246,0.5)] flex items-center justify-center gap-2.5 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                <Scan className="w-5 h-5 text-purple-200" />
                <span>Launch Scanner Modal</span>
              </button>
            </div>
          </div>
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
                Current Scanned Item Inspection
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
            <div className="rounded-2xl border-2 border-dashed border-slate-800 bg-slate-900/40 p-10 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4 shadow-inner">
                <QrCode className="w-8 h-8 animate-pulse" />
              </div>
              <h4 className="text-base font-bold text-white">No Item Scanned Yet</h4>
              <p className="text-xs text-slate-400 mt-1.5 max-w-md">
                Click &quot;Scan Barcode&quot; to open the optical viewfinder and select an item QR code to test instant barcode decoding.
              </p>
              <button
                onClick={() => setIsScannerOpen(true)}
                className="mt-5 px-5 py-2.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/50 text-purple-200 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
              >
                <Scan className="w-4 h-4" />
                Open Scanner Simulation
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
                Warehouse Catalog (Click Any Item to Scan Directly)
              </h3>
            </div>
            <span className="text-xs text-slate-400">4 Items Registered</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {products.map((item) => {
              const isLow = item.current_stock <= item.min_stock;
              const isCurrentlySelected = activeScannedProduct?.id === item.id;

              return (
                <div
                  key={item.id}
                  className={`p-5 rounded-2xl border transition-all duration-200 relative group overflow-hidden ${
                    isCurrentlySelected
                      ? 'bg-slate-800/90 border-purple-500 shadow-[0_0_20px_rgba(139,92,246,0.3)]'
                      : 'bg-slate-900/70 border-slate-800 hover:border-purple-500/50 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-2xl">
                      {item.emoji}
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
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
                      <span className={`font-mono font-bold ${isLow ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {item.current_stock}
                      </span>
                      <span className="text-slate-500 text-[10px]"> / {item.min_stock} min</span>
                    </div>

                    <button
                      onClick={() => {
                        handleScanSuccess(item);
                        playScannerBeep();
                      }}
                      className="px-2.5 py-1 rounded-lg bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 hover:text-white text-[11px] font-semibold border border-purple-500/30 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Scan className="w-3 h-3" /> Quick Scan
                    </button>
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
      <footer className="mt-16 border-t border-slate-800/80 bg-slate-950/60 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>StockSense Warehouse Systems • Barcode Optical Scanner Simulation</span>
          </div>
          <p className="text-[11px] text-slate-600">Built with React, Tailwind CSS, Framer Motion &amp; Web Audio API</p>
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

export default App;
