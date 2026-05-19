import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Timer, 
  CheckCircle2, 
  AlertCircle,
  ArrowUpRight,
  ChevronRight,
  MoreVertical,
  Wrench,
  LayoutDashboard
} from 'lucide-react';
import api from '../services/api/axios';

interface DashboardSummary {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  lowStockProducts: number;
}

interface OrderDto {
  id: number;
  orderDate: string;
  status: string;
  customerId: number;
  itemCount: number;
}

const DashboardView = () => {
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [summary, setSummary] = useState<DashboardSummary>({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    lowStockProducts: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const [summaryRes, ordersRes] = await Promise.all([
          api.get('/dashboard/summary'),
          api.get('/orders')
        ]);

        const summaryPayload = summaryRes.data?.data ?? summaryRes.data;
        const ordersPayload = Array.isArray(ordersRes.data?.data)
          ? ordersRes.data.data
          : Array.isArray(ordersRes.data)
            ? ordersRes.data
            : [];

        setSummary(summaryPayload ?? summary);
        setOrders(ordersPayload.slice(0, 5));
      } catch {
        setError('Failed to load dashboard data from API.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const stats = [
    { label: 'Total Orders', value: String(summary.totalOrders), growth: 'From PostgreSQL', icon: Timer, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { label: 'Products', value: String(summary.totalProducts), growth: 'Current catalog', icon: CheckCircle2, color: 'text-sky-400', bg: 'bg-sky-400/10' },
    { label: 'Low Stock', value: String(summary.lowStockProducts), growth: 'Below threshold', icon: AlertCircle, color: 'text-secondary-container', bg: 'bg-secondary-container/10' },
    { label: 'Revenue', value: `$${summary.totalRevenue.toLocaleString()}`, growth: 'Computed from orders', icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  ];
  return (
    <div className="p-8 space-y-8">
      {/* Welcome Header */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white italic">GARAGE OVERVIEW</h2>
        <p className="text-on-surface-variant font-medium">Precision tracking for your workshop operations.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="glass-panel machined-edge p-6 rounded-2xl group hover:border-white/20 transition-all duration-300">
            <div className="flex items-start justify-between">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-on-surface-variant/40 group-hover:text-primary transition-colors" />
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-on-surface-variant">{stat.label}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white">{stat.value}</span>
                <span className={`text-xs font-semibold ${stat.color}`}>{stat.growth}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Repair Tickets */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Timer className="w-5 h-5 text-primary" />
              ACTIVE TICKETS
            </h3>
            <button className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
              View all workflow <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-3">
            {loading ? (
               <div className="flex flex-col gap-3">
                 {[1, 2, 3].map(i => <div key={i} className="h-20 bg-white/5 animate-pulse rounded-xl" />)}
               </div>
            ) : orders.length > 0 ? (
              orders.map((order) => (
                <div key={order.id} className="glass-panel machined-edge rounded-xl p-4 flex items-center justify-between group hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-1.5 h-10 rounded-full ${
                      order.status.toLowerCase() === 'cancelled' ? 'bg-secondary-container' :
                      order.status.toLowerCase() === 'pending' ? 'bg-amber-400' : 'bg-sky-400'
                    }`} />
                    <div>
                      <h4 className="font-bold text-white">Order #{order.id}</h4>
                      <p className="text-xs text-on-surface-variant font-mono uppercase">Customer #{order.customerId} • {new Date(order.orderDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="hidden md:block">
                    <div className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      order.status.toLowerCase() === 'paid' ? 'bg-emerald-400/10 text-emerald-400' :
                      order.status.toLowerCase() === 'pending' ? 'bg-white/5 text-on-surface-variant' :
                      order.status.toLowerCase() === 'shipped' ? 'bg-primary/10 text-primary' :
                      'bg-red-400/10 text-red-400'
                    }`}>
                      {order.status}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div className="hidden sm:block">
                      <p className="text-xs text-on-surface-variant font-medium">Items</p>
                      <p className="font-bold text-white">{order.itemCount}</p>
                    </div>
                    <button className="p-2 text-on-surface-variant hover:text-white transition-colors">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            ) : error ? (
              <div className="glass-panel machined-edge rounded-2xl p-12 text-center space-y-6">
                <div className="mx-auto w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center">
                  <Wrench className="w-8 h-8 text-on-surface-variant/40" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-xl font-bold text-white">Dashboard unavailable</h4>
                  <p className="text-on-surface-variant text-sm max-w-xs mx-auto">{error}</p>
                </div>
              </div>
            ) : (
              <div className="glass-panel machined-edge rounded-2xl p-12 text-center space-y-6">
                <div className="mx-auto w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center">
                  <Wrench className="w-8 h-8 text-on-surface-variant/40" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-xl font-bold text-white">No recent orders</h4>
                  <p className="text-on-surface-variant text-sm max-w-xs mx-auto">Orders will appear here when transactions are recorded through the backend API.</p>
                </div>
              </div>
            )}
          </div>
        </div>


        {/* AI Quick Diagnostics */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold flex items-center gap-2 uppercase tracking-wide">
             AI INSIGHTS
          </h3>
          <div className="glass-panel machined-edge border-primary/20 bg-primary/5 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <Wrench className="w-24 h-24 rotate-45" />
            </div>
            
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-2 bg-primary/20 w-fit px-3 py-1 rounded-full text-xs font-bold text-primary">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                LIVE ANALYSIS
              </div>
              
              <h4 className="text-lg font-bold text-white leading-tight">Potential stock shortage detected for high-vol brake pads (B903-X)</h4>
              <p className="text-sm text-on-surface-variant leading-relaxed">Based on current service tickets and 30-day usage patterns, you will likely run out of OEM brake pads by Thursday.</p>
              
              <button className="w-full bg-primary text-on-primary py-3 rounded-xl font-bold text-sm shadow-xl shadow-primary/20 transition-transform active:scale-95">
                Bulk Order Now
              </button>
            </div>
          </div>

          <div className="glass-panel machined-edge rounded-2xl p-6 space-y-4">
            <h4 className="font-bold flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4 text-secondary-container" />
              SHOP EFFICIENCY
            </h4>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                  <span className="text-on-surface-variant">Bay Utilization</span>
                  <span className="text-white">85%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[85%]" />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                  <span className="text-on-surface-variant">Parts ROI</span>
                  <span className="text-white">62%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 w-[62%]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
