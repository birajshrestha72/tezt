import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { Users, Truck, Package, DollarSign } from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [counts, setCounts] = useState({
    staffCount: 0,
    vendorCount: 0,
    partsCount: 0,
    revenue: 0
  });

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const response = await axiosInstance.get('/dashboard/counts');
        setCounts(response.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      }
    };
    fetchCounts();
  }, []);

  const stats = [
    { title: 'Total Staff', value: counts.staffCount, icon: <Users size={24} />, color: '#3B82F6' },
    { title: 'Vendors', value: counts.vendorCount, icon: <Truck size={24} />, color: '#10B981' },
    { title: 'Parts in Stock', value: counts.partsCount, icon: <Package size={24} />, color: '#F59E0B' },
    { title: 'Revenue', value: `Rs. ${counts.revenue.toLocaleString()}`, icon: <DollarSign size={24} />, color: '#6366F1' },
  ];

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1>Dashboard Overview</h1>
        <p>Real-time system statistics</p>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
              {stat.icon}
            </div>
            <div className="stat-info">
              <h3>{stat.title}</h3>
              <p className="stat-value">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-24">
        <div className="card">
          <h2>Recent Activity</h2>
          <p className="text-secondary" style={{ marginTop: '8px' }}>Milestone-1 static activity log</p>
          <div className="activity-list mt-16">
            {[1, 2, 3].map((i) => (
              <div key={i} className="activity-item">
                <div className="activity-dot"></div>
                <div className="activity-content">
                  <p>New part added to inventory by <strong>Staff #{i+10}</strong></p>
                  <span>2 hours ago</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
