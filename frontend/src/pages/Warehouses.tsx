import React, { useEffect, useState } from "react";
import { Warehouse as WhIcon } from "lucide-react";
import { ApiService } from "../services/api";
import { Warehouse } from "../types";

export const Warehouses: React.FC = () => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  useEffect(() => { ApiService.getWarehouses().then((d) => setWarehouses(d)); }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in">
      <h1 className="text-xl font-bold text-white">Warehouses & Locations</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {warehouses.map((wh) => (
          <div key={wh.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
            <div className="flex items-center space-x-2">
              <WhIcon className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">{wh.name} ({wh.code})</h3>
            </div>
            <div className="text-xs text-slate-400">{wh.address || "Local Storage Facility"}</div>
          </div>
        ))}
      </div>
    </div>
  );
};