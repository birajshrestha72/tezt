import React, { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { MdAdd, MdEdit, MdDelete, MdBusiness, MdEmail, MdPhone } from 'react-icons/md';
import api from '../../../services/api/axios';
import { DataTable, type Column, Modal, ConfirmDialog, Pagination } from '../../../components/ui';

const PAGE = 10;

interface VendorRecord {
  id: number;
  name: string;
  email?: string;
  phone?: string | null;
}

interface VendorForm {
  name: string;
  email: string;
  phone?: string;
}

export default function VendorManagement() {
  const [vendors, setVendors] = useState<VendorRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<VendorRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<VendorRecord | null>(null);

  const addForm = useForm<VendorForm>();
  const editForm = useForm<VendorForm>();

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get('/vendors');
      setVendors(r.data?.data ?? []);
    } catch {
      toast.error('Failed to load vendors.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return vendors.filter(v =>
      v.name.toLowerCase().includes(q) ||
      (v.email ?? '').toLowerCase().includes(q)
    );
  }, [vendors, search]);

  const paged = filtered.slice((page - 1) * PAGE, page * PAGE);

  const onAdd = async (d: VendorForm) => {
    await api.post('/vendors', { name: d.name, email: d.email, phone: d.phone || null });
    toast.success('Vendor created.');
    addForm.reset();
    setAddOpen(false);
    void load();
  };

  const openEdit = (v: VendorRecord) => {
    editForm.reset({ name: v.name, email: v.email ?? '', phone: v.phone ?? '' });
    setEditTarget(v);
  };

  const onEdit = async (d: VendorForm) => {
    await api.put(`/vendors/${editTarget!.id}`, { name: d.name, email: d.email, phone: d.phone || null });
    toast.success('Vendor updated.');
    setEditTarget(null);
    void load();
  };

  const onDelete = async () => {
    await api.delete(`/vendors/${deleteTarget!.id}`);
    toast.success('Vendor deleted.');
    setDeleteTarget(null);
    void load();
  };

  const columns: Column<VendorRecord>[] = [
    {
      key: 'name', label: 'Vendor',
      render: row => (
        <div className="emp-row">
          <div className="avatar av-md" style={{ background: 'var(--info-bg)', color: 'var(--info)' }}><MdBusiness /></div>
          <div>
            <p className="emp-name">{row.name}</p>
            <p className="emp-sub">VND-{String(row.id).padStart(3, '0')}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'email', label: 'Email',
      render: row => (
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
          <MdEmail style={{ flexShrink: 0 }} /> {row.email || '—'}
        </span>
      ),
    },
    {
      key: 'phone', label: 'Phone',
      render: row => (
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
          <MdPhone style={{ flexShrink: 0 }} /> {row.phone || '—'}
        </span>
      ),
    },
    {
      key: 'actions', label: '', align: 'right',
      render: row => (
        <div className="action-btns">
          <button className="tbl-btn" aria-label="Edit" onClick={() => openEdit(row)}><MdEdit /></button>
          <button className="tbl-btn del" aria-label="Delete" onClick={() => setDeleteTarget(row)}><MdDelete /></button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Vendor Management</h2>
          <p className="page-subtitle">Manage suppliers and procurement contacts</p>
        </div>
        <button className="btn btn-primary" onClick={() => { addForm.reset(); setAddOpen(true); }}>
          <MdAdd /> Add Vendor
        </button>
      </div>

      <div className="toolbar">
        <div className="search-wrap" style={{ flex: 1, maxWidth: 320 }}>
          <input className="form-input" placeholder="Search by name or email…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{filtered.length} vendors</span>
      </div>

      <DataTable
        columns={columns}
        data={paged}
        loading={loading}
        keyExtractor={r => r.id}
        emptyMessage={search ? 'No vendors match your search.' : 'No vendors yet.'}
      />

      {filtered.length > PAGE && (
        <Pagination total={filtered.length} page={page} pageSize={PAGE} onChange={p => setPage(p)} />
      )}

      {/* Add Modal */}
      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Add Vendor" size="md"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setAddOpen(false)}>Cancel</button>
            <button className="btn btn-primary" disabled={addForm.formState.isSubmitting} onClick={addForm.handleSubmit(onAdd)}>
              {addForm.formState.isSubmitting ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : 'Save'}
            </button>
          </>
        }
      >
        <form noValidate>
          <div className="form-group">
            <label htmlFor="v-add-name" className="form-label req">Vendor Name</label>
            <input id="v-add-name" {...addForm.register('name', { required: true, maxLength: 150 })} className="form-input" placeholder="e.g. Auto Parts Pvt. Ltd." />
          </div>
          <div className="form-group">
            <label htmlFor="v-add-email" className="form-label req">Email</label>
            <input id="v-add-email" {...addForm.register('email', { required: true })} type="email" className="form-input" placeholder="vendor@example.com" />
          </div>
          <div className="form-group">
            <label htmlFor="v-add-phone" className="form-label">Phone</label>
            <input id="v-add-phone" {...addForm.register('phone')} className="form-input" placeholder="+977 XXXXXXXX" />
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title={`Edit — ${editTarget?.name}`} size="md"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setEditTarget(null)}>Cancel</button>
            <button className="btn btn-primary" disabled={editForm.formState.isSubmitting} onClick={editForm.handleSubmit(onEdit)}>
              {editForm.formState.isSubmitting ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : 'Save'}
            </button>
          </>
        }
      >
        <form noValidate>
          <div className="form-group">
            <label htmlFor="v-edit-name" className="form-label req">Vendor Name</label>
            <input id="v-edit-name" {...editForm.register('name', { required: true, maxLength: 150 })} className="form-input" />
          </div>
          <div className="form-group">
            <label htmlFor="v-edit-email" className="form-label req">Email</label>
            <input id="v-edit-email" {...editForm.register('email', { required: true })} type="email" className="form-input" />
          </div>
          <div className="form-group">
            <label htmlFor="v-edit-phone" className="form-label">Phone</label>
            <input id="v-edit-phone" {...editForm.register('phone')} className="form-input" />
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={onDelete}
        title={`Delete "${deleteTarget?.name}"?`}
        message="This action cannot be undone."
        dangerous
      />
    </div>
  );
}
