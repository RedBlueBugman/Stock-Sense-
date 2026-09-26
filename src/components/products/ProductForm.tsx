'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Select } from '@/components/ui';

export const productFormSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(255),
  sku: z.string().min(1, 'SKU is required').regex(/^[A-Z0-9-]+$/, 'SKU must be uppercase alphanumeric (e.g. LP-001)'),
  category: z.string().min(1, 'Category is required'),
  unit_price: z.coerce.number().positive('Price must be greater than 0'),
  description: z.string().optional(),
  barcode: z.string().optional(),
});

export type ProductFormData = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  onSubmit: (data: ProductFormData) => Promise<void>;
  initialData?: Partial<ProductFormData>;
  isLoading?: boolean;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  onSubmit,
  initialData,
  isLoading,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: initialData || {
      name: '',
      sku: '',
      category: '',
      unit_price: 0,
      description: '',
      barcode: '',
    },
  });

  React.useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Product Name *</label>
        <Input
          {...register('name')}
          placeholder="E.g., Laptop Pro 15"
          disabled={isLoading || isSubmitting}
          error={errors.name?.message}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">SKU Code *</label>
          <Input
            {...register('sku')}
            placeholder="LP-001"
            disabled={isLoading || isSubmitting}
            error={errors.sku?.message}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Unit Price ($) *</label>
          <Input
            {...register('unit_price')}
            type="number"
            step="0.01"
            placeholder="1299.99"
            disabled={isLoading || isSubmitting}
            error={errors.unit_price?.message}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Category *</label>
          <Select
            {...register('category')}
            options={[
              { label: 'Electronics', value: 'electronics' },
              { label: 'Accessories', value: 'accessories' },
              { label: 'Cables', value: 'cables' },
              { label: 'Storage', value: 'storage' },
              { label: 'Raw Materials', value: 'raw_materials' },
            ]}
            placeholder="Select category"
            disabled={isLoading || isSubmitting}
            error={errors.category?.message}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Barcode (Optional)</label>
          <Input
            {...register('barcode')}
            placeholder="890123456789"
            disabled={isLoading || isSubmitting}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Description</label>
        <textarea
          {...register('description')}
          placeholder="Add detailed product specifications..."
          className="w-full px-3.5 py-2.5 border border-slate-200 bg-slate-50 rounded-xl text-sm outline-none transition focus:border-indigo-600 focus:bg-white disabled:bg-slate-100"
          rows={3}
          disabled={isLoading || isSubmitting}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          variant="primary"
          className="flex-1"
          loading={isLoading || isSubmitting}
        >
          Save Product
        </Button>
        <Button type="button" variant="outline" onClick={() => reset()}>
          Reset Form
        </Button>
      </div>
    </form>
  );
};
