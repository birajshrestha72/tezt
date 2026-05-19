import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

const StaffManagement = () => {
  const [staff, setStaff] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: '00000000-0000-0000-0000-000000000000', userId: '00000000-0000-0000-0000-000000000000', fullName: '', email: '', password: '', department: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchStaff = async () => {
    try {
      const response = await axiosInstance.get('/staff');
      setStaff(response.data);
    } catch (error) {
      console.error('Error fetching staff', error);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleEdit = (s) => {
    setFormData({
      id: s.id,
      userId: s.userId,
      fullName: s.user?.fullName || '',
      email: s.user?.email || '',
      password: '', // Don't show password
      department: s.department || ''
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditing) {
        // For editing staff, we might need a different endpoint or handle it in the backend
        await axiosInstance.put(`/staff/${formData.id}`, {
          id: formData.id,
          userId: formData.userId,
          department: formData.department
        });
      } else {
        await axiosInstance.post('/staff', formData);
      }
      setIsModalOpen(false);
      resetForm();
      fetchStaff();
    } catch (error) {
      alert(`Error ${isEditing ? 'updating' : 'creating'} staff: ${error.response?.data?.message || error.response?.data || error.message}`);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({ id: '00000000-0000-0000-0000-000000000000', userId: '00000000-0000-0000-0000-000000000000', fullName: '', email: '', password: '', department: '' });
    setIsEditing(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      try {
        await axiosInstance.delete(`/staff/${id}`);
        fetchStaff();
      } catch (error) {
        alert('Error deleting staff');
      }
    }
  };

  return (
    <div className="management-page">
      <div className="flex justify-between items-center mb-24">
        <div>
          <h1>Staff Management</h1>
          <p className="text-secondary">Manage system administrators and staff</p>
        </div>
        <button className="primary flex items-center gap-16" onClick={() => { resetForm(); setIsModalOpen(true); }}>
          <Plus size={18} /> Add New Staff
        </button>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((s) => (
              <tr key={s.id}>
                <td>{s.user?.fullName || 'N/A'}</td>
                <td>{s.user?.email || 'N/A'}</td>
                <td>{s.department}</td>
                <td><span className="role-badge">{s.user?.role?.name || 'Staff'}</span></td>
                <td>
                  <span className="status-pill active">
                    Active
                  </span>
                </td>
                <td>
                  <div className="flex gap-16">
                    <button className="icon-btn" onClick={() => handleEdit(s)}>
                      <Edit2 size={16} style={{marginRight: '8px'}} /> Edit
                    </button>
                    <button className="icon-btn danger" onClick={() => handleDelete(s.id)}>
                      <Trash2 size={16} style={{marginRight: '8px'}} /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="flex justify-between items-center mb-24">
              <h2>{isEditing ? 'Edit Staff' : 'Add New Staff'}</h2>
              <button className="icon-btn" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <input 
                  required 
                  type="text" 
                  value={formData.fullName || ''} 
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})} 
                  disabled={isEditing}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input 
                  required 
                  type="email" 
                  value={formData.email || ''} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})} 
                  disabled={isEditing}
                />
              </div>
              {!isEditing && (
                <div className="form-group">
                  <label>Password</label>
                  <input required type="password" value={formData.password || ''} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                </div>
              )}
              <div className="form-group">
                <label>Department</label>
                <input required type="text" value={formData.department || ''} onChange={(e) => setFormData({...formData, department: e.target.value})} />
              </div>
              <div className="flex gap-16 mt-24">
                <button type="button" className="full-width" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="primary full-width" disabled={loading}>
                  {loading ? 'Saving...' : (isEditing ? 'Update Staff' : 'Save Staff')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;
