import { toast } from 'react-hot-toast';
import api from './axios';
import { getApiErrorMessage, unwrap } from './apiUtils';

export interface FinancialReportSummary {
  period: string;
  totalRevenue: number;
  totalOrders: number;
  totalItems: number;
  averageOrderValue: number;
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
  vehicleNumber?: string | null;
  vehicleMake?: string | null;
  vehicleModel?: string | null;
  vehicleYear?: number | null;
}

export interface CustomerOrderStat {
  customerId: number;
  customerName: string;
  email?: string | null;
  phone?: string | null;
  orderCount: number;
  totalSpend?: number;
}

export type TopSpenderDto = CustomerOrderStat & { totalSpent?: number };

export type CustomerOrderStatDto = CustomerOrderStat;

export interface PendingCreditCustomerRecord {
  customerId: number;
  customerName: string;
  email?: string | null;
  phone?: string | null;
  overdueOrders: number;
  outstandingAmount: number;
  overdueDays: number;
}

export type CreditReminderReportDto = PendingCreditCustomerRecord & {
  daysOverdue?: number;
  lastOrderDate?: string | null;
};

export interface OrderCountSummary {
  totalOrders: number;
}

export interface TotalAmountSummary {
  totalAmount: number;
}

export const reportService = {
  async getTopSpenders() {
    try {
      const response = await api.get('/reports/customers/top-spenders');
      return unwrap<CustomerOrderStat[]>(response).map((item) => ({
        ...item,
        totalSpent: item.totalSpend,
      })) as TopSpenderDto[];
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load top spenders.'));
      throw error;
    }
  },

  async getPendingCredits() {
    try {
      const response = await api.get('/reports/customers/pending-credits');
      return unwrap<PendingCreditCustomerRecord[]>(response).map((item) => ({
        ...item,
        daysOverdue: item.overdueDays,
        lastOrderDate: null,
      })) as CreditReminderReportDto[];
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load pending credit customers.'));
      throw error;
    }
  },

  async getFinancialReport(period: 'daily' | 'monthly' | 'yearly' = 'monthly', date?: string) {
    try {
      const response = await api.get('/reports/financial', { params: { period, date } });
      return unwrap<FinancialReportSummary>(response);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load financial report.'));
      throw error;
    }
  },

  async getCreditReminderReport() {
    try {
      const response = await api.get('/reports/credit-reminders');
      return unwrap<CreditReminderReportSummary>(response);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load credit reminder report.'));
      throw error;
    }
  },

  async getCustomers() {
    try {
      const response = await api.get('/customers');
      return unwrap<CustomerRecord[]>(response);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load customers.'));
      throw error;
    }
  },

  async getCustomerCount() {
    try {
      const response = await api.get('/customers/count');
      return unwrap<{ totalCustomers: number }>(response);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load customer count.'));
      throw error;
    }
  },

  async getOrderCount() {
    try {
      const response = await api.get('/orders/count');
      return unwrap<OrderCountSummary>(response);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load order count.'));
      throw error;
    }
  },

  async getTotalAmount() {
    try {
      const response = await api.get('/orders/total-amount');
      return unwrap<TotalAmountSummary>(response);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load total amount.'));
      throw error;
    }
  },

  async getTopCustomers() {
    try {
      const response = await api.get('/reports/customers/top-spenders');
      return unwrap<CustomerOrderStat[]>(response);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load top customers.'));
      throw error;
    }
  },

  async getRegularCustomers() {
    try {
      const response = await api.get('/reports/customers/regulars');
      return unwrap<CustomerOrderStat[]>(response);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load regular customers.'));
      throw error;
    }
  },

  async getPendingCreditCustomers() {
    try {
      const response = await api.get('/reports/customers/pending-credits');
      return unwrap<PendingCreditCustomerRecord[]>(response);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load pending credit customers.'));
      throw error;
    }
  },
};
