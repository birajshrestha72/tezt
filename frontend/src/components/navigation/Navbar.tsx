import React from 'react';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

interface NavbarProps {
  title?: string;
}

export default function Navbar({ title = 'Dashboard' }: NavbarProps) {
  const { user, logout } = useAuth();
  const initials = user?.name?.slice(0, 2).toUpperCase() ?? 'U';

  return (
    <header className="wm-navbar">
      <span className="wm-navbar__title">{title}</span>
      <div className="wm-navbar__right">
        <div className="wm-navbar__user">
          <div className="wm-navbar__avatar">{initials}</div>
          <div className="wm-navbar__info">
            <div className="wm-navbar__name">{user?.name || 'User'}</div>
            <div className="wm-navbar__role">{user?.role}</div>
          </div>
        </div>
        <button className="wm-navbar__logout" onClick={logout}>Sign Out</button>
      </div>
    </header>
  );
}
