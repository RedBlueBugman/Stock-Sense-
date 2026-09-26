import React, { useState } from "react";
import { X, Scan, CheckCircle, AlertCircle } from "lucide-react";
import { Product } from "../types";

interface BarcodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onScanSuccess: (product: Product) => void;
}

export const BarcodeScannerModal: React.FC<BarcodeModalProps> = ({ isOpen, onClose, products, onScanSuccess }) => {
  const [scannedCode, setScannedCode] = useState("");
  const [feedback, setFeedback] = useState<"idle" | "success" | "error">("idle");
  const [matchedProduct, setMatchedProduct] = useState<Product | null>(null);

  if (!isOpen) return null;

  const handleSimulateScan = (code: string) => {
    setScannedCode(code);
    const found = products.find((p) => p.barcode === code || p.sku === code);

    if (found) {
      setFeedback("success");
      setMatchedProduct(found);
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } catch (_) {}

      setTimeout(() => {
        onScanSuccess(found);
        onClose();
        setFeedback("idle");
      }, 1000);
    } else {
      setFeedback("error");
      setMatchedProduct(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex justify-between items-center pb-3">
          <div className="flex items-center space-x-2">
            <Scan className="w-5 h-5 text-indigo-400 animate-pulse" />
            <span className="text-sm font-bold text-white">Floor Barcode Scanner</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="my-4 relative h-44 rounded-2xl border-2 border-dashed border-indigo-500/40 bg-slate-950 flex flex-col items-center justify-center overflow-hidden">
          {feedback === "success" && matchedProduct ? (
            <div className="text-center p-4">
              <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              <div className="text-sm font-bold text-white">{matchedProduct.name}</div>
              <div className="text-xs text-emerald-300 font-mono">SKU: {matchedProduct.sku}</div>
            </div>
          ) : feedback === "error" ? (
            <div className="text-center p-4">
              <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-2" />
              <div className="text-sm font-bold text-white">Item Not Found</div>
            </div>
          ) : (
            <div className="text-center text-slate-500 text-xs">
              <Scan className="w-8 h-8 mx-auto mb-1 opacity-50" />
              <span>Simulate quick scan below</span>
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Quick Barcode Demos:</div>
          <div className="grid grid-cols-2 gap-2">
            {products.slice(0, 4).map((p) => (
              <button
                key={p.id}
                onClick={() => handleSimulateScan(p.barcode || p.sku)}
                className="p-2 bg-slate-950 hover:bg-indigo-600/20 border border-slate-800 rounded-xl text-left transition"
              >
                <div className="text-xs font-semibold text-slate-200 truncate">{p.name}</div>
                <div className="text-[10px] text-indigo-400 font-mono">{p.barcode || p.sku}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};