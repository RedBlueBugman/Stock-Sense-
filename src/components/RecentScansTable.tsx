import React from 'react';
import { History, CheckCircle2, QrCode, ArrowRight } from 'lucide-react';
import { ScanRecord, Product } from '../types/inventory';

interface RecentScansTableProps {
  records: ScanRecord[];
  onSelectProduct: (product: Product) => void;
}

export const RecentScansTable: React.FC<RecentScansTableProps> = ({ records, onSelectProduct }) => {
  if (records.length === 0) {
    return (
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-8 text-center text-slate-400">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-500">
          <History className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-slate-300">No Scan Events Yet</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Click &quot;Scan Barcode&quot; above to simulate an optical scan and record real-time inventory transactions.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-slate-900/80 border border-slate-800/80 overflow-hidden shadow-xl backdrop-blur-md">
      <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-purple-400" />
          <h4 className="text-sm font-bold text-white tracking-wide">Live Optical Scan Event Stream</h4>
        </div>
        <span className="text-xs font-mono text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">
          {records.length} Recorded
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/60 text-slate-400 font-mono uppercase tracking-wider border-b border-slate-800/80">
            <tr>
              <th className="py-3 px-4">Time</th>
              <th className="py-3 px-4">Item</th>
              <th className="py-3 px-4">SKU / Barcode</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Current Units</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {records.map((rec) => (
              <tr 
                key={rec.id} 
                className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                onClick={() => onSelectProduct(rec.product)}
              >
                <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">
                  {rec.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{rec.product.emoji}</span>
                    <span className="font-bold text-white group-hover:text-purple-300 transition-colors">
                      {rec.product.name}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4 font-mono">
                  <span className="text-purple-300 font-bold">{rec.product.sku}</span>
                  <span className="text-slate-500 ml-1.5">({rec.product.barcode})</span>
                </td>
                <td className="py-3 px-4 text-slate-300">
                  {rec.product.category}
                </td>
                <td className="py-3 px-4 font-mono font-bold">
                  <span className={rec.product.current_stock <= rec.product.min_stock ? 'text-amber-400' : 'text-emerald-400'}>
                    {rec.product.current_stock}
                  </span>
                  <span className="text-slate-500 text-[10px] ml-1">/ {rec.product.min_stock} min</span>
                </td>
                <td className="py-3 px-4">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold">
                    <CheckCircle2 className="w-3 h-3" /> VERIFIED
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectProduct(rec.product);
                    }}
                    className="text-purple-400 hover:text-purple-300 font-semibold inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                  >
                    View <ArrowRight className="w-3 h-3" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
