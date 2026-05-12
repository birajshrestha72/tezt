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
import CustomersView from '../components/Customers';
import PurchaseOrdersView from '../components/PurchaseOrders';

// Staff Pages
import StaffDashboard from '../features/staff/StaffDashboard';
import StaffSales from '../features/staff/StaffSales';
import StaffCustomerSearch from '../features/staff/StaffCustomerSearch';
import StaffReports from '../features/staff/StaffReports';

// Customer Pages
import CustomerHome from '../features/customer/CustomerHome';
import CustomerProfile from '../features/customer/CustomerProfile';
import CustomerHistory from '../features/customer/CustomerHistory';
import CustomerAppointments from '../features/customer/CustomerAppointments';
import CustomerVehicleHealth from '../features/customer/CustomerVehicleHealth';

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
        <Route path="purchase" element={<PurchaseOrdersView />} />
        <Route path="customers" element={<CustomersView />} />
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
        <Route path="dashboard" element={<StaffDashboard />} />
        <Route path="sales" element={<StaffSales />} />
        <Route path="customers" element={<StaffCustomerSearch />} />
        <Route path="reports" element={<StaffReports />} />
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
        <Route path="home" element={<CustomerHome />} />
        <Route path="profile" element={<CustomerProfile />} />
        <Route path="history" element={<CustomerHistory />} />
        <Route path="appointments" element={<CustomerAppointments />} />
        <Route path="ai" element={<CustomerVehicleHealth />} />
      </Route>

      {/* Fallback */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
