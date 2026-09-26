import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { ApiService } from "../services/api";
import { StockOperation } from "../types";
import { OperationModal } from "../components/OperationModal";

export const Operations: React.FC = () => {
  const [operations, setOperations] = useState<StockOperation[]>([]);
  const [tab, setTab] = useState<string>("all");
  const [isOpen, setIsOpen] = useState(false);

  const load = () => ApiService.getOperations(tab === "all" ? undefined : tab).then((d) => setOperations(d));
  useEffect(() => { load(); }, [tab]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-white">Operations Hub</h1>
        <button onClick={() => setIsOpen(true)} className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl flex items-center space-x-2">
          <Plus className="w-4 h-4" /><span>New Operation</span>
        </button>
      </div>

      <div className="flex space-x-2 border-b border-slate-800 pb-2">
        {["all", "receipt", "delivery", "internal", "adjustment"].map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize ${tab === t ? "bg-indigo-600 text-white" : "text-slate-400"}`}>
            {t === "all" ? "All" : t + "s"}
          </button>
        ))}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 uppercase text-[10px]">
              <th className="py-3 px-4">Reference</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Route</th>
              <th className="py-3 px-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {operations.map((op) => (
              <tr key={op.id} className="hover:bg-slate-800/40">
                <td className="py-3 px-4 font-mono font-bold text-indigo-400">{op.referenceCode}</td>
                <td className="py-3 px-4 capitalize">{op.operationType}</td>
                <td className="py-3 px-4 text-slate-300">{op.sourceLocation?.name || "Source"} → {op.destinationLocation?.name || "Dest"}</td>
                <td className="py-3 px-4 text-right text-emerald-400 font-bold">{op.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <OperationModal isOpen={isOpen} onClose={() => setIsOpen(false)} onSuccess={load} defaultType={tab === "all" ? "receipt" : tab} />
    </div>
  );
};