import React, { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../../../services/api/axios';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Modal from '../../../components/ui/Modal';
import Pagination from '../../../components/ui/Pagination';
import './StaffManagement.css';

const PAGE = 10;
const DEPTS = ['Sales', 'Inventory', 'Customer Service', 'Administration', 'Technical'];

interface Staff {
  id: string;
  employeeCode: string;
  fullName: string;
  email: string;
  department: string;
  isActive: boolean;
  joinedAt: string;
  phone?: string;
}

export default function StaffManagement() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Staff | null>(null);
  const [showPw, setShowPw] = useState(false);

  const { register: rA, handleSubmit: hsA, reset: rstA, formState: { errors: eA, isSubmitting: sA } } = useForm();
  const { register: rE, handleSubmit: hsE, reset: rstE, formState: { errors: eE, isSubmitting: sE } } = useForm();

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get('/staff');
      setStaff(r.data.data);
    } catch {
      toast.error('Failed to load staff.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return staff.filter(s => 
      s.fullName.toLowerCase().includes(q) || 
      s.employeeCode.toLowerCase().includes(q) || 
      (s.email || '').toLowerCase().includes(q)
    );
  }, [staff, search]);

  const paged = filtered.slice((page - 1) * PAGE, page * PAGE);
  const totalPages = Math.ceil(filtered.length / PAGE);

  const onAdd = async (d: any) => {
    try {
      await api.post('/staff', { ...d, joinedAt: d.joinedAt || new Date().toISOString() });
      toast.success(`Staff "${d.fullName}" created.`);
      rstA();
      setShowAdd(false);
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create staff.');
    }
  };

  const openEdit = (s: Staff) => {
    setEditing(s);
    rstE({ fullName: s.fullName, phone: s.phone || '', department: s.department, isActive: s.isActive });
  };

  const onEdit = async (d: any) => {
    try {
      await api.put(`/staff/${editing?.id}`, { ...d, isActive: d.isActive === 'true' || d.isActive === true });
      toast.success('Staff updated.');
      setEditing(null);
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed.');
    }
  };

  const deactivate = async (s: Staff) => {
    if (!window.confirm(`Deactivate ${s.fullName}? They can no longer log in.`)) return;
    try {
      await api.delete(`/staff/${s.id}`);
      toast.success('Staff deactivated.');
      load();
    } catch {
      toast.error('Failed.');
    }
  };

  return (
    <div className="staff-management">
      <div className="pg-header">
        <div>
          <h2 className="pg-title">Staff Management</h2>
          <p className="pg-sub">{staff.filter(s => s.isActive).length} active of {staff.length} total</p>
        </div>
        <Button onClick={() => { rstA(); setShowPw(false); setShowAdd(true); }}>+ Add Staff</Button>
      </div>

      <div className="toolbar">
        <input 
          className="search-input" 
          placeholder="Search by name, code or email…" 
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }} 
        />
        <span className="table-count">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="table-card">
        {loading ? (
          <div style={{ padding: 20 }}>{[1, 2, 3].map(i => <div key={i} className="sm-skeleton" />)}</div>
        ) : paged.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👤</div>
            <p>{search ? 'No staff match your search.' : 'No staff members yet.'}</p>
            {!search && <Button onClick={() => setShowAdd(true)}>Add first staff member</Button>}
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr><th>Code</th><th>Full Name</th><th>Email</th><th>Department</th><th>Status</th><th>Joined</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {paged.map(s => (
                    <tr key={s.id}>
                      <td><code className="sm-code">{s.employeeCode}</code></td>
                      <td style={{ fontWeight: 600 }}>{s.fullName}</td>
                      <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{s.email}</td>
                      <td>{s.department}</td>
                      <td><Badge label={s.isActive ? 'Active' : 'Inactive'} type={s.isActive ? 'success' : 'danger'} /></td>
                      <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{new Date(s.joinedAt).toLocaleDateString('en-GB')}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          <Button variant="secondary" size="sm" onClick={() => openEdit(s)}>Edit</Button>
                          {s.isActive && <Button variant="danger" size="sm" onClick={() => deactivate(s)}>Deactivate</Button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="table-footer">
              <span className="table-count">Showing {(page - 1) * PAGE + 1}–{Math.min(page * PAGE, filtered.length)} of {filtered.length}</span>
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </>
        )}
      </div>

      <Modal 
        isOpen={showAdd} 
        onClose={() => setShowAdd(false)} 
        title="Add New Staff Member"
        footer={<><Button variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Button><Button type="submit" form="addStaffForm" disabled={sA}>{sA ? 'Creating…' : 'Create Staff'}</Button></>}
      >
        <form id="addStaffForm" onSubmit={hsA(onAdd)} className="form-grid" noValidate>
          <div className="form-field">
            <label className="field-label req">Full Name</label>
            <input 
              className={`field-input${eA.fullName ? ' err' : ''}`} 
              placeholder="e.g. Ram Thapa"
              {...rA('fullName', { required: 'Full name is required', maxLength: { value: 150, message: 'Max 150 characters' } })} 
            />
            {eA.fullName && <span className="field-error">{eA.fullName.message as string}</span>}
          </div>
          <div className="form-field">
            <label className="field-label req">Employee Code</label>
            <input 
              className={`field-input${eA.employeeCode ? ' err' : ''}`} 
              placeholder="EMP-005"
              {...rA('employeeCode', { required: 'Employee code is required', pattern: { value: /^EMP-\d{3}$/, message: 'Format must be EMP-001, EMP-002…' } })} 
            />
            {eA.employeeCode && <span className="field-error">{eA.employeeCode.message as string}</span>}
            <span className="field-hint">Format: EMP-001</span>
          </div>
          <div className="form-field">
            <label className="field-label req">Email</label>
            <input 
              className={`field-input${eA.email ? ' err' : ''}`} 
              type="email" 
              placeholder="staff@vehicleparts.com"
              {...rA('email', { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' } })} 
            />
            {eA.email && <span className="field-error">{eA.email.message as string}</span>}
          </div>
          <div className="form-field">
            <label className="field-label req">Password</label>
            <div style={{ position: 'relative' }}>
              <input 
                className={`field-input${eA.password ? ' err' : ''}`} 
                type={showPw ? 'text' : 'password'} 
                placeholder="Min 6 characters" 
                style={{ paddingRight: 38 }}
                {...rA('password', { required: 'Password is required', minLength: { value: 6, message: 'Minimum 6 characters' } })} 
              />
              <button 
                type="button" 
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }} 
                onClick={() => setShowPw(v => !v)}
              >
                {showPw ? '🙈' : '👁'}
              </button>
            </div>
            {eA.password && <span className="field-error">{eA.password.message as string}</span>}
          </div>
          <div className="form-field">
            <label className="field-label req">Department</label>
            <select className={`field-select${eA.department ? ' err' : ''}`} {...rA('department', { required: 'Please select a department' })}>
              <option value="">Select department…</option>
              {DEPTS.map(d => <option key={d}>{d}</option>)}
            </select>
            {eA.department && <span className="field-error">{eA.department.message as string}</span>}
          </div>
          <div className="form-field">
            <label className="field-label">Phone</label>
            <input 
              className={`field-input${eA.phone ? ' err' : ''}`} 
              placeholder="10 digit number"
              {...rA('phone', { pattern: { value: /^\d{10}$/, message: 'Must be exactly 10 digits' } })} 
            />
            {eA.phone && <span className="field-error">{eA.phone.message as string}</span>}
          </div>
          <div className="form-field form-field-full">
            <label className="field-label">Joined Date</label>
            <input className="field-input" type="date" {...rA('joinedAt')} />
            <span className="field-hint">Leave blank to use today's date</span>
          </div>
        </form>
      </Modal>

      <Modal 
        isOpen={!!editing} 
        onClose={() => setEditing(null)} 
        title={`Edit — ${editing?.fullName}`}
        footer={<><Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button><Button type="submit" form="editStaffForm" disabled={sE}>{sE ? 'Saving…' : 'Save Changes'}</Button></>}
      >
        <form id="editStaffForm" onSubmit={hsE(onEdit)} className="form-grid" noValidate>
          <div className="form-field">
            <label className="field-label">Full Name</label>
            <input className={`field-input${eE.fullName ? ' err' : ''}`} {...rE('fullName', { maxLength: { value: 150, message: 'Max 150 characters' } })} />
            {eE.fullName && <span className="field-error">{eE.fullName.message as string}</span>}
          </div>
          <div className="form-field">
            <label className="field-label">Phone</label>
            <input 
              className={`field-input${eE.phone ? ' err' : ''}`} 
              placeholder="10 digits"
              {...rE('phone', { pattern: { value: /^\d{10}$/, message: 'Must be 10 digits' } })} 
            />
            {eE.phone && <span className="field-error">{eE.phone.message as string}</span>}
          </div>
          <div className="form-field">
            <label className="field-label">Department</label>
            <select className="field-select" {...rE('department')}>
              {DEPTS.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label className="field-label">Status</label>
            <select className="field-select" {...rE('isActive')}>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
}
