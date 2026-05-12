import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart3, CalendarDays, Download, RefreshCcw, Users } from 'lucide-react';
import { reportService, type CustomerOrderStat, type CustomerRecord } from '../services/api/reportService';

interface CustomerReportState {
  totalCustomers: number;
  totalOrders: number;
  totalAmount: number;
  customers: CustomerRecord[];
  topCustomers: CustomerOrderStat[];
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
});

const emptyReport: CustomerReportState = {
  totalCustomers: 0,
  totalOrders: 0,
  totalAmount: 0,
  customers: [],
  topCustomers: [],
};

const fullName = (customer: CustomerRecord) => `${customer.firstName} ${customer.lastName}`.trim();

const CustomerReportsView = () => {
  const navigate = useNavigate();
  const [report, setReport] = useState<CustomerReportState>(emptyReport);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);

    try {
      const [customers, customerCount, orderCount, totalAmount, topCustomers] = await Promise.all([
        reportService.getCustomers(),
        reportService.getCustomerCount(),
        reportService.getOrderCount(),
        reportService.getTotalAmount(),
        reportService.getTopCustomers(),
      ]);

      setReport({
        customers,
        totalCustomers: customerCount.totalCustomers,
        totalOrders: orderCount.totalOrders,
        totalAmount: totalAmount.totalAmount,
        topCustomers,
      });
      setLastUpdated(new Date());
    } catch (loadError) {
      console.error('Customer report load failed:', loadError);
      setError('Failed to load customer reports from the API.');
      setReport(emptyReport);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const avgOrdersPerCustomer = report.totalCustomers > 0 ? report.totalOrders / report.totalCustomers : 0;

  const cards = [
    { label: 'Total Customers', value: report.totalCustomers.toString(), hint: 'Registered customer records', icon: Users },
    { label: 'Total Orders', value: report.totalOrders.toString(), hint: 'Orders linked to customers', icon: BarChart3 },
    { label: 'Avg Orders / Customer', value: avgOrdersPerCustomer.toFixed(1), hint: 'Order distribution measure', icon: CalendarDays },
    { label: 'Total Order Value', value: currencyFormatter.format(report.totalAmount), hint: 'Gross order value tracked', icon: Download },
  ];

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8">
      <section className="flex flex-col gap-4 rounded-3xl border border-white/5 bg-surface-container/70 p-5 shadow-xl shadow-black/10 backdrop-blur md:p-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => navigate('/admin/reports')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-on-surface-variant transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Financial Reports
          </button>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Customer Reports</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-white sm:text-4xl">Customer activity summary</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-on-surface-variant">
              Track customer growth, order volume, and top-performing accounts using the existing customer and order APIs.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/notifications')}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Open Notifications
          </button>
          <button
            type="button"
            onClick={() => void load()}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary shadow-lg shadow-primary/20 transition hover:brightness-110"
          >
            <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <article key={card.label} className="rounded-3xl border border-white/5 bg-surface-container/70 p-5 shadow-lg shadow-black/10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant">{card.label}</p>
                <h2 className="mt-3 text-3xl font-black tracking-tight text-white">{loading ? '—' : card.value}</h2>
                <p className="mt-2 text-sm text-on-surface-variant">{card.hint}</p>
              </div>
              <div className="rounded-2xl bg-white/5 p-3 text-primary">
                <card.icon className="h-5 w-5" />
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

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_0.95fr]">
        <div className="rounded-3xl border border-white/5 bg-surface-container/70 shadow-xl shadow-black/10">
          <div className="flex items-center justify-between gap-4 border-b border-white/5 px-5 py-4 md:px-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-on-surface-variant">Top customers</p>
              <h3 className="mt-1 text-lg font-bold text-white">Highest order volume</h3>
            </div>
            {lastUpdated && <p className="text-xs text-on-surface-variant">Updated {lastUpdated.toLocaleTimeString()}</p>}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/5 text-left">
              <thead>
                <tr className="text-xs uppercase tracking-[0.18em] text-on-surface-variant">
                  <th className="px-5 py-4 font-semibold md:px-6">Customer</th>
                  <th className="px-5 py-4 font-semibold md:px-6">Email</th>
                  <th className="px-5 py-4 font-semibold md:px-6">Phone</th>
                  <th className="px-5 py-4 font-semibold md:px-6">Orders</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td className="px-5 py-6 text-sm text-on-surface-variant md:px-6" colSpan={4}>
                      Loading customer records...
                    </td>
                  </tr>
                ) : report.topCustomers.length > 0 ? (
                  report.topCustomers.map((customer, index) => (
                    <tr key={`${customer.customerId}-${index}`} className="hover:bg-white/5">
                      <td className="px-5 py-4 text-sm font-semibold text-white md:px-6">{customer.customerName}</td>
                      <td className="px-5 py-4 text-sm text-on-surface-variant md:px-6">—</td>
                      <td className="px-5 py-4 text-sm text-on-surface-variant md:px-6">—</td>
                      <td className="px-5 py-4 text-sm font-semibold text-primary md:px-6">{customer.orderCount}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-5 py-6 text-sm text-on-surface-variant md:px-6" colSpan={4}>
                      No customer ordering data is available yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="rounded-3xl border border-white/5 bg-surface-container/70 p-5 shadow-xl shadow-black/10 md:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-on-surface-variant">Customer directory</p>
              <h3 className="mt-1 text-lg font-bold text-white">Recent customer records</h3>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-on-surface-variant">
              {report.customers.length} loaded
            </span>
          </div>

          <div className="mt-5 space-y-3">
            {loading ? (
              <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-6 text-sm text-on-surface-variant">Loading customers...</div>
            ) : report.customers.length > 0 ? (
              report.customers.slice(0, 6).map((customer) => (
                <div key={customer.id} className="rounded-2xl border border-white/5 bg-white/5 px-4 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-white">{fullName(customer)}</p>
                      <p className="mt-1 text-xs text-on-surface-variant">Customer ID {customer.id}</p>
                    </div>
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                      Active
                    </span>
                  </div>
                  <div className="mt-3 space-y-1 text-sm text-on-surface-variant">
                    <p className="truncate">{customer.email}</p>
                    <p>{customer.phone || 'No phone number on file'}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-8 text-sm text-on-surface-variant">
                No customers have been loaded yet.
              </div>
            )}
          </div>
        </aside>
      </section>
    </div>
  );
};

export default CustomerReportsView;
