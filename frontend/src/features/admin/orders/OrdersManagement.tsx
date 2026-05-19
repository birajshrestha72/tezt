import React, { useEffect, useState, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { MdVisibility, MdEmail, MdDelete, MdTag } from 'react-icons/md';
import { orderService, type OrderDetailDto } from '../../../services/api/orderService';
import { DataTable, type Column, Badge, getStatusBadge, Modal, ConfirmDialog, Pagination, StatCard } from '../../../components/ui';

const PAGE = 12;
const STATUSES = ['All', 'Pending', 'Paid', 'Shipped', 'Cancelled'];

export default function OrdersManagement() {
  const [orders, setOrders] = useState<OrderDetailDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [viewTarget, setViewTarget] = useState<OrderDetailDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<OrderDetailDto | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await orderService.getOrdersWithDetails();
      setOrders(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return orders.filter(o => {
      const matchSearch = !q || String(o.id).includes(q) || `${o.customer.firstName} ${o.customer.lastName}`.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'All' || o.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [orders, search, statusFilter]);

  const paged = filtered.slice((page - 1) * PAGE, page * PAGE);

  const paid = orders.filter(o => o.status === 'Paid').length;
  const pending = orders.filter(o => o.status === 'Pending').length;
  const totalRevenue = orders.reduce((s, o) => s + o.totalAmount, 0);

  const handleSendInvoice = async (id: number) => {
    try {
      await orderService.sendInvoice(id);
      toast.success('Invoice sent.');
    } catch {
      /* handled by service */
    }
  };

  const handleDelete = async () => {
    await orderService.deleteOrder(deleteTarget!.id);
    toast.success('Order deleted.');
    setDeleteTarget(null);
    void load();
  };

  const columns: Column<OrderDetailDto>[] = [
    { key: 'id', label: 'Order #', render: r => <strong>#{String(r.id).padStart(4, '0')}</strong> },
    {
      key: 'customer', label: 'Customer',
      render: r => (
        <div>
          <p className="emp-name">{r.customer.firstName} {r.customer.lastName}</p>
          <p className="emp-sub">{r.customer.email}</p>
        </div>
      ),
    },
    { key: 'orderDate', label: 'Date', render: r => new Date(r.orderDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) },
    { key: 'items', label: 'Items', render: r => <Badge variant="info">{(r.items ?? []).length} items</Badge> },
    {
      key: 'totalAmount', label: 'Total', align: 'right',
      render: r => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
          <strong>${r.totalAmount.toFixed(2)}</strong>
          {r.loyaltyDiscountApplied && <MdTag style={{ color: 'var(--amber)', fontSize: 14 }} />}
        </div>
      ),
    },
    { key: 'amountPaid', label: 'Paid', align: 'right', render: r => `$${r.amountPaid.toFixed(2)}` },
    { key: 'status', label: 'Status', render: r => getStatusBadge(r.status) },
    {
      key: 'actions', label: '', align: 'right',
      render: r => (
        <div className="action-btns">
          <button className="tbl-btn" aria-label="View" onClick={() => setViewTarget(r)}><MdVisibility /></button>
          <button className="tbl-btn" aria-label="Send invoice" onClick={() => handleSendInvoice(r.id)} title="Send Invoice"><MdEmail /></button>
          <button className="tbl-btn del" aria-label="Delete" onClick={() => setDeleteTarget(r)}><MdDelete /></button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Orders Management</h2>
          <p className="page-subtitle">All sales orders with customer and item details</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard loading={loading} label="Total Orders" value={orders.length} accentColor="var(--info)" />
        <StatCard loading={loading} label="Paid" value={paid} accentColor="var(--success)" />
        <StatCard loading={loading} label="Pending" value={pending} accentColor="var(--warning)" />
        <StatCard loading={loading} label="Total Revenue" value={`$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} accentColor="var(--amber)" />
      </div>

      <div className="toolbar">
        <div className="search-wrap" style={{ flex: 1, maxWidth: 300 }}>
          <input className="form-input" placeholder="Search order # or customer…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select className="form-select" style={{ width: 150 }} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{filtered.length} orders</span>
      </div>

      <DataTable
        columns={columns}
        data={paged}
        loading={loading}
        keyExtractor={r => r.id}
        emptyMessage="No orders found."
      />

      {filtered.length > PAGE && (
        <Pagination total={filtered.length} page={page} pageSize={PAGE} onChange={p => setPage(p)} />
      )}

      {/* Order Detail Modal */}
      <Modal isOpen={!!viewTarget} onClose={() => setViewTarget(null)} title={`Order #${String(viewTarget?.id ?? '').padStart(4, '0')}`} size="xl"
        footer={
          <>
            {viewTarget && (
              <button className="btn btn-primary btn-md" onClick={() => handleSendInvoice(viewTarget.id)}>
                <MdEmail /> Send Invoice
              </button>
            )}
            <button className="btn btn-ghost" onClick={() => setViewTarget(null)}>Close</button>
          </>
        }
      >
        {viewTarget && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--md)', marginBottom: 'var(--lg)' }}>
              <div className="card" style={{ padding: 'var(--md)' }}>
                <p style={{ fontWeight: 700, marginBottom: 'var(--sm)', color: 'var(--text-primary)' }}>Customer</p>
                <p className="emp-name">{viewTarget.customer.firstName} {viewTarget.customer.lastName}</p>
                <p className="emp-sub">{viewTarget.customer.email}</p>
                {viewTarget.customer.phone && <p className="emp-sub">{viewTarget.customer.phone}</p>}
                {viewTarget.customer.vehicleMake && (
                  <p className="emp-sub">{viewTarget.customer.vehicleMake} {viewTarget.customer.vehicleModel} {viewTarget.customer.vehicleYear}</p>
                )}
              </div>
              <div className="card" style={{ padding: 'var(--md)' }}>
                <p style={{ fontWeight: 700, marginBottom: 'var(--sm)', color: 'var(--text-primary)' }}>Order Info</p>
                <p className="emp-sub">Date: {new Date(viewTarget.orderDate).toLocaleDateString('en-GB')}</p>
                <div style={{ marginTop: 8 }}>{getStatusBadge(viewTarget.status)}</div>
              </div>
            </div>

            <div className="table-card" style={{ marginBottom: 'var(--md)' }}>
              <table className="data-table">
                <thead><tr><th>Product</th><th>Qty</th><th>Unit Price</th><th className="right">Line Total</th></tr></thead>
                <tbody>
                  {(viewTarget.items ?? []).map(item => (
                    <tr key={item.productId}>
                      <td>{item.productName}</td>
                      <td>{item.quantity}</td>
                      <td>${item.unitPrice.toFixed(2)}</td>
                      <td className="right"><strong>${(item.quantity * item.unitPrice).toFixed(2)}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ maxWidth: 320, marginLeft: 'auto' }}>
              {[
                { label: 'Subtotal', value: `$${(viewTarget.totalAmount + viewTarget.discountAmount).toFixed(2)}` },
                ...(viewTarget.loyaltyDiscountApplied ? [{ label: 'Loyalty Discount', value: `-$${viewTarget.discountAmount.toFixed(2)}`, color: 'var(--amber)' }] : []),
                { label: 'Total', value: `$${viewTarget.totalAmount.toFixed(2)}`, bold: true },
                { label: 'Amount Paid', value: `$${viewTarget.amountPaid.toFixed(2)}` },
                {
                  label: 'Outstanding',
                  value: `$${(viewTarget.totalAmount - viewTarget.amountPaid).toFixed(2)}`,
                  color: viewTarget.totalAmount - viewTarget.amountPaid > 0 ? 'var(--danger)' : 'var(--success)',
                  bold: true,
                },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{row.label}</span>
                  <span style={{ fontWeight: row.bold ? 700 : 400, color: row.color ?? 'var(--text-primary)', fontSize: 14 }}>{row.value}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={`Delete Order #${String(deleteTarget?.id ?? '').padStart(4, '0')}?`}
        message="This action cannot be undone."
        dangerous
      />
    </div>
  );
}
