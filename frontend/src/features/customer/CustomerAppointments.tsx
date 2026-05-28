import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { MdAdd, MdCalendarToday, MdBuild } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
import { appointmentService, type AppointmentRecord } from '../../services/api/appointmentService';
import { partRequestService, type PartRequestRecord } from '../../services/api/partRequestService';
import { Modal, getStatusBadge, EmptyState } from '../../components/ui';
import { formatDate } from '../../utils/format';

type Tab = 'appointments' | 'part-requests';

const SERVICE_TYPES = [
  'Oil Change',
  'Tyre Rotation',
  'Brake Service',
  'Engine Check',
  'Battery Replacement',
  'Air Filter Replacement',
  'Transmission Service',
  'AC Service',
  'Wheel Alignment',
  'General Service',
];

interface ApptForm {
  appointmentDate: string;
  serviceType: string;
  notes?: string;
}

interface PartReqForm {
  partName: string;
  description?: string;
}

export default function CustomerAppointments() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('appointments');
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [partRequests, setPartRequests] = useState<PartRequestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [addPartOpen, setAddPartOpen] = useState(false);

  const apptForm = useForm<ApptForm>({ defaultValues: { serviceType: SERVICE_TYPES[0] } });
  const partForm = useForm<PartReqForm>();

  const loadAppointments = async () => {
    if (!user?.id) return;
    try {
      const data = await appointmentService.getAppointmentsByCustomer(user.id);
      setAppointments(data.toSorted((a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime()));
    } catch (err) {
      console.error('[CustomerAppointments] load appointments error:', err);
    }
  };

  const loadPartRequests = async () => {
    if (!user?.id) return;
    try {
      const data = await partRequestService.getPartRequestsByCustomer(user.id);
      setPartRequests(data);
    } catch (err) {
      console.error('[CustomerAppointments] load part requests error:', err);
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.allSettled([loadAppointments(), loadPartRequests()]);
      setLoading(false);
    };
    void load();
  }, [user?.id]);

  const onAddAppt = async (d: ApptForm) => {
    if (!user?.id) return;
    try {
      await appointmentService.createAppointment({
        customerId: user.id,
        appointmentDate: d.appointmentDate,
        serviceType: d.serviceType,
        notes: d.notes,
      });
      toast.success('Appointment booked.');
      apptForm.reset({ serviceType: SERVICE_TYPES[0] });
      setAddOpen(false);
      void loadAppointments();
    } catch (err) {
      console.error('[CustomerAppointments] book error:', err);
    }
  };

  const onCancelAppt = async (id: number) => {
    try {
      await appointmentService.updateAppointmentStatus(id, 'Cancelled');
      toast.success('Appointment cancelled.');
      void loadAppointments();
    } catch (err) {
      console.error('[CustomerAppointments] cancel error:', err);
    }
  };

  const onAddPartReq = async (d: PartReqForm) => {
    if (!user?.id) return;
    try {
      await partRequestService.createPartRequest({
        customerId: user.id,
        partName: d.partName,
        description: d.description || null,
      });
      toast.success('Part request submitted.');
      partForm.reset();
      setAddPartOpen(false);
      void loadPartRequests();
    } catch (err) {
      console.error('[CustomerAppointments] part request error:', err);
    }
  };

  return (
    <div>
      <div className="page-header customer-page-header">
        <div>
          <h2 className="page-title">My Appointments</h2>
          <p className="page-subtitle">Service bookings and part requests</p>
        </div>
        <div className="customer-page-header__action">
          {tab === 'appointments' && (
            <button type="button" className="btn btn-primary appointments-header-btn" onClick={() => { apptForm.reset({ serviceType: SERVICE_TYPES[0] }); setAddOpen(true); }}>
              <MdAdd /> Book Appointment
            </button>
          )}
          {tab === 'part-requests' && (
            <button type="button" className="btn btn-primary appointments-header-btn" onClick={() => { partForm.reset(); setAddPartOpen(true); }}>
              <MdAdd /> Request Part
            </button>
          )}
        </div>
      </div>

      <div className="tab-row appointments-tab-row">
        {([
          { key: 'appointments' as Tab, label: 'Appointments', icon: <MdCalendarToday /> },
          { key: 'part-requests' as Tab, label: 'Part Requests', icon: <MdBuild /> },
        ]).map(t => (
          <button key={t.key} className={`tab-btn ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* APPOINTMENTS TAB */}
      {tab === 'appointments' && (
        <>
          {loading && ['a', 'b', 'c'].map(k => (
            <div key={k} className="skeleton" style={{ height: 80, borderRadius: 12, marginBottom: 8 }} />
          ))}
          {!loading && (appointments.length === 0) && (
            <div className="card appointments-empty-card">
              <EmptyState icon={<MdCalendarToday />} title="No appointments yet." action={{ label: 'Book Now', onClick: () => setAddOpen(true) }} />
            </div>
          )}
          {!loading && appointments.map(a => {
            const d = new Date(a.appointmentDate);
            return (
              <div key={a.id} className="appt-card">
                <div style={{ textAlign: 'center', minWidth: 52 }}>
                  <p className="appt-date">{d.getDate()}</p>
                  <p className="appt-month">{d.toLocaleString('en-GB', { month: 'short' })}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{d.getFullYear()}</p>
                </div>
                <div style={{ flex: 1 }}>
                  <p className="appt-service">{a.serviceType}</p>
                  {a.notes && <p className="appt-notes">{a.notes}</p>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 'var(--xs, 4px)' }}>
                  {getStatusBadge(a.status)}
                  {a.status === 'Pending' && (
                    <button className="btn btn-danger btn-sm" style={{ fontSize: 11 }} onClick={() => onCancelAppt(a.id)}>
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </>
      )}

      {/* PART REQUESTS TAB */}
      {tab === 'part-requests' && (
        <>
          {loading && ['a', 'b', 'c'].map(k => (
            <div key={k} className="skeleton" style={{ height: 80, borderRadius: 12, marginBottom: 8 }} />
          ))}
          {!loading && (partRequests.length === 0) && (
            <div className="card appointments-empty-card">
              <EmptyState icon={<MdBuild />} title="No part requests yet." action={{ label: 'Request a Part', onClick: () => setAddPartOpen(true) }} />
            </div>
          )}
          {!loading && partRequests.map(pr => (
            <div key={pr.id} className="card appointments-list-card">
              <div>
                <p style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>{pr.partName}</p>
                {pr.description && <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{pr.description}</p>}
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{formatDate(pr.createdAt)}</p>
              </div>
              <div>{getStatusBadge(pr.status)}</div>
            </div>
          ))}
        </>
      )}

      {/* Book Appointment Modal */}
      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Book Appointment" size="md"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setAddOpen(false)}>Cancel</button>
            <button className="btn btn-primary" disabled={apptForm.formState.isSubmitting} onClick={apptForm.handleSubmit(onAddAppt)}>
              {apptForm.formState.isSubmitting
                ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                : 'Book'}
            </button>
          </>
        }
      >
        <form noValidate>
          <div className="form-group">
            <label htmlFor="appt-date" className="form-label req">Date &amp; Time</label>
            <input id="appt-date" {...apptForm.register('appointmentDate', { required: true })} type="datetime-local" className="form-input" />
          </div>
          <div className="form-group">
            <label htmlFor="appt-svc" className="form-label req">Service Type</label>
            <select id="appt-svc" {...apptForm.register('serviceType', { required: true })} className="form-select">
              {SERVICE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="appt-notes" className="form-label">Notes</label>
            <textarea id="appt-notes" {...apptForm.register('notes')} className="form-textarea" placeholder="Any additional details…" />
          </div>
        </form>
      </Modal>

      {/* Request Part Modal */}
      <Modal isOpen={addPartOpen} onClose={() => setAddPartOpen(false)} title="Request a Part" size="sm"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setAddPartOpen(false)}>Cancel</button>
            <button className="btn btn-primary" disabled={partForm.formState.isSubmitting} onClick={partForm.handleSubmit(onAddPartReq)}>
              {partForm.formState.isSubmitting
                ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                : 'Submit'}
            </button>
          </>
        }
      >
        <form noValidate>
          <div className="form-group">
            <label htmlFor="pr-name" className="form-label req">Part Name</label>
            <input id="pr-name" {...partForm.register('partName', { required: true, maxLength: 120 })} className="form-input" placeholder="e.g. Brake Pad, Air Filter…" />
          </div>
          <div className="form-group">
            <label htmlFor="pr-desc" className="form-label">Description</label>
            <textarea id="pr-desc" {...partForm.register('description')} className="form-textarea" placeholder="Provide any details that may help us find the right part…" rows={3} />
          </div>
        </form>
      </Modal>
    </div>
  );
}
