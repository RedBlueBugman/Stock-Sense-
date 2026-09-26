import React, { useEffect, useState } from "react";
import { ApiService } from "../services/api";
import { Partner } from "../types";

export const Partners: React.FC = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [tab, setTab] = useState<"all" | "supplier" | "customer">("all");

  useEffect(() => {
    const filter = tab === "all" ? undefined : tab;
    ApiService.getPartners(filter).then((data) => setPartners(data));
  }, [tab]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in">
      <div>
        <h1 className="text-xl font-bold text-white">Partner Directory</h1>
        <p className="text-xs text-slate-400">Vendor suppliers and retail/wholesale customer destinations</p>
      </div>

      <div className="flex space-x-2 border-b border-slate-800 pb-2">
        {(["all", "supplier", "customer"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition ${
              tab === t ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            {t === "all" ? "All Partners" : t + "s"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {partners.map((p) => (
          <div key={p.id} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-2">
            <div className="flex justify-between items-start">
              <div className="font-bold text-white text-sm">{p.name}</div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${p.type === "supplier" ? "bg-emerald-500/10 text-emerald-400" : "bg-indigo-500/10 text-indigo-400"}`}>
                {p.type}
              </span>
            </div>
            <div className="text-xs text-slate-400 font-mono">{p.email || "contact@partner.example"}</div>
            <div className="text-xs text-slate-500">{p.phone || "+91 90000 00000"}</div>
          </div>
        ))}
      </div>
    </div>
  );
};