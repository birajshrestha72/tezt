import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Search, 
  Filter, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  History,
  AlertTriangle,
  MoreHorizontal
} from 'lucide-react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { InventoryItem } from '../types';

const InventoryView = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'inventory'),
      where('userId', '==', auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const itemsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as InventoryItem[];
      setItems(itemsData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'inventory');
    });

    return unsubscribe;
  }, []);

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3 italic uppercase">
             STOCK LOGISTICS
          </h2>
          <p className="text-on-surface-variant font-medium mt-1">Real-time inventory tracking and automated replenishment.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-bold hover:bg-white/10 transition-colors">
            <ArrowDownToLine className="w-4 h-4" />
            Check In
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-bold shadow-lg shadow-primary/20">
            <Package className="w-4 h-4" />
            Add New Part
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel machined-edge rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/40" />
          <input 
            type="text" 
            placeholder="Search parts, SKUs, or manufacturer..."
            className="w-full bg-surface-container-low border border-white/5 rounded-xl py-2.5 pl-11 pr-4 text-sm text-on-surface focus:ring-1 focus:ring-primary/20 placeholder:text-on-surface-variant/30"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-surface-container-low border border-white/5 rounded-xl text-sm font-bold text-on-surface-variant hover:text-white transition-colors">
            <Filter className="w-4 h-4" />
            Filters
          </button>
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-surface-container-low border border-white/5 rounded-xl text-sm font-bold text-on-surface-variant hover:text-white transition-colors">
            <History className="w-4 h-4" />
            Logs
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="glass-panel machined-edge rounded-2x overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/5">
                <th className="px-6 py-4 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Part Identification</th>
                <th className="px-6 py-4 text-[10px] font-black text-on-surface-variant uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-on-surface-variant uppercase tracking-widest text-center">In Stock</th>
                <th className="px-6 py-4 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Pricing</th>
                <th className="px-6 py-4 text-[10px] font-black text-on-surface-variant uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-on-surface-variant/40 font-bold uppercase tracking-widest text-xs">
                    Accessing Vault...
                  </td>
                </tr>
              ) : items.length > 0 ? (
                items.map((item) => {
                  const isLow = item.quantity <= item.minStock;
                  return (
                    <tr key={item.id} className="hover:bg-white-[2%] transition-colors group">
                      <td className="px-6 py-6 font-medium">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-surface-container-highest flex items-center justify-center text-on-surface-variant group-hover:text-primary transition-colors">
                            <Package className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-white font-bold leading-tight">{item.name}</p>
                            <p className="text-xs text-on-surface-variant font-mono mt-1">{item.partNumber}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <div className="flex justify-center">
                          {isLow ? (
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-red-400/10 text-red-400 rounded-full text-[10px] font-black uppercase tracking-wider border border-red-400/20 shadow-[0_0_10px_rgba(248,113,113,0.1)]">
                              <AlertTriangle className="w-3 h-3" />
                              Low Stock
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-400/10 text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-wider border border-emerald-400/20">
                              Optimal
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <div>
                          <p className={`text-lg font-black ${isLow ? 'text-red-400' : 'text-white'}`}>{item.quantity}</p>
                          <p className="text-[10px] font-bold text-on-surface-variant uppercase">Min: {item.minStock}</p>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <p className="text-sm font-bold text-white">${item.price}</p>
                        <p className="text-[10px] text-on-surface-variant font-medium">MSRP ${item.price * 1.5}</p>
                      </td>
                      <td className="px-6 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2 text-on-surface-variant hover:text-white transition-colors bg-white/5 rounded-lg">
                            <ArrowUpFromLine className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-on-surface-variant hover:text-white transition-colors bg-white/5 rounded-lg">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center space-y-4">
                    <div className="flex flex-col items-center gap-4 opacity-40">
                      <Package className="w-12 h-12" />
                      <p className="font-bold uppercase tracking-widest text-xs">Inventory empty. Please add items.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};


export default InventoryView;
