import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

const EMPTY_FORM = {
  id: '00000000-0000-0000-0000-000000000000',
  name: '',
  sku: '',
  description: '',
  unitPrice: 0,
  costPrice: 0,
  stockQty: 0,
  reorderLevel: 0,
  vendorId: '',
};

const PartsManagement = () => {
  const [parts, setParts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchAll = async () => {
    try {
      const partsRes = await axiosInstance.get('/part');
      setParts(partsRes.data);
    } catch (error) {
      console.error('Error fetching parts', error);
    }
    try {
      const vendorsRes = await axiosInstance.get('/vendor');
      setVendors(vendorsRes.data);
    } catch (error) {
      console.error('Error fetching vendors', error);
    }
    try {
      const catsRes = await axiosInstance.get('/categories');
      setCategories(catsRes.data);
    } catch (error) {
      console.error('Error fetching categories', error);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleEdit = (part) => {
    setFormData({
      ...EMPTY_FORM,
      ...part,
      vendorId: part.vendorId || '',
      categoryId: part.categoryId || '',
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this part?')) {
      try {
        await axiosInstance.delete(`/part/${id}`);
        fetchAll();
      } catch (error) {
        alert('Error deleting part');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Sanitize payload
      const payload = {
        ...formData,
        vendorId: formData.vendorId || null,
        // categoryId is optional and not used in UI
      };
      if (isEditing) {
        await axiosInstance.put(`/part/${formData.id}`, payload);
      } else {
        if (!formData.vendorId) { alert('Vendor is required.'); return; }
      }
      setIsModalOpen(false);
      resetForm();
      fetchAll();
    } catch (error) {
      console.error('Update error response:', error.response?.data);
      const msg = error.response?.data?.message
        || error.response?.data?.title
        || (typeof error.response?.data === 'string' ? error.response.data : null)
        || error.response?.data?.errors?.map?.(e=>e.msg).join(', ')
        || error.message
        || 'Unknown error';
      alert(`Error ${isEditing ? 'updating' : 'creating'} part: ${msg}`);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setIsEditing(false);
  };

  const field = (key, label, type = 'text', extra = {}) => (
    <div className="form-group">
      <label>{label}</label>
      <input
        type={type}
        value={formData[key]}
        onChange={(e) => setFormData({ ...formData, [key]: type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value })}
        {...extra}
      />
    </div>
  );

  return (
    <div className="management-page">
      <div className="flex justify-between items-center mb-24">
        <div>
          <h1>Parts Inventory</h1>
          <p className="text-secondary">View and manage vehicle parts</p>
        </div>
        <button className="primary flex items-center gap-16" onClick={() => { resetForm(); setIsModalOpen(true); }}>
          <Plus size={18} /> Add New Part
        </button>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Name</th>
              <th>Unit Price</th>
              <th>Stock</th>
              <th>Reorder Level</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {parts.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: '#888' }}>No parts found.</td></tr>
            ) : parts.map((p) => (
              <tr key={p.id}>
                <td><strong>{p.sku}</strong></td>
                <td>{p.name}</td>
                <td>Rs. {p.unitPrice?.toFixed(2)}</td>
                <td>
                  <span className={`status-pill ${p.stockQty <= p.reorderLevel ? 'inactive' : 'active'}`}>
                    {p.stockQty}
                  </span>
                </td>
                <td>{p.reorderLevel}</td>
                <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.description}</td>
                <td>
                  <div className="flex gap-16">
                    <button className="icon-btn" onClick={() => handleEdit(p)}>
                      <Edit2 size={16} style={{ marginRight: '8px' }} /> Edit
                    </button>
                    <button className="icon-btn danger" onClick={() => handleDelete(p.id)}>
                      <Trash2 size={16} style={{ marginRight: '8px' }} /> Delete
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
          <div className="modal-card" style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="flex justify-between items-center mb-24">
              <h2>{isEditing ? 'Edit Part' : 'Add New Part'}</h2>
              <button className="icon-btn" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="flex gap-16">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Part Name *</label>
                  <input required type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Oil Filter" />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>SKU *</label>
                  <input required type="text" value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} placeholder="e.g. ENG-OIL-001" />
                </div>
              </div>

              <div className="flex gap-16">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Vendor</label>
                  <select value={formData.vendorId} onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}>
                    <option value="">-- Select Vendor (optional) --</option>
                    {vendors.map((v) => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-16">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Unit Price (Rs.) *</label>
                  <input required type="number" step="0.01" min="0" value={formData.unitPrice} onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Cost Price (Rs.) *</label>
                  <input required type="number" step="0.01" min="0" value={formData.costPrice} onChange={(e) => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })} />
                </div>
              </div>

              <div className="flex gap-16">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Stock Qty *</label>
                  <input required type="number" min="0" value={formData.stockQty} onChange={(e) => setFormData({ ...formData, stockQty: parseInt(e.target.value) || 0 })} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Reorder Level</label>
                  <input type="number" min="0" value={formData.reorderLevel} onChange={(e) => setFormData({ ...formData, reorderLevel: parseInt(e.target.value) || 0 })} />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Optional description..." />
              </div>

              <div className="flex gap-16 mt-24">
                <button type="button" className="full-width" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="primary full-width" disabled={loading}>
                  {loading ? 'Saving...' : (isEditing ? 'Update Part' : 'Save Part')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartsManagement;
