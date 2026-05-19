import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdMenu, MdNotifications, MdLogout, MdPerson } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
import { notificationService } from '../../services/api/notificationService';

interface NavbarProps {
  readonly pageTitle?: string;
  readonly onMenuClick: () => void;
}

function getInitials(name?: string) {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  return parts.length >= 2
    ? (parts[0][0] + (parts.at(-1)?.[0] ?? '')).toUpperCase()
    : name.slice(0, 2).toUpperCase();
}

export default function Navbar({ pageTitle = 'Dashboard', onMenuClick }: NavbarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  const initials = getInitials(user?.name);
  const isAdmin = user?.role === 'Admin';

  useEffect(() => {
    if (!isAdmin) return;
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
    return () => { cancelled = true; clearInterval(interval); };
  }, [isAdmin]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSignOut = () => {
    setDropdownOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="navbar__left">
        <button className="navbar__hamburger" onClick={onMenuClick} aria-label="Open menu">
          <MdMenu />
        </button>
        <span className="navbar__title">{pageTitle}</span>
      </div>

      <div className="navbar__right">
        {isAdmin && (
          <button
            className="navbar__bell"
            onClick={() => navigate('/admin/notifications')}
            aria-label="Notifications"
          >
            <MdNotifications />
            {unreadCount > 0 && <span className="navbar__bell-dot" />}
          </button>
        )}

        <div className="navbar__divider" />

        <div className="navbar__user-info">
          <span className="navbar__user-name">{user?.name ?? 'User'}</span>
          <span className="navbar__user-role">{user?.role}</span>
        </div>

        <div className="navbar__avatar-wrap" ref={dropRef}>
          <button
            className="navbar__avatar"
            onClick={() => setDropdownOpen(v => !v)}
            aria-label="Account menu"
            aria-expanded={dropdownOpen}
          >
            {initials}
          </button>

          {dropdownOpen && (
            <div className="navbar__dropdown">
              <div className="navbar__dropdown-item">
                <MdPerson />
                {user?.name ?? 'User'}
              </div>
              <button className="navbar__dropdown-item danger" onClick={handleSignOut}>
                <MdLogout />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
