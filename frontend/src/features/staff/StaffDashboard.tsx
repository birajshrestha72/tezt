import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdAddShoppingCart, MdSearch, MdAssessment, MdReceipt } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
import { orderService, type OrderListItem } from '../../services/api/orderService';
import { reportService } from '../../services/api/reportService';
import { appointmentService } from '../../services/api/appointmentService';
import { StatCard, getStatusBadge, DataTable, type Column } from '../../components/ui';

const FMT_DATE = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

const isToday = (dateStr: string) => {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
};

export default function StaffDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [customerCount, setCustomerCount] = useState(0);
  const [appointmentCount, setAppointmentCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [ordRes, custRes, apptRes] = await Promise.allSettled([
        orderService.getOrdersWithDetails(),
        reportService.getCustomerCount(),
        appointmentService.getAppointments(),
      ]);
      if (ordRes.status === 'fulfilled') setOrders(ordRes.value as unknown as OrderListItem[]);
      if (custRes.status === 'fulfilled') setCustomerCount(custRes.value.totalCustomers);
      if (apptRes.status === 'fulfilled') setAppointmentCount(apptRes.value.filter(a => a.status !== 'Cancelled').length);
      setLoading(false);
    };
    void load();
  }, []);

  const todayOrders = orders.filter(o => isToday(o.orderDate));
  const recentOrders = [...orders].sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()).slice(0, 5);

  const QUICK = [
    { label: 'New Sale',       icon: <MdAddShoppingCart />, path: '/staff/sales' },
    { label: 'Customer Search',icon: <MdSearch />,          path: '/staff/customers' },
    { label: 'View Reports',   icon: <MdAssessment />,      path: '/staff/reports' },
    { label: 'All Orders',     icon: <MdReceipt />,         path: '/staff/sales' },
  ] as const;

  const columns: Column<OrderListItem>[] = [
    { key: 'id', label: 'Order #', render: r => <strong>#{String(r.id).padStart(4, '0')}</strong> },
    { key: 'customerId', label: 'Customer ID', render: r => `#${r.customerId}` },
    { key: 'totalAmount', label: 'Total', align: 'right', render: r => <strong>${r.totalAmount.toFixed(2)}</strong> },
    { key: 'status', label: 'Status', render: r => getStatusBadge(r.status) },
    { key: 'orderDate', label: 'Date', render: r => new Date(r.orderDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <p style={{ fontSize: 'var(--head-md)', fontWeight: 700, color: 'var(--text-primary)' }}>
            {greeting()}, {user?.name ?? 'Staff'}
          </p>
          <p className="page-subtitle">{FMT_DATE.format(new Date())}</p>
        </div>
        <button className="btn btn-primary btn-lg" onClick={() => navigate('/staff/sales')}>
          <MdAddShoppingCart /> New Sale
        </button>
      </div>

      <div className="stats-grid">
        <StatCard loading={loading} label="Today's Orders" value={todayOrders.length} hint="Sales processed today" accentColor="var(--red)" />
        <StatCard loading={loading} label="Total Customers" value={customerCount} hint="Registered customers" accentColor="var(--info)" />
        <StatCard loading={loading} label="Active Appointments" value={appointmentCount} hint="Upcoming bookings" accentColor="var(--amber)" />
        <StatCard loading={false} label="Create Sale" value="→" hint="Process a new order" accentColor="var(--success)" onClick={() => navigate('/staff/sales')} />
      </div>

      <div className="quick-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 'var(--xl)' }}>
        {QUICK.map(q => (
          <button key={q.label} className="quick-btn" onClick={() => navigate(q.path)}>
            {q.icon}
            <span style={{ fontSize: 12, fontWeight: 600 }}>{q.label}</span>
          </button>
        ))}
      </div>

      <div className="table-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--md) var(--md) 0' }}>
          <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 15 }}>Recent Orders</p>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/staff/sales')}>View All →</button>
        </div>
        <DataTable
          columns={columns}
          data={recentOrders}
          loading={loading}
          keyExtractor={r => r.id}
          emptyMessage="No orders yet."
        />
      </div>
    </div>
  );
}
