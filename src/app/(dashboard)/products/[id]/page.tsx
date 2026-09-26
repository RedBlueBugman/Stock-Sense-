'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useProductDetail, useProducts } from '@/hooks/useProducts';
import { ArrowLeft, Package, Trash2, Save, Layers, MapPin, History } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: product, isLoading } = useProductDetail(id);
  const { updateProduct, deleteProduct, isUpdating } = useProducts();

  const [activeTab, setActiveTab] = useState<'info' | 'locations' | 'history'>('info');
  const [reorderMin, setReorderMin] = useState<number | undefined>(undefined);
  const [reorderMax, setReorderMax] = useState<number | undefined>(undefined);

  if (isLoading) {
    return <div className="p-12 text-center text-sm text-slate-400">Loading product details...</div>;
  }

  if (!product) {
    return <div className="p-12 text-center text-sm text-slate-400">Product not found.</div>;
  }

  const handleSaveReorders = async () => {
    await updateProduct({
      id,
      data: {
        reorder_min: reorderMin ?? product.reorder_min ?? product.reorderMin,
        reorder_max: reorderMax ?? product.reorder_max ?? product.reorderMax,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href={ROUTES.PRODUCTS} className="rounded-xl border p-2 text-slate-500 hover:bg-slate-100">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{product.name}</h1>
            <p className="text-xs font-mono text-slate-500">SKU: {product.sku}</p>
          </div>
        </div>

        <button
          onClick={async () => {
            if (confirm('Deactivate this product?')) {
              await deleteProduct(id);
              router.push(ROUTES.PRODUCTS);
            }
          }}
          className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50"
        >
          <Trash2 className="h-4 w-4" /> Deactivate Product
        </button>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b space-x-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('info')}
          className={`pb-3 border-b-2 flex items-center gap-2 ${
            activeTab === 'info' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400'
          }`}
        >
          <Package className="h-4 w-4" /> Specifications
        </button>
        <button
          onClick={() => setActiveTab('locations')}
          className={`pb-3 border-b-2 flex items-center gap-2 ${
            activeTab === 'locations' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400'
          }`}
        >
          <MapPin className="h-4 w-4" /> Stock by Location
        </button>
      </div>

      {/* Tab 1: Info & Reorder Rules */}
      {activeTab === 'info' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="font-bold text-slate-900 border-b pb-2">Product Information</h2>
            <dl className="grid grid-cols-2 gap-y-3 text-sm">
              <dt className="text-slate-400">Category:</dt>
              <dd className="font-semibold text-slate-800">{product.category_name || '—'}</dd>
              <dt className="text-slate-400">Barcode:</dt>
              <dd className="font-mono text-slate-800">{product.barcode || '—'}</dd>
              <dt className="text-slate-400">Unit of Measure:</dt>
              <dd className="font-semibold text-slate-800 uppercase">{product.unit_of_measure || 'pcs'}</dd>
              <dt className="text-slate-400">Tracking Mode:</dt>
              <dd className="font-semibold text-slate-800 capitalize">{product.tracking_type || 'none'}</dd>
            </dl>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="font-bold text-slate-900 border-b pb-2">Reorder Thresholds</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700">Minimum Reorder Alert</label>
                <input
                  type="number"
                  defaultValue={product.reorder_min ?? product.reorderMin ?? 0}
                  onChange={(e) => setReorderMin(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border p-2 text-sm outline-none focus:border-indigo-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700">Maximum Capacity</label>
                <input
                  type="number"
                  defaultValue={product.reorder_max ?? product.reorderMax ?? 0}
                  onChange={(e) => setReorderMax(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border p-2 text-sm outline-none focus:border-indigo-600"
                />
              </div>
              <button
                onClick={handleSaveReorders}
                disabled={isUpdating}
                className="mt-2 flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
              >
                <Save className="h-3.5 w-3.5" /> Save Thresholds
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Stock by Location */}
      {activeTab === 'locations' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-bold text-slate-900 mb-4">Stock Breakdown Across Locations</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-slate-50 text-xs uppercase text-slate-400">
                <tr>
                  <th className="py-3 px-4">Warehouse</th>
                  <th className="py-3 px-4">Location Name</th>
                  <th className="py-3 px-4">Available Quantity</th>
                  <th className="py-3 px-4">Reserved Quantity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(product.locations_stock || []).length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">
                      No stock allocated to specific locations yet.
                    </td>
                  </tr>
                ) : (
                  product.locations_stock?.map((loc: any, idx: number) => (
                    <tr key={idx}>
                      <td className="py-3 px-4 font-semibold text-slate-800">{loc.warehouse_name || 'Central WH'}</td>
                      <td className="py-3 px-4 text-slate-700">{loc.location_name || 'Main Bin'}</td>
                      <td className="py-3 px-4 font-bold text-emerald-600">{loc.qty_available || 0}</td>
                      <td className="py-3 px-4 text-slate-500">{loc.qty_reserved || 0}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
