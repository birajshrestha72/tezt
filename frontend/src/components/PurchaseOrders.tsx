import React, { useState, useEffect } from 'react';
import { Package, Search, Truck, ClipboardList, Layers3 } from 'lucide-react';

const PurchaseOrdersView = () => {
  const [search, setSearch] = useState('');

  const metrics = [
    { label: 'Purchase Orders', value: '0', hint: 'Ready to be created', icon: ClipboardList },
    { label: 'Vendor Links', value: '0', hint: 'Connected suppliers', icon: Truck },
    { label: 'Inventory Requests', value: '0', hint: 'Awaiting replenishment', icon: Layers3 },
  ];

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 bg-bg-primary min-h-screen">
      <section className="flex flex-col gap-5 rounded-3xl border border-border-light bg-surface-container/70 p-5 shadow-xl shadow-black/10 backdrop-blur md:p-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-border-light bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-text-secondary">
            <Package className="h-3.5 w-3.5" />
            Procurement
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-text-primary sm:text-[2.15rem]">Purchase Orders</h1>
            <p className="max-w-2xl text-sm font-medium leading-6 text-text-secondary">
              Manage supplier purchase orders and keep inventory replenishment aligned with the operational workflow.
            </p>
          </div>
        </div>

        <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-default px-5 py-3 text-sm font-bold text-white shadow-lg shadow-brand-default/20 transition-transform duration-base hover:-translate-y-0.5 hover:bg-brand-hover sm:w-auto">
          <Package className="h-4 w-4" />
          New Purchase Order
        </button>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {metrics.map((metric) => (
          <article key={metric.label} className="rounded-3xl border border-border-light bg-surface-container/70 p-5 shadow-lg shadow-black/10 transition-all duration-base hover:-translate-y-0.5 hover:border-brand-default/30">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-text-tertiary">{metric.label}</p>
                <h2 className="mt-3 text-3xl font-black tracking-tight text-text-primary">{metric.value}</h2>
                <p className="mt-2 text-sm text-text-tertiary">{metric.hint}</p>
              </div>
              <div className="rounded-2xl bg-white/5 p-3 text-brand-default">
                <metric.icon className="h-5 w-5" />
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-3xl border border-border-light bg-surface-container/70 shadow-xl shadow-black/10">
        <div className="border-b border-border-light px-5 py-4 md:px-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-text-tertiary">Search procurement</p>
              <h3 className="mt-1 text-lg font-bold text-text-primary">Locate a supplier order or part request</h3>
            </div>
            <label className="flex w-full items-center gap-3 rounded-2xl border border-border-light bg-bg-secondary px-4 py-3 md:max-w-lg">
              <Search className="h-5 w-5 text-text-tertiary" />
              <input
                type="text"
                placeholder="Search by PO number, supplier, or part..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent text-sm text-text-primary outline-none placeholder:text-text-tertiary"
              />
            </label>
          </div>
        </div>

        <div className="px-5 py-14 md:px-6">
          <div className="rounded-3xl border border-dashed border-border-light bg-bg-secondary px-5 py-12 text-center">
            <Package className="mx-auto mb-4 h-16 w-16 text-text-tertiary" />
            <h3 className="text-xl font-bold text-text-primary">No Purchase Orders</h3>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-text-secondary">
              {search ? 'No purchase orders matched your search.' : 'Get started by creating your first purchase order.'}
            </p>
            {!search && (
              <button className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-default px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-default/20 transition hover:bg-brand-hover">
                Create Purchase Order
              </button>
            )}
          </div>
        </div>

        <div className="border-t border-border-light bg-bg-secondary px-5 py-4 md:px-6">
          <p className="text-sm leading-6 text-text-secondary">
            <strong className="text-text-primary">Purchase Orders:</strong> Track supplier orders, delivery dates, and inventory replenishment from one operational panel.
          </p>
        </div>
      </section>
    </div>
  );
};

export default PurchaseOrdersView;
