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

export type PurchaseOrderItemRecord = {
  partId: string;
  partName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

export type PurchaseOrderRecord = {
  id: string;
  supplierId?: number;
  supplierName?: string | null;
  totalAmount: number;
  status: string;
  notes?: string | null;
  orderedAt: string;
  receivedAt?: string | null;
  items: PurchaseOrderItemRecord[];
};

const unwrap = <T,>(response: { data: ApiResponse<T> }) => response.data.data;

export const purchaseOrderService = {
  async create(payload: CreatePurchaseOrderForm) {
    const response = await api.post<ApiResponse<{ id: string }>>('/purchase', payload);
    return unwrap(response);
  },

  async getAll() {
    const response = await api.get<ApiResponse<PurchaseOrderRecord[]>>('/purchase');
    return unwrap(response);
  },

  async getById(id: string) {
    const response = await api.get<ApiResponse<PurchaseOrderRecord>>(`/purchase/${id}`);
    return unwrap(response);
  },

  async markReceived(id: string) {
    const response = await api.put<ApiResponse<any>>(`/purchase/${id}/receive`);
    return unwrap(response);
  },

  async cancel(id: string) {
    const response = await api.put<ApiResponse<any>>(`/purchase/${id}/cancel`);
    return unwrap(response);
  },
};
