import React, { useEffect, useState, useMemo } from 'react';
import { useForm, UseFormRegister, FieldErrors } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../../../services/api/axios';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Modal from '../../../components/ui/Modal';
import Pagination from '../../../components/ui/Pagination';

const PAGE = 10;

interface Vendor {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  isActive: boolean;
}

interface VendorFormProps {
  rFn: UseFormRegister<any>;
  errors: FieldErrors;
  formId: string;
  onSub: (e: React.FormEvent) => void;
}

const VendorForm = ({ rFn, errors, formId, onSub }: VendorFormProps) => (
  <form id={formId} onSubmit={onSub} className="form-grid" noValidate>
    <div className="form-field form-field-full">
      <label className="field-label req">Vendor Name</label>
      <input 
        className={`field-input${errors.name ? ' err' : ''}`} 
        placeholder="e.g. Nepal Auto Parts Pvt. Ltd." 
        {...rFn('name', { required: 'Vendor name is required', maxLength: { value: 150, message: 'Max 150 characters' } })} 
      />
      {errors.name && <span className="field-error">{errors.name.message as string}</span>}
    </div>
    <div className="form-field">
      <label className="field-label">Phone</label>
      <input 
        className={`field-input${errors.phone ? ' err' : ''}`} 
        placeholder="061-XXXXXX" 
        {...rFn('phone', { pattern: { value: /^[\d-+\s()]{7,20}$/, message: 'Invalid phone number' } })} 
      />
      {errors.phone && <span className="field-error">{errors.phone.message as string}</span>}
    </div>
    <div className="form-field">
      <label className="field-label">Email</label>
      <input 
        className={`field-input${errors.email ? ' err' : ''}`} 
        type="email" 
        placeholder="vendor@email.com" 
        {...rFn('email', { pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' } })} 
      />
      {errors.email && <span className="field-error">{errors.email.message as string}</span>}
    </div>
    <div className="form-field form-field-full">
      <label className="field-label">Address</label>
      <input className="field-input" placeholder="City, Nepal" {...rFn('address')} />
    </div>
  </form>
);

export default function VendorManagement() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Vendor | null>(null);

  const { register: rA, handleSubmit: hsA, reset: rstA, formState: { errors: eA, isSubmitting: sA } } = useForm();
  const { register: rE, handleSubmit: hsE, reset: rstE, formState: { errors: eE, isSubmitting: sE } } = useForm();

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get('/vendors');
      setVendors(r.data.data);
    } catch {
      toast.error('Failed to load vendors.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return vendors.filter(v => v.name.toLowerCase().includes(q) || (v.email || '').toLowerCase().includes(q));
  }, [vendors, search]);

  const paged = filtered.slice((page - 1) * PAGE, page * PAGE);
  const totalPages = Math.ceil(filtered.length / PAGE);

  const onAdd = async (d: any) => {
    try {
      await api.post('/vendors', d);
      toast.success('Vendor created.');
      rstA();
      setShowAdd(false);
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed.');
    }
  };

  const openEdit = (v: Vendor) => {
    setEditing(v);
    rstE({ name: v.name, phone: v.phone || '', email: v.email || '', address: v.address || '' });
  };

  const onEdit = async (d: any) => {
    try {
      await api.put(`/vendors/${editing?.id}`, d);
      toast.success('Vendor updated.');
      setEditing(null);
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed.');
    }
  };

  const deactivate = async (v: Vendor) => {
    if (!window.confirm(`Deactivate "${v.name}"?`)) return;
    try {
      await api.delete(`/vendors/${v.id}`);
      toast.success('Vendor deactivated.');
      load();
    } catch {
      toast.error('Failed.');
    }
  };

  return (
    <div className="vendor-management">
      <div className="pg-header">
        <div>
          <h2 className="pg-title">Vendor Management</h2>
          <p className="pg-sub">{vendors.filter(v => v.isActive).length} active of {vendors.length} total</p>
        </div>
        <Button onClick={() => { rstA(); setShowAdd(true); }}>+ Add Vendor</Button>
      </div>

      <div className="toolbar">
        <input 
          className="search-input" 
          placeholder="Search by name or email…" 
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }} 
        />
      </div>

      <div className="table-card">
        {loading ? (
          <p style={{ padding: 24, color: 'var(--text-secondary)' }}>Loading…</p>
        ) : paged.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏭</div>
            <p>{search ? 'No vendors match your search.' : 'No vendors yet.'}</p>
            {!search && <Button onClick={() => setShowAdd(true)}>Add first vendor</Button>}
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr><th>Name</th><th>Phone</th><th>Email</th><th>Address</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {paged.map(v => (
                    <tr key={v.id}>
                      <td style={{ fontWeight: 600 }}>{v.name}</td>
                      <td style={{ fontSize: 12 }}>{v.phone || '—'}</td>
                      <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{v.email || '—'}</td>
                      <td style={{ fontSize: 12, color: 'var(--text-secondary)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.address || '—'}</td>
                      <td><Badge label={v.isActive ? 'Active' : 'Inactive'} type={v.isActive ? 'success' : 'danger'} /></td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <Button variant="secondary" size="sm" onClick={() => openEdit(v)}>Edit</Button>
                          {v.isActive && <Button variant="danger" size="sm" onClick={() => deactivate(v)}>Deactivate</Button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="table-footer">
              <span className="table-count">{filtered.length} vendor{filtered.length !== 1 ? 's' : ''}</span>
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </>
        )}
      </div>

      <Modal 
        isOpen={showAdd} 
        onClose={() => setShowAdd(false)} 
        title="Add Vendor"
        footer={<><Button variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Button><Button type="submit" form="addVendorForm" disabled={sA}>{sA ? 'Creating…' : 'Create Vendor'}</Button></>}
      >
        <VendorForm rFn={rA} errors={eA} formId="addVendorForm" onSub={hsA(onAdd)} />
      </Modal>

      <Modal 
        isOpen={!!editing} 
        onClose={() => setEditing(null)} 
        title={`Edit — ${editing?.name}`}
        footer={<><Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button><Button type="submit" form="editVendorForm" disabled={sE}>{sE ? 'Saving…' : 'Save Changes'}</Button></>}
      >
        <VendorForm rFn={rE} errors={eE} formId="editVendorForm" onSub={hsE(onEdit)} />
      </Modal>
    </div>
  );
}
