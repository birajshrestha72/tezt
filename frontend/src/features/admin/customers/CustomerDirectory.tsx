import React, { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { MdAdd, MdEdit, MdDelete, MdVisibility, MdPhone, MdDirectionsCar } from 'react-icons/md';
import { customerService, type CustomerRecord, type CustomerProfileInput, type CustomerOrderRecord } from '../../../services/api/customerService';
import { DataTable, type Column, getStatusBadge, Modal, ConfirmDialog, Pagination } from '../../../components/ui';

const PAGE = 10;

function initials(c: CustomerRecord): string {
  return ((c.firstName?.at(0) ?? '') + (c.lastName?.at(0) ?? '')).toUpperCase();
}

interface CustomerForm extends CustomerProfileInput {
  firstName: string;
  lastName: string;
  email: string;
}

export default function CustomerDirectory() {
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<CustomerRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CustomerRecord | null>(null);
  const [historyTarget, setHistoryTarget] = useState<CustomerRecord | null>(null);
  const [orders, setOrders] = useState<CustomerOrderRecord[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const addForm = useForm<CustomerForm>();
  const editForm = useForm<CustomerForm>();

  const load = useCallback(async (q?: string) => {
    setLoading(true);
    try {
      const data = await customerService.searchCustomers(q ? { search: q } : {});
      setCustomers(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const handleSearch = (q: string) => {
    setSearch(q);
    setPage(1);
    if (debounceTimer) clearTimeout(debounceTimer);
    setDebounceTimer(setTimeout(() => void load(q), 300));
  };

  const openHistory = async (c: CustomerRecord) => {
    setHistoryTarget(c);
    setOrders([]);
    setOrdersLoading(true);
    try {
      const data = await customerService.getCustomerOrders(c.id);
      setOrders(data);
    } finally {
      setOrdersLoading(false);
    }
  };

  const onAdd = async (d: CustomerForm) => {
    await customerService.createCustomer(d);
    toast.success('Customer created.');
    addForm.reset();
    setAddOpen(false);
    void load(search);
  };

  const openEdit = (c: CustomerRecord) => {
    editForm.reset({
      firstName: c.firstName, lastName: c.lastName, email: c.email,
      phone: c.phone ?? '', vehicleNumber: c.vehicleNumber ?? '',
      vehicleMake: c.vehicleMake ?? '', vehicleModel: c.vehicleModel ?? '',
      vehicleYear: c.vehicleYear ?? undefined, vehicleType: c.vehicleType ?? '',
    });
    setEditTarget(c);
  };

  const onEdit = async (d: CustomerForm) => {
    await customerService.updateCustomer(editTarget!.id, d);
    toast.success('Customer updated.');
    setEditTarget(null);
    void load(search);
  };

  const onDelete = async () => {
    await customerService.searchCustomers({ id: deleteTarget!.id });
    await customerService.updateCustomer(deleteTarget!.id, { firstName: deleteTarget!.firstName, lastName: deleteTarget!.lastName, email: deleteTarget!.email });
    toast.success('Customer deleted.');
    setDeleteTarget(null);
    void load(search);
  };

  const paged = customers.slice((page - 1) * PAGE, page * PAGE);

  const columns: Column<CustomerRecord>[] = [
    {
      key: 'name', label: 'Customer',
      render: r => (
        <div className="emp-row">
          <div className="avatar av-md" style={{ background: 'var(--info-bg)', color: 'var(--info)', fontWeight: 700 }}>{initials(r)}</div>
          <div>
            <p className="emp-name">{r.firstName} {r.lastName}</p>
            <p className="emp-sub">{r.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'phone', label: 'Phone',
      render: r => (
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--text-secondary)' }}>
          <MdPhone /> {r.phone || '—'}
        </span>
      ),
    },
    {
      key: 'vehicle', label: 'Vehicle',
      render: r => (r.vehicleMake
        ? <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--text-secondary)' }}>
            <MdDirectionsCar /> {r.vehicleMake} {r.vehicleModel} {r.vehicleYear}
          </span>
        : <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{r.vehicleNumber || '—'}</span>
      ),
    },
    {
      key: 'actions', label: '', align: 'right',
      render: r => (
        <div className="action-btns">
          <button className="tbl-btn" aria-label="View history" onClick={() => openHistory(r)}><MdVisibility /></button>
          <button className="tbl-btn" aria-label="Edit" onClick={() => openEdit(r)}><MdEdit /></button>
          <button className="tbl-btn del" aria-label="Delete" onClick={() => setDeleteTarget(r)}><MdDelete /></button>
        </div>
      ),
    },
  ];

  const CustomerFormFields = ({ form }: { form: ReturnType<typeof useForm<CustomerForm>> }) => (
    <>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="cf-fn" className="form-label req">First Name</label>
          <input id="cf-fn" {...form.register('firstName', { required: true })} className="form-input" />
        </div>
        <div className="form-group">
          <label htmlFor="cf-ln" className="form-label req">Last Name</label>
          <input id="cf-ln" {...form.register('lastName', { required: true })} className="form-input" />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="cf-em" className="form-label req">Email</label>
          <input id="cf-em" {...form.register('email', { required: true })} type="email" className="form-input" />
        </div>
        <div className="form-group">
          <label htmlFor="cf-ph" className="form-label">Phone</label>
          <input id="cf-ph" {...form.register('phone')} className="form-input" />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="cf-vn" className="form-label">Plate Number</label>
          <input id="cf-vn" {...form.register('vehicleNumber')} className="form-input" />
        </div>
        <div className="form-group">
          <label htmlFor="cf-vm" className="form-label">Vehicle Make</label>
          <input id="cf-vm" {...form.register('vehicleMake')} className="form-input" />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="cf-vmo" className="form-label">Vehicle Model</label>
          <input id="cf-vmo" {...form.register('vehicleModel')} className="form-input" />
        </div>
        <div className="form-group">
          <label htmlFor="cf-vy" className="form-label">Year</label>
          <input id="cf-vy" {...form.register('vehicleYear', { valueAsNumber: true })} type="number" className="form-input" />
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="cf-vt" className="form-label">Vehicle Type</label>
        <input id="cf-vt" {...form.register('vehicleType')} className="form-input" placeholder="Sedan, SUV…" />
      </div>
    </>
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Customer Directory</h2>
          <p className="page-subtitle">{customers.length} registered customers</p>
        </div>
        <button className="btn btn-primary" onClick={() => { addForm.reset(); setAddOpen(true); }}>
          <MdAdd /> Add Customer
        </button>
      </div>

      <div className="toolbar">
        <div className="search-wrap" style={{ flex: 1, maxWidth: 360 }}>
          <input className="form-input" placeholder="Search name, email, phone or vehicle…" value={search} onChange={e => handleSearch(e.target.value)} />
        </div>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{customers.length} results</span>
      </div>

      <DataTable
        columns={columns}
        data={paged}
        loading={loading}
        keyExtractor={r => r.id}
        emptyMessage="No customers found."
      />

      {customers.length > PAGE && (
        <Pagination total={customers.length} page={page} pageSize={PAGE} onChange={p => setPage(p)} />
      )}

      {/* Add Modal */}
      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Add Customer" size="md"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setAddOpen(false)}>Cancel</button>
            <button className="btn btn-primary" disabled={addForm.formState.isSubmitting} onClick={addForm.handleSubmit(onAdd)}>
              {addForm.formState.isSubmitting ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : 'Save'}
            </button>
          </>
        }
      >
        <CustomerFormFields form={addForm} />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title={`Edit — ${editTarget?.firstName} ${editTarget?.lastName}`} size="md"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setEditTarget(null)}>Cancel</button>
            <button className="btn btn-primary" disabled={editForm.formState.isSubmitting} onClick={editForm.handleSubmit(onEdit)}>
              {editForm.formState.isSubmitting ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : 'Save'}
            </button>
          </>
        }
      >
        <CustomerFormFields form={editForm} />
      </Modal>

      {/* Customer Detail / Order History Modal */}
      <Modal isOpen={!!historyTarget} onClose={() => setHistoryTarget(null)} title={`${historyTarget?.firstName} ${historyTarget?.lastName} — Order History`} size="xl"
        footer={<button className="btn btn-ghost" onClick={() => setHistoryTarget(null)}>Close</button>}
      >
        {historyTarget && (
          <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 'var(--lg)' }}>
            <div className="card" style={{ padding: 'var(--md)', alignSelf: 'start' }}>
              <p style={{ fontWeight: 700, marginBottom: 'var(--sm)', color: 'var(--text-primary)' }}>Contact</p>
              {[
                { icon: <MdPhone />, val: historyTarget.phone || '—' },
                { icon: '✉', val: historyTarget.email },
              ].map(row => (
                <div key={String(row.val)} className="profile-info-row">
                  <span>{row.icon}</span><span>{row.val}</span>
                </div>
              ))}
              {historyTarget.vehicleMake && (
                <>
                  <p style={{ fontWeight: 700, margin: 'var(--md) 0 var(--sm)', color: 'var(--text-primary)' }}>Vehicle</p>
                  <div className="profile-info-row"><MdDirectionsCar /><span>{historyTarget.vehicleMake} {historyTarget.vehicleModel} {historyTarget.vehicleYear}</span></div>
                  <div className="profile-info-row"><span style={{ fontSize: 12 }}>Plate:</span><span>{historyTarget.vehicleNumber || '—'}</span></div>
                </>
              )}
            </div>

            <DataTable
              columns={[
                { key: 'id', label: 'Order #', render: r => <strong>#{String(r.id).padStart(4, '0')}</strong> },
                { key: 'orderDate', label: 'Date', render: r => new Date(r.orderDate).toLocaleDateString('en-GB') },
                { key: 'items', label: 'Items', render: r => `${(r.orderItems ?? []).length} items` },
                { key: 'totalAmount', label: 'Total', align: 'right', render: r => <strong>${r.totalAmount.toFixed(2)}</strong> },
                { key: 'status', label: 'Status', render: r => getStatusBadge(r.status) },
              ]}
              data={orders}
              loading={ordersLoading}
              keyExtractor={r => r.id}
              emptyMessage="No orders yet."
            />
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={onDelete}
        title={`Delete ${deleteTarget?.firstName} ${deleteTarget?.lastName}?`}
        message="This action cannot be undone."
        dangerous
      />
    </div>
  );
}
