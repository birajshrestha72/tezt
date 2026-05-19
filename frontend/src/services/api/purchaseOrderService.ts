import { toast } from 'react-hot-toast';
import api from './axios';
import { getApiErrorMessage, unwrap } from './apiUtils';

export interface PurchaseOrderItemInput {
  productId: number;
  quantity: number;
  unitCost: number;
}

export interface PurchaseOrderInput {
  supplierId: number;
  items: PurchaseOrderItemInput[];
}

export interface PurchaseOrderItemRecord extends PurchaseOrderItemInput {
  id: number;
  productName: string;
}

export interface PurchaseOrderRecord {
  id: number;
  orderDate: string;
  status: string;
  supplierId: number;
  supplierName: string;
  items: PurchaseOrderItemRecord[];
}

export type PurchaseOrderDto = PurchaseOrderRecord;

export const purchaseOrderService = {
  async getAll() {
    return this.getPurchaseOrders();
  },

  async getPurchaseOrders() {
    try {
      const response = await api.get('/purchaseorder');
      return unwrap<PurchaseOrderRecord[]>(response);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load purchase orders.'));
      throw error;
    }
  },

  async getPurchaseOrderById(id: number) {
    try {
      const response = await api.get(`/purchaseorder/${id}`);
      return unwrap<PurchaseOrderRecord>(response);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load purchase order.'));
      throw error;
    }
  },

  async createPurchaseOrder(payload: PurchaseOrderInput) {
    try {
      const response = await api.post('/purchaseorder', payload);
      return unwrap<PurchaseOrderRecord>(response);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to create purchase order.'));
      throw error;
    }
  },

  async receivePurchaseOrder(id: number) {
    try {
      const response = await api.put(`/purchaseorder/${id}/receive`);
      return unwrap<{ received: boolean; purchaseOrderId: number }>(response);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to receive purchase order.'));
      throw error;
    }
  },

  async deletePurchaseOrder(id: number) {
    try {
      const response = await api.delete(`/purchaseorder/${id}`);
      return unwrap<{ deleted: number }>(response);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to delete purchase order.'));
      throw error;
    }
  },

  async create(payload: PurchaseOrderInput) {
    return this.createPurchaseOrder(payload);
  },

  async receive(id: number) {
    return this.receivePurchaseOrder(id);
  },

  async delete(id: number) {
    return this.deletePurchaseOrder(id);
  },
};