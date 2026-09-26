import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import { Product, PaginatedResponse, ProductCategory } from '@/types/api';
import { toast } from 'sonner';

interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  category_id?: string;
  warehouse_id?: string;
  stock_status?: 'in_stock' | 'low' | 'out';
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export function useProducts(filters: ProductFilters = {}) {
  const queryClient = useQueryClient();

  const productsQuery = useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      const res = await apiClient.get('/products', { params: filters });
      return res.data as PaginatedResponse<Product>;
    },
  });

  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await apiClient.get('/categories');
      return (res.data?.data || []) as ProductCategory[];
    },
  });

  const createProductMutation = useMutation({
    mutationFn: async (newProduct: any) => {
      const res = await apiClient.post('/products', newProduct);
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Product created successfully');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.error?.message || 'Failed to create product';
      toast.error(msg);
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiClient.patch(`/products/${id}`, data);
      return res.data?.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['products', variables.id] });
      toast.success('Product updated');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Failed to update product');
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product deactivated');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Cannot delete product');
    },
  });

  return {
    products: productsQuery.data?.data || [],
    meta: productsQuery.data?.meta,
    isLoading: productsQuery.isLoading,
    categories: categoriesQuery.data || [],
    createProduct: createProductMutation.mutateAsync,
    isCreating: createProductMutation.isPending,
    updateProduct: updateProductMutation.mutateAsync,
    isUpdating: updateProductMutation.isPending,
    deleteProduct: deleteProductMutation.mutateAsync,
    isDeleting: deleteProductMutation.isPending,
    refetch: productsQuery.refetch,
  };
}

export function useProductDetail(id: string) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: async () => {
      const res = await apiClient.get(`/products/${id}`);
      return res.data?.data as Product & { locations_stock?: any[] };
    },
    enabled: !!id,
  });
}
