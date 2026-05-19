import { toast } from 'react-hot-toast';
import api from './axios';
import { getApiErrorMessage, unwrap as unwrapResponse } from './apiUtils';

export interface DashboardSummary {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  lowStockProducts: number;
  totalCategories: number;
  totalSuppliers: number;
  totalCustomers: number;
  totalOrderItems: number;
}

export interface DashboardInsightResponse {
  insight: string;
}

export interface MaintenancePrediction {
  component: string;
  severity: 'Good' | 'Warning' | 'Critical';
  message: string;
  recommendedAction: string;
  estimatedCost?: string;
}

export const aiService = {
  async getDashboardSummary() {
    try {
      const response = await api.get('/dashboard/summary');
      return unwrapResponse<DashboardSummary>(response);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load dashboard summary.'));
      throw error;
    }
  },

  async getInsights() {
    try {
      const response = await api.get('/dashboard/insights');
      return unwrapResponse<DashboardInsightResponse>(response);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load AI insights.'));
      throw error;
    }
  },

  async getDiagnostics(vehicleMake: string, vehicleModel: string, vehicleYear: number, recentParts: string[]) {
    try {
      const response = await api.post('/dashboard/diagnostics', {
        vehicleMake,
        vehicleModel,
        vehicleYear,
        recentParts,
      });

      return unwrapResponse<MaintenancePrediction[]>(response);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to run vehicle diagnostics.'));
      throw error;
    }
  },
};
