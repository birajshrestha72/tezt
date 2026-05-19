import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';

interface LoginFormData {
  email: string;
  password: string;
}

const DEMO_CREDS = {
  admin:    { email: 'admin@vehicleparts.com',  password: 'Admin@2025' },
  staff:    { email: 'staff1@vehicleparts.com', password: 'Staff@2025' },
  customer: { email: 'cust1@vehicleparts.com',  password: 'Cust@2025!' },
} as const;

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const { register, handleSubmit, setValue, formState: { isSubmitting } } = useForm<LoginFormData>();

  const fillDemo = (role: keyof typeof DEMO_CREDS) => {
    setValue('email', DEMO_CREDS[role].email);
    setValue('password', DEMO_CREDS[role].password);
  };

  const onSubmit = async (data: LoginFormData) => {
    setServerError('');
    try {
      const user = await login(data);
      const isAdmin = user.role === 'Admin';
      const isCustomer = user.role === 'Customer';
      const isStaffLike = !isAdmin && !isCustomer;

      if (isAdmin) navigate('/admin/dashboard', { replace: true });
      else if (isStaffLike) navigate('/staff/dashboard', { replace: true });
      else navigate('/customer/home', { replace: true });
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setServerError(e?.response?.data?.message ?? 'Login failed. Please check your credentials.');
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
            ['High-Precision Inventory', 'Real-time tracking across all SKUs'],
            ['Service Bay Integration', 'Connect warehouse parts to service tickets'],
            ['Industrial Resilience', 'Built for the modern professional workshop'],
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

        <div className="auth-brand__demo">
          <p className="auth-brand__demo-label">Quick Access (Dev Mode)</p>
          <div className="auth-brand__demo-btns">
            {(['admin', 'staff', 'customer'] as const).map(role => (
              <button
                key={role}
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => fillDemo(role)}
              >
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="auth-main">
        <div className="auth-card">
          <h2 className="auth-title">Welcome back</h2>
          <p className="auth-subtitle">Access your inventory and service dashboard.</p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="form-group">
              <label htmlFor="login-email" className="form-label req">Email Address</label>
              <div className="input-wrap">
                <MdEmail className="input-icon" />
                <input
                  id="login-email"
                  {...register('email', { required: true })}
                  type="email"
                  className="form-input"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="login-password" className="form-label req">Password</label>
              <div className="input-wrap">
                <MdLock className="input-icon" />
                <input
                  id="login-password"
                  {...register('password', { required: true })}
                  type={showPwd ? 'text' : 'password'}
                  className="form-input"
                  placeholder="••••••••"
                  autoComplete="current-password"
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

            {serverError && <div className="auth-error">{serverError}</div>}

            <button type="submit" className="btn btn-primary btn-lg btn-fw" disabled={isSubmitting}>
              {isSubmitting ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : 'Sign In'}
            </button>
          </form>

          <p className="auth-footer">
            New customer? <Link to="/register">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
