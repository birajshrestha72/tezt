import { useEffect, useState } from 'react';
import { productService, type ProductDetailRecord, type ProductOption } from '../services/api/productService';
import { purchaseOrderService } from '../services/api/purchaseOrderService';

export default function PurchaseInvoice() {
  const [suppliers, setSuppliers] = useState<ProductOption[]>([]);
  const [parts, setParts] = useState<ProductDetailRecord[]>([]);
  const [supplierId, setSupplierId] = useState<number | ''>('');
  const [items, setItems] = useState<{ partId: string; quantity: number; unitPrice: number }[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const load = async () => {
      const [p, s] = await Promise.all([productService.getProducts(), productService.getSuppliers()]);
      setParts(p);
      setSuppliers(s);
    };
    void load();
  }, []);

  const addRow = () => setItems(i => [...i, { partId: parts[0]?.id ?? '', quantity: 1, unitPrice: parts[0]?.price ?? 0 }]);
  const updateRow = (index: number, patch: Partial<{ partId: string; quantity: number; unitPrice: number }>) => {
    setItems(prev => prev.map((r, i) => i === index ? { ...r, ...patch } : r));
  };
  const removeRow = (index: number) => setItems(prev => prev.filter((_, i) => i !== index));

  const submit = async () => {
    if (!supplierId || items.length === 0) { setMessage('Select supplier and add at least one item.'); return; }
    setSaving(true); setMessage('');
    try {
      const payload = { supplierId: Number(supplierId), items: items.map(it => ({ partId: it.partId, quantity: Number(it.quantity), unitPrice: Number(it.unitPrice) })) };
      const res = await purchaseOrderService.create(payload as any);
      setMessage('Purchase order created.');
      setItems([]);
      setSupplierId('');
    } catch (err: any) {
      console.error(err);
      setMessage(err?.response?.data?.message ?? 'Failed to create purchase order.');
    } finally { setSaving(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Create Purchase Order</h2>
          <p className="page-subtitle">Select supplier, add parts and submit purchase order.</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <select className="form-select" value={supplierId as any} onChange={e => setSupplierId(e.target.value ? Number(e.target.value) : '')}>
          <option value="">Select supplier…</option>
          {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <button className="btn btn-secondary" onClick={addRow}>Add item</button>
      </div>

      <table className="table">
        <thead>
          <tr><th>Part</th><th>Qty</th><th>Unit Price</th><th></th></tr>
        </thead>
        <tbody>
          {items.map((it, idx) => (
            <tr key={idx}>
              <td>
                <select className="form-select" value={it.partId} onChange={e => updateRow(idx, { partId: e.target.value })}>
                  <option value="">Select part…</option>
                  {parts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </td>
              <td><input type="number" className="form-input" value={it.quantity} onChange={e => updateRow(idx, { quantity: Number(e.target.value) })} /></td>
              <td><input type="number" className="form-input" value={it.unitPrice} onChange={e => updateRow(idx, { unitPrice: Number(e.target.value) })} /></td>
              <td><button className="tbl-btn del" onClick={() => removeRow(idx)}>Remove</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 12 }}>
        <button className="btn btn-primary" onClick={submit} disabled={saving}>{saving ? 'Saving…' : 'Create Purchase Order'}</button>
        {message && <div style={{ marginTop: 8 }} className="alert alert-info">{message}</div>}
      </div>
    </div>
  );
}
