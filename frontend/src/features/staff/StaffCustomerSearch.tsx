import React, { useRef, useState } from 'react';
import { MdEmail, MdPhone, MdDirectionsCar, MdSearch, MdPerson } from 'react-icons/md';
import { customerService, type CustomerRecord, type CustomerOrderRecord } from '../../services/api/customerService';
import { DataTable, type Column, Modal } from '../../components/ui';
import { formatCurrency, formatDate } from '../../utils/format';

function getOrderStatusClass(status: string): string {
  if (status === 'Paid') return 'success';
  if (status === 'Pending') return 'warning';
  if (status === 'Cancelled') return 'danger';
  return 'info';
}

export default function StaffCustomerSearch() {
  const [search, setSearch] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [historyTarget, setHistoryTarget] = useState<CustomerRecord | null>(null);
  const [orders, setOrders] = useState<CustomerOrderRecord[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof globalThis.setTimeout> | null>(null);

  const doSearch = async (params: { search?: string; phone?: string; vehicleNumber?: string }) => {
    setLoading(true);
    setSearched(true);
    try {
      const data = await customerService.searchCustomers(params);
      setCustomers(data);
    } catch (err) {
      console.error('[StaffCustomerSearch] error:', err);
    } finally {
      setLoading(false);
    }
  };

  const scheduleSearch = (overrides: { search?: string; phone?: string; vehicleNumber?: string }) => {
    if (timerRef.current) globalThis.clearTimeout(timerRef.current);
    const params = {
      search: (overrides.search ?? search).trim() || undefined,
      phone: (overrides.phone ?? phone).trim() || undefined,
      vehicleNumber: (overrides.vehicleNumber ?? vehicleNumber).trim() || undefined,
    };
    timerRef.current = globalThis.setTimeout(() => { void doSearch(params); }, 300);
  };

  const openHistory = async (c: CustomerRecord) => {
    setHistoryTarget(c);
    setOrders([]);
    setOrdersLoading(true);
    try {
      const data = await customerService.getCustomerOrders(c.id);
      setOrders(data);
    } catch (err) {
      console.error('[StaffCustomerSearch] load orders error:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const orderCols: Column<CustomerOrderRecord>[] = [
    { key: 'id', label: 'Order #', render: r => <strong>#{String(r.id).padStart(4, '0')}</strong> },
    { key: 'orderDate', label: 'Date', render: r => formatDate(r.orderDate) },
    { key: 'items', label: 'Items', render: r => String((r.orderItems ?? []).length) },
    { key: 'totalAmount', label: 'Total', align: 'right', render: r => <strong>{formatCurrency(r.totalAmount)}</strong> },
    {
      key: 'status', label: 'Status',
      render: r => {
        const cls = getOrderStatusClass(r.status);
        const colors: Record<string, string> = {
          success: 'var(--success)', warning: 'var(--warning)', danger: 'var(--danger)', info: 'var(--info)',
        };
        return (
          <span style={{ color: colors[cls] ?? 'var(--text-secondary)', fontWeight: 600, fontSize: 12 }}>
            {r.status}
          </span>
        );
      },
    },
  ];

  const modalTitle = historyTarget
    ? `${historyTarget.firstName} ${historyTarget.lastName} — History`
    : '';

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Customer Search</h2>
          <p className="page-subtitle">Find customers by name, email, phone or vehicle</p>
        </div>
      </div>

      <div className="card customer-search-panel">
        <div className="customer-search-fields">
          <div className="search-wrap">
            <MdSearch className="search-icon" />
            <input
              className="search-input"
              placeholder="Search by name or email…"
              value={search}
              onChange={e => { setSearch(e.target.value); scheduleSearch({ search: e.target.value }); }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--md)' }}>
            <div className="search-wrap">
              <MdPhone className="search-icon" />
              <input
                className="search-input"
                placeholder="Phone number…"
                value={phone}
                onChange={e => { setPhone(e.target.value); scheduleSearch({ phone: e.target.value }); }}
              />
            </div>
            <div className="search-wrap">
              <MdDirectionsCar className="search-icon" />
              <input
                className="search-input"
                placeholder="Vehicle plate number…"
                value={vehicleNumber}
                onChange={e => { setVehicleNumber(e.target.value); scheduleSearch({ vehicleNumber: e.target.value }); }}
              />
            </div>
          </div>
        </div>
      </div>

      {loading && ['a', 'b', 'c', 'd'].map(k => (
        <div key={k} className="skeleton" style={{ height: 80, borderRadius: 12, marginBottom: 8 }} />
      ))}

      {!loading && searched && (customers.length === 0) && (
        <div className="card" style={{ padding: 'var(--xl)', textAlign: 'center', color: 'var(--text-muted)' }}>
          No customers found.
        </div>
      )}

      {!loading && (
        <div className="customer-search-grid">
          {customers.map(c => (
            <div key={c.id} className="card customer-search-card">
              <div className="avatar av-md" style={{ background: 'var(--info-bg)', color: 'var(--info)', fontWeight: 700, flexShrink: 0 }}>
                {((c.firstName?.at(0) ?? '') + (c.lastName?.at(0) ?? '')).toUpperCase()}
              </div>
              <div className="customer-search-card__content">
                <p className="customer-search-card__name">{c.firstName} {c.lastName}</p>
                <p className="customer-search-card__meta">
                  <MdEmail style={{ flexShrink: 0 }} />{c.email}
                </p>
                {c.phone && (
                  <p className="customer-search-card__meta">
                    <MdPhone style={{ flexShrink: 0 }} />{c.phone}
                  </p>
                )}
                {c.vehicleMake && (
                  <p className="customer-search-card__meta">
                    <MdDirectionsCar style={{ flexShrink: 0 }} />{c.vehicleMake} {c.vehicleModel} {c.vehicleYear}
                  </p>
                )}
              </div>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => openHistory(c)}>View</button>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={!!historyTarget} onClose={() => setHistoryTarget(null)} title={modalTitle} size="xl"
        footer={<button className="btn btn-ghost" onClick={() => setHistoryTarget(null)}>Close</button>}
      >
        {historyTarget && (
          <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 'var(--lg)' }}>
            <div className="card" style={{ padding: 'var(--md)', alignSelf: 'start' }}>
              <div className="avatar av-lg" style={{ background: 'var(--info-bg)', color: 'var(--info)', fontWeight: 700, margin: '0 auto var(--md)' }}>
                {((historyTarget.firstName?.at(0) ?? '') + (historyTarget.lastName?.at(0) ?? '')).toUpperCase()}
              </div>
              <p style={{ fontWeight: 700, color: 'var(--text-primary)', textAlign: 'center', marginBottom: 'var(--md)' }}>
                {historyTarget.firstName} {historyTarget.lastName}
              </p>
              <div className="profile-info-row"><MdPerson /><span style={{ fontSize: 13 }}>Customer</span></div>
              <div className="profile-info-row"><MdEmail /><span style={{ fontSize: 13 }}>{historyTarget.email}</span></div>
              {historyTarget.phone && (
                <div className="profile-info-row"><MdPhone /><span style={{ fontSize: 13 }}>{historyTarget.phone}</span></div>
              )}
              {historyTarget.vehicleMake && (
                <>
                  <p style={{ fontWeight: 700, margin: 'var(--md) 0 var(--sm)', color: 'var(--text-primary)' }}>Vehicle</p>
                  <div className="profile-info-row">
                    <MdDirectionsCar />
                    <span style={{ fontSize: 13 }}>{historyTarget.vehicleMake} {historyTarget.vehicleModel} {historyTarget.vehicleYear}</span>
                  </div>
                  {historyTarget.vehicleNumber && (
                    <div className="profile-info-row">
                      <MdDirectionsCar style={{ opacity: 0 }} />
                      <span style={{ fontSize: 13 }}>Plate: {historyTarget.vehicleNumber}</span>
                    </div>
                  )}
                </>
              )}
            </div>

            <DataTable
              columns={orderCols}
              data={orders}
              loading={ordersLoading}
              keyExtractor={r => r.id}
              emptyMessage="No orders found."
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
