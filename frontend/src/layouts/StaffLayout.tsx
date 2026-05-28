import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/navigation/Sidebar';
import Navbar from '../components/navigation/Navbar';

const TITLES: Record<string, string> = {
  '/staff/dashboard': 'Staff Dashboard',
  '/staff/sales':     'Create New Sale',
  '/staff/purchase':  'Purchase Orders',
  '/staff/customers': 'Customer Search',
  '/staff/reports':   'Staff Reports',
};

export default function StaffLayout() {
  const { pathname } = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="page-area">
        <Navbar
          pageTitle={TITLES[pathname] ?? 'Wrench Mob Staff'}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <div className="page-inner">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
