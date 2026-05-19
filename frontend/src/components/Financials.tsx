import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowRight, BarChart3, CalendarDays, DollarSign, RefreshCcw, ShieldAlert, TrendingUp, Loader } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { reportService, type CreditReminderReportSummary, type FinancialReportSummary } from '../services/api/reportService';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
});

type PeriodType = 'daily' | 'monthly' | 'yearly';

const FinancialsView = () => {
  const navigate = useNavigate();
  const [financial, setFinancial] = useState<FinancialReportSummary | null>(null);
  const [reminders, setReminders] = useState<CreditReminderReportSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [period, setPeriod] = useState<PeriodType>('monthly');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const load = async () => {
    setLoading(true);
    setError(null);

    try {
      const [financialReport, reminderReport] = await Promise.all([
        reportService.getFinancialReport(period, selectedDate),
        reportService.getCreditReminderReport(),
      ]);

      setFinancial(financialReport);
      setReminders(reminderReport);
      setLastUpdated(new Date());
    } catch (loadError) {
      toast.error('Failed to load financial reports');
      setError('Failed to load financial reports from the API.');
      setFinancial(null);
      setReminders(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [period, selectedDate]);

  const stats = [
    {
      label: 'Total Revenue',
      value: financial ? currencyFormatter.format(financial.totalRevenue) : '—',
      hint: 'Gross order revenue',
      icon: DollarSign,
    },
    {
      label: 'Total Orders',
      value: financial ? financial.totalOrders.toString() : '—',
      hint: 'Orders captured in the backend',
      icon: BarChart3,
    },
    {
      label: 'Overdue Orders',
      value: reminders ? reminders.overdueOrders.toString() : '—',
      hint: 'Credit reminders pending action',
      icon: ShieldAlert,
    },
    {
      label: 'Outstanding Amount',
      value: reminders ? currencyFormatter.format(reminders.totalOutstandingAmount) : '—',
      hint: 'Credit exposure tied to overdue orders',
      icon: TrendingUp,
    },
  ];

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 bg-bg-primary min-h-screen">
      <section className="flex flex-col gap-5 rounded-3xl border border-border-light bg-surface-container/70 p-5 shadow-xl shadow-black/10 backdrop-blur md:p-6 lg:flex-col">
        <div className="space-y-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Financial Reports</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-text-primary sm:text-4xl">Revenue and credit summary</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
              View financial data filtered by daily, monthly, or yearly periods.
            </p>
          </div>

          {/* Period & Date Filters */}
          <div className="flex flex-wrap gap-4 pt-3">
            <div className="flex gap-2 items-center">
              <label className="text-xs font-semibold uppercase tracking-[0.18em] text-text-tertiary">
                Period:
              </label>
              <div className="flex gap-2">
                {(['daily', 'monthly', 'yearly'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                      period === p
                        ? 'bg-brand-default text-white'
                        : 'bg-white/10 text-text-secondary hover:bg-white/20'
                    }`}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 items-center">
              <label className="text-xs font-semibold uppercase tracking-[0.18em] text-text-tertiary">
                {period === 'yearly' ? 'Year:' : 'Date:'}
              </label>
              <input
                type={period === 'yearly' ? 'number' : 'date'}
                value={period === 'yearly' ? selectedDate.split('-')[0] : selectedDate}
                onChange={(e) => {
                  if (period === 'yearly') {
                    setSelectedDate(`${e.target.value}-01-01`);
                  } else {
                    setSelectedDate(e.target.value);
                  }
                }}
                className="px-3 py-1 rounded-lg text-xs bg-white/10 border border-border-light text-text-primary focus:ring-2 focus:ring-brand-default"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-4 border-t border-border-light/30">
          <button
            type="button"
            onClick={() => navigate('/admin/reports/customers')}
            className="inline-flex items-center gap-2 rounded-xl border border-border-light bg-white/5 px-4 py-2.5 text-sm font-semibold text-text-primary transition hover:border-brand-default/30 hover:bg-white/10"
          >
            Customer Reports
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/notifications')}
            className="inline-flex items-center gap-2 rounded-xl border border-border-light bg-white/5 px-4 py-2.5 text-sm font-semibold text-text-primary transition hover:border-brand-default/30 hover:bg-white/10"
          >
            Notifications
          </button>
          <button
            type="button"
            onClick={() => void load()}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-default px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-default/20 transition hover:bg-brand-hover"
          >
            <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <article key={stat.label} className="rounded-3xl border border-border-light bg-surface-container/70 p-5 shadow-lg shadow-black/10 transition-all duration-base hover:-translate-y-0.5 hover:border-brand-default/30 hover:shadow-xl hover:shadow-black/20">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-text-tertiary">{stat.label}</p>
                <h2 className="mt-3 text-4xl font-black tracking-tight text-text-primary">{loading ? '—' : stat.value}</h2>
                <p className="mt-2 text-sm text-text-tertiary">{stat.hint}</p>
              </div>
              <div className="rounded-2xl bg-white/5 p-3 text-primary">
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </article>
        ))}
      </section>

      {error && (
        <div className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm font-medium text-red-300">
          {error}
        </div>
      )}

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        <div className="rounded-3xl border border-border-light bg-surface-container/70 shadow-xl shadow-black/10">
          <div className="flex flex-col gap-3 border-b border-border-light px-5 py-4 md:flex-row md:items-center md:justify-between md:px-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-text-tertiary">Credit reminders</p>
              <h3 className="mt-1 text-lg font-bold text-text-primary">Overdue customer follow-up list</h3>
            </div>
            {lastUpdated && <p className="text-xs text-text-tertiary">Updated {lastUpdated.toLocaleTimeString()}</p>}
          </div>

          <div className="divide-y divide-border-light/60">
            {loading ? (
              <div className="px-5 py-8 text-sm text-text-tertiary md:px-6">Loading financial report data...</div>
            ) : reminders?.reminders?.length ? (
              reminders.reminders.map((reminder) => (
                <div key={reminder.referenceKey} className="flex flex-col gap-4 px-5 py-4 md:flex-row md:items-start md:justify-between md:px-6">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                        {reminder.notificationType}
                      </span>
                      <span className="rounded-full bg-danger/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-danger">
                        {reminder.overdueDays} days overdue
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-text-primary">{reminder.customerName}</p>
                    <p className="text-sm text-text-secondary">{reminder.customerEmail}</p>
                    <p className="text-sm text-text-secondary">Due {new Date(reminder.dueDate).toLocaleDateString()}</p>
                  </div>

                  <div className="grid gap-2 text-sm text-right">
                    <p className="font-semibold text-text-primary">Outstanding {currencyFormatter.format(reminder.outstandingAmount)}</p>
                    <p className="text-text-secondary">Order total {currencyFormatter.format(reminder.orderTotal)}</p>
                    <p className="text-text-secondary">Paid {currencyFormatter.format(reminder.amountPaid)}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-5 py-10 md:px-6">
                <div className="rounded-3xl border border-dashed border-border-light bg-bg-secondary px-5 py-10 text-center">
                  <AlertTriangle className="mx-auto h-10 w-10 text-text-tertiary" />
                  <h3 className="mt-4 text-lg font-bold text-text-primary">No overdue reminders right now.</h3>
                  <p className="mt-2 text-sm text-text-secondary">
                    When credit reminders are generated by the backend, they will appear here.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <aside className="rounded-3xl border border-border-light bg-surface-container/70 p-5 shadow-xl shadow-black/10 md:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-text-tertiary">Quick notes</p>
              <h3 className="mt-1 text-lg font-bold text-text-primary">Report context</h3>
            </div>
            <CalendarDays className="h-5 w-5 text-primary" />
          </div>

          <div className="mt-5 space-y-3 text-sm leading-6 text-text-secondary">
            <p className="rounded-2xl border border-border-light bg-white/5 p-4">Financial report values come directly from the existing orders and order-item tables.</p>
            <p className="rounded-2xl border border-border-light bg-white/5 p-4">Credit reminder totals are sourced from the backend summary used by the report service.</p>
            <p className="rounded-2xl border border-border-light bg-white/5 p-4">Use the customer report page for customer counts, top customers, and order distribution.</p>
          </div>
        </aside>
      </section>
    </div>
  );
};

export default FinancialsView;
