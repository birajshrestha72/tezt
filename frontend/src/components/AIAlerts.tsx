import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, BellRing, BrainCircuit, RefreshCcw, ShieldAlert, Sparkles, TrendingUp } from 'lucide-react';
import { aiService, type DashboardSummary } from '../services/api/aiService';

interface AlertCard {
  id: string;
  title: string;
  description: string;
  severity: 'High' | 'Medium' | 'Low';
  recommendation: string;
  status: 'Active' | 'Monitoring' | 'Resolved';
}

const severityStyles: Record<AlertCard['severity'], string> = {
  High: 'bg-red-400/10 text-red-300 border-red-400/20',
  Medium: 'bg-amber-400/10 text-amber-300 border-amber-400/20',
  Low: 'bg-emerald-400/10 text-emerald-300 border-emerald-400/20',
};

const statusStyles: Record<AlertCard['status'], string> = {
  Active: 'bg-red-400/10 text-red-300',
  Monitoring: 'bg-amber-400/10 text-amber-300',
  Resolved: 'bg-emerald-400/10 text-emerald-300',
};

const buildAlerts = (summary: DashboardSummary, insight: string): AlertCard[] => {
  const alerts: AlertCard[] = [];

  if (summary.lowStockProducts > 0) {
    alerts.push({
      id: 'low-stock',
      title: 'Parts low-stock risk',
      description: `${summary.lowStockProducts} product${summary.lowStockProducts === 1 ? '' : 's'} are below the replenishment threshold.`,
      severity: summary.lowStockProducts >= 3 ? 'High' : 'Medium',
      recommendation: 'Prioritize restock requests for fast-moving parts before repair scheduling is blocked.',
      status: 'Active',
    });
  }

  if (summary.totalRevenue === 0) {
    alerts.push({
      id: 'revenue-startup',
      title: 'Revenue not yet established',
      description: 'The dashboard has not recorded revenue activity yet.',
      severity: 'Low',
      recommendation: 'Continue normal order processing and verify the reporting workflow after test data is entered.',
      status: 'Monitoring',
    });
  } else if (summary.totalRevenue > 0 && summary.totalOrders > 0) {
    alerts.push({
      id: 'revenue-flow',
      title: 'Revenue flow stable',
      description: `Orders are generating ${summary.totalRevenue.toFixed(2)} in tracked revenue.`,
      severity: 'Low',
      recommendation: 'Keep monitoring order throughput and review the financial report page for trend changes.',
      status: 'Resolved',
    });
  }

  alerts.push({
    id: 'insight',
    title: 'System insight',
    description: insight,
    severity: summary.lowStockProducts > 0 ? 'Medium' : 'Low',
    recommendation: summary.lowStockProducts > 0 ? 'Align procurement with the low-stock alert and review the parts page.' : 'No immediate action required; continue routine monitoring.',
    status: summary.lowStockProducts > 0 ? 'Active' : 'Resolved',
  });

  return alerts;
};

