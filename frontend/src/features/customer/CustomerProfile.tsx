import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { MdEmail, MdPhone, MdDirectionsCar, MdEdit, MdLock, MdCalendarMonth, MdSave, MdClose } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
import { customerService, type CustomerRecord, type CustomerProfileInput } from '../../services/api/customerService';
import { authService } from '../../services/api/authService';
import { Badge } from '../../components/ui';

interface PwForm { currentPassword: string; newPassword: string; confirmPassword: string; }

export default function CustomerProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<CustomerRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editVehicleMode, setEditVehicleMode] = useState(false);

  const profileForm = useForm<CustomerProfileInput>();
  const vehicleForm = useForm<CustomerProfileInput>();
  const pwForm = useForm<PwForm>();

  useEffect(() => {
    if (!user?.id) return;
    customerService.getCustomerById(user.id)
      .then(d => { setProfile(d); setLoading(false); })
      .catch(err => { console.error('[CustomerProfile] load error:', err); setLoading(false); });
  }, [user?.id]);

  const openEdit = () => {
    if (!profile) return;
    profileForm.reset({
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      phone: profile.phone ?? '',
    });
    setEditMode(true);
  };

  const openVehicleEdit = () => {
    if (!profile) return;
    vehicleForm.reset({
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      phone: profile.phone ?? '',
      vehicleNumber: profile.vehicleNumber ?? '',
      vehicleMake: profile.vehicleMake ?? '',
      vehicleModel: profile.vehicleModel ?? '',
      vehicleYear: profile.vehicleYear ?? undefined,
      vehicleType: profile.vehicleType ?? '',
    });
    setEditVehicleMode(true);
  };

  const onSaveProfile = async (d: CustomerProfileInput) => {
    if (!user?.id || !profile) return;
    try {
      const updated = await customerService.updateCustomer(user.id, {
        ...profile, firstName: d.firstName, lastName: d.lastName, email: d.email, phone: d.phone,
      });
      setProfile(updated);
      toast.success('Profile updated.');
      setEditMode(false);
    } catch (err) {
      console.error('[CustomerProfile] save profile error:', err);
    }
  };

  const onSaveVehicle = async (d: CustomerProfileInput) => {
    if (!user?.id || !profile) return;
    try {
      const updated = await customerService.updateCustomer(user.id, {
        ...profile,
        vehicleMake: d.vehicleMake,
        vehicleModel: d.vehicleModel,
        vehicleYear: d.vehicleYear,
        vehicleNumber: d.vehicleNumber,
        vehicleType: d.vehicleType,
      });
      setProfile(updated);
      toast.success('Vehicle updated.');
      setEditVehicleMode(false);
    } catch (err) {
      console.error('[CustomerProfile] save vehicle error:', err);
    }
  };

  const onPwChange = async (d: PwForm) => {
    if (d.newPassword !== d.confirmPassword) { toast.error('Passwords do not match.'); return; }
    try {
      await authService.changePassword({ currentPassword: d.currentPassword, newPassword: d.newPassword });
      toast.success('Password changed.');
      pwForm.reset();
    } catch (err) {
      console.error('[CustomerProfile] password change error:', err);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--xl)' }}>
        <span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
      </div>
    );
  }
  if (!profile) return null;

  const initials = ((profile.firstName?.at(0) ?? '') + (profile.lastName?.at(0) ?? '')).toUpperCase();

  return (
    <div className="profile-shell">
      {/* Left card */}
      <div className="profile-card">
        <div className="avatar av-xl" style={{ background: 'var(--red-dim)', color: 'var(--red-bright)', fontWeight: 700, fontSize: 24 }}>
          {initials}
        </div>
        <p className="profile-name">{profile.firstName} {profile.lastName}</p>
        <Badge variant="primary" style={{ marginBottom: 'var(--md)' }}>Customer</Badge>
        <div className="profile-info-row" style={{ justifyContent: 'center' }}>
          <MdCalendarMonth style={{ color: 'var(--text-muted)' }} />
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Member</span>
        </div>
        <button className="btn btn-secondary btn-sm btn-fw" style={{ marginTop: 'var(--lg)' }} onClick={openEdit}>
          <MdEdit /> Edit Profile
        </button>
      </div>

      {/* Right column */}
      <div>
        {/* Contact info / inline edit */}
        <div className="card" style={{ padding: 'var(--lg)', marginBottom: 'var(--md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--md)' }}>
            <p style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Contact Information</p>
            {!editMode && (
              <button className="btn btn-ghost btn-sm" onClick={openEdit}><MdEdit /> Edit</button>
            )}
          </div>

          {editMode ? (
            <form noValidate>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="pf-fn" className="form-label">First Name</label>
                  <input id="pf-fn" {...profileForm.register('firstName')} className="form-input" />
                </div>
                <div className="form-group">
                  <label htmlFor="pf-ln" className="form-label">Last Name</label>
                  <input id="pf-ln" {...profileForm.register('lastName')} className="form-input" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="pf-em" className="form-label">Email</label>
                  <input id="pf-em" {...profileForm.register('email')} type="email" className="form-input" />
                </div>
                <div className="form-group">
                  <label htmlFor="pf-ph" className="form-label">Phone</label>
                  <input id="pf-ph" {...profileForm.register('phone')} className="form-input" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 'var(--sm)', marginTop: 'var(--sm)' }}>
                <button type="button" className="btn btn-primary btn-sm" disabled={profileForm.formState.isSubmitting} onClick={profileForm.handleSubmit(onSaveProfile)}>
                  <MdSave /> Save
                </button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditMode(false)}>
                  <MdClose /> Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              {[
                { icon: <MdEmail />, label: 'Email', val: profile.email },
                { icon: <MdPhone />, label: 'Phone', val: profile.phone || '—' },
              ].map(row => (
                <div key={row.label} className="profile-info-row">
                  {row.icon}
                  <span style={{ color: 'var(--text-muted)', fontSize: 12, minWidth: 60 }}>{row.label}</span>
                  <span>{row.val}</span>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Vehicle info / inline edit */}
        <div className="card" style={{ padding: 'var(--lg)', marginBottom: 'var(--md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--md)' }}>
            <p style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Vehicle Information</p>
            {!editVehicleMode && (
              <button className="btn btn-ghost btn-sm" onClick={openVehicleEdit}><MdEdit /> Edit</button>
            )}
          </div>

          {editVehicleMode ? (
            <form noValidate>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="vf-mk" className="form-label">Make</label>
                  <input id="vf-mk" {...vehicleForm.register('vehicleMake')} className="form-input" />
                </div>
                <div className="form-group">
                  <label htmlFor="vf-mo" className="form-label">Model</label>
                  <input id="vf-mo" {...vehicleForm.register('vehicleModel')} className="form-input" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="vf-yr" className="form-label">Year</label>
                  <input id="vf-yr" {...vehicleForm.register('vehicleYear', { valueAsNumber: true })} type="number" className="form-input" />
                </div>
                <div className="form-group">
                  <label htmlFor="vf-pl" className="form-label">Plate Number</label>
                  <input id="vf-pl" {...vehicleForm.register('vehicleNumber')} className="form-input" />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="vf-tp" className="form-label">Vehicle Type</label>
                <input id="vf-tp" {...vehicleForm.register('vehicleType')} className="form-input" placeholder="Sedan, SUV…" />
              </div>
              <div style={{ display: 'flex', gap: 'var(--sm)', marginTop: 'var(--sm)' }}>
                <button type="button" className="btn btn-primary btn-sm" disabled={vehicleForm.formState.isSubmitting} onClick={vehicleForm.handleSubmit(onSaveVehicle)}>
                  <MdSave /> Save
                </button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditVehicleMode(false)}>
                  <MdClose /> Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              {[
                { label: 'Make',  val: profile.vehicleMake  || '—' },
                { label: 'Model', val: profile.vehicleModel || '—' },
                { label: 'Year',  val: profile.vehicleYear  ? String(profile.vehicleYear) : '—' },
                { label: 'Plate', val: profile.vehicleNumber || '—' },
                { label: 'Type',  val: profile.vehicleType  || '—' },
              ].map(row => (
                <div key={row.label} className="profile-info-row">
                  <MdDirectionsCar style={{ opacity: row.label === 'Make' ? 1 : 0 }} />
                  <span style={{ color: 'var(--text-muted)', fontSize: 12, minWidth: 60 }}>{row.label}</span>
                  <span>{row.val}</span>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Password section */}
        <div className="card" style={{ padding: 'var(--lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sm)', marginBottom: 'var(--md)' }}>
            <MdLock style={{ color: 'var(--text-muted)' }} />
            <p style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Change Password</p>
          </div>
          <form noValidate>
            <div className="form-group">
              <label htmlFor="pw-cur" className="form-label req">Current Password</label>
              <input id="pw-cur" {...pwForm.register('currentPassword', { required: true })} type="password" className="form-input" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="pw-new" className="form-label req">New Password</label>
                <input id="pw-new" {...pwForm.register('newPassword', { required: true, minLength: 6 })} type="password" className="form-input" />
              </div>
              <div className="form-group">
                <label htmlFor="pw-con" className="form-label req">Confirm Password</label>
                <input id="pw-con" {...pwForm.register('confirmPassword', { required: true })} type="password" className="form-input" />
              </div>
            </div>
            <button type="button" className="btn btn-primary btn-sm" disabled={pwForm.formState.isSubmitting} onClick={pwForm.handleSubmit(onPwChange)}>
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
