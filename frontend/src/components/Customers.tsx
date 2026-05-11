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
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { Customer } from '../types';

const CustomersView = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'customers'),
      where('userId', '==', auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const customersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Customer[];
      setCustomers(customersData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'customers');
    });

    return unsubscribe;
  }, []);

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3 italic uppercase">
             CLIENT DATABASE
          </h2>
          <p className="text-on-surface-variant font-medium mt-1">Manage relationships and service history for your fleet.</p>
        </div>
        
        <button className="flex items-center gap-2 px-6 py-3 bg-secondary-container text-white rounded-xl text-sm font-bold shadow-lg shadow-secondary-container/20 red-glow-hover">
          <UserPlus className="w-4 h-4" />
          Onboard Customer
        </button>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-on-surface-variant/40" />
        </div>
        <input 
          type="text" 
          placeholder="Search by name, email, phone or plate number..."
          className="block w-full bg-surface-container border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-on-surface focus:ring-1 focus:ring-primary/20 placeholder:text-on-surface-variant/30 text-lg sm:text-base transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="h-64 bg-white/5 animate-pulse rounded-3xl" />)
        ) : customers.length > 0 ? (
          customers.map((customer) => (
            <div key={customer.id} className="glass-panel machined-edge rounded-3xl p-6 group hover:border-primary/30 transition-all duration-300 flex flex-col h-full bg-gradient-to-br from-white/[0.02] to-transparent">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-surface-container-highest border border-white/10 flex items-center justify-center text-xl font-bold text-primary shadow-inner">
                    {customer.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-lg leading-tight uppercase group-hover:text-primary transition-colors">{customer.name}</h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest italic">V.I.P CLIENT</span>
                    </div>
                  </div>
                </div>
                <button className="p-2 text-on-surface-variant hover:text-white transition-colors bg-white/5 rounded-xl">
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 flex-1">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm font-medium truncate">{customer.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm font-medium">{customer.phone}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2 mb-3">
                    <Car className="w-4 h-4 text-on-surface-variant" />
                    <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest leading-none">Vehicle Pool</span>
                  </div>
                  <div className="space-y-2">
                    {customer.vehicles.map((car, i) => (
                      <div key={i} className="flex items-center justify-between p-2.5 bg-surface-container-highest/50 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                        <span className="text-xs font-bold text-white/80">{car}</span>
                        <ChevronRight className="w-3 h-3 text-on-surface-variant" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                <button className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-on-surface-variant hover:text-white transition-all border border-white/5 italic">
                  Svc History
                </button>
                <button className="flex-1 py-2.5 bg-primary/10 hover:bg-primary/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-primary transition-all border border-primary/20 italic">
                  New Order
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center opacity-40 space-y-4">
             <Users className="w-16 h-16 mx-auto" />
             <p className="font-bold uppercase tracking-widest text-xs">No records found. Onboard your first client.</p>
          </div>
        )}
      </div>
    </div>
  );
};


export default CustomersView;
