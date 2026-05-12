import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/navigation/Sidebar';
import Navbar from '../components/navigation/Navbar';
import '../styles/Layout.css';

const TITLES: Record<string, string> = {
  '/admin/dashboard': 'Admin Dashboard',
  '/admin/parts': 'Parts Management',
  '/admin/purchase': 'Purchase Orders',
  '/admin/sales': 'Sales Overview',
  '/admin/staff': 'Staff Management',
  '/admin/vendors': 'Vendor Management',
  '/admin/customers': 'Customer Directory',
  '/admin/reports': 'Financial Reports',
  '/admin/reports/customers': 'Customer Reports',
  '/admin/notifications': 'Notifications',
  '/admin/ai': 'AI Predictions'
};

export default function AdminLayout() {
  const { pathname } = useLocation();
  
  return (
    <div className="wm-layout">
      <Sidebar />
      <div className="wm-layout__body">
        <Navbar title={TITLES[pathname] ?? 'Wrench Mob Admin'} />
        <main className="wm-layout__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
