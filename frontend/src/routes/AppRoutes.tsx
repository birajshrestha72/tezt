import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';

// Layouts
import AdminLayout from '../layouts/AdminLayout';
import StaffLayout from '../layouts/StaffLayout';
import CustomerLayout from '../layouts/CustomerLayout';
import AuthLayout from '../layouts/AuthLayout';

// Features
import LoginPage from '../features/auth/LoginPage';
import AdminDashboard from '../features/admin/dashboard/AdminDashboard';
import StaffManagement from '../features/admin/staff/StaffManagement';
import VendorManagement from '../features/admin/vendors/VendorManagement';
import InventoryView from '../components/Inventory';
import FinancialsView from '../components/Financials';
import CustomerReportsView from '../components/CustomerReports';
import NotificationsView from '../components/Notifications';
import AIAlertsView from '../components/AIAlerts';
import OrdersView from '../components/Orders';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* Admin Routes */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['Admin']}>
              <AdminLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="staff" element={<StaffManagement />} />
        <Route path="vendors" element={<VendorManagement />} />
        <Route path="parts" element={<InventoryView />} />
        <Route path="sales" element={<OrdersView />} />
        <Route path="purchase" element={<div>Purchase Orders Placeholder</div>} />
        <Route path="customers" element={<div>Customer Directory Placeholder</div>} />
        <Route path="reports" element={<FinancialsView />} />
        <Route path="reports/customers" element={<CustomerReportsView />} />
        <Route path="notifications" element={<NotificationsView />} />
        <Route path="ai" element={<AIAlertsView />} />
      </Route>

      {/* Staff Routes */}
      <Route 
        path="/staff" 
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['Staff', 'Admin']}>
              <StaffLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<div>Staff Dashboard Placeholder</div>} />
        <Route path="sales" element={<div>New Sale Placeholder</div>} />
        <Route path="customers" element={<div>Customer Search Placeholder</div>} />
        <Route path="reports" element={<div>Staff Reports Placeholder</div>} />
      </Route>

      {/* Customer Routes */}
      <Route 
        path="/customer" 
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['Customer', 'Admin']}>
              <CustomerLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route path="home" element={<div>Customer Home Placeholder</div>} />
        <Route path="profile" element={<div>My Profile Placeholder</div>} />
        <Route path="history" element={<div>Order History Placeholder</div>} />
        <Route path="appointments" element={<div>Appointments Placeholder</div>} />
        <Route path="ai" element={<div>Vehicle Health Placeholder</div>} />
      </Route>

      {/* Fallback */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
