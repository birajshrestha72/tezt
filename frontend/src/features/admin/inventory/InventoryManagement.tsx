import React, { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { MdAdd, MdEdit, MdDelete, MdBuild, MdWarning, MdCheckCircle } from 'react-icons/md';
import { productService, type ProductDetailRecord, type ProductFormData, type ProductOption } from '../../../services/api/productService';
import { DataTable, type Column, Badge, Modal, ConfirmDialog, Pagination, StatCard } from '../../../components/ui';

const PAGE = 12;

export default function InventoryManagement() {
  const [products, setProducts] = useState<ProductDetailRecord[]>([]);
  const [categories, setCategories] = useState<ProductOption[]>([]);
  const [suppliers, setSuppliers] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ProductDetailRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductDetailRecord | null>(null);

  const addForm = useForm<ProductFormData>();
  const editForm = useForm<ProductFormData>();

  const load = async () => {
    setLoading(true);
    const [prodRes, catRes, supRes] = await Promise.allSettled([
      productService.getProducts(),
      productService.getCategories(),
      productService.getSuppliers(),
    ]);
    if (prodRes.status === 'fulfilled') setProducts(prodRes.value);
    if (catRes.status === 'fulfilled') setCategories(catRes.value);
    if (supRes.status === 'fulfilled') setSuppliers(supRes.value);
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return products.filter(p => {
      const matchSearch = !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
      const productCategoryId = p.category?.id ?? p.categoryId;
      const productSupplierId = p.supplier?.id ?? p.supplierId;
      const matchCat = !catFilter || String(productCategoryId) === catFilter;
      const matchSup = !supplierFilter || String(productSupplierId) === supplierFilter;
      const matchLow = !lowStockOnly || p.stockQty < 10;
      return matchSearch && matchCat && matchSup && matchLow;
    });
  }, [products, search, catFilter, supplierFilter, lowStockOnly]);

  const paged = filtered.slice((page - 1) * PAGE, page * PAGE);
  const lowStockCount = products.filter(p => p.stockQty < 10).length;
  const avgPrice = products.length ? products.reduce((s, p) => s + p.price, 0) / products.length : 0;

  const onAdd = async (d: ProductFormData) => {
    await productService.createProduct({ ...d, price: Number(d.price), stockQty: Number(d.stockQty), categoryId: Number(d.categoryId), supplierId: Number(d.supplierId) });
    toast.success('Part added.');
    addForm.reset();
    setAddOpen(false);
    void load();
  };

  const openEdit = (p: ProductDetailRecord) => {
    editForm.reset({ name: p.name, sku: p.sku, price: p.price, stockQty: p.stockQty, categoryId: p.categoryId, supplierId: p.supplierId });
    setEditTarget(p);
  };

  const onEdit = async (d: ProductFormData) => {
    await productService.updateProduct(editTarget!.id, { ...d, price: Number(d.price), stockQty: Number(d.stockQty), categoryId: Number(d.categoryId), supplierId: Number(d.supplierId) });
    toast.success('Part updated.');
    setEditTarget(null);
    void load();
  };

  const onDelete = async () => {
    await productService.deleteProduct(deleteTarget!.id);
    toast.success('Part deleted.');
    setDeleteTarget(null);
    void load();
  };

  const columns: Column<ProductDetailRecord>[] = [
    {
      key: 'name', label: 'Part',
      render: r => (
        <div className="emp-row">
          <div className="avatar av-md" style={{ background: 'var(--amber-dim)', color: 'var(--amber)' }}><MdBuild /></div>
          <div>
            <p className="emp-name">{r.name}</p>
            <p className="emp-sub" style={{ fontFamily: 'monospace' }}>{r.sku}</p>
          </div>
        </div>
      ),
    },
    { key: 'category', label: 'Category', render: r => <Badge variant="amber">{r.category?.name ?? (r.categoryId ? `Category #${r.categoryId}` : 'Uncategorized')}</Badge> },
    { key: 'supplier', label: 'Supplier', render: r => <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{r.supplier?.name ?? '—'}</span> },
    { key: 'price', label: 'Price', align: 'right', render: r => <strong>${r.price.toFixed(2)}</strong> },
    {
      key: 'stockQty', label: 'Stock', align: 'right',
      render: r => r.stockQty < 10
        ? <span style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end', color: 'var(--danger)', fontWeight: 700 }}><MdWarning />{r.stockQty}</span>
        : <span style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end', color: 'var(--success)', fontWeight: 600 }}><MdCheckCircle />{r.stockQty}</span>,
    },
    {
      key: 'actions', label: '', align: 'right',
      render: r => (
        <div className="action-btns">
          <button className="tbl-btn" aria-label="Edit" onClick={() => openEdit(r)}><MdEdit /></button>
          <button className="tbl-btn del" aria-label="Delete" onClick={() => setDeleteTarget(r)}><MdDelete /></button>
        </div>
      ),
    },
  ];

  const PartForm = ({ form }: { form: ReturnType<typeof useForm<ProductFormData>> }) => (
    <>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="pf-name" className="form-label req">Part Name</label>
          <input id="pf-name" {...form.register('name', { required: true })} className="form-input" />
        </div>
        <div className="form-group">
          <label htmlFor="pf-sku" className="form-label req">SKU</label>
          <input id="pf-sku" {...form.register('sku', { required: true })} className="form-input" style={{ textTransform: 'uppercase' }} />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="pf-price" className="form-label req">Price ($)</label>
          <input id="pf-price" {...form.register('price', { required: true, min: 0 })} type="number" step="0.01" className="form-input" />
        </div>
        <div className="form-group">
          <label htmlFor="pf-stock" className="form-label">Stock Qty</label>
          <input id="pf-stock" {...form.register('stockQty', { min: 0 })} type="number" className="form-input" />
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="pf-cat" className="form-label">Category</label>
        <select id="pf-cat" {...form.register('categoryId')} className="form-select">
          <option value="">Select category…</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="pf-sup" className="form-label">Supplier</label>
        <select id="pf-sup" {...form.register('supplierId')} className="form-select">
          <option value="">Select supplier…</option>
          {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>
    </>
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Inventory Management</h2>
          <p className="page-subtitle">Manage parts catalogue, stock levels and suppliers</p>
        </div>
        <button className="btn btn-primary" onClick={() => { addForm.reset(); setAddOpen(true); }}>
          <MdAdd /> Add Part
        </button>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <StatCard loading={loading} label="Total Parts" value={products.length} accentColor="var(--info)" />
        <StatCard loading={loading} label="Low Stock" value={lowStockCount} accentColor={lowStockCount > 0 ? 'var(--danger)' : 'var(--success)'} hint="Below 10 units" />
        <StatCard loading={loading} label="Avg Price" value={`$${avgPrice.toFixed(2)}`} accentColor="var(--amber)" />
      </div>

      {!loading && lowStockCount > 0 && (
        <div className="alert alert-warning" style={{ marginBottom: 'var(--xl)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <MdWarning /> {lowStockCount} part{lowStockCount > 1 ? 's are' : ' is'} below restock threshold.
        </div>
      )}

      <div className="toolbar">
        <div className="search-wrap" style={{ flex: 1, maxWidth: 300 }}>
          <input className="form-input" placeholder="Search name or SKU…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select className="form-select" style={{ width: 160 }} value={catFilter} onChange={e => { setCatFilter(e.target.value); setPage(1); }}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        <select className="form-select" style={{ width: 200, marginLeft: 8 }} value={supplierFilter} onChange={e => { setSupplierFilter(e.target.value); setPage(1); }}>
          <option value="">All Suppliers</option>
          {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <button
          className={`btn btn-sm ${lowStockOnly ? 'btn-warning' : 'btn-secondary'}`}
          onClick={() => { setLowStockOnly(p => !p); setPage(1); }}
        >
          Low Stock {lowStockOnly ? '✓' : ''}
        </button>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{filtered.length} parts</span>
      </div>

      <DataTable
        columns={columns}
        data={paged}
        loading={loading}
        keyExtractor={r => r.id}
        emptyMessage={search || catFilter || lowStockOnly ? 'No parts match your filters.' : 'No parts yet.'}
      />

      {filtered.length > PAGE && (
        <Pagination total={filtered.length} page={page} pageSize={PAGE} onChange={p => setPage(p)} />
      )}

      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Add Part" size="md"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setAddOpen(false)}>Cancel</button>
            <button className="btn btn-primary" disabled={addForm.formState.isSubmitting} onClick={addForm.handleSubmit(onAdd)}>
              {addForm.formState.isSubmitting ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : 'Save'}
            </button>
          </>
        }
      >
        <PartForm form={addForm} />
      </Modal>

      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title={`Edit — ${editTarget?.name}`} size="md"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setEditTarget(null)}>Cancel</button>
            <button className="btn btn-primary" disabled={editForm.formState.isSubmitting} onClick={editForm.handleSubmit(onEdit)}>
              {editForm.formState.isSubmitting ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : 'Save'}
            </button>
          </>
        }
      >
        <PartForm form={editForm} />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={onDelete}
        title={`Delete "${deleteTarget?.name}"?`}
        message="This action cannot be undone."
        dangerous
      />
    </div>
  );
}
