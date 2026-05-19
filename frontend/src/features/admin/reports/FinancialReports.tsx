import React, { useEffect, useState, useCallback } from 'react';
import { MdAttachMoney, MdReceipt, MdInventory2, MdShowChart } from 'react-icons/md';
import { reportService, type FinancialReportSummary, type CreditReminderReportSummary } from '../../../services/api/reportService';
import { StatCard, DataTable, type Column, Badge } from '../../../components/ui';

type Period = 'daily' | 'monthly' | 'yearly';

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function yearStr(): string {
  return String(new Date().getFullYear());
}

export default function FinancialReports() {
  const [period, setPeriod] = useState<Period>('monthly');
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [report, setReport] = useState<FinancialReportSummary | null>(null);
  const [credit, setCredit] = useState<CreditReminderReportSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (p: Period, d: string) => {
    setLoading(true);
    const dateParam = p === 'yearly' ? `${d}-01-01` : d;
    const [repRes, credRes] = await Promise.allSettled([
      reportService.getFinancialReport(p, dateParam),
      reportService.getCreditReminderReport(),
    ]);
    if (repRes.status === 'fulfilled') setReport(repRes.value);
    if (credRes.status === 'fulfilled') setCredit(credRes.value);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load(period, period === 'yearly' ? yearStr() : selectedDate);
  }, [load, period, selectedDate]);

  const handlePeriodChange = (p: Period) => {
    setPeriod(p);
    if (p === 'yearly') setSelectedDate(yearStr());
    else setSelectedDate(todayStr());
  };

  const creditColumns: Column<NonNullable<typeof credit>['reminders'][number]>[] = [
    { key: 'customerName', label: 'Customer' },
    { key: 'customerEmail', label: 'Email', render: r => <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.customerEmail}</span> },
    { key: 'dueDate', label: 'Due Date', render: r => new Date(r.dueDate).toLocaleDateString('en-GB') },
    { key: 'overdueDays', label: 'Days Overdue', render: r => <Badge variant="danger">{r.overdueDays}d</Badge> },
    { key: 'outstandingAmount', label: 'Outstanding', align: 'right', render: r => <strong style={{ color: 'var(--danger)' }}>${r.outstandingAmount.toFixed(2)}</strong> },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Financial Reports</h2>
          <p className="page-subtitle">Revenue, order metrics and credit summary</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sm)' }}>
          {(['daily', 'monthly', 'yearly'] as Period[]).map(p => (
            <button
              key={p}
              className={`btn btn-sm ${period === p ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => handlePeriodChange(p)}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
          {period !== 'yearly'
            ? <input type="date" className="form-input" style={{ height: 36, width: 160 }} value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
            : <input type="number" className="form-input" style={{ height: 36, width: 100 }} value={selectedDate} min={2000} max={2100} onChange={e => setSelectedDate(e.target.value)} />
          }
        </div>
      </div>

      <div className="stats-grid">
        <StatCard loading={loading} label="Total Revenue" value={report ? `$${report.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'} icon={<MdAttachMoney />} accentColor="var(--orange)" />
        <StatCard loading={loading} label="Total Orders" value={report?.totalOrders ?? '—'} icon={<MdReceipt />} accentColor="var(--red)" />
        <StatCard loading={loading} label="Total Items" value={report?.totalItems ?? '—'} icon={<MdInventory2 />} accentColor="var(--amber)" />
        <StatCard loading={loading} label="Avg Order Value" value={report ? `$${report.averageOrderValue.toFixed(2)}` : '—'} icon={<MdShowChart />} accentColor="var(--info)" />
      </div>

      <div className="card" style={{ padding: 'var(--lg)', marginTop: 'var(--xl)' }}>
        <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', marginBottom: 'var(--md)' }}>Credit Summary</p>

        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 'var(--lg)' }}>
          <StatCard loading={loading} label="Overdue Orders" value={credit?.overdueOrders ?? '—'} accentColor="var(--danger)" />
          <StatCard loading={loading} label="Overdue Customers" value={credit?.overdueCustomers ?? '—'} accentColor="var(--warning)" />
          <StatCard loading={loading} label="Total Outstanding" value={credit ? `$${credit.totalOutstandingAmount.toFixed(2)}` : '—'} accentColor="var(--red)" />
        </div>

        <DataTable
          columns={creditColumns}
          data={credit?.reminders ?? []}
          loading={loading}
          keyExtractor={r => r.orderId}
          emptyMessage="No overdue orders."
        />
      </div>
    </div>
  );
}
