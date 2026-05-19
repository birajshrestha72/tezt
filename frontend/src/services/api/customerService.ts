import { toast } from 'react-hot-toast';
import api from './axios';
import { getApiErrorMessage, unwrap } from './apiUtils';

export interface CustomerRecord {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  vehicleNumber?: string | null;
  vehicleMake?: string | null;
  vehicleModel?: string | null;
  vehicleYear?: number | null;
  vehicleType?: string | null;
}

export interface CustomerOrderItem {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface CustomerOrderRecord {
  id: number;
  orderDate: string;
  creditDueDate?: string | null;
  amountPaid: number;
  discountAmount: number;
  loyaltyDiscountApplied: boolean;
  totalAmount: number;
  status: string;
  customerId: number;
  orderItems: CustomerOrderItem[];
}

export interface CustomerProfileInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  vehicleNumber?: string | null;
  vehicleMake?: string | null;
  vehicleModel?: string | null;
  vehicleYear?: number | null;
  vehicleType?: string | null;
}

export interface CustomerRegisterInput extends CustomerProfileInput {
  password: string;
}

export const customerService = {
  async getById(id: number) {
    return this.getCustomerById(id);
  },

  async update(id: number, payload: CustomerProfileInput) {
    return this.updateCustomer(id, payload);
  },

  async searchCustomers(params: { search?: string; phone?: string; vehicleNumber?: string; id?: number } | string = {}) {
    try {
      const normalizedParams = typeof params === 'string' ? { search: params } : params;
      const response = await api.get('/customers', { params: normalizedParams });
      return unwrap<CustomerRecord[]>(response);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to search customers.'));
      throw error;
    }
  },

  async getCustomerById(id: number) {
    try {
      const response = await api.get(`/customers/${id}`);
      return unwrap<CustomerRecord>(response);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load customer.'));
      throw error;
    }
  },

  async getCustomerOrders(id: number) {
    try {
      const response = await api.get(`/customers/${id}/orders`);
      return unwrap<CustomerOrderRecord[]>(response);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load customer orders.'));
      throw error;
    }
  },

  async updateCustomer(id: number, payload: CustomerProfileInput) {
    try {
      const response = await api.put(`/customers/${id}`, payload);
      return unwrap<CustomerRecord>(response);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to update customer.'));
      throw error;
    }
  },

  async createCustomer(payload: CustomerProfileInput) {
    try {
      const response = await api.post('/customers', payload);
      return unwrap<CustomerRecord>(response);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to create customer.'));
      throw error;
    }
  },

  async registerCustomer(payload: CustomerRegisterInput) {
    try {
      const response = await api.post('/customers/register', payload);
      return unwrap<CustomerRecord>(response);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to register customer.'));
      throw error;
    }
  },
};