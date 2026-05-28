import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { MdAdd, MdCheckCircle, MdDelete, MdPersonAdd, MdSearch, MdSend } from 'react-icons/md';
import { customerService, type CustomerRecord } from '../../services/api/customerService';
import { orderService, type ProductOption, type OrderCreateResult } from '../../services/api/orderService';
import { Modal, Badge } from '../../components/ui';
import { formatCurrency } from '../../utils/format';

interface LineItem {
  key: number;
  productId: number | '';
  quantity: number;
  unitPrice: number;
}

interface OrderForm {
  status: string;
  amountPaid: number;
  creditDays?: number;
}

interface NewCustForm {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

function getUpdatedLineItem(
  item: LineItem,
  key: number,
  field: keyof LineItem,
  val: number | string,
  products: ProductOption[]
): LineItem {
  if (item.key !== key) return item;
  if (field === 'productId') {
    const product = products.find(productOption => productOption.id === Number(val));
    return {
      ...item,
      productId: val ? Number(val) : '',
      unitPrice: product ? product.price : item.unitPrice,
    };
  }
  return { ...item, [field]: val };
}

const STATUSES = ['Pending', 'Paid', 'Shipped', 'Cancelled'];
const LOYALTY_THRESHOLD = 5000;
const LOYALTY_RATE = 0.1;

export default function StaffSales() {
  const [step, setStep] = useState(1);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [searchResults, setSearchResults] = useState<CustomerRecord[]>([]);
  const [selectedCust, setSelectedCust] = useState<CustomerRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [lines, setLines] = useState<LineItem[]>([]);
  const [result, setResult] = useState<OrderCreateResult | null>(null);
  const [addCustOpen, setAddCustOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const nextKey = useRef(0);
  const timerRef = useRef<ReturnType<typeof globalThis.setTimeout> | null>(null);

  const orderForm = useForm<OrderForm>({ defaultValues: { status: 'Pending', amountPaid: 0 } });
  const custForm = useForm<NewCustForm>();

  useEffect(() => {
    orderService.getProducts()
      .then(data => setProducts(data))
      .catch(err => console.error('[StaffSales] load products error:', err));
  }, []);

  const runSearch = async (q: string) => {
    setSearchLoading(true);
    try {
      const data = await customerService.searchCustomers({ search: q.trim() });
      setSearchResults(data);
    } catch (err) {
      console.error('[StaffSales] search error:', err);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    if (timerRef.current) globalThis.clearTimeout(timerRef.current);
    if (!q.trim()) { setSearchResults([]); return; }
    timerRef.current = globalThis.setTimeout(() => { void runSearch(q); }, 300);
  };

  const addLine = () => setLines(l => [...l, { key: nextKey.current++, productId: '', quantity: 1, unitPrice: 0 }]);

  const removeLine = (key: number) => setLines(l => l.filter(i => i.key !== key));

  const updateLine = (key: number, field: keyof LineItem, val: number | string) => {
    setLines(prev => prev.map(item => getUpdatedLineItem(item, key, field, val, products)));
  };

  const subtotal = lines.reduce((s, l) => s + (l.quantity || 0) * (Number(l.unitPrice) || 0), 0);
  const hasLoyalty = subtotal > LOYALTY_THRESHOLD;
  const discount = hasLoyalty ? subtotal * LOYALTY_RATE : 0;
  const total = subtotal - discount;

  const onRegisterCust = async (d: NewCustForm) => {
    try {
      const created = await customerService.createCustomer({
        firstName: d.firstName, lastName: d.lastName, email: d.email, phone: d.phone,
      });
      setSelectedCust(created);
      toast.success('Customer registered.');
      setAddCustOpen(false);
      custForm.reset();
      setStep(2);
    } catch (err) {
      console.error('[StaffSales] register customer error:', err);
    }
  };

  const onConfirmOrder = async (d: OrderForm) => {
    if (!selectedCust) return;
    if (lines.length === 0) { toast.error('Add at least one item.'); return; }
    if (lines.some(l => !l.productId)) { toast.error('Select a product for each line.'); return; }
    setSubmitting(true);
    try {
      const dueDate = d.creditDays
        ? new Date(Date.now() + Number(d.creditDays) * 86400000).toISOString().slice(0, 10)
        : undefined;
      const res = await orderService.createOrder({
        orderDate: new Date().toISOString().slice(0, 10),
        creditDueDate: dueDate,
        amountPaid: Number(d.amountPaid),
        status: d.status,
        customerId: selectedCust.id,
        items: lines.map(l => ({ productId: Number(l.productId), quantity: Number(l.quantity), unitPrice: Number(l.unitPrice) })),
      });
      setResult(res);
      setStep(3);
    } catch (err) {
      console.error('[StaffSales] create order error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const resetAll = () => {
    setStep(1);
    setSelectedCust(null);
    setSearchQuery('');
    setSearchResults([]);
    setLines([]);
    setResult(null);
    orderForm.reset({ status: 'Pending', amountPaid: 0 });
  };

  const stepLabels: Record<number, string> = { 1: 'Select Customer', 2: 'Build Order', 3: 'Confirm' };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Create New Sale</h2>
          <p className="page-subtitle">Step {step} of 3 — {stepLabels[step]}</p>
        </div>
      </div>

      <div className="sales-stepper">
        {[1, 2, 3].map(n => (
          <div key={n} className={`sales-stepper__segment${n <= step ? ' active' : ''}`} />
        ))}
      </div>

      {/* STEP 1 — Select Customer */}
      {step === 1 && (
        <div>
          <div className="search-wrap sales-search-box">
            <MdSearch className="search-icon" />
            <input
              className="search-input"
              placeholder="Search by name, email or phone…"
              value={searchQuery}
              onChange={e => handleSearchChange(e.target.value)}
            />
          </div>
          <div className="sales-actions-row">
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => { custForm.reset(); setAddCustOpen(true); }}>
              <MdPersonAdd /> Register New Customer
            </button>
          </div>

          {searchLoading && ['a', 'b', 'c', 'd'].map(k => (
            <div key={k} className="skeleton" style={{ height: 76, borderRadius: 12, marginBottom: 8 }} />
          ))}

          {!searchLoading && (
            <div className="sales-customer-grid">
              {searchResults.map(c => (
                <button
                  key={c.id}
                  type="button"
                  className={`card sales-customer-card${selectedCust?.id === c.id ? ' selected' : ''}`}
                  onClick={() => { setSelectedCust(c); setStep(2); }}
                >
                  <div className="sales-customer-card__content">
                    <p className="sales-customer-card__name">{c.firstName} {c.lastName}</p>
                    <p className="sales-customer-card__meta">{c.email}</p>
                    {c.phone && <p className="sales-customer-card__meta">{c.phone}</p>}
                  </div>
                </button>
              ))}
              {(searchResults.length === 0) && searchQuery && (
                <div className="sales-customer-empty">
                  No customers found.
                </div>
              )}
              {!searchQuery && (
                <div className="sales-customer-empty">
                  Type a name, email or phone to search customers.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* STEP 2 — Build Order */}
      {step === 2 && selectedCust && (
        <div>
          <div className="card sales-customer-shell">
            <div className="avatar" style={{ background: 'var(--red-dim)', color: 'var(--red-bright)', fontWeight: 700 }}>
              {((selectedCust.firstName.at(0) ?? '') + (selectedCust.lastName.at(0) ?? '')).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{selectedCust.firstName} {selectedCust.lastName}</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{selectedCust.email}</p>
            </div>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setStep(1)}>Change</button>
          </div>

          <form onSubmit={orderForm.handleSubmit(onConfirmOrder)} noValidate>
            <div className="sales-order-shell">
              <div className="card sales-order-panel">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--md)' }}>
                  <p style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Order Items</p>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={addLine}><MdAdd /> Add Item</button>
                </div>
                {lines.length === 0 && (
                  <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: 'var(--lg)' }}>Click "Add Item" to start building the order.</p>
                )}
                {lines.map(line => (
                  <div key={line.key} className="order-item-row">
                    <select className="form-select" value={line.productId} onChange={e => updateLine(line.key, 'productId', e.target.value)}>
                      <option value="">Select product…</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({formatCurrency(p.price)}, stock: {p.stockQty})</option>
                      ))}
                    </select>
                    <input type="number" className="form-input" min={1} value={line.quantity}
                      onChange={e => updateLine(line.key, 'quantity', Number(e.target.value))} placeholder="Qty" />
                    <input type="number" className="form-input" min={0} step={0.01} value={line.unitPrice}
                      onChange={e => updateLine(line.key, 'unitPrice', Number(e.target.value))} placeholder="Price" />
                    <span style={{ textAlign: 'right', fontWeight: 600, color: 'var(--text-primary)', fontSize: 14, minWidth: 80 }}>
                      {formatCurrency((line.quantity || 0) * (Number(line.unitPrice) || 0))}
                    </span>
                    <button type="button" className="tbl-btn del" onClick={() => removeLine(line.key)}><MdDelete /></button>
                  </div>
                ))}
              </div>

              <div className="card sales-order-summary">
                <p style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--md)' }}>Order Summary</p>
                {hasLoyalty && (
                  <div style={{ marginBottom: 'var(--md)' }}>
                    <Badge variant="warning">Loyalty Discount: 10% applied</Badge>
                  </div>
                )}
                <div className="form-group">
                  <label htmlFor="s2-status" className="form-label">Status</label>
                  <select id="s2-status" {...orderForm.register('status')} className="form-select">
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="s2-paid" className="form-label">Amount Paid</label>
                  <input id="s2-paid" {...orderForm.register('amountPaid', { min: 0 })} type="number" step="0.01" className="form-input" />
                </div>
                <div className="form-group">
                  <label htmlFor="s2-credit" className="form-label">Credit Days</label>
                  <input id="s2-credit" {...orderForm.register('creditDays', { min: 0 })} type="number" className="form-input" placeholder="e.g. 30" />
                  <p className="form-hint">Leave blank for no credit period.</p>
                </div>
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--md)', marginTop: 'var(--md)' }}>
                  {[
                    { label: 'Subtotal', value: formatCurrency(subtotal) },
                    ...(hasLoyalty ? [{ label: 'Loyalty (10%)', value: `-${formatCurrency(discount)}` }] : []),
                    { label: 'Total', value: formatCurrency(total) },
                  ].map(row => (
                    <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{row.label}</span>
                      <strong>{row.value}</strong>
                    </div>
                  ))}
                </div>
                <button type="submit" className="btn btn-primary btn-lg btn-fw" style={{ marginTop: 'var(--lg)' }} disabled={submitting}>
                  {submitting
                    ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                    : 'Confirm Order'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* STEP 3 — Confirmation */}
      {step === 3 && result && (
        <div className="card sales-confirm-card">
          <MdCheckCircle style={{ fontSize: 64, color: 'var(--success)', marginBottom: 'var(--md)' }} />
          <p style={{ fontSize: 'var(--head-md)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--sm)' }}>
            Order #{result.order?.id} Created Successfully
          </p>
          <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--xl)' }}>
            Total: {formatCurrency(result.totalAmount ?? 0)}
            {result.loyaltyDiscountApplied
              ? ` · Loyalty discount: ${formatCurrency(result.discountAmount ?? 0)}`
              : ''}
          </p>
          <div style={{ display: 'flex', gap: 'var(--md)', justifyContent: 'center' }}>
            <button type="button" className="btn btn-primary" onClick={() => toast.success('Invoice sent.')}>
              <MdSend /> Send Invoice
            </button>
            <button type="button" className="btn btn-secondary" onClick={resetAll}>New Sale</button>
          </div>
        </div>
      )}

      <Modal isOpen={addCustOpen} onClose={() => setAddCustOpen(false)} title="Register New Customer" size="md"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setAddCustOpen(false)}>Cancel</button>
            <button className="btn btn-primary" disabled={custForm.formState.isSubmitting} onClick={custForm.handleSubmit(onRegisterCust)}>
              Register
            </button>
          </>
        }
      >
        <form noValidate>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nc-fn" className="form-label req">First Name</label>
              <input id="nc-fn" {...custForm.register('firstName', { required: true })} className="form-input" />
            </div>
            <div className="form-group">
              <label htmlFor="nc-ln" className="form-label req">Last Name</label>
              <input id="nc-ln" {...custForm.register('lastName', { required: true })} className="form-input" />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="nc-em" className="form-label req">Email</label>
            <input id="nc-em" {...custForm.register('email', { required: true })} type="email" className="form-input" />
          </div>
          <div className="form-group">
            <label htmlFor="nc-ph" className="form-label">Phone</label>
            <input id="nc-ph" {...custForm.register('phone')} className="form-input" />
          </div>
        </form>
      </Modal>
    </div>
  );
}
