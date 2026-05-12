import api from './axios';

type ApiResponse<T> = {
  success: boolean;
  message?: string | null;
  data: T;
};

const unwrap = <T,>(response: { data: ApiResponse<T> }) => response.data.data;

export interface FinancialReportSummary {
  totalRevenue: number;
  totalOrders: number;
}

export interface CreditReminderReportItem {
  orderId: number;
  customerId: number;
  customerName: string;
  customerEmail: string;
  orderDate: string;
  dueDate: string;
  overdueDays: number;
  orderTotal: number;
  amountPaid: number;
  outstandingAmount: number;
  status: string;
  subject: string;
  body: string;
  referenceKey: string;
  notificationType: string;
  payloadJson?: string | null;
}

export interface CreditReminderReportSummary {
  overdueOrders: number;
  overdueCustomers: number;
  totalOutstandingAmount: number;
  reminders: CreditReminderReportItem[];
}

export interface CustomerRecord {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
}

export interface CustomerOrderStat {
  customerId: number;
  customerName: string;
  orderCount: number;
}

export interface OrderCountSummary {
  totalOrders: number;
}

export interface TotalAmountSummary {
  totalAmount: number;
}

export const reportService = {
  async getFinancialReport() {
    const response = await api.get<ApiResponse<FinancialReportSummary>>('/reports/financial');
    return unwrap(response);
  },

  async getCreditReminderReport() {
    const response = await api.get<ApiResponse<CreditReminderReportSummary>>('/reports/credit-reminders');
    return unwrap(response);
  },

  async getCustomers() {
    const response = await api.get<ApiResponse<CustomerRecord[]>>('/customers');
    return unwrap(response);
  },

  async getCustomerCount() {
    const response = await api.get<ApiResponse<{ totalCustomers: number }>>('/customers/count');
    return unwrap(response);
  },

  async getOrderCount() {
    const response = await api.get<ApiResponse<OrderCountSummary>>('/orders/count');
    return unwrap(response);
  },

  async getTotalAmount() {
    const response = await api.get<ApiResponse<TotalAmountSummary>>('/orders/total-amount');
    return unwrap(response);
  },

  async getTopCustomers() {
    const response = await api.get<ApiResponse<CustomerOrderStat[]>>('/orders/top-customers');
    return unwrap(response);
  },
};
