import api from './axios';

type ApiResponse<T> = {
  success: boolean;
  message?: string | null;
  data: T;
};

const unwrap = <T,>(response: { data: ApiResponse<T> }) => response.data.data;

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

export const aiService = {
  async getDashboardSummary() {
    const response = await api.get<ApiResponse<DashboardSummary>>('/dashboard/summary');
    return unwrap(response);
  },

  async getInsights() {
    const response = await api.get<ApiResponse<DashboardInsightResponse>>('/dashboard/insights');
    return unwrap(response);
  },
};
