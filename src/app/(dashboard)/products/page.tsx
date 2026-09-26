'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import { useProducts } from '@/hooks/useProducts';
import { Product } from '@/types/api';
import { DataTable } from '@/components/shared/DataTable';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { ProtectedComponent } from '@/components/ProtectedComponent';
import { Badge, Button } from '@/components/ui';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { ROUTES } from '@/constants/routes';

export default function ProductsPage() {
  const { products = [], deleteProduct } = useProducts();
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const safeProducts = useMemo(() => (Array.isArray(products) ? products : []), [products]);

  const columns = useMemo<ColumnDef<Product>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Product Name',
        cell: ({ row }) => (
          <Link
            href={ROUTES.PRODUCT_DETAIL(row.original.id)}
            className="font-bold text-slate-900 hover:text-indigo-600 transition"
          >
            {row.original.name || 'Unnamed Product'}
          </Link>
        ),
      },
      {
        accessorKey: 'sku',
        header: 'SKU',
        cell: ({ row }) => (
          <span className="font-mono text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
            {row.original.sku || '—'}
          </span>
        ),
      },
      {
        accessorKey: 'category',
        header: 'Category',
        cell: ({ row }) => (
          <span className="capitalize text-slate-700 font-medium">
            {row.original.category || (row.original as any).category_name || 'General'}
          </span>
        ),
      },
      {
        accessorKey: 'unit_price',
        header: 'Unit Price',
        cell: ({ row }) => {
          const val = row.original.unit_price || 0;
          return <span className="font-semibold text-slate-900">${Number(val).toFixed(2)}</span>;
        },
      },
      {
        accessorKey: 'quantity',
        header: 'Stock Qty',
        cell: ({ row }) => {
          const qty = row.original.quantity ?? (row.original as any).stock_qty ?? 0;
          const variant = qty === 0 ? 'error' : qty <= 10 ? 'warning' : 'success';
          return <Badge variant={variant}>{qty} in stock</Badge>;
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 justify-end">
            <Link
              href={ROUTES.PRODUCT_DETAIL(row.original.id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
            >
              <Edit2 className="h-4 w-4" />
            </Link>
            <ProtectedComponent allowedRoles={['ADMIN']}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteTargetId(row.original.id);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </ProtectedComponent>
          </div>
        ),
      },
    ],
    []
  );

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      await deleteProduct(deleteTargetId);
      setDeleteTargetId(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Products Catalog</h1>
          <p className="text-sm text-slate-500">Manage catalog inventory with real-time stock indicators</p>
        </div>
        <ProtectedComponent allowedRoles={['ADMIN', 'INVENTORY_MANAGER']}>
          <Link href={ROUTES.PRODUCT_NEW}>
            <Button variant="primary">
              <Plus className="h-4 w-4" /> Add Product
            </Button>
          </Link>
        </ProtectedComponent>
      </div>

      <DataTable
        columns={columns}
        data={safeProducts}
        pageSize={10}
        searchPlaceholder="Filter by name, SKU, or category..."
      />

      <ConfirmDialog
        isOpen={!!deleteTargetId}
        title="Deactivate Product"
        message="Are you sure you want to deactivate this product? This action will set is_active to false."
        confirmText="Deactivate"
        isDangerous
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
}
