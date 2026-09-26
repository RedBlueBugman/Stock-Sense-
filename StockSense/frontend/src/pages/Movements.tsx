import React, { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { ApiService } from "../services/api";
import { StockOperation } from "../types";

export const Movements: React.FC = () => {
  const [operations, setOperations] = useState<StockOperation[]>([]);

  useEffect(() => {
    ApiService.getOperations().then((data) => setOperations(data));
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-indigo-400" />
          <span>Immutable Stock Movement Ledger</span>
        </h1>
        <p className="text-xs text-slate-400">Complete audit stream of every source → destination movement</p>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <th className="py-3 px-4">Date & Time</th>
              <th className="py-3 px-4">Operation Ref</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Source Location</th>
              <th className="py-3 px-4">Destination Location</th>
              <th className="py-3 px-4 text-right">Ledger Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {operations.map((op) => (
              <tr key={op.id} className="hover:bg-slate-800/40 transition">
                <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                  {new Date(op.createdAt).toLocaleString()}
                </td>
                <td className="py-3.5 px-4 font-mono font-bold text-indigo-400">{op.referenceCode}</td>
                <td className="py-3.5 px-4 capitalize">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
                    {op.operationType}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-slate-300 font-medium">{op.sourceLocation?.name || "Virtual Source"}</td>
                <td className="py-3.5 px-4 text-slate-300 font-medium">{op.destinationLocation?.name || "Virtual Dest"}</td>
                <td className="py-3.5 px-4 text-right">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Committed (Done)
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};