import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

interface NavItem {
  to: string;
  label: string;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

const NAV: Record<string, NavGroup[]> = {
  Admin: [
    { group: 'Main', items: [{ to: '/admin/dashboard', label: 'Dashboard' }, { to: '/admin/parts', label: 'Parts' }, { to: '/admin/purchase', label: 'Purchase Orders' }, { to: '/admin/sales', label: 'Sales' }] },
    { group: 'Management', items: [{ to: '/admin/staff', label: 'Staff' }, { to: '/admin/vendors', label: 'Vendors' }, { to: '/admin/customers', label: 'Customers' }] },
    { group: 'Analytics', items: [{ to: '/admin/reports', label: 'Reports' }, { to: '/admin/reports/customers', label: 'Customer Reports' }, { to: '/admin/ai', label: 'AI Predictions' }] },
    { group: 'Operations', items: [{ to: '/admin/notifications', label: 'Notifications' }] },
  ],
  Staff: [
    { group: 'Main', items: [{ to: '/staff/dashboard', label: 'Dashboard' }, { to: '/staff/sales', label: 'New Sale' }, { to: '/staff/customers', label: 'Customer Search' }] },
    { group: 'Reports', items: [{ to: '/staff/reports', label: 'Reports' }] },
  ],
  Customer: [
    { group: 'My Account', items: [{ to: '/customer/home', label: 'Home' }, { to: '/customer/profile', label: 'My Profile' }, { to: '/customer/history', label: 'My History' }, { to: '/customer/appointments', label: 'Appointments' }, { to: '/customer/ai', label: 'Vehicle Health' }] },
  ],
};

export default function Sidebar() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const groups = user?.role ? (NAV[user.role] ?? NAV.Customer) : NAV.Customer;

  return (
    <>
      <button className="wm-hamburger" onClick={() => setOpen(true)} aria-label="Open menu">☰</button>
      {open && <div className="wm-sb-overlay" onClick={() => setOpen(false)} />}
      <aside className={`wm-sidebar${open ? ' wm-sidebar--open' : ''}`}>
        <div className="wm-sidebar__brand">
          <div className="wm-sidebar__logo">W</div>
          <div>
            <div className="wm-sidebar__name">Wrench Mob</div>
            <div className="wm-sidebar__sub">AUTOMOBILE</div>
          </div>
          <button className="wm-sidebar__close" onClick={() => setOpen(false)}>✕</button>
        </div>
        <nav className="wm-sidebar__nav">
          {groups.map(g => (
            <div key={g.group}>
              <div className="wm-sidebar__grp">{g.group}</div>
              {g.items.map(item => (
                <NavLink 
                  key={item.to} 
                  to={item.to} 
                  onClick={() => setOpen(false)} 
                  className={({ isActive }) => `wm-sidebar__item${isActive ? ' wm-sidebar__item--active' : ''}`}
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="wm-sidebar__foot">Enterprise Frontend</div>
      </aside>
    </>
  );
}
