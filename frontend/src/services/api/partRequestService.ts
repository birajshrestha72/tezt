import { toast } from 'react-hot-toast';
import api from './axios';
import { getApiErrorMessage, unwrap } from './apiUtils';

export interface PartRequestRecord {
  id: number;
  customerId: number;
  customerName: string;
  partName: string;
  description?: string | null;
  status: string;
  createdAt: string;
}

export interface PartRequestInput {
  customerId: number;
  partName: string;
  description?: string | null;
}

export type PartRequestDto = PartRequestRecord;

export const partRequestService = {
  async getCustomerRequests(customerId: number) {
    return this.getPartRequestsByCustomer(customerId);
  },

  async create(payload: PartRequestInput) {
    return this.createPartRequest(payload);
  },

  async getPartRequests() {
    try {
      const response = await api.get('/part-requests');
      return unwrap<PartRequestRecord[]>(response);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load part requests.'));
      throw error;
    }
  },

  async getPartRequestsByCustomer(customerId: number) {
    try {
      const response = await api.get(`/part-requests/customer/${customerId}`);
      return unwrap<PartRequestRecord[]>(response);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load customer part requests.'));
      throw error;
    }
  },

  async createPartRequest(payload: PartRequestInput) {
    try {
      const response = await api.post('/part-requests', payload);
      return unwrap<PartRequestRecord>(response);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to submit part request.'));
      throw error;
    }
  },

  async updatePartRequestStatus(id: number, status: 'Fulfilled' | 'Rejected') {
    try {
      const response = await api.put(`/part-requests/${id}/status`, { status });
      return unwrap<{ updated: boolean; partRequestId: number }>(response);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to update part request.'));
      throw error;
    }
  },
};