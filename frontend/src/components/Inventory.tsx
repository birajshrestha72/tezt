import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Barcode, Edit3, Loader2, Package, Plus, Search, Store, Trash2, Tags } from 'lucide-react';
import toast from 'react-hot-toast';
import { ProductApiRecord, ProductDetailRecord, ProductFormData, ProductOption, productService } from '../services/api/productService';

const LOW_STOCK_THRESHOLD = 10;

interface InventoryRow {
  id: number;
  name: string;
  sku: string;
  stockQty: number;
  price: number;
  categoryName: string;
  supplierName: string;
  categoryId: number;
  supplierId: number;
}

interface ProductFormState {
  name: string;
  sku: string;
  price: string;
  stockQty: string;
  categoryId: string;
  supplierId: string;
}

const EMPTY_FORM: ProductFormState = {
  name: '',
  sku: '',
  price: '',
  stockQty: '',
  categoryId: '',
  supplierId: '',
};

const mapProduct = (item: ProductDetailRecord, fallback?: ProductApiRecord): InventoryRow => ({
  id: item.id,
  name: item.name,
  sku: item.sku,
  stockQty: item.stockQty,
  price: item.price,
  categoryId: fallback?.categoryId ?? item.categoryId,
  supplierId: fallback?.supplierId ?? item.supplierId,
  categoryName: item.category?.name ?? `Category ${fallback?.categoryId ?? item.categoryId}`,
  supplierName: item.supplier?.name ?? `Supplier ${fallback?.supplierId ?? item.supplierId}`,
});

const toPayload = (form: ProductFormState): ProductFormData => ({
  name: form.name.trim(),
  sku: form.sku.trim(),
  price: Number(form.price),
  stockQty: Number(form.stockQty),
  categoryId: Number(form.categoryId),
  supplierId: Number(form.supplierId),
});

