import React, { useEffect, useState } from "react";
import { ApiService } from "../services/api";
import { Partner } from "../types";

export const Partners: React.FC = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  useEffect(() => { ApiService.getPartners().then((d) => setPartners(d)); }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in">
      <h1 className="text-xl font-bold text-white">Partners (Suppliers & Customers)</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {partners.map((p) => (
          <div key={p.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
            <div className="font-bold text-white text-sm">{p.name}</div>
            <div className="text-[10px] text-indigo-400 uppercase font-mono">{p.type}</div>
            <div className="text-xs text-slate-400">{p.email || "contact@partner.example"}</div>
          </div>
        ))}
      </div>
    </div>
  );
};