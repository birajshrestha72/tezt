import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LoginDto } from '../../shared/types/auth.types';
import './LoginPage.css';

const DEMO: Record<string, any> = {
  Admin: { email: 'admin@vehicleparts.com', password: 'Admin@2025' },
  Staff: { email: 'staff1@vehicleparts.com', password: 'Staff@2025' },
  Customer: { email: 'cust1@vehicleparts.com', password: 'Cust@2025!' }
};

export default function LoginPage() {
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<LoginDto>();
  const [serverErr, setServerErr] = useState('');
  const [showPw, setShowPw] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const fillDemo = (role: string) => {
    setValue('email', DEMO[role].email);
    setValue('password', DEMO[role].password);
  };

  const onSubmit = async (data: LoginDto) => {
    setServerErr('');
    try {
      await login(data);
      // AuthContext handles state, now we navigate based on the role
      // We can get the user from storage or wait for state update, 
      // but since login resolved, we can just check what role we expect or re-read
      const user = JSON.parse(localStorage.getItem('wm_user') || '{}');
      if (user.role === 'Admin') navigate('/admin/dashboard');
      else if (user.role === 'Staff') navigate('/staff/dashboard');
      else navigate('/customer/home');
    } catch (err: any) {
      setServerErr(err.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="lp">
      <div className="lp__left">
        <div className="lp__brand">
          <div className="lp__logo">W</div>
          <div>
            <div className="lp__brand-name">Wrench Mob</div>
            <div className="lp__brand-sub">AUTOMOBILE</div>
          </div>
        </div>
        <p className="lp__tagline">Your Vehicle. Our Expertise.</p>
        <ul className="lp__features">
          {['Complete Parts Inventory Management', 'Staff & Vendor Administration', 'Customer Portal & Appointments', 'Enterprise Cloud Ready'].map(f => (
            <li key={f}><span className="lp__dot">●</span>{f}</li>
          ))}
        </ul>
        <div className="lp__demo-block">
          <p className="lp__demo-label">Quick login as:</p>
          <div className="lp__demo-row">
            {['Admin', 'Staff', 'Customer'].map(r => (
              <button key={r} type="button" className="lp__demo-btn" onClick={() => fillDemo(r)}>{r}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="lp__right">
        <div className="lp__card">
          <h2 className="lp__title">Sign In</h2>
          <p className="lp__desc">Vehicle Parts Management System</p>

          {serverErr && <div className="alert-banner danger" style={{ marginBottom: 16 }}>{serverErr}</div>}

          <form onSubmit={handleSubmit(onSubmit)} className="lp__form" noValidate>
            <div className="form-field">
              <label className="field-label req">Email Address</label>
              <input 
                className={`field-input${errors.email ? ' err' : ''}`} 
                type="email" 
                placeholder="Enter your email"
                {...register('email', { 
                  required: 'Email is required', 
                  pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email address' } 
                })} 
              />
              {errors.email && <span className="field-error">{errors.email.message as string}</span>}
            </div>

            <div className="form-field" style={{ marginTop: 12 }}>
              <label className="field-label req">Password</label>
              <div className="lp__pw-row">
                <input 
                  className={`field-input${errors.password ? ' err' : ''}`} 
                  type={showPw ? 'text' : 'password'} 
                  placeholder="Enter your password"
                  {...register('password', { 
                    required: 'Password is required', 
                    minLength: { value: 6, message: 'Minimum 6 characters' } 
                  })} 
                />
                <button 
                  type="button" 
                  className="lp__pw-eye" 
                  onClick={() => setShowPw(v => !v)} 
                  aria-label="Toggle password"
                >
                  {showPw ? '🙈' : '👁'}
                </button>
              </div>
              {errors.password && <span className="field-error">{errors.password.message as string}</span>}
            </div>

            <button 
              type="submit" 
              className="wm-btn wm-btn--primary wm-btn--lg wm-btn--fw" 
              style={{ marginTop: 20 }} 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="lp__creds">
            <div className="lp__creds-title">Demo Credentials</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, color: 'var(--text-secondary)' }}>
              <tbody>
                <tr><td style={{ fontWeight: 600, paddingRight: 8, paddingBottom: 2, color: 'var(--text-primary)', width: 72 }}>Admin:</td><td>admin@vehicleparts.com / Admin@2025</td></tr>
                <tr><td style={{ fontWeight: 600, paddingRight: 8, paddingBottom: 2, color: 'var(--text-primary)' }}>Staff:</td><td>staff1@vehicleparts.com / Staff@2025</td></tr>
                <tr><td style={{ fontWeight: 600, paddingRight: 8, color: 'var(--text-primary)' }}>Customer:</td><td>cust1@vehicleparts.com / Cust@2025!</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
