import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  MdDashboard, MdInventory2, MdShoppingCart, MdReceipt,
  MdGroup, MdLocalShipping, MdPersonSearch, MdBarChart,
  MdTrendingUp, MdAutoFixHigh, MdNotifications,
  MdAddShoppingCart, MdSearch, MdAssessment,
  MdHome, MdAccountCircle, MdHistory, MdCalendarMonth, MdElectricBolt,
  MdLogout,
} from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
import { notificationService } from '../../services/api/notificationService';

interface SidebarProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

function getInitials(name?: string) {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  return parts.length >= 2
    ? (parts[0][0] + (parts.at(-1)?.[0] ?? '')).toUpperCase()
    : name.slice(0, 2).toUpperCase();
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user?.role !== 'Admin') return;
    let cancelled = false;

    const poll = async () => {
      try {
        const res = await notificationService.getUnreadCount();
        if (!cancelled) setUnreadCount(res.unreadCount);
      } catch {
        // silently ignore
      }
    };

    poll();
    const interval = setInterval(poll, 60_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [user?.role]);

  const groups = buildNav(user?.role, unreadCount);
  const initials = getInitials(user?.name);

  return (
    <>
      <button
        className={`sidebar-overlay${isOpen ? ' visible' : ''}`}
        onClick={onClose}
        aria-label="Close sidebar"
        style={{ all: 'unset', position: 'fixed', inset: 0, zIndex: 39, display: isOpen ? 'block' : 'none', background: 'rgba(0,21,35,0.85)', cursor: 'default' }}
      />
      <aside className={`sidebar${isOpen ? ' open' : ''}`}>
        <div className="sidebar__brand">
          <div className="sidebar__logo">W</div>
          <div>
            <div className="sidebar__name">WRENCH MOB</div>
            <div className="sidebar__sub">AUTOMOBILE PARTS &amp; SERVICE</div>
          </div>
        </div>

        <nav className="sidebar__nav">
          {groups.map(g => (
            <div key={g.group}>
              <div className="sidebar__group-label">{g.group}</div>
              {g.items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    isActive ? 'sidebar__item active' : 'sidebar__item'
                  }
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge != null && item.badge > 0 && (
                    <span className="sidebar__badge">{item.badge}</span>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar__foot">
          <div className="sidebar__foot-avatar">{initials}</div>
          <div>
            <div className="sidebar__foot-name">{user?.name ?? 'User'}</div>
            <div className="sidebar__foot-role">{user?.role}</div>
          </div>
          <button className="sidebar__foot-logout" onClick={logout} title="Sign Out">
            <MdLogout />
            Out
          </button>
        </div>
      </aside>
    </>
  );
}

function buildNav(role: string | undefined, unreadCount: number): NavGroup[] {
  if (role === 'Admin') {
    return [
      {
        group: 'MAIN',
        items: [
          { to: '/admin/dashboard', label: 'Dashboard', icon: <MdDashboard /> },
          { to: '/admin/parts',     label: 'Parts',     icon: <MdInventory2 /> },
          { to: '/admin/purchase',  label: 'Purchase Orders', icon: <MdShoppingCart /> },
          { to: '/admin/sales',     label: 'Orders',    icon: <MdReceipt /> },
        ],
      },
      {
        group: 'MANAGEMENT',
        items: [
          { to: '/admin/staff',     label: 'Staff',     icon: <MdGroup /> },
          { to: '/admin/vendors',   label: 'Vendors',   icon: <MdLocalShipping /> },
          { to: '/admin/customers', label: 'Customers', icon: <MdPersonSearch /> },
        ],
      },
      {
        group: 'ANALYTICS',
        items: [
          { to: '/admin/reports',           label: 'Financial Reports',  icon: <MdBarChart /> },
          { to: '/admin/reports/customers', label: 'Customer Reports',   icon: <MdTrendingUp /> },
          { to: '/admin/ai',                label: 'AI Intelligence',    icon: <MdAutoFixHigh /> },
        ],
      },
      {
        group: 'OPERATIONS',
        items: [
          { to: '/admin/notifications', label: 'Notifications', icon: <MdNotifications />, badge: unreadCount },
        ],
      },
    ];
  }

  if (role === 'Staff') {
    return [
      {
        group: 'MAIN',
        items: [
          { to: '/staff/dashboard', label: 'Dashboard',       icon: <MdDashboard /> },
          { to: '/staff/sales',     label: 'New Sale',        icon: <MdAddShoppingCart /> },
          { to: '/staff/customers', label: 'Customers',       icon: <MdSearch /> },
        ],
      },
      {
        group: 'REPORTS',
        items: [
          { to: '/staff/reports', label: 'Staff Reports', icon: <MdAssessment /> },
        ],
      },
    ];
  }

  return [
    {
      group: 'MY ACCOUNT',
      items: [
        { to: '/customer/home',         label: 'Home',          icon: <MdHome /> },
        { to: '/customer/profile',      label: 'My Profile',    icon: <MdAccountCircle /> },
        { to: '/customer/history',      label: 'Order History', icon: <MdHistory /> },
        { to: '/customer/appointments', label: 'Appointments',  icon: <MdCalendarMonth /> },
        { to: '/customer/ai',           label: 'Vehicle Health',icon: <MdElectricBolt /> },
      ],
    },
  ];
}
