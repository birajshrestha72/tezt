import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/navigation/Sidebar';
import Navbar from '../components/navigation/Navbar';
import '../styles/Layout.css';

const TITLES: Record<string, string> = {
  '/staff/dashboard': 'Staff Dashboard',
  '/staff/sales': 'Create New Sale',
  '/staff/customers': 'Customer Search',
  '/staff/reports': 'Service Reports'
};

export default function StaffLayout() {
  const { pathname } = useLocation();
  
  return (
    <div className="wm-layout">
      <Sidebar />
      <div className="wm-layout__body">
        <Navbar title={TITLES[pathname] ?? 'Wrench Mob Staff'} />
        <main className="wm-layout__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
