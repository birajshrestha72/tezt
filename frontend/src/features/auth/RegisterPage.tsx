import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { authService, setAuthSession } from '../../services/api/authService';

interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  vehicleNumber?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: number;
  vehicleType?: string;
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<RegisterFormData>();

  const onSubmit = async (data: RegisterFormData) => {
    setServerError('');
    try {
      const res = await authService.register(data as Record<string, unknown>);
      setAuthSession(res);
      toast.success('Account created successfully. Welcome!');
      navigate('/customer/home', { replace: true });
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setServerError(e?.response?.data?.message ?? 'Registration failed. Email may already be in use.');
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-brand">
        <div className="auth-brand__glow" />
        <div className="auth-brand__logo">
          <div className="auth-brand__W">W</div>
          <div>
            <p className="auth-brand__name">WRENCH MOB</p>
            <p className="auth-brand__tagline">INDUSTRIAL PRECISION</p>
          </div>
        </div>

        <ul className="auth-brand__bullets" style={{ listStyle: 'none', padding: 0 }}>
          {([
            ['Vehicle Profile', 'Track your vehicle across all service visits'],
            ['Appointment Booking', 'Schedule service bays at your convenience'],
            ['Order History', 'Full visibility into parts ordered for your vehicle'],
          ] as const).map(([title, desc]) => (
            <li key={title} className="auth-brand__bullet">
              <span className="auth-brand__bullet-dot" />
              <div>
                <p className="auth-brand__bullet-title">{title}</p>
                <p className="auth-brand__bullet-desc">{desc}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="auth-brand__demo" />
      </div>

      <div className="auth-main">
        <div className="auth-card wide">
          <h2 className="auth-title">Customer Registration</h2>
          <p className="auth-subtitle">Create your account to track vehicles and service history.</p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <p className="form-section">PERSONAL DETAILS</p>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="reg-firstName" className="form-label req">First Name</label>
                <input id="reg-firstName" {...register('firstName', { required: true })} className="form-input" placeholder="John" />
              </div>
              <div className="form-group">
                <label htmlFor="reg-lastName" className="form-label req">Last Name</label>
                <input id="reg-lastName" {...register('lastName', { required: true })} className="form-input" placeholder="Doe" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="reg-email" className="form-label req">Email</label>
                <input id="reg-email" {...register('email', { required: true })} type="email" className="form-input" placeholder="you@example.com" autoComplete="email" />
              </div>
              <div className="form-group">
                <label htmlFor="reg-phone" className="form-label">Phone</label>
                <input id="reg-phone" {...register('phone')} className="form-input" placeholder="+977 98XXXXXXXX" />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="reg-password" className="form-label req">Password</label>
              <div className="input-wrap">
                <input
                  id="reg-password"
                  {...register('password', { required: true, minLength: 6 })}
                  type={showPwd ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Min. 6 characters"
                  autoComplete="new-password"
                  style={{ paddingLeft: 'var(--md)' }}
                />
                <button
                  type="button"
                  className="input-icon input-icon-right"
                  onClick={() => setShowPwd(p => !p)}
                  aria-label={showPwd ? 'Hide password' : 'Show password'}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 18, cursor: 'pointer' }}
                >
                  {showPwd ? <MdVisibilityOff /> : <MdVisibility />}
                </button>
              </div>
            </div>

            <p className="form-section">VEHICLE INFORMATION</p>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="reg-vnum" className="form-label">Plate Number</label>
                <input id="reg-vnum" {...register('vehicleNumber')} className="form-input" placeholder="BA 1 PA 1234" />
              </div>
              <div className="form-group">
                <label htmlFor="reg-vmake" className="form-label">Vehicle Make</label>
                <input id="reg-vmake" {...register('vehicleMake')} className="form-input" placeholder="Toyota" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="reg-vmodel" className="form-label">Vehicle Model</label>
                <input id="reg-vmodel" {...register('vehicleModel')} className="form-input" placeholder="Corolla" />
              </div>
              <div className="form-group">
                <label htmlFor="reg-vyear" className="form-label">Year</label>
                <input id="reg-vyear" {...register('vehicleYear', { valueAsNumber: true, min: 1990, max: 2030 })} type="number" className="form-input" placeholder="2022" />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="reg-vtype" className="form-label">Vehicle Type</label>
              <input id="reg-vtype" {...register('vehicleType')} className="form-input" placeholder="Sedan, SUV, Hatchback…" />
            </div>

            {serverError && <div className="auth-error">{serverError}</div>}

            <button type="submit" className="btn btn-primary btn-lg btn-fw" disabled={isSubmitting}>
              {isSubmitting ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : 'Create Account'}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
