import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Users, Truck, LayoutDashboard, Package, LogOut } from 'lucide-react';
import './Layout.css';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <h2>VP SYSTEM</h2>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
            <LayoutDashboard size={20} /> Dashboard
          </NavLink>
          <NavLink to="/admin/staff" className={({ isActive }) => isActive ? 'active' : ''}>
            <Users size={20} /> Staff Management
          </NavLink>
          <NavLink to="/admin/vendors" className={({ isActive }) => isActive ? 'active' : ''}>
            <Truck size={20} /> Vendor Management
          </NavLink>
          <NavLink to="/admin/parts" className={({ isActive }) => isActive ? 'active' : ''}>
            <Package size={20} /> Parts Inventory
          </NavLink>
        </nav>
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>
      <main className="main-content">
        <header className="navbar">
          <div className="navbar-title">
            <h3>Vehicle Parts Selling & Inventory</h3>
          </div>
          <div className="user-profile">
            <span>{user?.fullName}</span>
            <span className="role-badge">{user?.role}</span>
          </div>
        </header>
        <div className="content-inner">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