export default function InventoryView() {
  const [items, setItems] = useState<InventoryRow[]>([]);
  const [categories, setCategories] = useState<ProductOption[]>([]);
  const [suppliers, setSuppliers] = useState<ProductOption[]>([]);
  const [lowStockIds, setLowStockIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<InventoryRow | null>(null);
  const [form, setForm] = useState<ProductFormState>(EMPTY_FORM);

  const load = async () => {
    setLoading(true);
    setError(null);

    try {
      const [products, productDtos, lowStock, categoryOptions, supplierOptions] = await Promise.all([
        productService.getProducts(),
        productService.getProductDtos(),
        productService.getLowStock(LOW_STOCK_THRESHOLD),
        productService.getCategories(),
        productService.getSuppliers(),
      ]);

      const productMap = new Map<number, ProductApiRecord>(productDtos.map((product) => [product.id, product]));

      setItems(products.map((product) => mapProduct(product, productMap.get(product.id))));
      setLowStockIds(new Set(lowStock.map((product) => product.id)));
      setCategories(categoryOptions);
      setSuppliers(supplierOptions);
    } catch (loadError) {
      setError('Failed to load inventory from API.');
      toast.error('Inventory could not be loaded.');
      console.error('Inventory load failed:', loadError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return items;
    }

    return items.filter((item) =>
      [item.name, item.sku, item.categoryName, item.supplierName].some((value) => value.toLowerCase().includes(query))
    );
  }, [items, search]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setIsFormOpen(true);
  };

  const openEdit = (item: InventoryRow) => {
    setEditing(item);
    setForm({
      name: item.name,
      sku: item.sku,
      price: String(item.price),
      stockQty: String(item.stockQty),
      categoryId: String(item.categoryId),
      supplierId: String(item.supplierId),
    });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditing(null);
    setForm(EMPTY_FORM);
  };

  const submitForm = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);

    try {
      const payload = toPayload(form);

      if (!payload.name || !payload.sku || !payload.categoryId || !payload.supplierId || Number.isNaN(payload.price) || Number.isNaN(payload.stockQty)) {
        toast.error('Please complete all required product fields.');
        return;
      }

      if (editing) {
        await productService.updateProduct(editing.id, payload);
        toast.success(`Product "${payload.name}" updated.`);
      } else {
        await productService.createProduct(payload);
        toast.success(`Product "${payload.name}" created.`);
      }

      closeForm();
      await load();
    } catch (submitError: any) {
      const message = submitError?.response?.data?.message || 'Unable to save product.';
      toast.error(message);
      console.error('Inventory save failed:', submitError);
    } finally {
      setSaving(false);
    }
  };

  const removeProduct = async (item: InventoryRow) => {
    if (!window.confirm(`Delete ${item.name}? This cannot be undone.`)) {
      return;
    }

    try {
      await productService.deleteProduct(item.id);
      toast.success(`Product "${item.name}" deleted.`);
      await load();
    } catch (deleteError: any) {
      const message = deleteError?.response?.data?.message || 'Unable to delete product.';
      toast.error(message);
      console.error('Inventory delete failed:', deleteError);
    }
  };

  const stats: Array<{ label: string; value: number; tone?: 'warn' | 'default' }> = [
    { label: 'Products', value: items.length },
    { label: 'Low Stock', value: lowStockIds.size, tone: lowStockIds.size > 0 ? 'warn' : 'default' },
    { label: 'Categories', value: categories.length },
    { label: 'Suppliers', value: suppliers.length },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 md:px-6 lg:px-8 lg:py-8">
      <section className="flex flex-col gap-4 rounded-3xl border border-white/5 bg-surface-container/70 p-5 shadow-xl shadow-black/10 backdrop-blur md:p-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-on-surface-variant">
            <Store className="h-3.5 w-3.5" />
            Inventory Control
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-[2.15rem]">Parts and Products</h2>
            <p className="max-w-2xl text-sm font-medium leading-6 text-on-surface-variant">
              Manage catalog items, monitor stock levels, and surface low-stock parts directly from PostgreSQL-backed APIs.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-on-primary shadow-lg shadow-primary/20 transition-transform hover:-translate-y-0.5 sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </button>
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="rounded-3xl border border-white/5 bg-white/5 p-4 shadow-xl shadow-black/10 md:p-5">
          <label className="block space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Search inventory</span>
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant/40" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products, SKU, category, or supplier..."
                className="w-full rounded-2xl border border-white/5 bg-surface-container-low py-3.5 pl-11 pr-4 text-sm text-on-surface outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10 placeholder:text-on-surface-variant/35"
              />
            </div>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-[440px]">
          {stats.map((stat) => (
            <StatCard key={stat.label} label={stat.label} value={stat.value} tone={stat.tone} />
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-white/5 bg-surface-container/70 shadow-xl shadow-black/10">
        <div className="border-b border-white/5 px-5 py-4 md:px-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-on-surface-variant">Inventory Table</p>
              <p className="mt-1 text-sm font-medium text-on-surface-variant">
                {loading ? 'Loading products...' : `${filteredItems.length} item${filteredItems.length === 1 ? '' : 's'} visible`}
              </p>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
              Low stock threshold: {LOW_STOCK_THRESHOLD}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[940px] border-collapse text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.25em] text-on-surface-variant">Product</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.25em] text-on-surface-variant">Category</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.25em] text-on-surface-variant">Supplier</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.25em] text-center text-on-surface-variant">Stock</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.25em] text-on-surface-variant">Pricing</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.25em] text-right text-on-surface-variant">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="inline-flex items-center gap-3 rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-sm font-semibold text-on-surface-variant">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading inventory...
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-sm font-semibold text-red-300">
                    {error}
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16">
                    <div className="mx-auto flex max-w-sm flex-col items-center gap-4 text-center text-on-surface-variant">
                      <Package className="h-12 w-12 opacity-50" />
                      <div className="space-y-2">
                        <p className="text-sm font-bold uppercase tracking-widest">Inventory is empty</p>
                        <p className="text-sm leading-6">Add the first product to start tracking stock levels.</p>
                      </div>
                      <button type="button" onClick={openCreate} className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-on-primary">
                        Add Product
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isLow = lowStockIds.has(item.id) || item.stockQty < LOW_STOCK_THRESHOLD;

                  return (
                    <tr key={item.id} className="transition-colors hover:bg-white/[0.02]">
                      <td className="px-6 py-5 align-top">
                        <div className="flex items-center gap-4">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface-container-highest text-on-surface-variant">
                            <Barcode className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-bold text-white">{item.name}</p>
                            <p className="mt-1 truncate font-mono text-xs text-on-surface-variant">{item.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 align-top">
                        <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/5 bg-white/5 px-3 py-1.5 text-xs font-semibold text-on-surface-variant">
                          <Tags className="h-3.5 w-3.5" />
                          <span className="truncate">{item.categoryName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 align-top">
                        <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/5 bg-white/5 px-3 py-1.5 text-xs font-semibold text-on-surface-variant">
                          <Store className="h-3.5 w-3.5" />
                          <span className="truncate">{item.supplierName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center align-top">
                        <div className="space-y-1">
                          <p className={`text-lg font-black ${isLow ? 'text-red-400' : 'text-white'}`}>{item.stockQty}</p>
                          <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${isLow ? 'border border-red-400/20 bg-red-400/10 text-red-300' : 'border border-emerald-400/20 bg-emerald-400/10 text-emerald-300'}`}>
                            {isLow ? <AlertTriangle className="h-3 w-3" /> : null}
                            {isLow ? 'Low Stock' : 'Healthy'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 align-top">
                        <p className="text-sm font-bold text-white">${item.price.toFixed(2)}</p>
                        <p className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant">Threshold: {LOW_STOCK_THRESHOLD}</p>
                      </td>
                      <td className="px-6 py-5 text-right align-top">
                        <div className="flex flex-col justify-end gap-2 sm:flex-row sm:items-center">
                          <button
                            type="button"
                            onClick={() => openEdit(item)}
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/5 bg-white/5 px-3 py-2 text-xs font-bold text-on-surface-variant transition hover:text-white"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => removeProduct(item)}
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-400/20 bg-red-400/10 px-3 py-2 text-xs font-bold text-red-300 transition hover:bg-red-400/20"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {isFormOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm md:items-center md:p-6">
          <div className="flex h-[100svh] w-full max-w-3xl flex-col overflow-hidden rounded-none border border-white/10 bg-surface-container shadow-2xl shadow-black/40 md:h-auto md:max-h-[calc(100vh-3rem)] md:rounded-3xl">
            <div className="flex items-start justify-between gap-4 border-b border-white/5 bg-surface-container/95 px-5 py-4 backdrop-blur md:px-6 md:py-5">
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-on-surface-variant">Inventory Module</p>
                <h3 className="text-2xl font-extrabold text-white">{editing ? 'Edit Product' : 'Create Product'}</h3>
                <p className="text-sm leading-6 text-on-surface-variant">Saved directly through the wrapped ASP.NET API.</p>
              </div>
              <button type="button" onClick={closeForm} className="shrink-0 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-bold text-on-surface-variant">
                Close
              </button>
            </div>

            <form onSubmit={submitForm} className="flex min-h-0 flex-1 flex-col">
              <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5 md:px-6">
                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="Name" value={form.name} onChange={(value) => setForm((prev) => ({ ...prev, name: value }))} placeholder="Brake Pad Set" required />
                  <Field label="SKU" value={form.sku} onChange={(value) => setForm((prev) => ({ ...prev, sku: value }))} placeholder="BRK-001" required />
                  <Field label="Price" type="number" step="0.01" value={form.price} onChange={(value) => setForm((prev) => ({ ...prev, price: value }))} placeholder="125.00" required />
                  <Field label="Stock Qty" type="number" value={form.stockQty} onChange={(value) => setForm((prev) => ({ ...prev, stockQty: value }))} placeholder="10" required />
                  <SelectField label="Category" value={form.categoryId} onChange={(value) => setForm((prev) => ({ ...prev, categoryId: value }))} options={categories} required />
                  <SelectField label="Supplier" value={form.supplierId} onChange={(value) => setForm((prev) => ({ ...prev, supplierId: value }))} options={suppliers} required />
                </div>
              </div>

              <div className="border-t border-white/5 bg-surface-container/98 px-5 py-4 md:px-6">
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button type="button" onClick={closeForm} className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-on-surface-variant">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-on-primary shadow-lg shadow-primary/20 disabled:cursor-not-allowed disabled:opacity-70">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {saving ? 'Saving...' : editing ? 'Update Product' : 'Create Product'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function StatCard({ label, value, tone }: { label: string; value: number; tone?: 'warn' | 'default' }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-4 shadow-lg shadow-black/5">
      <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">{label}</p>
      <p className={`mt-2 text-2xl font-extrabold ${tone === 'warn' ? 'text-red-300' : 'text-white'}`}>{value}</p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  step,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  step?: string;
  required?: boolean;
}) {
  return (
    <label className="space-y-2">
      <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
        {label} {required ? '*' : ''}
      </span>
      <input
        type={type}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/5 bg-surface-container-low px-4 py-3.5 text-sm text-on-surface outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10 placeholder:text-on-surface-variant/35"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: ProductOption[];
  required?: boolean;
}) {
  return (
    <label className="space-y-2">
      <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
        {label} {required ? '*' : ''}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-white/5 bg-surface-container-low px-4 py-3.5 text-sm text-on-surface outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
      >
        <option value="">Select {label.toLowerCase()}...</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
    </label>
  );
}