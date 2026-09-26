import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { ApiService } from "../services/api";
import { StockOperation } from "../types";
import { OperationModal } from "../components/OperationModal";

export const Operations: React.FC = () => {
  const [operations, setOperations] = useState<StockOperation[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadOps = () => {
    const typeFilter = activeTab === "all" ? undefined : activeTab;
    ApiService.getOperations(typeFilter).then((data) => setOperations(data));
  };

  useEffect(() => {
    loadOps();
  }, [activeTab]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Stock Operations Hub</h1>
          <p className="text-xs text-slate-400">Manage receipts, deliveries, internal transfers, and adjustments</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center space-x-2 transition shadow-lg shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>New Operation</span>
        </button>
      </div>

      <div className="flex space-x-2 border-b border-slate-800 pb-2">
        {["all", "receipt", "delivery", "internal", "adjustment"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition ${
              activeTab === tab ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            {tab === "all" ? "All Operations" : tab + "s"}
          </button>
        ))}
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <th className="py-3 px-4">Reference</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Movement Route</th>
              <th className="py-3 px-4">Items Summary</th>
              <th className="py-3 px-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {operations.map((op) => (
              <tr key={op.id} className="hover:bg-slate-800/40 transition">
                <td className="py-3.5 px-4 font-mono font-bold text-indigo-400">{op.referenceCode}</td>
                <td className="py-3.5 px-4 capitalize">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
                    {op.operationType}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-slate-300">
                  {op.sourceLocation?.name || "Source"} <span className="text-indigo-400">→</span> {op.destinationLocation?.name || "Dest"}
                </td>
                <td className="py-3.5 px-4 text-slate-400 font-mono">
                  {op.moves?.map((m) => `${m.quantity} ${m.unitOfMeasure} ${m.product?.name || ""}`).join(", ") || "1 item"}
                </td>
                <td className="py-3.5 px-4 text-right">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {op.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <OperationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => loadOps()}
        defaultType={activeTab === "all" ? "receipt" : (activeTab as any)}
      />
    </div>
  );
};