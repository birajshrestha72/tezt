import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../shared/types/auth.types';

interface RoleRouteProps {
  readonly children: React.ReactNode;
  readonly allowedRoles: UserRole[];
}

export default function RoleRoute({ children, allowedRoles }: RoleRouteProps) {
  const { user } = useAuth();
  const role = user?.role;
  const isAdmin = role === 'Admin';
  const isCustomer = role === 'Customer';
  const isStaffLike = !!role && !isAdmin && !isCustomer;

  const hasAccess = !!user && (
    allowedRoles.includes(role as UserRole)
    || (allowedRoles.includes('Staff') && isStaffLike)
  );

  if (!hasAccess) {
    if (isAdmin) return <Navigate to="/admin/dashboard" replace />;
    if (isStaffLike) return <Navigate to="/staff/dashboard" replace />;
    if (isCustomer) return <Navigate to="/customer/home" replace />;
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
