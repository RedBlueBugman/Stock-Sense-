import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Scan, Zap, Sparkles, Volume2 } from 'lucide-react';
import { Product } from '../types/inventory';
import { MOCK_PRODUCTS } from '../data/mockProducts';
import { playScannerBeep } from '../utils/audio';
import { QRCodeDisplay } from './QRCodeDisplay';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (product: Product) => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onScan,
}) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isScanningSuccess, setIsScanningSuccess] = useState<boolean>(false);
  const [activeRippleId, setActiveRippleId] = useState<number | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Reset internal states whenever modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedProduct(null);
      setIsScanningSuccess(false);
      setActiveRippleId(null);
      // Accessibility: Focus trap initial focus
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Accessibility: Handle Escape key press
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

  // Handle clicking on a QR code card simulation
  const handleProductSelect = (product: Product) => {
    if (isScanningSuccess) return; // Prevent double trigger during animation

    setSelectedProduct(product);
    setIsScanningSuccess(true);
    setActiveRippleId(product.id);

    // 1. Play realistic industrial scanner beep sound
    playScannerBeep();

    // 2. Callback and modal closure after 800ms
    setTimeout(() => {
      onScan(product);
      setIsScanningSuccess(false);
      setSelectedProduct(null);
      onClose();
    }, 800);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="scanner-modal-title"
        >
          {/* Dark Backdrop with Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal Container */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-xl bg-slate-900/95 border border-purple-500/30 rounded-2xl shadow-[0_20px_60px_-15px_rgba(139,92,246,0.3)] backdrop-blur-xl overflow-hidden z-10 my-auto text-slate-100"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking modal body
          >
            {/* Ambient Background Gradient Glows */}
            <div className="absolute -top-32 -left-32 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/60">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Scan className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h2 id="scanner-modal-title" className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
                    StockSense Optical Scanner
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      LIVE SIMULATION
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">Aim target at physical barcode or select sample item below</p>
                </div>
              </div>

              {/* Close Button */}
              <button
                ref={closeButtonRef}
                onClick={onClose}
                aria-label="Close scanner modal"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800/80 border border-transparent hover:border-slate-700 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* SECTION A: SCANNER VIEWFINDER */}
              <div className="flex flex-col items-center">
                <div className="relative w-full max-w-[420px] h-[240px] sm:h-[260px] rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-950/90 via-purple-950/80 to-slate-950 border-2 border-purple-500/40 shadow-[0_0_35px_rgba(139,92,246,0.35)] flex items-center justify-center">
                  
                  {/* Subtle Radar Background Grid */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#8b5cf610_1px,transparent_1px),linear-gradient(to_bottom,#8b5cf610_1px,transparent_1px)] bg-[size:20px_20px]" />

                  {/* High-tech Viewfinder Corner Brackets */}
                  <div className="absolute top-4 left-4 w-7 h-7 border-t-2 border-l-2 border-purple-400 rounded-tl-md shadow-[0_0_8px_#a855f7]" />
                  <div className="absolute top-4 right-4 w-7 h-7 border-t-2 border-r-2 border-purple-400 rounded-tr-md shadow-[0_0_8px_#a855f7]" />
                  <div className="absolute bottom-4 left-4 w-7 h-7 border-b-2 border-l-2 border-purple-400 rounded-bl-md shadow-[0_0_8px_#a855f7]" />
                  <div className="absolute bottom-4 right-4 w-7 h-7 border-b-2 border-r-2 border-purple-400 rounded-br-md shadow-[0_0_8px_#a855f7]" />

                  {/* Center Target Reticle */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-28 h-28 border border-purple-500/30 rounded-xl flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-purple-400 animate-ping opacity-75" />
                    </div>
                  </div>

                  {/* Continuous Scanning Laser Line Animation (2s Loop) */}
                  {!isScanningSuccess && (
                    <motion.div
                      className="absolute left-3 right-3 h-[3px] bg-gradient-to-r from-transparent via-cyan-400 via-purple-300 to-transparent shadow-[0_0_15px_#c084fc,0_0_25px_#818cf8]"
                      animate={{
                        top: ['12%', '88%', '12%'],
                        opacity: [0.8, 1, 0.8],
                      }}
                      transition={{
                        duration: 2.0,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    >
                      {/* Laser Beam Glow Flare */}
                      <div className="absolute inset-0 bg-purple-400/50 blur-sm" />
                    </motion.div>
                  )}

                  {/* Success Green Flash Animation & Checkmark Icon */}
                  <AnimatePresence>
                    {isScanningSuccess && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 bg-emerald-500/30 backdrop-blur-sm border-2 border-emerald-400 flex flex-col items-center justify-center z-20"
                      >
                        {/* Glowing Success Icon */}
                        <motion.div
                          initial={{ scale: 0, rotate: -45 }}
                          animate={{ scale: [0, 1.2, 1], rotate: 0 }}
                          transition={{ duration: 0.35, ease: 'easeOut' }}
                          className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.8)]"
                        >
                          <Check className="w-10 h-10 stroke-[3]" />
                        </motion.div>

                        {/* Scanned Feedback Name */}
                        {selectedProduct && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="mt-3 text-center"
                          >
                            <span className="inline-block px-3 py-1 rounded-full bg-slate-900/90 text-emerald-300 text-xs font-mono font-bold tracking-wider border border-emerald-500/50 shadow-lg">
                              DECODED: {selectedProduct.sku} ({selectedProduct.name})
                            </span>
                          </motion.div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* HUD Status Bar in Viewfinder */}
                  <div className="absolute bottom-2.5 left-4 right-4 flex items-center justify-between text-[11px] font-mono text-purple-300/80 pointer-events-none">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      SENSOR READY
                    </span>
                    <span className="text-[10px] text-purple-400/60">FPS: 60 | 4K-OPTICAL</span>
                  </div>
                </div>

                {/* Text below viewfinder */}
                <p className="mt-3 text-xs font-medium text-purple-300/90 flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-purple-400" />
                  <span>Point camera at barcode or tap a simulated product below to test:</span>
                </p>
              </div>

              {/* SECTION B: QR CODE SELECTION AREA (2x2 Grid) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    Simulated Inventory QR Tags
                  </span>
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Volume2 className="w-3 h-3 text-slate-400" />
                    Audio &amp; Haptic Enabled
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-3.5">
                  {MOCK_PRODUCTS.map((product) => {
                    const isSelected = selectedProduct?.id === product.id;
                    const isRippleActive = activeRippleId === product.id;

                    return (
                      <motion.button
                        key={product.id}
                        type="button"
                        whileHover={{ scale: 1.02, translateY: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleProductSelect(product)}
                        disabled={isScanningSuccess}
                        className={`group relative flex flex-col items-center p-3 rounded-xl border text-left transition-all duration-200 overflow-hidden cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          isSelected
                            ? 'bg-purple-900/50 border-purple-400 shadow-[0_0_20px_rgba(139,92,246,0.6)]'
                            : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/80 hover:border-purple-500/50 hover:shadow-[0_8px_20px_rgba(139,92,246,0.2)]'
                        }`}
                      >
                        {/* Ripple Effect Animation */}
                        {isRippleActive && (
                          <motion.span
                            initial={{ scale: 0, opacity: 0.7 }}
                            animate={{ scale: 3, opacity: 0 }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                            className="absolute inset-0 m-auto w-24 h-24 bg-purple-400/40 rounded-full pointer-events-none"
                          />
                        )}

                        {/* Top: 100px x 100px QR Code Image + Product Emoji Overlay */}
                        <div className="relative mb-2.5">
                          <QRCodeDisplay sku={product.sku} size={100} />

                          {/* Product Emoji Icon Badge */}
                          <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-slate-900 border border-purple-500/40 rounded-full flex items-center justify-center text-sm shadow-md group-hover:scale-110 transition-transform">
                            {product.emoji}
                          </div>
                        </div>

                        {/* Product Info */}
                        <div className="w-full text-center mt-1">
                          <div className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-purple-300 transition-colors">
                            {product.name}
                          </div>
                          <div className="text-[11px] font-mono text-purple-400 font-semibold tracking-wider mt-0.5">
                            {product.sku}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5 flex items-center justify-center gap-1">
                            <span>Stock:</span>
                            <span className={`font-semibold ${product.current_stock <= product.min_stock ? 'text-amber-400' : 'text-emerald-400'}`}>
                              {product.current_stock}
                            </span>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer with quick instructions */}
            <div className="px-6 py-3 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-mono">ESC</kbd> to exit
              </span>
              <span className="text-[11px] text-slate-500">StockSense Core v2.4</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
