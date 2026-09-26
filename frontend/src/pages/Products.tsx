import React, { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import { ApiService } from "../services/api";
import { Product } from "../types";

export const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");

  const load = () => ApiService.getProducts(search).then((d) => setProducts(d));
  useEffect(() => { load(); }, [search]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-white">Product Catalog</h1>
      </div>
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white"
        />
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 uppercase text-[10px]">
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">SKU</th>
              <th className="py-3 px-4">Barcode</th>
              <th className="py-3 px-4 text-right">Min Stock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-slate-800/40">
                <td className="py-3 px-4 font-bold text-white">{p.name}</td>
                <td className="py-3 px-4 font-mono text-indigo-400">{p.sku}</td>
                <td className="py-3 px-4 text-slate-400">{p.barcode || "—"}</td>
                <td className="py-3 px-4 text-right font-mono text-amber-400">{p.reorderMin}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};