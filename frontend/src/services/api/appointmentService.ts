import { toast } from 'react-hot-toast';
import api from './axios';
import { getApiErrorMessage, unwrap } from './apiUtils';

export interface AppointmentRecord {
  id: number;
  customerId: number;
  customerName: string;
  appointmentDate: string;
  serviceType: string;
  status: string;
  notes?: string | null;
  createdAt: string;
}

export interface AppointmentInput {
  customerId: number;
  appointmentDate: string;
  serviceType: string;
  notes?: string | null;
}

export type AppointmentDto = AppointmentRecord;

export const appointmentService = {
  async getCustomerAppointments(customerId: number) {
    return this.getAppointmentsByCustomer(customerId);
  },

  async create(payload: AppointmentInput) {
    return this.createAppointment(payload);
  },

  async getAppointments() {
    try {
      const response = await api.get('/appointments');
      return unwrap<AppointmentRecord[]>(response);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load appointments.'));
      throw error;
    }
  },

  async getAppointmentsByCustomer(customerId: number) {
    try {
      const response = await api.get(`/appointments/customer/${customerId}`);
      return unwrap<AppointmentRecord[]>(response);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load customer appointments.'));
      throw error;
    }
  },

  async createAppointment(payload: AppointmentInput) {
    try {
      const response = await api.post('/appointments', payload);
      return unwrap<AppointmentRecord>(response);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to create appointment.'));
      throw error;
    }
  },

  async updateAppointmentStatus(id: number, status: string) {
    try {
      const response = await api.put(`/appointments/${id}`, { status });
      return unwrap<{ updated: boolean; appointmentId: number }>(response);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to update appointment status.'));
      throw error;
    }
  },

  async deleteAppointment(id: number) {
    try {
      const response = await api.delete(`/appointments/${id}`);
      return unwrap<{ deleted: number }>(response);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to delete appointment.'));
      throw error;
    }
  },
};