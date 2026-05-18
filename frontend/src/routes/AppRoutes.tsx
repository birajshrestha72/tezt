import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';

// Layouts
import AdminLayout from '../layouts/AdminLayout';
import StaffLayout from '../layouts/StaffLayout';
import CustomerLayout from '../layouts/CustomerLayout';
import AuthLayout from '../layouts/AuthLayout';

// Auth
import LoginPage from '../features/auth/LoginPage';
import RegisterPage from '../features/auth/RegisterPage';

// Admin
import AdminDashboard from '../features/admin/dashboard/AdminDashboard';
import StaffManagement from '../features/admin/staff/StaffManagement';
import VendorManagement from '../features/admin/vendors/VendorManagement';
import PurchaseOrders from '../features/admin/vendors/PurchaseOrders';
import PartsManagement from '../pages/PartsManagement';
import OrdersManagement from '../features/admin/orders/OrdersManagement';
import CustomerDirectory from '../features/admin/customers/CustomerDirectory';
import FinancialReports from '../features/admin/reports/FinancialReports';
import CustomerReports from '../features/admin/reports/CustomerReports';
import NotificationsPage from '../features/admin/notifications/NotificationsPage';
import AIAlertsPage from '../features/admin/ai/AIAlertsPage';

// Staff
import StaffDashboard from '../features/staff/StaffDashboard';
import StaffSales from '../features/staff/StaffSales';
import StaffCustomerSearch from '../features/staff/StaffCustomerSearch';
import StaffReports from '../features/staff/StaffReports';

// Customer
import CustomerHome from '../features/customer/CustomerHome';
import CustomerProfile from '../features/customer/CustomerProfile';
import CustomerHistory from '../features/customer/CustomerHistory';
import CustomerAppointments from '../features/customer/CustomerAppointments';
import CustomerVehicleHealth from '../features/customer/CustomerVehicleHealth';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Admin */}
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
        <Route path="dashboard"          element={<AdminDashboard />} />
        <Route path="staff"              element={<StaffManagement />} />
        <Route path="vendors"            element={<VendorManagement />} />
        <Route path="parts"              element={<PartsManagement />} />
        <Route path="sales"              element={<OrdersManagement />} />
        <Route path="purchase"           element={<PurchaseOrders />} />
        <Route path="customers"          element={<CustomerDirectory />} />
        <Route path="reports"            element={<FinancialReports />} />
        <Route path="reports/customers"  element={<CustomerReports />} />
        <Route path="notifications"      element={<NotificationsPage />} />
        <Route path="ai"                 element={<AIAlertsPage />} />
      </Route>

      {/* Staff */}
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
        <Route path="dashboard"  element={<StaffDashboard />} />
        <Route path="sales"      element={<StaffSales />} />
        <Route path="customers"  element={<StaffCustomerSearch />} />
        <Route path="reports"    element={<StaffReports />} />
      </Route>

      {/* Customer */}
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
        <Route path="home"         element={<CustomerHome />} />
        <Route path="profile"      element={<CustomerProfile />} />
        <Route path="history"      element={<CustomerHistory />} />
        <Route path="appointments" element={<CustomerAppointments />} />
        <Route path="ai"           element={<CustomerVehicleHealth />} />
      </Route>

      {/* Fallback */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
