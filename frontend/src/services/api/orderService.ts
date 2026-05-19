import { toast } from 'react-hot-toast';
import api from './axios';
import { getApiErrorMessage, unwrap as unwrapResponse } from './apiUtils';

// ========== API Response Types ==========
type ApiResponse<T> = {
  success: boolean;
  message?: string | null;
  data: T;
};

const unwrap = <T,>(response: { data: ApiResponse<T> }) => response.data.data;

// ========== Customer Types ==========
export interface CustomerOption {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

// ========== Product Types ==========
export interface ProductOption {
  id: number;
  name: string;
  sku: string;
  price: number;
  stockQty: number;
  categoryId: number;
  supplierId: number;
}

// ========== Order Item Types ==========
export interface OrderItemInput {
  productId: number;
  quantity: number;
  unitPrice: number;
}

export interface OrderItemSummary {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
}

// ========== Order Types ==========
export interface OrderCreateInput {
  orderDate: string; // ISO date
  creditDueDate?: string; // ISO date
  amountPaid: number;
  status: string;
  customerId: number;
  items: OrderItemInput[];
}

export interface OrderUpdateInput {
  orderDate: string;
  creditDueDate?: string;
  amountPaid: number;
  status: string;
  customerId: number;
  items: OrderItemInput[];
}

export interface OrderListItem {
  id: number;
  orderDate: string;
  creditDueDate?: string;
  amountPaid: number;
  discountAmount: number;
  loyaltyDiscountApplied: boolean;
  totalAmount: number;
  status: string;
  customerId: number;
  itemCount: number;
}

export interface OrderDetail {
  id: number;
  orderDate: string;
  creditDueDate?: string;
  amountPaid: number;
  discountAmount: number;
  loyaltyDiscountApplied: boolean;
  totalAmount: number;
  status: string;
  customerId: number;
  orderItems: OrderItemSummary[];
}

export interface OrderWithCustomer extends OrderDetail {
  customer: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    vehicleNumber?: string;
    vehicleMake?: string;
    vehicleModel?: string;
    vehicleYear?: number;
  };
}

export interface OrderDetailDto extends OrderWithCustomer {
  items: OrderItemSummary[];
}

const mapOrderDetail = (order: OrderWithCustomer): OrderDetailDto => ({
  ...order,
  items: order.orderItems,
});

export interface OrderCreateResult {
  order: OrderListItem;
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  loyaltyDiscountApplied: boolean;
}

// ========== Service Methods ==========
export const orderService = {
  async getCustomerOrders(customerId: number) {
    try {
      const response = await api.get(`/customers/${customerId}/orders`);
      return unwrap<OrderWithCustomer[]>(response).map(mapOrderDetail);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load customer orders.'));
      throw error;
    }
  },

  // ===== Order Operations =====

  /**
   * Get all orders with customer and item details
   */
  async getOrdersWithDetails() {
    try {
      const response = await api.get('/orders/with-details');
      return unwrap<OrderWithCustomer[]>(response).map(mapOrderDetail);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load orders.'));
      throw error;
    }
  },

  /**
   * Get order by ID with items
   */
  async getOrderById(id: number) {
    try {
      const response = await api.get(`/orders/${id}`);
      return unwrapResponse<OrderDetail>(response);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load order.'));
      throw error;
    }
  },

  /**
   * Create a new order with inventory reduction
   * 
   * Workflow:
   * 1. POST /orders to create order
   * 2. For each item, PUT /products/{id} to reduce stock
   * 3. Return created order
   */
  async createOrder(orderData: OrderCreateInput) {
    try {
      const createResponse = await api.post('/orders', {
        orderDate: orderData.orderDate,
        creditDueDate: orderData.creditDueDate,
        amountPaid: orderData.amountPaid,
        status: orderData.status,
        customerId: orderData.customerId,
        items: orderData.items,
      });

      return unwrapResponse<OrderCreateResult>(createResponse);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to create order.'));
      throw error;
    }
  },

  /**
   * Update an existing order
   * 
   * Workflow:
   * 1. Get current order to know old quantities
   * 2. PUT /orders to update order
   * 3. Adjust inventory:
   *    - For removed items: restore stock
   *    - For modified items: adjust by delta
   *    - For new items: reduce stock
   */
  async updateOrder(id: number, orderData: OrderUpdateInput) {
    try {
      const updateResponse = await api.put(`/orders/${id}`, {
        orderDate: orderData.orderDate,
        creditDueDate: orderData.creditDueDate,
        amountPaid: orderData.amountPaid,
        status: orderData.status,
        customerId: orderData.customerId,
        items: orderData.items,
      });

      return unwrapResponse<{ updated: boolean }>(updateResponse);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to update order.'));
      throw error;
    }
  },

  /**
   * Delete an order and restore inventory
   * 
   * Workflow:
   * 1. Get order to know items and quantities
   * 2. DELETE /orders/{id}
   * 3. For each item, PUT /products/{id} to restore stock
   */
  async deleteOrder(id: number) {
    try {
      const deleteResponse = await api.delete(`/orders/${id}`);
      return unwrapResponse<{ deleted: number }>(deleteResponse);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to delete order.'));
      throw error;
    }
  },

  async sendInvoice(id: number) {
    try {
      const response = await api.post(`/orders/${id}/send-invoice`);
      return unwrapResponse<{ sent: boolean; orderId: number }>(response);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to send invoice.'));
      throw error;
    }
  },

  // ===== Lookup Data =====

  /**
   * Get all customers for dropdown selection
   */
  async getCustomers() {
    try {
      const response = await api.get('/customers');
      return unwrapResponse<CustomerOption[]>(response);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load customers.'));
      throw error;
    }
  },

  /**
   * Get all products for item selection
   */
  async getProducts() {
    try {
      const response = await api.get('/products');
      return unwrapResponse<ProductOption[]>(response);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load products.'));
      throw error;
    }
  },

  // ===== Utility =====

  /**
   * Calculate order total from items
   */
  calculateOrderTotal(items: OrderItemInput[]): number {
    return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  },
};
