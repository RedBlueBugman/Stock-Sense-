import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Printer, QrCode, Download, Eye, Sparkles, Check, FileDown, Layers } from 'lucide-react';
import { Product } from '../types/inventory';
import { MOCK_PRODUCTS } from '../data/mockProducts';
import { QRCodeDisplay } from './QRCodeDisplay';

interface PrintableQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  products?: Product[];
}

export const PrintableQRModal: React.FC<PrintableQRModalProps> = ({
  isOpen,
  onClose,
  products = MOCK_PRODUCTS,
}) => {
  const [selectedFullScreenProduct, setSelectedFullScreenProduct] = useState<Product | null>(null);

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="qr-document-title"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-4xl bg-slate-900 border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.8)] backdrop-blur-2xl z-10 my-auto text-slate-100 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-inner">
                <QrCode className="w-6 h-6" />
              </div>
              <div>
                <h3 id="qr-document-title" className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  Official StockSense QR Inventory Tags
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    4 DEMO CATEGORIES
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Print or show these 4 QR tags on your phone/screen in front of your webcam to test live camera scanning!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-[0_0_20px_rgba(139,92,246,0.4)] flex items-center gap-2 transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Save PDF Sheet</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Grid of 4 Scannable QR Tag Documents */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="p-5 rounded-2xl bg-white text-slate-900 border-2 border-slate-300 shadow-lg flex flex-col justify-between relative overflow-hidden group hover:border-purple-600 transition-all"
              >
                {/* Tag Header */}
                <div className="flex items-start justify-between border-b pb-3 border-slate-200">
                  <div className="flex items-center gap-2.5">
                    <span className="text-3xl">{product.emoji}</span>
                    <div>
                      <h4 className="font-extrabold text-base text-slate-900 leading-tight">
                        {product.name}
                      </h4>
                      <span className="text-xs font-mono font-bold text-purple-700">
                        {product.sku} • {product.barcode}
                      </span>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300 uppercase">
                    {product.category}
                  </span>
                </div>

                {/* QR Code Center & Details */}
                <div className="flex items-center justify-between gap-4 my-4">
                  <div className="flex-1 space-y-1.5 text-xs text-slate-600">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Storage Bin:</span>
                      <strong className="text-slate-900 font-mono">{product.location || 'Zone A - General'}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Lot Batch Number:</span>
                      <strong className="text-slate-800 font-mono">{product.batchNumber || 'LOT-2026'}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Reorder Minimum:</span>
                      <strong className="text-slate-900">{product.min_stock} units</strong>
                    </div>
                  </div>

                  {/* Standard Scannable Machine QR Code */}
                  <div className="flex-shrink-0 flex flex-col items-center">
                    <QRCodeDisplay sku={product.barcode || product.sku} size={130} />
                    <span className="text-[9px] font-mono text-slate-500 font-bold mt-1">
                      {product.barcode}
                    </span>
                  </div>
                </div>

                {/* Tag Footer & Action */}
                <div className="border-t pt-2.5 border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-mono font-semibold">STOCKSENSE COMPLIANT TAG</span>
                  <button
                    type="button"
                    onClick={() => setSelectedFullScreenProduct(product)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-purple-100 text-purple-700 font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Enlarge for Camera</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Instructions Box */}
          <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 flex items-start gap-3 text-xs text-purple-200">
            <Sparkles className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block">How to test Live Camera Scanning:</strong>
              1. Keep this QR sheet open on your phone or click <strong>&quot;Enlarge for Camera&quot;</strong>.<br />
              2. Click <strong>&quot;Scan Barcode&quot;</strong> to activate your webcam.<br />
              3. Hold the QR code up to your camera $\rightarrow$ StockSense will automatically decode it in sub-500ms, beep, flash green, and add it!
            </div>
          </div>
        </motion.div>

        {/* Full-Screen Individual QR Enlarged Viewer (For holding up to webcam) */}
        <AnimatePresence>
          {selectedFullScreenProduct && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-60 bg-black/95 flex flex-col items-center justify-center p-6 text-center"
              onClick={() => setSelectedFullScreenProduct(null)}
            >
              <div
                className="bg-white p-8 rounded-3xl text-slate-900 max-w-sm w-full shadow-2xl flex flex-col items-center border-4 border-purple-600"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="text-5xl mb-2">{selectedFullScreenProduct.emoji}</span>
                <h3 className="text-xl font-black text-slate-900">{selectedFullScreenProduct.name}</h3>
                <span className="text-xs font-mono font-bold text-purple-700 mt-0.5">
                  SKU: {selectedFullScreenProduct.sku} • ({selectedFullScreenProduct.barcode})
                </span>

                <div className="my-6 p-2 bg-white rounded-2xl shadow-inner border">
                  <QRCodeDisplay sku={selectedFullScreenProduct.barcode || selectedFullScreenProduct.sku} size={240} />
                </div>

                <p className="text-xs text-slate-500 font-medium">
                  Point your computer webcam at this screen now to test instant live detection!
                </p>

                <button
                  type="button"
                  onClick={() => setSelectedFullScreenProduct(null)}
                  className="mt-6 w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-sm transition-colors cursor-pointer"
                >
                  Done / Close
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>
  );
};
