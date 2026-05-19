import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  UserPlus, 
  Mail, 
  Phone, 
  Car,
  ChevronRight,
  ExternalLink,
  Star
} from 'lucide-react';
import api from '../services/api/axios';

interface CustomerApiDto {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

interface CustomerViewModel {
  id: string;
  name: string;
  email: string;
  phone: string;
  vehicles: string[];
}

const CustomersView = () => {
  const [customers, setCustomers] = useState<CustomerViewModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  const visibleCustomers = customers.filter((customer) => {
    const query = search.toLowerCase();
    return (
      customer.name.toLowerCase().includes(query) ||
      customer.email.toLowerCase().includes(query) ||
      customer.phone.toLowerCase().includes(query)
    );
  });

  const metrics = [
    { label: 'Total Customers', value: customers.length.toString(), hint: 'Registered accounts', icon: Users },
    { label: 'Visible Records', value: visibleCustomers.length.toString(), hint: 'Matching the current search', icon: Search },
    { label: 'Contactable', value: customers.filter((customer) => customer.email).length.toString(), hint: 'Email addresses on file', icon: Mail },
    { label: 'Vehicle Links', value: customers.reduce((count, customer) => count + customer.vehicles.length, 0).toString(), hint: 'Connected fleet records', icon: Car },
  ];

  useEffect(() => {
    const loadCustomers = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get('/customers');
        const data = (response.data?.data ?? []) as CustomerApiDto[];

        const normalized = data.map((c) => ({
          id: String(c.id),
          name: `${c.firstName} ${c.lastName}`.trim(),
          email: c.email,
          phone: c.phone ?? '-',
          vehicles: []
        }));

        setCustomers(normalized);
      } catch {
        setError('Failed to load customers from API.');
      } finally {
        setLoading(false);
      }
    };

    loadCustomers();
  }, []);

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 bg-bg-primary min-h-screen">
      <section className="flex flex-col gap-5 rounded-3xl border border-border-light bg-surface-container/70 p-5 shadow-xl shadow-black/10 backdrop-blur md:p-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-border-light bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-text-secondary">
            <Users className="h-3.5 w-3.5" />
            Customer Directory
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-text-primary sm:text-[2.15rem]">Customer Directory</h1>
            <p className="max-w-2xl text-sm font-medium leading-6 text-text-secondary">
              Manage relationships, service history, and fleet contacts from a structured CRM-style dashboard.
            </p>
          </div>
        </div>

        <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-default px-5 py-3 text-sm font-bold text-white shadow-lg shadow-brand-default/20 transition-transform duration-base hover:-translate-y-0.5 hover:bg-brand-hover sm:w-auto">
          <UserPlus className="h-4 w-4" />
          Onboard Customer
        </button>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-text-tertiary">Search directory</p>
              <h3 className="mt-1 text-lg font-bold text-text-primary">Find a customer or contact record</h3>
            </div>

            <label className="flex w-full items-center gap-3 rounded-2xl border border-border-light bg-bg-secondary px-4 py-3 md:max-w-xl">
              <Search className="h-5 w-5 text-text-tertiary" />
              <input
                type="text"
                placeholder="Search by name, email, phone or plate number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent text-sm text-text-primary outline-none placeholder:text-text-tertiary"
              />
            </label>
          </div>
        </div>

        <div className="p-5 md:p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          [1, 2, 3].map((i) => <div key={i} className="h-64 rounded-3xl border border-border-light bg-bg-secondary/70 animate-pulse" />)
        ) : error ? (
          <div className="col-span-full rounded-3xl border border-border-light bg-bg-secondary px-6 py-16 text-center space-y-4">
            <Users className="mx-auto h-16 w-16 text-text-tertiary" />
            <p className="text-sm font-semibold uppercase tracking-widest text-text-secondary">{error}</p>
          </div>
        ) : visibleCustomers.length > 0 ? (
          visibleCustomers.map((customer) => (
            <div key={customer.id} className="flex h-full flex-col rounded-3xl border border-border-light bg-surface-container/70 p-6 shadow-lg shadow-black/10 transition-all duration-base hover:-translate-y-0.5 hover:border-brand-default/30 hover:shadow-xl hover:shadow-black/20">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border-light bg-bg-secondary text-xl font-bold text-brand-default shadow-inner">
                    {customer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold leading-tight text-text-primary transition-colors">{customer.name}</h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Client profile</span>
                    </div>
                  </div>
                </div>
                <button className="rounded-xl border border-border-light bg-white/5 p-2 text-text-tertiary transition hover:text-text-primary">
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 flex-1">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-text-secondary">
                    <Mail className="w-4 h-4" />
                    <span className="truncate text-sm font-medium">{customer.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-text-secondary">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm font-medium">{customer.phone}</span>
                  </div>
                </div>

                <div className="border-t border-border-light/60 pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Car className="w-4 h-4 text-text-tertiary" />
                    <span className="text-[10px] font-black uppercase tracking-widest leading-none text-text-tertiary">Vehicle Pool</span>
                  </div>
                  <div className="space-y-2">
                    {customer.vehicles.length > 0 ? (
                      customer.vehicles.map((car, i) => (
                        <div key={i} className="flex items-center justify-between rounded-xl border border-border-light bg-bg-secondary/70 p-2.5 transition-colors hover:border-brand-default/20">
                          <span className="text-xs font-bold text-text-primary">{car}</span>
                          <ChevronRight className="h-3 w-3 text-text-tertiary" />
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center justify-between rounded-xl border border-border-light bg-bg-secondary/70 p-2.5">
                        <span className="text-xs font-bold text-text-tertiary">No vehicles added</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                <button className="flex-1 rounded-xl border border-border-light bg-white/5 py-2.5 text-[10px] font-black uppercase tracking-widest text-text-tertiary transition-all hover:border-brand-default/20 hover:text-text-primary">
                  Svc History
                </button>
                <button className="flex-1 rounded-xl border border-brand-default/20 bg-brand-default/10 py-2.5 text-[10px] font-black uppercase tracking-widest text-brand-default transition-all hover:bg-brand-default/20">
                  New Order
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full rounded-3xl border border-dashed border-border-light bg-bg-secondary px-6 py-16 text-center space-y-4">
             <Users className="mx-auto h-16 w-16 text-text-tertiary" />
             <p className="text-xs font-bold uppercase tracking-widest text-text-tertiary">No records found. Onboard your first client.</p>
          </div>
        )}
          </div>
        </div>
      </section>
    </div>
  );
};


export default CustomersView;
