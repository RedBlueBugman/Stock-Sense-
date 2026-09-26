import React, { useEffect, useState } from "react";
import {
  Package,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  TrendingUp,
  Clock,
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { ApiService } from "../services/api";
import { DashboardKPIs, StockOperation } from "../types";

export const Dashboard: React.FC = () => {
  const [kpis, setKpis] = useState<DashboardKPIs>({
    total_products: 0,
    pending_receipts: 0,
    pending_deliveries: 0,
    scheduled_transfers: 0,
    unread_alerts: 0,
  });
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
    { day: "Sun", incoming: 95, outgoing: 50 },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in">
      {kpis.unread_alerts > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-300">Active Stock Alerts Detected</div>
              <div className="text-xs text-amber-400/80">Items have reached or fallen below minimum safety reorder thresholds.</div>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full">
            {kpis.unread_alerts} Alerts Active
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-medium text-slate-400">Total Products</span>
              <div className="text-2xl font-extrabold text-white mt-1">{kpis.total_products}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-[11px] text-emerald-400 flex items-center space-x-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Active SKU Catalog</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-medium text-slate-400">Pending Receipts</span>
              <div className="text-2xl font-extrabold text-emerald-400 mt-1">{kpis.pending_receipts}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-[11px] text-slate-400">Vendor incoming shipments</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-medium text-slate-400">Pending Deliveries</span>
              <div className="text-2xl font-extrabold text-rose-400 mt-1">{kpis.pending_deliveries}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-[11px] text-slate-400">Customer outbound orders</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-medium text-slate-400">Internal Transfers</span>
              <div className="text-2xl font-extrabold text-amber-400 mt-1">{kpis.scheduled_transfers}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-[11px] text-slate-400">Rack & Floor balancing</div>
        </div>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-sm font-bold text-white">7-Day Ledger Movement Velocity</h3>
            <p className="text-xs text-slate-400">Incoming Receipts vs Outgoing Customer Shipments</p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="inColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="outColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px", fontSize: "12px" }} />
              <Area type="monotone" dataKey="incoming" stroke="#10b981" fillOpacity={1} fill="url(#inColor)" />
              <Area type="monotone" dataKey="outgoing" stroke="#f43f5e" fillOpacity={1} fill="url(#outColor)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>Recent Immutable Ledger Operations</span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="pb-3 px-2">Reference</th>
                <th className="pb-3 px-2">Type</th>
                <th className="pb-3 px-2">Route (From → To)</th>
                <th className="pb-3 px-2">Partner</th>
                <th className="pb-3 px-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {operations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500">
                    No operations found. Click 'New Operation' to execute your first transaction!
                  </td>
                </tr>
              ) : (
                operations.slice(0, 6).map((op) => (
                  <tr key={op.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-2 font-mono font-bold text-indigo-400">{op.referenceCode}</td>
                    <td className="py-3 px-2">
                      <span className="capitalize px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-800 text-slate-300">
                        {op.operationType}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-slate-300">
                      {op.sourceLocation?.name || "Source"} <span className="text-indigo-400">→</span> {op.destinationLocation?.name || "Dest"}
                    </td>
                    <td className="py-3 px-2 text-slate-400">{op.partner?.name || "—"}</td>
                    <td className="py-3 px-2 text-right">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {op.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};