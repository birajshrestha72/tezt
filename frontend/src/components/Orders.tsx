import React, { useState, useEffect, useMemo } from 'react';
import {
  ShoppingCart,
  Search,
  Plus,
  Trash2,
  Edit2,
  ChevronDown,
  X,
  AlertCircle,
  CheckCircle,
  DollarSign,
} from 'lucide-react';
import {
  orderService,
  OrderWithCustomer,
  OrderItemInput,
  OrderCreateInput,
  OrderUpdateInput,
  CustomerOption,
  ProductOption,
} from '../services/api/orderService';

// ========== Order Form Modal Component ==========
interface OrderFormProps {
  isOpen: boolean;
  order?: OrderWithCustomer | null;
  customers: CustomerOption[];
  products: ProductOption[];
  onSave: (data: OrderCreateInput | OrderUpdateInput) => Promise<void>;
  onCancel: () => void;
  isSaving?: boolean;
}

const OrderFormModal: React.FC<OrderFormProps> = ({
  isOpen,
  order,
  customers,
  products,
  onSave,
  onCancel,
  isSaving = false,
}) => {
  const [formData, setFormData] = useState<{
    orderDate: string;
    creditDueDate: string;
    customerId: number;
    amountPaid: number;
    status: string;
    items: OrderItemInput[];
  }>({
    orderDate: new Date().toISOString().split('T')[0],
    creditDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    customerId: 0,
    amountPaid: 0,
    status: 'Pending',
    items: [],
  });

  const [itemForm, setItemForm] = useState({ productId: 0, quantity: 1, unitPrice: 0 });

  // Initialize form with order data if editing
  useEffect(() => {
    if (order) {
      setFormData({
        orderDate: order.orderDate.split('T')[0],
        creditDueDate: order.creditDueDate?.split('T')[0] || '',
        customerId: order.customerId,
        amountPaid: order.amountPaid,
        status: order.status,
        items: order.orderItems.map((oi) => ({
          productId: oi.productId,
          quantity: oi.quantity,
          unitPrice: oi.unitPrice,
        })),
      });
    } else {
      setFormData({
        orderDate: new Date().toISOString().split('T')[0],
        creditDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        customerId: 0,
        amountPaid: 0,
        status: 'Pending',
        items: [],
      });
    }
    setItemForm({ productId: 0, quantity: 1, unitPrice: 0 });
  }, [order, isOpen]);

  const handleAddItem = () => {
    if (itemForm.productId && itemForm.quantity && itemForm.unitPrice) {
      // Check if item already exists
      const exists = formData.items.some((i) => i.productId === itemForm.productId);
      if (!exists) {
        setFormData((prev) => ({
          ...prev,
          items: [...prev.items, { ...itemForm }],
        }));
        setItemForm({ productId: 0, quantity: 1, unitPrice: 0 });
      }
    }
  };

  const handleRemoveItem = (productId: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.productId !== productId),
    }));
  };

  const handleUpdateItem = (productId: number, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((i) =>
        i.productId === productId ? { ...i, [field]: value } : i
      ),
    }));
  };

  const orderTotal = orderService.calculateOrderTotal(formData.items);

  const handleSubmit = async () => {
    if (!formData.customerId || !formData.items.length) {
      alert('Please select a customer and add at least one item');
      return;
    }

    try {
      await onSave({
        orderDate: `${formData.orderDate}T00:00:00Z`,
        creditDueDate: formData.creditDueDate
          ? `${formData.creditDueDate}T00:00:00Z`
          : undefined,
        customerId: formData.customerId,
        amountPaid: formData.amountPaid,
        status: formData.status,
        items: formData.items,
      });
      onCancel();
    } catch (error) {
      alert('Failed to save order');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end md:items-center md:justify-center">
      <div className="bg-white w-full md:max-w-2xl md:rounded-lg shadow-xl md:max-h-[90vh] overflow-y-auto rounded-t-lg md:rounded-t-lg">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex justify-between items-center">
          <h2 className="text-lg font-bold">{order ? 'Edit Order' : 'Create Order'}</h2>
          <button
            onClick={onCancel}
            className="hover:bg-white hover:bg-opacity-20 p-1 rounded"
            disabled={isSaving}
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Customer Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer *
            </label>
            <select
              value={formData.customerId}
              onChange={(e) => setFormData((prev) => ({ ...prev, customerId: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSaving}
            >
              <option value={0}>Select a customer...</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.firstName} {c.lastName} ({c.email})
                </option>
              ))}
            </select>
          </div>

          {/* Order Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order Date *
              </label>
              <input
                type="date"
                value={formData.orderDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, orderDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSaving}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Credit Due Date
              </label>
              <input
                type="date"
                value={formData.creditDueDate}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, creditDueDate: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSaving}
              />
            </div>
          </div>

          {/* Status and Amount Paid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSaving}
              >
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="Shipped">Shipped</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount Paid ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.amountPaid}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, amountPaid: Number(e.target.value) }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSaving}
              />
            </div>
          </div>

          {/* Order Items Section */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>

            {/* Add Item Form */}
            <div className="bg-gray-50 p-3 rounded-md mb-3 space-y-2">
              <div className="grid grid-cols-12 gap-2">
                <select
                  value={itemForm.productId}
                  onChange={(e) =>
                    setItemForm((prev) => ({ ...prev, productId: Number(e.target.value) }))
                  }
                  className="col-span-6 px-2 py-1 border border-gray-300 rounded text-sm"
                  disabled={isSaving}
                >
                  <option value={0}>Select product...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Stock: {p.stockQty})
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  value={itemForm.quantity}
                  onChange={(e) =>
                    setItemForm((prev) => ({ ...prev, quantity: Number(e.target.value) }))
                  }
                  placeholder="Qty"
                  className="col-span-2 px-2 py-1 border border-gray-300 rounded text-sm"
                  disabled={isSaving}
                />
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={itemForm.unitPrice}
                  onChange={(e) =>
                    setItemForm((prev) => ({ ...prev, unitPrice: Number(e.target.value) }))
                  }
                  placeholder="Price"
                  className="col-span-2 px-2 py-1 border border-gray-300 rounded text-sm"
                  disabled={isSaving}
                />
                <button
                  onClick={handleAddItem}
                  className="col-span-2 bg-green-600 text-white px-2 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50"
                  disabled={isSaving}
                >
                  Add
                </button>
              </div>
            </div>

            {/* Items List */}
            {formData.items.length > 0 ? (
              <div className="space-y-2 mb-3">
                {formData.items.map((item) => {
                  const product = products.find((p) => p.id === item.productId);
                  const lineTotal = item.quantity * item.unitPrice;
                  return (
                    <div
                      key={item.productId}
                      className="bg-gray-50 p-3 rounded-md flex justify-between items-start"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm">{product?.name}</p>
                        <p className="text-xs text-gray-600">
                          {item.quantity} × ${item.unitPrice.toFixed(2)} = $
                          {lineTotal.toFixed(2)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.productId)}
                        className="text-red-600 hover:text-red-700 p-1"
                        disabled={isSaving}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500 mb-3">No items added yet</p>
            )}

            {/* Order Total */}
            <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
              <p className="text-right">
                <span className="font-semibold text-lg">
                  Order Total: ${orderTotal.toFixed(2)}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 px-4 py-3 flex justify-end gap-2 border-t">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : order ? 'Update Order' : 'Create Order'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ========== Delete Confirmation Modal ==========
interface DeleteConfirmProps {
  isOpen: boolean;
  orderId: number;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  isDeleting?: boolean;
}

const DeleteConfirmModal: React.FC<DeleteConfirmProps> = ({
  isOpen,
  orderId,
  onConfirm,
  onCancel,
  isDeleting = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
        <div className="p-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
            <AlertCircle className="text-red-600" size={24} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2 text-center">
            Delete Order
          </h3>
          <p className="text-gray-500 text-sm text-center mb-6">
            Are you sure you want to delete order #{orderId}? Inventory will be restored.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ========== Main Orders Component ==========
export default function OrdersView() {
  const [orders, setOrders] = useState<OrderWithCustomer[]>([]);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithCustomer | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; orderId: number | null }>({
    isOpen: false,
    orderId: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [ordersData, customersData, productsData] = await Promise.all([
          orderService.getOrdersWithDetails(),
          orderService.getCustomers(),
          orderService.getProducts(),
        ]);
        setOrders(ordersData);
        setCustomers(customersData);
        setProducts(productsData);
      } catch (err: any) {
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter and search
  const filteredOrders = useMemo(() => {
    if (!search) return orders;
    const searchLower = search.toLowerCase();
    return orders.filter(
      (o) =>
        o.id.toString().includes(searchLower) ||
        `${o.customer.firstName} ${o.customer.lastName}`.toLowerCase().includes(searchLower) ||
        o.customer.email.toLowerCase().includes(searchLower)
    );
  }, [orders, search]);

  // Handle create/update
  const handleSave = async (data: OrderCreateInput | OrderUpdateInput) => {
    setIsSaving(true);
    try {
      if (selectedOrder) {
        await orderService.updateOrder(selectedOrder.id, data as OrderUpdateInput);
      } else {
        await orderService.createOrder(data as OrderCreateInput);
      }
      // Reload orders
      const updatedOrders = await orderService.getOrdersWithDetails();
      setOrders(updatedOrders);
      setSelectedOrder(null);
      setIsFormOpen(false);
    } catch (err: any) {
      alert(err.message || 'Failed to save order');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deleteConfirm.orderId) return;

    setIsDeleting(true);
    try {
      await orderService.deleteOrder(deleteConfirm.orderId);
      // Reload orders
      const updatedOrders = await orderService.getOrdersWithDetails();
      setOrders(updatedOrders);
      setDeleteConfirm({ isOpen: false, orderId: null });
    } catch (err: any) {
      alert(err.message || 'Failed to delete order');
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle edit
  const handleEdit = (order: OrderWithCustomer) => {
    setSelectedOrder(order);
    setIsFormOpen(true);
  };

  // Handle create
  const handleCreate = () => {
    setSelectedOrder(null);
    setIsFormOpen(true);
  };

  const metrics = [
    {
      label: 'Total Orders',
      value: orders.length.toString(),
      hint: 'Tracked across the current session',
      icon: ShoppingCart,
    },
    {
      label: 'Visible Orders',
      value: filteredOrders.length.toString(),
      hint: 'Matching the active search',
      icon: Search,
    },
    {
      label: 'Customers Loaded',
      value: customers.length.toString(),
      hint: 'Ready for new sales',
      icon: CheckCircle,
    },
    {
      label: 'Estimated Revenue',
      value: `$${orders
        .reduce(
          (sum, order) =>
            sum +
            orderService.calculateOrderTotal(
              order.orderItems.map((oi) => ({
                productId: oi.productId,
                quantity: oi.quantity,
                unitPrice: oi.unitPrice,
              }))
            ),
          0
        )
        .toFixed(2)}`,
      hint: 'Derived from order line items',
      icon: DollarSign,
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 bg-bg-primary min-h-screen">
      <section className="flex flex-col gap-5 rounded-3xl border border-border-light bg-surface-container/70 p-5 shadow-xl shadow-black/10 backdrop-blur md:p-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-border-light bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-text-secondary">
            <ShoppingCart className="h-3.5 w-3.5" />
            Sales Operations
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-text-primary sm:text-[2.15rem]">Orders & Sales</h1>
            <p className="max-w-2xl text-sm font-medium leading-6 text-text-secondary">
              Manage customer orders, payment status, and inventory movement from one operational dashboard.
            </p>
          </div>
        </div>

        <button
          onClick={handleCreate}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-default px-5 py-3 text-sm font-bold text-white shadow-lg shadow-brand-default/20 transition-transform duration-base hover:-translate-y-0.5 hover:bg-brand-hover sm:w-auto"
        >
          <Plus size={18} />
          Create Order
        </button>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <article key={metric.label} className="rounded-3xl border border-border-light bg-surface-container/70 p-5 shadow-lg shadow-black/10 transition-all duration-base hover:-translate-y-0.5 hover:border-brand-default/30 hover:shadow-xl hover:shadow-black/20">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-text-tertiary">{metric.label}</p>
                <h2 className="mt-3 text-3xl font-black tracking-tight text-text-primary">{metric.value}</h2>
                <p className="mt-2 text-sm text-text-tertiary">{metric.hint}</p>
              </div>
              <div className="rounded-2xl bg-white/5 p-3 text-brand-default">
                <metric.icon className="h-5 w-5" />
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm font-medium text-danger">
          <AlertCircle size={20} className="flex-shrink-0 mr-2" />
          {error}
        </div>
      )}

      <section className="rounded-3xl border border-border-light bg-surface-container/70 shadow-xl shadow-black/10">
        <div className="flex flex-col gap-4 border-b border-border-light px-5 py-4 md:flex-row md:items-center md:justify-between md:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-text-tertiary">Order register</p>
            <h3 className="mt-1 text-lg font-bold text-text-primary">Search, review, and manage live sales</h3>
          </div>

          <div className="w-full md:max-w-lg">
            <label className="flex items-center gap-3 rounded-2xl border border-border-light bg-bg-secondary px-4 py-3 transition focus-within:border-brand-default/40 focus-within:ring-2 focus-within:ring-brand-default/10">
              <Search size={18} className="text-text-tertiary" />
              <input
                type="text"
                placeholder="Search by order ID, customer name, or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent text-sm text-text-primary outline-none placeholder:text-text-tertiary"
              />
            </label>
          </div>
        </div>

      {filteredOrders.length > 0 ? (
        <div className="overflow-hidden rounded-b-3xl">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border-light bg-bg-secondary">
                <tr>
                  <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.22em] text-text-tertiary">
                    Order ID
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.22em] text-text-tertiary">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.22em] text-text-tertiary">
                    Items
                  </th>
                  <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-[0.22em] text-text-tertiary">
                    Total
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.22em] text-text-tertiary">
                    Status
                  </th>
                  <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-[0.22em] text-text-tertiary">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light/60">
                {filteredOrders.map((order) => {
                  const orderTotal = orderService.calculateOrderTotal(
                    order.orderItems.map((oi) => ({
                      productId: oi.productId,
                      quantity: oi.quantity,
                      unitPrice: oi.unitPrice,
                    }))
                  );

                  const statusColor = {
                    Pending: 'bg-warning/10 text-warning border-warning/20',
                    Paid: 'bg-success/10 text-success border-success/20',
                    Shipped: 'bg-info/10 text-info border-info/20',
                    Cancelled: 'bg-danger/10 text-danger border-danger/20',
                  }[order.status] || 'bg-bg-secondary text-text-secondary border-border-light';

                  return (
                    <tr key={order.id} className="transition-colors hover:bg-white/5">
                      <td className="px-6 py-4 whitespace-nowrap font-semibold text-brand-default">
                        #{order.id}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-text-primary">
                          {order.customer.firstName} {order.customer.lastName}
                        </div>
                        <div className="text-xs text-text-secondary">{order.customer.email}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-text-secondary">
                        {order.orderItems.length} item{order.orderItems.length !== 1 ? 's' : ''}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-text-primary">
                        ${orderTotal.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${statusColor}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center space-x-2">
                        <button
                          onClick={() => handleEdit(order)}
                          className="inline-flex items-center justify-center rounded-xl border border-border-light bg-white/5 p-2 text-brand-default transition hover:border-brand-default/30 hover:bg-brand-default/10"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ isOpen: true, orderId: order.id })}
                          className="inline-flex items-center justify-center rounded-xl border border-border-light bg-white/5 p-2 text-danger transition hover:border-danger/30 hover:bg-danger/10"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-border-light/60">
            {filteredOrders.map((order) => {
              const orderTotal = orderService.calculateOrderTotal(
                order.orderItems.map((oi) => ({
                  productId: oi.productId,
                  quantity: oi.quantity,
                  unitPrice: oi.unitPrice,
                }))
              );

              const statusColor = {
                Pending: 'bg-warning/10 text-warning border-warning/20',
                Paid: 'bg-success/10 text-success border-success/20',
                Shipped: 'bg-info/10 text-info border-info/20',
                Cancelled: 'bg-danger/10 text-danger border-danger/20',
              }[order.status] || 'bg-bg-secondary text-text-secondary border-border-light';

              return (
                <div key={order.id} className="space-y-4 px-5 py-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-brand-default">Order #{order.id}</p>
                      <p className="text-sm text-text-primary">
                        {order.customer.firstName} {order.customer.lastName}
                      </p>
                      <p className="text-xs text-text-secondary">{order.customer.email}</p>
                    </div>
                    <span className={`inline-block rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${statusColor}`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">
                      {order.orderItems.length} item{order.orderItems.length !== 1 ? 's' : ''}
                    </span>
                    <span className="font-semibold text-text-primary">${orderTotal.toFixed(2)}</span>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-border-light/60">
                    <button
                      onClick={() => handleEdit(order)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border-light bg-white/5 px-3 py-2 text-sm text-brand-default transition hover:border-brand-default/30 hover:bg-brand-default/10"
                    >
                      <Edit2 size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteConfirm({ isOpen: true, orderId: order.id })}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border-light bg-white/5 px-3 py-2 text-sm text-danger transition hover:border-danger/30 hover:bg-danger/10"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="rounded-b-3xl px-5 py-14 text-center">
          <ShoppingCart size={48} className="mx-auto mb-4 text-text-tertiary" />
          <h3 className="mb-2 text-lg font-semibold text-text-primary">No orders found</h3>
          <p className="mb-4 text-sm text-text-secondary">
            {search ? 'Try adjusting your search criteria' : 'Create your first order to get started'}
          </p>
          {!search && (
            <button
              onClick={handleCreate}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-default px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-default/20 transition hover:bg-brand-hover"
            >
              <Plus size={20} />
              Create Order
            </button>
          )}
        </div>
      )}
      </section>

      {/* Order Form Modal */}
      <OrderFormModal
        isOpen={isFormOpen}
        order={selectedOrder}
        customers={customers}
        products={products}
        onSave={handleSave}
        onCancel={() => {
          setIsFormOpen(false);
          setSelectedOrder(null);
        }}
        isSaving={isSaving}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteConfirm.isOpen}
        orderId={deleteConfirm.orderId || 0}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, orderId: null })}
        isDeleting={isDeleting}
      />
    </div>
  );
}
