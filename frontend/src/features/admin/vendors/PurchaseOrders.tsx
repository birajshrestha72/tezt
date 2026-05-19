import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { MdAdd, MdVisibility, MdDoneAll, MdDelete } from 'react-icons/md';
import { purchaseOrderService, type PurchaseOrderRecord } from '../../../services/api/purchaseOrderService';
import { productService, type ProductApiRecord } from '../../../services/api/productService';
import api from '../../../services/api/axios';
import { DataTable, type Column, Badge, getStatusBadge, Modal, ConfirmDialog, StatCard } from '../../../components/ui';

interface SupplierOption { id: number; name: string; }

interface LineItem {
  key: number;
  productId: number | '';
  quantity: number;
  unitCost: number;
}

function calcTotal(order: PurchaseOrderRecord): number {
  return (order.items ?? []).reduce((s, i) => s + (i.unitCost ?? 0) * (i.quantity ?? 0), 0);
}

export default function PurchaseOrders() {
  const [orders, setOrders] = useState<PurchaseOrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [suppliers, setSuppliers] = useState<SupplierOption[]>([]);
  const [products, setProducts] = useState<ProductApiRecord[]>([]);

  const [createOpen, setCreateOpen] = useState(false);
  const [viewTarget, setViewTarget] = useState<PurchaseOrderRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PurchaseOrderRecord | null>(null);

  const [supplierId, setSupplierId] = useState<number | ''>('');
  const nextKey = React.useRef(1);
  const [lines, setLines] = useState<LineItem[]>([{ key: 0, productId: '', quantity: 1, unitCost: 0 }]);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [pos, sups, prods] = await Promise.allSettled([
        purchaseOrderService.getAll(),
        api.get('/suppliers'),
        productService.getProductDtos(),
      ]);
      if (pos.status === 'fulfilled') setOrders(pos.value);
      if (sups.status === 'fulfilled') setSuppliers(sups.value.data?.data ?? []);
      if (prods.status === 'fulfilled') setProducts(prods.value);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const grandTotal = lines.reduce((s, l) => s + (l.quantity || 0) * (l.unitCost || 0), 0);

  const openCreate = () => {
    setSupplierId('');
    nextKey.current = 1;
    setLines([{ key: 0, productId: '', quantity: 1, unitCost: 0 }]);
    setCreateOpen(true);
  };

  const addLine = () => setLines(l => [...l, { key: nextKey.current++, productId: '', quantity: 1, unitCost: 0 }]);
  const removeLine = (i: number) => setLines(l => l.filter((_, idx) => idx !== i));
  const updateLine = (i: number, field: keyof LineItem, val: number | string) =>
    setLines(l => l.map((item, idx) => idx === i ? { ...item, [field]: val } : item));

  const handleCreate = async () => {
    if (!supplierId) { toast.error('Please select a supplier.'); return; }
    if (lines.some(l => !l.productId)) { toast.error('Please select a product for each line.'); return; }
    if (lines.some(l => !(l.quantity >= 1))) { toast.error('Each line must have quantity of at least 1.'); return; }
    if (lines.some(l => !(l.unitCost >= 0.01))) { toast.error('Each line must have a unit cost of at least $0.01.'); return; }
    setSubmitting(true);
    try {
      await purchaseOrderService.create({
        supplierId: Number(supplierId),
        items: lines.map(l => ({ productId: Number(l.productId), quantity: l.quantity, unitCost: l.unitCost })),
      });
      toast.success('Purchase order created.');
      setCreateOpen(false);
      void load();
    } finally {
      setSubmitting(false);
    }
  };

  const handleReceive = async (id: number) => {
    await purchaseOrderService.receive(id);
    toast.success('Purchase order received. Stock updated.');
    void load();
  };

  const handleDelete = async () => {
    await purchaseOrderService.delete(deleteTarget!.id);
    toast.success('Purchase order deleted.');
    setDeleteTarget(null);
    void load();
  };

  const pending = orders.filter(o => o.status === 'Pending').length;
  const received = orders.filter(o => o.status === 'Received').length;

  const columns: Column<PurchaseOrderRecord>[] = [
    { key: 'id', label: 'PO #', render: r => <strong>PO-{r.id}</strong> },
    { key: 'supplierName', label: 'Supplier', render: r => r.supplierName },
    { key: 'orderDate', label: 'Date', render: r => new Date(r.orderDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) },
    { key: 'items', label: 'Items', render: r => <Badge variant="info">{(r.items ?? []).length} items</Badge> },
    { key: 'total', label: 'Total', align: 'right', render: r => <strong>${calcTotal(r).toFixed(2)}</strong> },
    { key: 'status', label: 'Status', render: r => getStatusBadge(r.status) },
    {
      key: 'actions', label: '', align: 'right',
      render: r => (
        <div className="action-btns">
          <button className="tbl-btn" aria-label="View" onClick={() => setViewTarget(r)}><MdVisibility /></button>
          {r.status === 'Pending' && (
            <button className="tbl-btn" style={{ color: 'var(--success)' }} aria-label="Mark received" onClick={() => handleReceive(r.id)}><MdDoneAll /></button>
          )}
          <button className="tbl-btn del" aria-label="Delete" onClick={() => setDeleteTarget(r)}><MdDelete /></button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Purchase Orders</h2>
          <p className="page-subtitle">Manage supplier orders and inventory replenishment</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}><MdAdd /> Create Purchase Order</button>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <StatCard loading={loading} label="Total POs" value={orders.length} accentColor="var(--info)" />
        <StatCard loading={loading} label="Pending" value={pending} accentColor="var(--warning)" />
        <StatCard loading={loading} label="Received" value={received} accentColor="var(--success)" />
      </div>

      <DataTable
        columns={columns}
        data={orders}
        loading={loading}
        keyExtractor={r => r.id}
        emptyMessage="No purchase orders yet."
      />

      {/* Create Modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Create Purchase Order" size="lg"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setCreateOpen(false)}>Cancel</button>
            <button className="btn btn-primary" disabled={submitting} onClick={handleCreate}>
              {submitting ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : 'Create Order'}
            </button>
          </>
        }
      >
        <div className="form-group">
          <label htmlFor="po-supplier" className="form-label req">Supplier</label>
          <select id="po-supplier" className="form-select" value={supplierId} onChange={e => setSupplierId(e.target.value ? Number(e.target.value) : '')}>
            <option value="">Select supplier…</option>
            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        <div style={{ marginTop: 'var(--md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sm)' }}>
            <p className="form-label">Line Items</p>
            <button className="btn btn-secondary btn-sm" type="button" onClick={addLine}><MdAdd /> Add Item</button>
          </div>

          {lines.map((line, i) => (
            <div key={line.key} className="po-item-row">
              <select className="form-select" value={line.productId} onChange={e => updateLine(i, 'productId', e.target.value ? Number(e.target.value) : '')}>
                <option value="">Select product…</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
              </select>
              <input type="number" className="form-input" min={1} value={line.quantity} onChange={e => updateLine(i, 'quantity', Number(e.target.value))} placeholder="Qty" style={{ width: 80 }} />
              <input type="number" className="form-input" min={0} step={0.01} value={line.unitCost} onChange={e => updateLine(i, 'unitCost', Number(e.target.value))} placeholder="Unit Cost" style={{ width: 110 }} />
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => removeLine(i)} disabled={lines.length === 1} style={{ padding: '0 8px' }}>✕</button>
            </div>
          ))}

          <div className="po-total">Total: ${grandTotal.toFixed(2)}</div>
        </div>
      </Modal>

      {/* View Modal */}
      <Modal isOpen={!!viewTarget} onClose={() => setViewTarget(null)} title={`PO-${viewTarget?.id} — ${viewTarget?.supplierName}`} size="lg"
        footer={
          <>
            {viewTarget?.status === 'Pending' && (
              <button className="btn btn-success btn-md" onClick={() => { handleReceive(viewTarget.id); setViewTarget(null); }}>
                Mark as Received
              </button>
            )}
            <button className="btn btn-ghost" onClick={() => setViewTarget(null)}>Close</button>
          </>
        }
      >
        {viewTarget && (
          <>
            <div style={{ display: 'flex', gap: 'var(--md)', marginBottom: 'var(--md)', flexWrap: 'wrap' }}>
              <div><p className="form-hint">Supplier</p><p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{viewTarget.supplierName}</p></div>
              <div><p className="form-hint">Date</p><p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{new Date(viewTarget.orderDate).toLocaleDateString('en-GB')}</p></div>
              <div><p className="form-hint">Status</p>{getStatusBadge(viewTarget.status)}</div>
            </div>
            <div className="table-card">
              <table className="data-table">
                <thead><tr><th>Product</th><th>Qty</th><th>Unit Cost</th><th className="right">Line Total</th></tr></thead>
                <tbody>
                  {(viewTarget.items ?? []).map(item => (
                    <tr key={item.id}>
                      <td>{item.productName}</td>
                      <td>{item.quantity}</td>
                      <td>${item.unitCost.toFixed(2)}</td>
                      <td className="right"><strong>${(item.quantity * item.unitCost).toFixed(2)}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="po-total">Total: ${calcTotal(viewTarget).toFixed(2)}</div>
          </>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={`Delete PO-${deleteTarget?.id}?`}
        message="This action cannot be undone."
        dangerous
      />
    </div>
  );
}
