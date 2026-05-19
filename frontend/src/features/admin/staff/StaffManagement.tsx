import React, { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { MdAdd, MdEdit, MdDelete } from 'react-icons/md';
import api from '../../../services/api/axios';
import { DataTable, type Column, Badge, getStatusBadge, Modal, ConfirmDialog, Pagination } from '../../../components/ui';

const PAGE = 10;
const ROLES = ['Admin', 'Staff', 'Sales', 'Inventory', 'Customer Service', 'Administration', 'Technical'];

interface StaffRecord {
  id: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  isActive?: boolean;
  createdAt?: string;
}

interface StaffRow {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

interface StaffForm {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
  password?: string;
}

function normalize(r: StaffRecord): StaffRow {
  return {
    id: r.id,
    firstName: r.firstName ?? '',
    lastName: r.lastName ?? '',
    fullName: `${r.firstName ?? ''} ${r.lastName ?? ''}`.trim() || 'Unnamed',
    email: r.email ?? '',
    role: r.role ?? 'Staff',
    isActive: r.isActive ?? true,
    createdAt: r.createdAt ?? new Date().toISOString(),
  };
}

function initials(row: StaffRow) {
  const parts = row.fullName.split(' ').filter(Boolean);
  return ((parts[0]?.at(0) ?? '') + (parts.at(-1)?.at(0) ?? '')).toUpperCase();
}

export default function StaffManagement() {
  const [staff, setStaff] = useState<StaffRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [page, setPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<StaffRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StaffRow | null>(null);

  const addForm = useForm<StaffForm>({ defaultValues: { isActive: true } });
  const editForm = useForm<StaffForm>();

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get('/staff');
      setStaff((r.data?.data ?? []).map(normalize));
    } catch {
      toast.error('Failed to load staff.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return staff.filter(s => {
      const matchSearch = !q || s.fullName.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || s.role.toLowerCase().includes(q);
      const matchFilter = filter === 'All' || (filter === 'Active' ? s.isActive : !s.isActive);
      return matchSearch && matchFilter;
    });
  }, [staff, search, filter]);

  const paged = filtered.slice((page - 1) * PAGE, page * PAGE);

  const onAdd = async (d: StaffForm) => {
    await api.post('/staff', { firstName: d.firstName, lastName: d.lastName, email: d.email, role: d.role, isActive: d.isActive, password: d.password || undefined });
    toast.success('Staff member added.');
    addForm.reset({ isActive: true });
    setAddOpen(false);
    void load();
  };

  const openEdit = (row: StaffRow) => {
    editForm.reset({ firstName: row.firstName, lastName: row.lastName, email: row.email, role: row.role, isActive: row.isActive });
    setEditTarget(row);
  };

  const onEdit = async (d: StaffForm) => {
    await api.put(`/staff/${editTarget!.id}`, { firstName: d.firstName, lastName: d.lastName, email: d.email, role: d.role, isActive: d.isActive });
    toast.success('Staff updated.');
    setEditTarget(null);
    void load();
  };

  const onDelete = async () => {
    await api.delete(`/staff/${deleteTarget!.id}`);
    toast.success('Staff removed.');
    setDeleteTarget(null);
    void load();
  };

  const columns: Column<StaffRow>[] = [
    {
      key: 'fullName', label: 'Employee',
      render: row => (
        <div className="emp-row">
          <div className="avatar av-md" style={{ background: 'var(--red-dim)', color: 'var(--red-bright)', fontWeight: 700 }}>{initials(row)}</div>
          <div>
            <p className="emp-name">{row.fullName}</p>
            <p className="emp-sub">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role', label: 'Role',
      render: row => getStatusBadge(row.role),
    },
    {
      key: 'isActive', label: 'Status',
      render: row => <Badge variant={row.isActive ? 'success' : 'muted'}>{row.isActive ? 'Active' : 'Inactive'}</Badge>,
    },
    {
      key: 'createdAt', label: 'Joined',
      render: row => new Date(row.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
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
          <h2 className="page-title">Staff Management</h2>
          <p className="page-subtitle">Manage your warehouse team and access roles</p>
        </div>
        <button className="btn btn-primary" onClick={() => { addForm.reset({ isActive: true }); setAddOpen(true); }}>
          <MdAdd /> Add Staff
        </button>
      </div>

      <div className="toolbar">
        <div className="search-wrap" style={{ flex: 1, maxWidth: 320 }}>
          <input className="form-input" placeholder="Search by name, email or role…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select className="form-select" style={{ width: 140 }} value={filter} onChange={e => { setFilter(e.target.value as typeof filter); setPage(1); }}>
          <option>All</option>
          <option>Active</option>
          <option>Inactive</option>
        </select>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{filtered.length} members</span>
      </div>

      <DataTable
        columns={columns}
        data={paged}
        loading={loading}
        keyExtractor={r => r.id}
        emptyMessage={search ? 'No staff match your search.' : 'No staff members yet.'}
      />

      {filtered.length > PAGE && (
        <Pagination total={filtered.length} page={page} pageSize={PAGE} onChange={p => setPage(p)} />
      )}

      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Add New Staff Member" size="md"
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
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="add-firstName" className="form-label req">First Name</label>
              <input id="add-firstName" {...addForm.register('firstName', { required: true })} className="form-input" />
            </div>
            <div className="form-group">
              <label htmlFor="add-lastName" className="form-label req">Last Name</label>
              <input id="add-lastName" {...addForm.register('lastName', { required: true })} className="form-input" />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="add-email" className="form-label req">Email</label>
            <input id="add-email" {...addForm.register('email', { required: true })} type="email" className="form-input" />
          </div>
          <div className="form-group">
            <label htmlFor="add-role" className="form-label req">Role</label>
            <select id="add-role" {...addForm.register('role', { required: true })} className="form-select">
              <option value="">Select role…</option>
              {ROLES.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-check">
              <input type="checkbox" {...addForm.register('isActive')} />
              <span>Active</span>
            </label>
          </div>
          <div className="form-group">
            <label htmlFor="add-password" className="form-label">Temporary Password</label>
            <input id="add-password" {...addForm.register('password')} type="password" className="form-input" placeholder="Leave blank for default (Staff@2025)" />
            <p className="form-hint">Leave blank to use default password.</p>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title={`Edit — ${editTarget?.fullName}`} size="md"
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
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="edit-firstName" className="form-label">First Name</label>
              <input id="edit-firstName" {...editForm.register('firstName')} className="form-input" />
            </div>
            <div className="form-group">
              <label htmlFor="edit-lastName" className="form-label">Last Name</label>
              <input id="edit-lastName" {...editForm.register('lastName')} className="form-input" />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="edit-email" className="form-label">Email</label>
            <input id="edit-email" {...editForm.register('email')} type="email" className="form-input" />
          </div>
          <div className="form-group">
            <label htmlFor="edit-role" className="form-label">Role</label>
            <select id="edit-role" {...editForm.register('role')} className="form-select">
              {ROLES.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-check">
              <input type="checkbox" {...editForm.register('isActive')} />
              <span>Active</span>
            </label>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={onDelete}
        title={`Remove ${deleteTarget?.fullName}?`}
        message="This action cannot be undone."
        dangerous
      />
    </div>
  );
}
