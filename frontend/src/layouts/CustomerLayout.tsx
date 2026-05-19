import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/navigation/Sidebar';
import Navbar from '../components/navigation/Navbar';

const TITLES: Record<string, string> = {
  '/customer/home':         'Customer Home',
  '/customer/profile':      'My Profile',
  '/customer/history':      'Order History',
  '/customer/appointments': 'My Appointments',
  '/customer/ai':           'Vehicle Health',
};

export default function CustomerLayout() {
  const { pathname } = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="page-area">
        <Navbar
          pageTitle={TITLES[pathname] ?? 'Wrench Mob Portal'}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <div className="page-inner">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