const AIAlertsView = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [insight, setInsight] = useState('Loading prediction insight...');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);

    try {
      const [summaryData, insightData] = await Promise.all([
        aiService.getDashboardSummary(),
        aiService.getInsights(),
      ]);

      setSummary(summaryData);
      setInsight(insightData.insight);
      setLastUpdated(new Date());
    } catch (loadError) {
      console.error('AI alerts load failed:', loadError);
      setError('Failed to load AI prediction alerts from the API.');
      setSummary(null);
      setInsight('No prediction insight available.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const alerts = useMemo(() => {
    if (!summary) return [];
    return buildAlerts(summary, insight);
  }, [summary, insight]);

  const metrics = summary
    ? [
        { label: 'Revenue Signal', value: `$${summary.totalRevenue.toFixed(2)}`, icon: TrendingUp },
        { label: 'Orders Tracked', value: summary.totalOrders.toString(), icon: Sparkles },
        { label: 'Low Stock Items', value: summary.lowStockProducts.toString(), icon: ShieldAlert },
        { label: 'Prediction Inputs', value: summary.totalOrderItems.toString(), icon: BrainCircuit },
      ]
    : [];

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8">
      <section className="flex flex-col gap-4 rounded-3xl border border-white/5 bg-surface-container/70 p-5 shadow-xl shadow-black/10 backdrop-blur md:p-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">AI Predictions</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-white sm:text-4xl">Operational alert dashboard</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-on-surface-variant">
              Coursework-focused AI alerts derived from the existing dashboard summary and insight endpoint.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void load()}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary shadow-lg shadow-primary/20 transition hover:brightness-110"
          >
            <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Alerts
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {(loading ? [1, 2, 3, 4] : metrics).map((metric, index) => (
          <article key={loading ? index : metric.label} className="rounded-3xl border border-white/5 bg-surface-container/70 p-5 shadow-lg shadow-black/10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant">{loading ? 'Loading' : metric.label}</p>
                <h2 className="mt-3 text-3xl font-black tracking-tight text-white">{loading ? '—' : metric.value}</h2>
                <p className="mt-2 text-sm text-on-surface-variant">{loading ? 'Gathering prediction inputs' : 'Live dashboard metric'}</p>
              </div>
              {!loading && 'icon' in metric && (
                <div className="rounded-2xl bg-white/5 p-3 text-primary">
                  <metric.icon className="h-5 w-5" />
                </div>
              )}
            </div>
          </article>
        ))}
      </section>

      {error && (
        <div className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm font-medium text-red-300">
          {error}
        </div>
      )}

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_0.95fr]">
        <div className="rounded-3xl border border-white/5 bg-surface-container/70 shadow-xl shadow-black/10">
          <div className="flex flex-col gap-3 border-b border-white/5 px-5 py-4 md:flex-row md:items-center md:justify-between md:px-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                <BellRing className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-on-surface-variant">Prediction alerts</p>
                <h3 className="mt-1 text-lg font-bold text-white">Severity and recommendation feed</h3>
              </div>
            </div>
            {lastUpdated && <p className="text-xs text-on-surface-variant">Updated {lastUpdated.toLocaleTimeString()}</p>}
          </div>

          <div className="divide-y divide-white/5">
            {loading ? (
              <div className="px-5 py-8 text-sm text-on-surface-variant md:px-6">Loading AI alerts...</div>
            ) : alerts.length > 0 ? (
              alerts.map((alert) => (
                <div key={alert.id} className="flex flex-col gap-4 px-5 py-4 md:flex-row md:items-start md:justify-between md:px-6">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${severityStyles[alert.severity]}`}>
                        {alert.severity} Severity
                      </span>
                      <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${statusStyles[alert.status]}`}>
                        {alert.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{alert.title}</p>
                      <p className="mt-2 text-sm leading-6 text-on-surface-variant">{alert.description}</p>
                    </div>
                  </div>

                  <div className="max-w-xl rounded-2xl border border-white/5 bg-white/5 p-4 text-sm leading-6 text-on-surface-variant">
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">Recommendation</p>
                    <p>{alert.recommendation}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-5 py-10 md:px-6">
                <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 px-5 py-10 text-center">
                  <AlertTriangle className="mx-auto h-10 w-10 text-on-surface-variant" />
                  <h3 className="mt-4 text-lg font-bold text-white">No AI alerts available.</h3>
                  <p className="mt-2 text-sm text-on-surface-variant">
                    The dashboard will show live prediction alerts once the backend summary exposes risk conditions.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <aside className="rounded-3xl border border-white/5 bg-surface-container/70 p-5 shadow-xl shadow-black/10 md:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-on-surface-variant">Insight summary</p>
              <h3 className="mt-1 text-lg font-bold text-white">Current AI note</h3>
            </div>
            <BrainCircuit className="h-5 w-5 text-primary" />
          </div>

          <div className="mt-5 space-y-3">
            <div className="rounded-2xl border border-white/5 bg-white/5 p-4 text-sm leading-6 text-on-surface-variant">
              {loading ? 'Loading insight...' : insight}
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/5 p-4 text-sm leading-6 text-on-surface-variant">
              Severity is derived from backend stock and revenue state so the page remains lightweight and deterministic for coursework delivery.
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
};

export default AIAlertsView;
