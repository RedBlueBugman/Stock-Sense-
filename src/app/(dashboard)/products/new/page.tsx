'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useProducts } from '@/hooks/useProducts';
import { ProductForm, ProductFormData } from '@/components/products/ProductForm';
import { Card } from '@/components/ui';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';

export default function CreateProductPage() {
  const router = useRouter();
  const { createProduct, isCreating } = useProducts();

  const handleFormSubmit = async (data: ProductFormData) => {
    const payload = {
      name: data.name,
      sku: data.sku,
      category_id: undefined, // Backend will map or create
      unit_of_measure: 'pcs',
      unit_price: data.unit_price,
      barcode: data.barcode || undefined,
      description: data.description || undefined,
    };

    const result = await createProduct(payload);
    router.push(result?.id ? ROUTES.PRODUCT_DETAIL(result.id) : ROUTES.PRODUCTS);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href={ROUTES.PRODUCTS} className="rounded-xl border p-2 text-slate-500 hover:bg-slate-100">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Create New Product</h1>
          <p className="text-sm text-slate-500">Add an item to the global warehouse catalog</p>
        </div>
      </div>

      <Card>
        <ProductForm onSubmit={handleFormSubmit} isLoading={isCreating} />
      </Card>
    </div>
  );
}
