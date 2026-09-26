import React, { useEffect, useState } from "react";
import { ApiService } from "../services/api";
import { StockOperation } from "../types";

export const Movements: React.FC = () => {
  const [operations, setOperations] = useState<StockOperation[]>([]);
  useEffect(() => { ApiService.getOperations().then((d) => setOperations(d)); }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in">
      <h1 className="text-xl font-bold text-white">Immutable Ledger Audit Stream</h1>
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 uppercase text-[10px]">
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Reference</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Source</th>
              <th className="py-3 px-4">Destination</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {operations.map((op) => (
              <tr key={op.id} className="hover:bg-slate-800/40">
                <td className="py-3 px-4 text-slate-400">{new Date(op.createdAt).toLocaleTimeString()}</td>
                <td className="py-3 px-4 font-mono font-bold text-indigo-400">{op.referenceCode}</td>
                <td className="py-3 px-4 capitalize">{op.operationType}</td>
                <td className="py-3 px-4 text-slate-300">{op.sourceLocation?.name || "Source"}</td>
                <td className="py-3 px-4 text-slate-300">{op.destinationLocation?.name || "Dest"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};