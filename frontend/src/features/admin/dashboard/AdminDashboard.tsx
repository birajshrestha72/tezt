import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdAttachMoney, MdReceipt, MdInventory2, MdWarning, MdAutoFixHigh, MdGroup, MdLocalShipping, MdShoppingCart, MdAddShoppingCart, MdPersonSearch, MdBarChart, MdNotifications } from 'react-icons/md';
import { useAuth } from '../../../context/AuthContext';
import { aiService, type DashboardSummary } from '../../../services/api/aiService';
import api from '../../../services/api/axios';
import { StatCard } from '../../../components/ui';

const FMT_DATE = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

const QUICK_ACTIONS = [
  { label: 'Manage Staff',      icon: <MdGroup />,          path: '/admin/staff' },
  { label: 'Vendors',           icon: <MdLocalShipping />,  path: '/admin/vendors' },
  { label: 'Parts',             icon: <MdInventory2 />,     path: '/admin/parts' },
  { label: 'Purchase Orders',   icon: <MdShoppingCart />,   path: '/admin/purchase' },
  { label: 'New Sale',          icon: <MdAddShoppingCart />,path: '/staff/sales' },
  { label: 'Customers',         icon: <MdPersonSearch />,   path: '/admin/customers' },
  { label: 'Financial Reports', icon: <MdBarChart />,       path: '/admin/reports' },
  { label: 'Notifications',     icon: <MdNotifications />,  path: '/admin/notifications' },
] as const;

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [insight, setInsight] = useState('');
  const [staffCount, setStaffCount] = useState(0);
  const [vendorCount, setVendorCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [insightLoading, setInsightLoading] = useState(false);

  const loadInsight = useCallback(async () => {
    setInsightLoading(true);
    try {
      const r = await aiService.getInsights();
      setInsight(r.insight);
    } catch {
      /* handled by service */
    } finally {
      setInsightLoading(false);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [summaryRes, insightRes, staffRes, vendorRes] = await Promise.allSettled([
        aiService.getDashboardSummary(),
        aiService.getInsights(),
        api.get('/staff'),
        api.get('/vendors'),
      ]);

      if (summaryRes.status === 'fulfilled') setSummary(summaryRes.value);
      if (insightRes.status === 'fulfilled') setInsight(insightRes.value.insight);
      if (staffRes.status === 'fulfilled') setStaffCount(Array.isArray(staffRes.value.data?.data) ? staffRes.value.data.data.length : 0);
      if (vendorRes.status === 'fulfilled') setVendorCount(Array.isArray(vendorRes.value.data?.data) ? vendorRes.value.data.data.length : 0);
      setLoading(false);
    };
    void load();
  }, []);

  const s = summary;

  return (
    <div>
      <div className="page-header">
        <div>
          <p style={{ fontSize: 'var(--head-md)', fontWeight: 700, color: 'var(--text-primary)' }}>
            {greeting()}, {user?.name ?? 'Admin'}
          </p>
          <p className="page-subtitle">{FMT_DATE.format(new Date())}</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          loading={loading}
          label="Total Revenue"
          value={s ? `$${s.totalRevenue.toLocaleString()}` : '—'}
          hint="From all orders"
          icon={<MdAttachMoney />}
          accentColor="var(--amber)"
        />
        <StatCard
          loading={loading}
          label="Total Orders"
          value={s?.totalOrders ?? '—'}
          hint={s ? `${s.totalOrderItems} items total` : ''}
          icon={<MdReceipt />}
          accentColor="var(--orange)"
        />
        <StatCard
          loading={loading}
          label="Parts in Catalogue"
          value={s?.totalProducts ?? '—'}
          hint={s ? `${s.totalCategories} categories` : ''}
          icon={<MdInventory2 />}
          accentColor="var(--info)"
        />
        <StatCard
          loading={loading}
          label="Low Stock Alerts"
          value={s?.lowStockProducts ?? '—'}
          hint="Products below 10 units"
          icon={<MdWarning />}
          accentColor={s && s.lowStockProducts > 0 ? 'var(--danger)' : 'var(--text-muted)'}
          onClick={() => navigate('/admin/parts')}
        />
      </div>

      {s && s.lowStockProducts > 0 && (
        <div className="alert alert-warning" style={{ marginBottom: 'var(--xl)', display: 'flex', alignItems: 'center', gap: 'var(--md)', justifyContent: 'space-between' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <MdWarning /> {s.lowStockProducts} products are below restock threshold.
          </span>
          <button className="btn btn-warning btn-sm" onClick={() => navigate('/admin/parts')}>View Parts</button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 'var(--lg)', alignItems: 'start' }}>
        <div className="insight-card">
          <div className="insight-card__glow" />
          <div className="insight-card__label">
            <MdAutoFixHigh /> AI STRATEGIC INSIGHT
          </div>
          {insightLoading ? (
            <div className="skeleton sk-text" style={{ height: 80, marginBottom: 'var(--xl)' }} />
          ) : (
            <>
              <p className="insight-card__title">
                {insight ? insight.slice(0, 80) + (insight.length > 80 ? '…' : '') : 'No insight available'}
              </p>
              <p className="insight-card__body">{insight || 'Run an analysis to generate AI insights.'}</p>
            </>
          )}
          <div style={{ display: 'flex', gap: 'var(--sm)' }}>
            <button className="btn btn-primary btn-md" onClick={loadInsight} disabled={insightLoading}>
              Refresh Analysis
            </button>
            <button className="btn btn-secondary btn-md" onClick={() => navigate('/admin/reports')}>
              View Reports
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--md)' }}>
          <div className="card" style={{ padding: 'var(--md)' }}>
            <p className="page-subtitle" style={{ marginBottom: 'var(--sm)', fontWeight: 700, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              QUICK ACTIONS
            </p>
            <div className="quick-grid">
              {QUICK_ACTIONS.map(a => (
                <button key={a.path} className="quick-btn" onClick={() => navigate(a.path)}>
                  {a.icon}
                  <span style={{ fontSize: 11, fontWeight: 600 }}>{a.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: 'var(--md)' }}>
            {[
              { label: 'Active Staff',     value: staffCount,         path: '/admin/staff' },
              { label: 'Active Vendors',   value: vendorCount,        path: '/admin/vendors' },
              { label: 'Active Customers', value: s?.totalCustomers ?? '—', path: '/admin/customers' },
            ].map(row => (
              <div
                key={row.label}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}
              >
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{row.label}</span>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => navigate(row.path)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <strong style={{ color: 'var(--text-primary)' }}>{loading ? '…' : row.value}</strong>
                </button>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: 'var(--md)', display: 'flex', alignItems: 'center', gap: 'var(--sm)' }}>
            <span className="status-dot status-dot--active" />
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              SYSTEM STATUS
            </span>
            <span style={{ fontSize: 13, color: 'var(--success)', marginLeft: 4 }}>All Systems Nominal</span>
          </div>
        </div>
      </div>
    </div>
  );
}
