import React, { useEffect, useState } from "react";
import { Warehouse as WhIcon, MapPin } from "lucide-react";
import { ApiService } from "../services/api";
import { Warehouse } from "../types";

export const Warehouses: React.FC = () => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

  useEffect(() => {
    ApiService.getWarehouses().then((data) => setWarehouses(data));
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in">
      <div>
        <h1 className="text-xl font-bold text-white">Multi-Warehouse Network & Locations</h1>
        <p className="text-xs text-slate-400">Physical facilities, aisles, racks, and receiving docks</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {warehouses.map((wh) => (
          <div key={wh.id} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
                  <WhIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{wh.name}</h3>
                  <span className="text-[10px] font-mono text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded">
                    CODE: {wh.code}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-400 flex items-center space-x-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>{wh.address || "Local Warehouse Facility"}</span>
            </div>

            <div className="pt-3 border-t border-slate-800/80">
              <div className="text-[11px] font-semibold text-slate-400 mb-2">Registered Internal Locations:</div>
              <div className="flex flex-wrap gap-1.5">
                {wh.locations && wh.locations.length > 0 ? (
                  wh.locations.map((loc) => (
                    <span key={loc.id} className="px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-[10px] text-slate-300 font-mono">
                      {loc.name}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-500 text-xs">Main Store, Rack A, Shipping Dock</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};