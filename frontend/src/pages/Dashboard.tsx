import React, { useEffect, useState } from "react";
import { Package, ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Clock } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { ApiService } from "../services/api";
import { DashboardKPIs, StockOperation } from "../types";

export const Dashboard: React.FC = () => {
  const [kpis, setKpis] = useState<DashboardKPIs>({ total_products: 0, pending_receipts: 0, pending_deliveries: 0, scheduled_transfers: 0, unread_alerts: 0 });
  const [operations, setOperations] = useState<StockOperation[]>([]);

  useEffect(() => {
    Promise.all([ApiService.getKPIs(), ApiService.getRecentOperations()])
      .then(([kpiData, ops]) => {
        if (kpiData) setKpis(kpiData);
        setOperations(ops);
      })
      .catch(() => {});
  }, []);

  const trendData = [
    { day: "Mon", incoming: 120, outgoing: 45 },
    { day: "Tue", incoming: 80, outgoing: 60 },
    { day: "Wed", incoming: 150, outgoing: 90 },
    { day: "Thu", incoming: 40, outgoing: 75 },
    { day: "Fri", incoming: 200, outgoing: 110 },
    { day: "Sat", incoming: 60, outgoing: 30 },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <span className="text-xs font-medium text-slate-400">Total Products</span>
          <div className="text-2xl font-extrabold text-white mt-1">{kpis.total_products}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <span className="text-xs font-medium text-slate-400">Pending Receipts</span>
          <div className="text-2xl font-extrabold text-emerald-400 mt-1">{kpis.pending_receipts}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <span className="text-xs font-medium text-slate-400">Pending Deliveries</span>
          <div className="text-2xl font-extrabold text-rose-400 mt-1">{kpis.pending_deliveries}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <span className="text-xs font-medium text-slate-400">Internal Transfers</span>
          <div className="text-2xl font-extrabold text-amber-400 mt-1">{kpis.scheduled_transfers}</div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <h3 className="text-sm font-bold text-white mb-4">Stock Movement Velocity</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155" }} />
              <Area type="monotone" dataKey="incoming" stroke="#10b981" fill="#10b98120" />
              <Area type="monotone" dataKey="outgoing" stroke="#f43f5e" fill="#f43f5e20" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <h3 className="text-sm font-bold text-white mb-3">Recent Transactions</h3>
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-slate-400 border-b border-slate-800 pb-2">
              <th className="pb-2">Reference</th>
              <th className="pb-2">Type</th>
              <th className="pb-2">Route</th>
              <th className="pb-2 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {operations.slice(0, 5).map((op) => (
              <tr key={op.id} className="hover:bg-slate-800/40">
                <td className="py-2 font-mono font-bold text-indigo-400">{op.referenceCode}</td>
                <td className="py-2 capitalize">{op.operationType}</td>
                <td className="py-2 text-slate-300">{op.sourceLocation?.name || "Source"} → {op.destinationLocation?.name || "Dest"}</td>
                <td className="py-2 text-right text-emerald-400 font-bold">{op.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};