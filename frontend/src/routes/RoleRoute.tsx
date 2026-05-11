import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../shared/types/auth.types';

interface RoleRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export default function RoleRoute({ children, allowedRoles }: RoleRouteProps) {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    // Redirect to their respective dashboards if they have a role but not allowed here
    if (user?.role === 'Admin') return <Navigate to="/admin/dashboard" replace />;
    if (user?.role === 'Staff') return <Navigate to="/staff/dashboard" replace />;
    if (user?.role === 'Customer') return <Navigate to="/customer/home" replace />;
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
