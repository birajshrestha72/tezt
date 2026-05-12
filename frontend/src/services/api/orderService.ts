import api from './axios';

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
  status: string;
  customerId: number;
  itemCount: number;
}

export interface OrderDetail {
  id: number;
  orderDate: string;
  creditDueDate?: string;
  amountPaid: number;
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
  };
}

// ========== Service Methods ==========
export const orderService = {
  // ===== Order Operations =====

  /**
   * Get all orders with customer and item details
   */
  async getOrdersWithDetails() {
    const response = await api.get<ApiResponse<OrderWithCustomer[]>>('/orders/with-details');
    return unwrap(response);
  },

  /**
   * Get order by ID with items
   */
  async getOrderById(id: number) {
    const response = await api.get<ApiResponse<OrderDetail>>(`/orders/${id}`);
    return unwrap(response);
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
    // Create order first
    const createResponse = await api.post<ApiResponse<OrderListItem>>('/orders', {
      orderDate: orderData.orderDate,
      creditDueDate: orderData.creditDueDate,
      amountPaid: orderData.amountPaid,
      status: orderData.status,
      customerId: orderData.customerId,
      items: orderData.items,
    });

    const createdOrder = unwrap(createResponse);

    // Reduce inventory for each item
    try {
      for (const item of orderData.items) {
        // Get current product to know current stock
        const productResponse = await api.get<ApiResponse<ProductOption>>(`/products/${item.productId}`);
        const product = unwrap(productResponse);
        
        // Reduce stock by order quantity
        const newStock = Math.max(0, product.stockQty - item.quantity);
        await api.put(`/products/${item.productId}`, {
          name: product.name,
          sku: product.sku,
          price: product.price,
          stockQty: newStock,
          categoryId: product.categoryId,
          supplierId: product.supplierId,
        });
      }
    } catch (error) {
      // Log error but don't fail order creation
      // In production, might want to create notification or audit log
      console.error('Inventory update failed:', error);
    }

    return createdOrder;
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
    // Get current order first to calculate inventory adjustments
    let oldOrder: OrderDetail | null = null;
    try {
      oldOrder = await this.getOrderById(id);
    } catch {
      // If we can't get old order, proceed anyway but skip inventory adjustment
    }

    // Update order
    const updateResponse = await api.put<ApiResponse<{ updated: boolean }>>(`/orders/${id}`, {
      orderDate: orderData.orderDate,
      creditDueDate: orderData.creditDueDate,
      amountPaid: orderData.amountPaid,
      status: orderData.status,
      customerId: orderData.customerId,
      items: orderData.items,
    });

    unwrap(updateResponse);

    // Adjust inventory if we have the old order
    if (oldOrder) {
      try {
        // Build maps for easy lookup
        const oldItemMap = new Map(oldOrder.orderItems.map(oi => [oi.productId, oi]));
        const newItemMap = new Map(orderData.items.map(oi => [oi.productId, oi]));

        // Get all unique product IDs
        const allProductIds = new Set([...oldItemMap.keys(), ...newItemMap.keys()]);

        for (const productId of allProductIds) {
          const oldItem = oldItemMap.get(productId);
          const newItem = newItemMap.get(productId);

          // Get current product state
          const productResponse = await api.get<ApiResponse<ProductOption>>(`/products/${productId}`);
          const product = unwrap(productResponse);

          let newStock = product.stockQty;

          if (oldItem && !newItem) {
            // Item removed: restore stock
            newStock += oldItem.quantity;
          } else if (oldItem && newItem) {
            // Item quantity changed: adjust by delta
            const quantityDelta = newItem.quantity - oldItem.quantity;
            newStock -= quantityDelta;
          } else if (!oldItem && newItem) {
            // Item added: reduce stock
            newStock -= newItem.quantity;
          }

          // Ensure stock doesn't go negative
          newStock = Math.max(0, newStock);

          // Update product stock
          await api.put(`/products/${productId}`, {
            name: product.name,
            sku: product.sku,
            price: product.price,
            stockQty: newStock,
            categoryId: product.categoryId,
            supplierId: product.supplierId,
          });
        }
      } catch (error) {
        console.error('Inventory adjustment failed:', error);
      }
    }

    return { updated: true };
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
    // Get order first to know what inventory to restore
    let order: OrderDetail | null = null;
    try {
      order = await this.getOrderById(id);
    } catch {
      // If we can't get order, proceed with deletion anyway
    }

    // Delete order
    const deleteResponse = await api.delete<ApiResponse<{ deleted: number }>>(`/orders/${id}`);
    unwrap(deleteResponse);

    // Restore inventory if we have the order
    if (order) {
      try {
        for (const item of order.orderItems) {
          // Get current product
          const productResponse = await api.get<ApiResponse<ProductOption>>(`/products/${item.productId}`);
          const product = unwrap(productResponse);

          // Restore stock
          const newStock = product.stockQty + item.quantity;
          await api.put(`/products/${item.productId}`, {
            name: product.name,
            sku: product.sku,
            price: product.price,
            stockQty: newStock,
            categoryId: product.categoryId,
            supplierId: product.supplierId,
          });
        }
      } catch (error) {
        console.error('Inventory restoration failed:', error);
      }
    }

    return { deleted: id };
  },

  // ===== Lookup Data =====

  /**
   * Get all customers for dropdown selection
   */
  async getCustomers() {
    const response = await api.get<ApiResponse<CustomerOption[]>>('/customers');
    return unwrap(response);
  },

  /**
   * Get all products for item selection
   */
  async getProducts() {
    const response = await api.get<ApiResponse<ProductOption[]>>('/products');
    return unwrap(response);
  },

  // ===== Utility =====

  /**
   * Calculate order total from items
   */
  calculateOrderTotal(items: OrderItemInput[]): number {
    return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  },
};
