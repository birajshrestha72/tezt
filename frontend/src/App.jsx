import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/common/Layout';
import LoginPage from './pages/auth/LoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import StaffManagement from './pages/admin/StaffManagement';
import VendorManagement from './pages/admin/VendorManagement';
import PartsManagement from './pages/admin/PartsManagement';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" />;
  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route path="/admin/dashboard" element={
            <ProtectedRoute><AdminDashboard /></ProtectedRoute>
          } />
          
          <Route path="/admin/staff" element={
            <ProtectedRoute><StaffManagement /></ProtectedRoute>
          } />
          
          <Route path="/admin/vendors" element={
            <ProtectedRoute><VendorManagement /></ProtectedRoute>
          } />

          <Route path="/admin/parts" element={
            <ProtectedRoute><PartsManagement /></ProtectedRoute>
          } />

          <Route path="/" element={<Navigate to="/admin/dashboard" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
