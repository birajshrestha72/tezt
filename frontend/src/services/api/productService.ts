import api from './axios';

export type ProductOption = { id: string; name: string };

export type ProductCategory = { id: string; name: string };

export type ProductSupplier = { id: string; name: string };

export type ProductDetailRecord = {
  id: string;
  sku: string;
  name: string;
  price: number;
  costPrice?: number;
  stockQty: number;
  reorderLevel?: number;
  isActive?: boolean;
  categoryId?: string;
  supplierId?: string;
  category?: { id: string; name: string } | null;
  supplier?: { id: string; name: string } | null;
  updatedAt?: string;
};

export type ProductFormData = {
  name: string;
  sku: string;
  price: number;
  stockQty: number;
  categoryId?: string;
  supplierId?: string;
};

const unwrap = async <T>(promise: Promise<{ data: T }>) => {
  const response = await promise;
  return response.data;
};

export const productService = {
  getProducts: () => unwrap<ProductDetailRecord[]>(api.get<ProductDetailRecord[]>('/parts?activeOnly=true')),
  getCategories: () => unwrap<ProductOption[]>(api.get<ProductOption[]>('/part-categories')),
  getSuppliers: () => unwrap<ProductOption[]>(api.get<ProductOption[]>('/suppliers')),
  getLowStock: () => unwrap<ProductDetailRecord[]>(api.get<ProductDetailRecord[]>('/parts/low-stock')),
  createProduct: (payload: Partial<ProductFormData>) => unwrap(api.post('/parts', payload)),
  updateProduct: (id: string, payload: Partial<ProductFormData>) => unwrap(api.put(`/parts/${id}`, payload)),
  deleteProduct: (id: string) => unwrap(api.delete(`/parts/${id}`)),
};
