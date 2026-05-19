import React, { useEffect, useState } from 'react';
import { reportService, type CustomerOrderStat, type CreditReminderReportDto } from '../../services/api/reportService';
import { DataTable, type Column, Badge, StatCard } from '../../components/ui';
import { formatCurrency } from '../../utils/format';

type Tab = 'top-spenders' | 'regulars' | 'credits';

function getRankColor(idx: number): string {
  if (idx === 0) return 'var(--amber)';
  if (idx === 1) return 'var(--text-secondary)';
  if (idx === 2) return '#CD7F32';
  return 'var(--text-muted)';
}

function TopSpendersTab({ data, loading }: Readonly<{ data: CustomerOrderStat[]; loading: boolean }>) {
  const cols: Column<CustomerOrderStat>[] = [
    {
      key: 'rank', label: '#',
      render: r => {
        const idx = data.indexOf(r);
        return <span style={{ fontWeight: 700, color: getRankColor(idx) }}>{idx + 1}</span>;
      },
    },
    { key: 'customerName', label: 'Customer' },
    { key: 'email', label: 'Email', render: r => <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.email ?? '—'}</span> },
    { key: 'orderCount', label: 'Orders', render: r => <Badge variant="info">{r.orderCount}</Badge> },
    { key: 'totalSpend', label: 'Total Spend', align: 'right', render: r => <strong>{formatCurrency(r.totalSpend ?? 0)}</strong> },
  ];

  return <DataTable columns={cols} data={data} loading={loading} keyExtractor={r => r.customerId} emptyMessage="No data." />;
}

function RegularsTab({ data, loading }: Readonly<{ data: CustomerOrderStat[]; loading: boolean }>) {
  const cols: Column<CustomerOrderStat>[] = [
    { key: 'customerName', label: 'Customer' },
    { key: 'email', label: 'Email', render: r => <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.email ?? '—'}</span> },
    { key: 'orderCount', label: 'Orders', render: r => <Badge variant="info">{r.orderCount}</Badge> },
    { key: 'totalSpend', label: 'Total Spend', align: 'right', render: r => <strong>{formatCurrency(r.totalSpend ?? 0)}</strong> },
  ];

  return <DataTable columns={cols} data={data} loading={loading} keyExtractor={r => r.customerId} emptyMessage="No regular customers." />;
}

function PendingCreditsTab({ data, loading }: Readonly<{ data: CreditReminderReportDto[]; loading: boolean }>) {
  const cols: Column<CreditReminderReportDto>[] = [
    { key: 'customerName', label: 'Customer' },
    {
      key: 'outstandingAmount', label: 'Outstanding', align: 'right',
      render: r => <strong style={{ color: 'var(--danger)' }}>{formatCurrency(r.outstandingAmount)}</strong>,
    },
    { key: 'daysOverdue', label: 'Overdue', render: r => <Badge variant="danger">{r.daysOverdue ?? r.overdueDays}d</Badge> },
  ];

  return <DataTable columns={cols} data={data} loading={loading} keyExtractor={r => r.customerId} emptyMessage="No pending credits." />;
}

function renderContent(tab: Tab, spenders: CustomerOrderStat[], regulars: CustomerOrderStat[], credits: CreditReminderReportDto[], loading: boolean) {
  if (tab === 'top-spenders') return <TopSpendersTab data={spenders} loading={loading} />;
  if (tab === 'regulars') return <RegularsTab data={regulars} loading={loading} />;
  return <PendingCreditsTab data={credits} loading={loading} />;
}

const TABS: { key: Tab; label: string }[] = [
  { key: 'top-spenders', label: 'Top Spenders' },
  { key: 'regulars', label: 'Regular Customers' },
  { key: 'credits', label: 'Pending Credits' },
];

export default function StaffReports() {
  const [tab, setTab] = useState<Tab>('top-spenders');
  const [spenders, setSpenders] = useState<CustomerOrderStat[]>([]);
  const [regulars, setRegulars] = useState<CustomerOrderStat[]>([]);
  const [credits, setCredits] = useState<CreditReminderReportDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [spRes, regRes, crRes] = await Promise.allSettled([
        reportService.getTopSpenders(),
        reportService.getRegularCustomers(),
        reportService.getPendingCredits(),
      ]);
      if (spRes.status === 'fulfilled') setSpenders(spRes.value);
      else console.error('[StaffReports] top spenders error:', spRes.reason);
      if (regRes.status === 'fulfilled') setRegulars(regRes.value);
      else console.error('[StaffReports] regulars error:', regRes.reason);
      if (crRes.status === 'fulfilled') setCredits(crRes.value);
      else console.error('[StaffReports] credits error:', crRes.reason);
      setLoading(false);
    };
    void load();
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Staff Reports</h2>
          <p className="page-subtitle">Customer spending and credit summary</p>
        </div>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <StatCard loading={loading} label="Top Spenders" value={spenders.length} accentColor="var(--amber)" />
        <StatCard loading={loading} label="Regular Customers" value={regulars.length} accentColor="var(--info)" />
        <StatCard
          loading={loading}
          label="Pending Credits"
          value={credits.length}
          accentColor={(credits.length ?? 0) > 0 ? 'var(--danger)' : 'var(--success)'}
        />
      </div>

      <div className="tab-row">
        {TABS.map(t => (
          <button key={t.key} className={`tab-btn ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {renderContent(tab, spenders, regulars, credits, loading)}
    </div>
  );
}
