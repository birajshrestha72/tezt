import api from './axios';

type ApiResponse<T> = { success: boolean; message?: string | null; data: T };

export interface PurchaseOrderItemForm {
  partId: string;
  quantity: number;
  unitPrice: number;
}

export interface CreatePurchaseOrderForm {
  supplierId: number;
  staffId?: string | null;
  notes?: string | null;
  items: PurchaseOrderItemForm[];
}

const unwrap = <T,>(response: { data: ApiResponse<T> }) => response.data.data;

export const purchaseOrderService = {
  async create(payload: CreatePurchaseOrderForm) {
    const response = await api.post<ApiResponse<{ id: string }>>('/purchase', payload);
    return unwrap(response);
  },

  async getAll() {
    const response = await api.get<ApiResponse<any[]>>('/purchase');
    return unwrap(response);
  },

  async getById(id: string) {
    const response = await api.get<ApiResponse<any>>(`/purchase/${id}`);
    return unwrap(response);
  },

  async markReceived(id: string) {
    const response = await api.put<ApiResponse<any>>(`/purchase/${id}/receive`);
    return unwrap(response);
  },
};
