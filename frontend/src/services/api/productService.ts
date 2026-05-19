import api from './axios';

export interface ProductApiRecord {
  id: number;
  name: string;
  sku: string;
  price: number;
  stockQty: number;
  categoryId: number;
  supplierId: number;
}

export interface ProductDetailRecord extends ProductApiRecord {
  category?: {
    id: number;
    name: string;
  };
  supplier?: {
    id: number;
    name: string;
    email?: string;
    phone?: string | null;
  };
}

export interface ProductOption {
  id: number;
  name: string;
}

export interface ProductFormData {
  name: string;
  sku: string;
  price: number;
  stockQty: number;
  categoryId: number;
  supplierId: number;
}

type ApiResponse<T> = {
  success: boolean;
  message?: string | null;
  data: T;
};

const unwrap = <T,>(response: { data: ApiResponse<T> }) => response.data.data;

export const productService = {
  async getProductDtos() {
    const response = await api.get<ApiResponse<ProductApiRecord[]>>('/products');
    return unwrap(response);
  },

  async getProducts() {
    const response = await api.get<ApiResponse<ProductDetailRecord[]>>('/products/with-details');
    return unwrap(response);
  },

  async getLowStock(threshold = 10) {
    const response = await api.get<ApiResponse<ProductApiRecord[]>>('/parts/low-stock', { params: { threshold } });
    return unwrap(response);
  },

  async getCategories() {
    const response = await api.get<ApiResponse<ProductOption[]>>('/categories');
    return unwrap(response);
  },

  async getSuppliers() {
    const response = await api.get<ApiResponse<ProductOption[]>>('/suppliers');
    return unwrap(response);
  },

  async createProduct(payload: ProductFormData) {
    const response = await api.post<ApiResponse<ProductApiRecord>>('/products', payload);
    return unwrap(response);
  },

  async updateProduct(id: number, payload: ProductFormData) {
    const response = await api.put<ApiResponse<ProductApiRecord>>(`/products/${id}`, payload);
    return unwrap(response);
  },

  async deleteProduct(id: number) {
    const response = await api.delete<ApiResponse<{ deleted: number }>>(`/products/${id}`);
    return unwrap(response);
  },
};
