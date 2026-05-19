import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdAutoFixHigh, MdAttachMoney, MdReceipt, MdInventory2, MdWarning } from 'react-icons/md';
import { aiService, type DashboardSummary } from '../../../services/api/aiService';
import { StatCard } from '../../../components/ui';

export default function AIAlertsPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [insight, setInsight] = useState('');
  const [loading, setLoading] = useState(true);
  const [insightLoading, setInsightLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const loadInsight = useCallback(async () => {
    setInsightLoading(true);
    try {
      const r = await aiService.getInsights();
      setInsight(r.insight);
      setLastRefreshed(new Date());
    } finally {
      setInsightLoading(false);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [sumRes, insRes] = await Promise.allSettled([
        aiService.getDashboardSummary(),
        aiService.getInsights(),
      ]);
      if (sumRes.status === 'fulfilled') setSummary(sumRes.value);
      if (insRes.status === 'fulfilled') { setInsight(insRes.value.insight); setLastRefreshed(new Date()); }
      setLoading(false);
    };
    void load();
  }, []);

  const s = summary;

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sm)' }}>
          <MdAutoFixHigh style={{ fontSize: 28, color: 'var(--amber)' }} />
          <h2 className="page-title">AI Business Intelligence</h2>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard loading={loading} label="Total Revenue" value={s ? `$${s.totalRevenue.toLocaleString()}` : '—'} icon={<MdAttachMoney />} accentColor="var(--amber)" />
        <StatCard loading={loading} label="Total Orders" value={s?.totalOrders ?? '—'} icon={<MdReceipt />} accentColor="var(--orange)" />
        <StatCard loading={loading} label="Parts in Catalogue" value={s?.totalProducts ?? '—'} icon={<MdInventory2 />} accentColor="var(--info)" />
        <StatCard loading={loading} label="Low Stock Alerts" value={s?.lowStockProducts ?? '—'} icon={<MdWarning />} accentColor={s && s.lowStockProducts > 0 ? 'var(--danger)' : 'var(--text-muted)'} />
      </div>

      <div className="insight-card" style={{ marginBottom: 'var(--xl)' }}>
        <div className="insight-card__glow" />
        <div className="insight-card__label">
          <MdAutoFixHigh /> AI STRATEGIC INSIGHT
        </div>
        {insightLoading ? (
          <div className="skeleton sk-text" style={{ height: 80, marginBottom: 'var(--xl)' }} />
        ) : (
          <>
            <p className="insight-card__title">
              {insight ? insight.slice(0, 90) + (insight.length > 90 ? '…' : '') : 'No insight available'}
            </p>
            <p className="insight-card__body">{insight || 'Click Refresh Analysis to generate AI-powered business insights.'}</p>
          </>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--md)', flexWrap: 'wrap' }}>
          <button className="btn btn-primary btn-md" onClick={loadInsight} disabled={insightLoading}>
            {insightLoading ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : 'Refresh Analysis'}
          </button>
          {lastRefreshed && (
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Last refreshed: {lastRefreshed.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      <div>
        {!loading && s && s.lowStockProducts > 0 && (
          <div className="diag-card critical">
            <div className="diag-card__header">
              <p className="diag-card__component">Parts Low-Stock Risk</p>
              <MdWarning style={{ color: 'var(--danger)', fontSize: 20 }} />
            </div>
            <p className="diag-card__msg">{s.lowStockProducts} products are below safety threshold. Procurement action required.</p>
            <button className="btn btn-danger btn-sm" onClick={() => navigate('/admin/parts')}>
              View and restock critical inventory
            </button>
          </div>
        )}

        {!loading && s && s.totalRevenue === 0 && (
          <div className="diag-card warning">
            <div className="diag-card__header">
              <p className="diag-card__component">Revenue Not Established</p>
            </div>
            <p className="diag-card__msg">No revenue generated yet.</p>
            <p className="diag-card__action">Create first order to begin tracking</p>
          </div>
        )}

        {!loading && s && s.totalOrders > 0 && s.totalRevenue > 0 && (
          <div className="diag-card good">
            <div className="diag-card__header">
              <p className="diag-card__component">Revenue Flow Stable</p>
            </div>
            <p className="diag-card__msg">System is processing orders with consistent revenue.</p>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/reports')}>
              Continue monitoring via financial reports
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
