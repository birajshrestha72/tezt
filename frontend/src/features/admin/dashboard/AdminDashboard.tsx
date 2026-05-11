import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api/axios';
import './AdminDashboard.css';

interface DashboardStats {
  staff: number;
  vendors: number;
  parts: number;
  lowStock: number;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({ staff: 0, vendors: 0, parts: 0, lowStock: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, v, p, ls] = await Promise.allSettled([
          api.get('/staff'),
          api.get('/vendors?activeOnly=true'),
          api.get('/parts?activeOnly=true'),
          api.get('/parts/low-stock'),
        ]);

        setStats({
          staff: s.status === 'fulfilled' ? s.value.data.data.length : 0,
          vendors: v.status === 'fulfilled' ? v.value.data.data.length : 0,
          parts: p.status === 'fulfilled' ? p.value.data.data.length : 0,
          lowStock: ls.status === 'fulfilled' ? ls.value.data.data.length : 0,
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const hours = new Date().getHours();
  const greeting = hours < 12 ? 'Good morning' : hours < 17 ? 'Good afternoon' : 'Good evening';
  const name = user?.name ?? 'Admin';

  const kpis = [
    { label: 'Total Staff', value: stats.staff, sub: 'Active employees', color: undefined, nav: '/admin/staff' },
    { label: 'Active Vendors', value: stats.vendors, sub: 'Suppliers', color: undefined, nav: '/admin/vendors' },
    { label: 'Parts in Stock', value: stats.parts, sub: 'Active catalogue', color: undefined, nav: '/admin/parts' },
    { label: 'Low Stock Alerts', value: stats.lowStock, sub: 'Require reorder', color: stats.lowStock > 0 ? 'var(--warning)' : undefined, nav: '/admin/parts' },
  ];

  const quick = [
    { label: 'Manage Staff', icon: '👤', path: '/admin/staff' },
    { label: 'Manage Vendors', icon: '🏭', path: '/admin/vendors' },
    { label: 'Parts Catalogue', icon: '⚙', path: '/admin/parts' },
    { label: 'Purchase Orders', icon: '📦', path: '/admin/purchase' },
    { label: 'Sales', icon: '🧾', path: '/admin/sales' },
    { label: 'Customers', icon: '👥', path: '/admin/customers' },
    { label: 'Financial Reports', icon: '📊', path: '/admin/reports' },
    { label: 'AI Predictions', icon: '🤖', path: '/admin/ai' },
  ];

  return (
    <div className="admin-dash">
      <div className="dash-welcome">
        <h1>{greeting}, {name}!</h1>
        <p className="pg-sub">{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>

      <div className="stats-grid">
        {loading
          ? [1, 2, 3, 4].map(i => <div key={i} className="stat-card dash-skeleton" />)
          : kpis.map(k => (
            <button key={k.label} className="stat-card dash-kpi-btn" onClick={() => navigate(k.nav)}>
              <div className="stat-label">{k.label}</div>
              <div className="stat-value" style={{ color: k.color }}>{k.value}</div>
              <div className="stat-sub">{k.sub}</div>
            </button>
          ))
        }
      </div>

      <h3 style={{ marginBottom: 12 }}>Quick Actions</h3>
      <div className="dash-quick">
        {quick.map(q => (
          <button key={q.path} className="dash-qcard" onClick={() => navigate(q.path)}>
            <span className="dash-qcard-icon">{q.icon}</span>
            <span className="dash-qcard-label">{q.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
