import React, { useEffect, useState } from "react";
import { Package, Search, Plus } from "lucide-react";
import { ApiService } from "../services/api";
import { Product } from "../types";

export const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    barcode: "",
    unitOfMeasure: "pcs",
    reorderMin: 10,
    reorderMax: 100,
    reorderQty: 25,
  });

  const loadProducts = () => {
    ApiService.getProducts(search).then((data) => setProducts(data));
  };

  useEffect(() => {
    loadProducts();
  }, [search]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await ApiService.createProduct(formData);
    setShowAddModal(false);
    setFormData({ name: "", sku: "", barcode: "", unitOfMeasure: "pcs", reorderMin: 10, reorderMax: 100, reorderQty: 25 });
    loadProducts();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Product Catalog & Stock Limits</h1>
          <p className="text-xs text-slate-400">Manage SKUs, barcodes, and automated safety stock reordering</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center space-x-2 transition shadow-lg shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Search products by SKU, name, or barcode..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
        />
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <th className="py-3 px-4">Product Details</th>
              <th className="py-3 px-4">SKU / Code</th>
              <th className="py-3 px-4">Barcode</th>
              <th className="py-3 px-4">Unit</th>
              <th className="py-3 px-4 text-right">Min Threshold</th>
              <th className="py-3 px-4 text-right">Reorder Qty</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-slate-800/40 transition">
                <td className="py-3.5 px-4 font-bold text-white">{p.name}</td>
                <td className="py-3.5 px-4 font-mono font-semibold text-indigo-400">{p.sku}</td>
                <td className="py-3.5 px-4 font-mono text-slate-400">{p.barcode || "—"}</td>
                <td className="py-3.5 px-4">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">{p.unitOfMeasure}</span>
                </td>
                <td className="py-3.5 px-4 text-right font-mono text-amber-400">{p.reorderMin}</td>
                <td className="py-3.5 px-4 text-right font-mono text-slate-300">{p.reorderQty}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Create New Product</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">SKU</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Unit</label>
                  <input
                    type="text"
                    required
                    value={formData.unitOfMeasure}
                    onChange={(e) => setFormData({ ...formData, unitOfMeasure: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Min Threshold</label>
                  <input
                    type="number"
                    value={formData.reorderMin}
                    onChange={(e) => setFormData({ ...formData, reorderMin: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Reorder Qty</label>
                  <input
                    type="number"
                    value={formData.reorderQty}
                    onChange={(e) => setFormData({ ...formData, reorderQty: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg">
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};