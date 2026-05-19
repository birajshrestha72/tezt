import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/navigation/Sidebar';
import Navbar from '../components/navigation/Navbar';

const TITLES: Record<string, string> = {
  '/admin/dashboard':          'Admin Dashboard',
  '/admin/parts':              'Parts Management',
  '/admin/purchase':           'Purchase Orders',
  '/admin/sales':              'Orders & Sales',
  '/admin/staff':              'Staff Management',
  '/admin/vendors':            'Vendor Management',
  '/admin/customers':          'Customer Directory',
  '/admin/reports':            'Financial Reports',
  '/admin/reports/customers':  'Customer Reports',
  '/admin/notifications':      'Notifications',
  '/admin/ai':                 'AI Intelligence',
};

export default function AdminLayout() {
  const { pathname } = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="page-area">
        <Navbar
          pageTitle={TITLES[pathname] ?? 'Wrench Mob Admin'}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <div className="page-inner">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
