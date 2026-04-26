import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

const VendorManagement = () => {
  const [vendors, setVendors] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: '00000000-0000-0000-0000-000000000000', name: '', email: '', phone: '', address: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchVendors = async () => {
    try {
      const response = await axiosInstance.get('/vendor');
      setVendors(response.data);
    } catch (error) {
      console.error('Error fetching vendors', error);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleEdit = (vendor) => {
    setFormData(vendor);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this vendor?')) {
      try {
        await axiosInstance.delete(`/vendor/${id}`);
        fetchVendors();
      } catch (error) {
        alert('Error deleting vendor');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditing) {
        await axiosInstance.put(`/vendor/${formData.id}`, formData);
      } else {
        await axiosInstance.post('/vendor', formData);
      }
      setIsModalOpen(false);
      resetForm();
      fetchVendors();
    } catch (error) {
      alert(`Error ${isEditing ? 'updating' : 'creating'} vendor: ${error.response?.data?.message || error.response?.data || error.message}`);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({ id: '00000000-0000-0000-0000-000000000000', name: '', email: '', phone: '', address: '' });
    setIsEditing(false);
  };

  return (
    <div className="management-page">
      <div className="flex justify-between items-center mb-24">
        <div>
          <h1>Vendor Management</h1>
          <p className="text-secondary">Manage parts suppliers and vendors</p>
        </div>
        <button className="primary flex items-center gap-16" onClick={() => { resetForm(); setIsModalOpen(true); }}>
          <Plus size={18} /> Add New Vendor
        </button>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map((v) => (
              <tr key={v.id}>
                <td>{v.name}</td>
                <td>{v.email}</td>
                <td>{v.phone}</td>
                <td>{v.address}</td>
                <td>
                  <span className="status-pill active">
                    Active
                  </span>
                </td>
                <td>
                  <div className="flex gap-16">
                    <button className="icon-btn" onClick={() => handleEdit(v)}>
                      <Edit2 size={16} style={{marginRight: '8px'}} /> Edit
                    </button>
                    <button className="icon-btn danger" onClick={() => handleDelete(v.id)}>
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
              <h2>{isEditing ? 'Edit Vendor' : 'Add New Vendor'}</h2>
              <button className="icon-btn" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Vendor Name</label>
                <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input required type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input required type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Address</label>
                <textarea required value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})}></textarea>
              </div>
              <div className="flex gap-16 mt-24">
                <button type="button" className="full-width" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="primary full-width" disabled={loading}>
                  {loading ? 'Saving...' : (isEditing ? 'Update Vendor' : 'Save Vendor')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorManagement;
