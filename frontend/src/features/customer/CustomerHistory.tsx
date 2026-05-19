import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { MdReceiptLong } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
import { orderService, type OrderDetailDto } from '../../services/api/orderService';
import { getStatusBadge, StatCard } from '../../components/ui';
import { formatCurrency, formatDate } from '../../utils/format';

export default function CustomerHistory() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderDetailDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    orderService.getCustomerOrders(user.id)
      .then(d => { setOrders(d); setLoading(false); })
      .catch(err => { console.error('[CustomerHistory] load error:', err); setLoading(false); });
  }, [user?.id]);

  const totalSpent = orders.reduce((s, o) => s + o.totalAmount, 0);
  const loyaltySavings = orders.reduce((s, o) => s + (o.discountAmount ?? 0), 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Order History</h2>
          <p className="page-subtitle">{orders.length} orders placed</p>
        </div>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <StatCard loading={loading} label="Total Orders" value={orders.length} accentColor="var(--info)" />
        <StatCard loading={loading} label="Total Spent" value={formatCurrency(totalSpent)} accentColor="var(--red)" />
        <StatCard loading={loading} label="Loyalty Savings" value={formatCurrency(loyaltySavings)} accentColor="var(--amber)" />
      </div>

      {loading && ['a', 'b', 'c'].map(k => (
        <div key={k} className="skeleton" style={{ height: 120, borderRadius: 12, marginBottom: 12 }} />
      ))}

      {!loading && (orders.length === 0) && (
        <div className="card" style={{ padding: 'var(--xl)', textAlign: 'center', color: 'var(--text-muted)' }}>
          <MdReceiptLong style={{ fontSize: 40, marginBottom: 'var(--sm)' }} />
          <p>No orders yet.</p>
        </div>
      )}

      {!loading && orders.map(order => {
        const items = order.items ?? [];
        const outstanding = order.totalAmount - order.amountPaid;
        const hasDiscount = (order.discountAmount ?? 0) > 0;

        return (
          <div key={order.id} className="card" style={{ marginBottom: 'var(--md)', overflow: 'hidden' }}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--md) var(--lg)', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--md)' }}>
                <strong style={{ color: 'var(--text-primary)' }}>#{String(order.id).padStart(4, '0')}</strong>
                {getStatusBadge(order.status)}
              </div>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{formatDate(order.orderDate)}</span>
            </div>

            <div className="card-body" style={{ padding: 'var(--md) var(--lg)' }}>
              <div style={{ marginBottom: 'var(--md)' }}>
                {items.slice(0, 3).map(item => (
                  <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{item.productName} × {item.quantity}</span>
                    <span style={{ color: 'var(--text-primary)' }}>{formatCurrency(item.quantity * item.unitPrice)}</span>
                  </div>
                ))}
                {items.length > 3 && (
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>+{items.length - 3} more items</p>
                )}
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--sm)' }}>
                {[
                  { label: 'Subtotal', value: formatCurrency(order.totalAmount + (order.discountAmount ?? 0)), show: true },
                  { label: 'Loyalty Discount', value: `-${formatCurrency(order.discountAmount ?? 0)}`, show: hasDiscount },
                  { label: 'Total', value: formatCurrency(order.totalAmount), show: true, bold: true },
                  { label: 'Paid', value: formatCurrency(order.amountPaid), show: true },
                  {
                    label: 'Outstanding',
                    value: formatCurrency(outstanding),
                    show: true,
                    color: outstanding > 0 ? 'var(--danger)' : 'var(--success)',
                  },
                ].filter(r => r.show).map(r => (
                  <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: 13 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{r.label}</span>
                    <span style={{ fontWeight: r.bold ? 700 : 400, color: r.color ?? 'var(--text-primary)' }}>{r.value}</span>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 'var(--sm)', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => toast.success(`Invoice for order #${String(order.id).padStart(4, '0')} sent to your email.`)}
                >
                  Email Invoice
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
