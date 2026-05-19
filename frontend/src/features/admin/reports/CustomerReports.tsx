import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../../services/api/axios';
import { reportService, type CustomerOrderStat, type PendingCreditCustomerRecord } from '../../../services/api/reportService';
import { DataTable, type Column, Badge } from '../../../components/ui';

type Tab = 'top-spenders' | 'regulars' | 'pending-credits';

export default function CustomerReports() {
  const [activeTab, setActiveTab] = useState<Tab>('top-spenders');
  const [spenders, setSpenders] = useState<CustomerOrderStat[]>([]);
  const [regulars, setRegulars] = useState<CustomerOrderStat[]>([]);
  const [credits, setCredits] = useState<PendingCreditCustomerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [spRes, regRes, crRes] = await Promise.allSettled([
        reportService.getTopSpenders(),
        reportService.getRegularCustomers(),
        reportService.getPendingCreditCustomers(),
      ]);
      if (spRes.status === 'fulfilled') setSpenders(spRes.value);
      if (regRes.status === 'fulfilled') setRegulars(regRes.value);
      if (crRes.status === 'fulfilled') setCredits(crRes.value);
      setLoading(false);
    };
    void load();
  }, []);

  const sendReminder = async (customerId: number) => {
    setSendingId(customerId);
    try {
      const overdueRes = await api.get(`/credit-reminders/overdue`);
      const overdue = overdueRes.data?.data ?? [];
      const record = overdue.find((r: { customerId: number; orderId: number }) => r.customerId === customerId);
      if (!record) { toast.error('No overdue order found for this customer.'); return; }
      await api.post(`/credit-reminders/send/${record.orderId}`);
      toast.success('Credit reminder sent.');
    } catch {
      toast.error('Failed to send reminder.');
    } finally {
      setSendingId(null);
    }
  };

  const RANK_COLORS: Record<number, string> = { 1: 'var(--amber)', 2: 'var(--text-muted)', 3: 'var(--orange)' };

  const spenderCols: Column<CustomerOrderStat>[] = [
    { key: 'rank', label: 'Rank', render: (_, i) => <strong style={{ color: RANK_COLORS[(i ?? 0) + 1] ?? 'var(--text-secondary)', fontSize: 16 }}>#{(i ?? 0) + 1}</strong> },
    { key: 'customerName', label: 'Name' },
    { key: 'email', label: 'Email', render: r => <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.email ?? '—'}</span> },
    { key: 'phone', label: 'Phone', render: r => <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.phone ?? '—'}</span> },
    { key: 'orderCount', label: 'Orders', render: r => <Badge variant="info">{r.orderCount}</Badge> },
    { key: 'totalSpend', label: 'Total Spend', align: 'right', render: r => <strong>${(r.totalSpend ?? 0).toFixed(2)}</strong> },
  ];

  const regularCols: Column<CustomerOrderStat>[] = [
    { key: 'customerName', label: 'Name' },
    { key: 'email', label: 'Email', render: r => <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.email ?? '—'}</span> },
    { key: 'phone', label: 'Phone', render: r => <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.phone ?? '—'}</span> },
    { key: 'orderCount', label: 'Orders', render: r => <Badge variant="info">{r.orderCount}</Badge> },
    { key: 'totalSpend', label: 'Total Spend', align: 'right', render: r => <strong>${(r.totalSpend ?? 0).toFixed(2)}</strong> },
  ];

  const creditCols: Column<PendingCreditCustomerRecord>[] = [
    { key: 'customerName', label: 'Name' },
    { key: 'email', label: 'Email', render: r => <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.email ?? '—'}</span> },
    { key: 'outstandingAmount', label: 'Outstanding', align: 'right', render: r => <strong style={{ color: 'var(--danger)' }}>${r.outstandingAmount.toFixed(2)}</strong> },
    { key: 'overdueDays', label: 'Days Overdue', render: r => <Badge variant="danger">{r.overdueDays}d</Badge> },
    { key: 'overdueOrders', label: 'Overdue Orders', render: r => r.overdueOrders },
    {
      key: 'actions', label: '', align: 'right',
      render: r => (
        <button
          className="btn btn-warning btn-sm"
          disabled={sendingId === r.customerId}
          onClick={() => sendReminder(r.customerId)}
        >
          {sendingId === r.customerId ? <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : 'Send Reminder'}
        </button>
      ),
    },
  ];

  const TABS: { key: Tab; label: string }[] = [
    { key: 'top-spenders', label: 'Top Spenders' },
    { key: 'regulars', label: 'Regular Customers' },
    { key: 'pending-credits', label: 'Pending Credits' },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Customer Reports</h2>
          <p className="page-subtitle">Spending patterns, regulars, and outstanding credits</p>
        </div>
      </div>

      <div className="tab-row">
        {TABS.map(t => (
          <button key={t.key} className={`tab-btn ${activeTab === t.key ? 'active' : ''}`} onClick={() => setActiveTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'top-spenders' && (
        <DataTable columns={spenderCols} data={spenders} loading={loading} keyExtractor={r => r.customerId} emptyMessage="No data." />
      )}
      {activeTab === 'regulars' && (
        <DataTable columns={regularCols} data={regulars} loading={loading} keyExtractor={r => r.customerId} emptyMessage="No data." />
      )}
      {activeTab === 'pending-credits' && (
        <DataTable columns={creditCols} data={credits} loading={loading} keyExtractor={r => r.customerId} emptyMessage="No pending credits." />
      )}
    </div>
  );
}
