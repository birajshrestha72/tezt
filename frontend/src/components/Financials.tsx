import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Calendar,
  FileText
} from 'lucide-react';

const FinancialsView = () => {
  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3 italic uppercase">
             FISCAL COMMAND
          </h2>
          <p className="text-on-surface-variant font-medium mt-1">Bottom-line metrics and workshop profitability analysis.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-bold hover:bg-white/10 transition-colors">
            <Calendar className="w-4 h-4" />
            Last 30 Days
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-bold shadow-lg shadow-primary/20">
            <Download className="w-4 h-4" />
            Export Audit
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'GROSS REVENUE', value: '$124,800', change: '+22%', trend: 'up', icon: DollarSign, color: 'text-emerald-400' },
          { label: 'AVG ORDER VALUE', value: '$840.00', change: '-4.3%', trend: 'down', icon: CreditCard, color: 'text-amber-400' },
          { label: 'NET PROFIT MARGIN', value: '28.5%', change: '+1.2%', trend: 'up', icon: BarChart3, color: 'text-primary' },
        ].map((stat, i) => (
          <div key={i} className="glass-panel machined-edge p-8 rounded-3xl relative overflow-hidden group">
            <div className="relative z-10 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black tracking-[0.2em] text-on-surface-variant uppercase italic">{stat.label}</span>
                <div className={`p-2 bg-white/5 rounded-lg ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-8 flex items-end justify-between">
                <div>
                  <h3 className="text-4xl font-black text-white italic">{stat.value}</h3>
                  <div className={`flex items-center gap-1 mt-2 font-bold text-xs ${stat.trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {stat.trend === 'up' ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                    {stat.change} vs prev. period
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <stat.icon className="w-32 h-32" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-panel machined-edge rounded-3xl p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center gap-2 italic">
              <TrendingUp className="w-5 h-5 text-primary" />
              REVENUE FLOW
            </h3>
            <div className="flex gap-2">
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-on-surface-variant">
                <div className="w-2 h-2 rounded-full bg-primary" /> Labor
              </span>
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-on-surface-variant">
                <div className="w-2 h-2 rounded-full bg-emerald-400" /> Parts
              </span>
            </div>
          </div>
          
          <div className="h-[280px] flex items-end justify-between gap-4 px-4">
            {/* Visual Bar Chart Placeholder */}
            {[65, 45, 80, 55, 90, 70, 85, 40, 75, 60, 95, 80].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col gap-1.5 group cursor-pointer">
                <div className="w-full bg-primary/20 rounded-t-lg relative flex flex-col justify-end overflow-hidden" style={{ height: `${h}%` }}>
                  <div className="w-full bg-primary h-[40%] group-hover:bg-primary-container transition-colors" />
                </div>
                <span className="text-[9px] font-bold text-on-surface-variant text-center select-none uppercase tracking-tighter">M{i+1}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel machined-edge rounded-3xl p-8 space-y-6 flex flex-col">
          <h3 className="text-xl font-bold italic flex items-center gap-2">
            <FileText className="w-5 h-5 text-secondary-container" />
            RECENT INVOICES
          </h3>
          <div className="space-y-4 flex-1">
            {[
              { id: 'INV-402', client: 'J. Wick', date: 'Oct 24', amount: '$1,240', status: 'PAID' },
              { id: 'INV-403', client: 'T. Stark', date: 'Oct 25', amount: '$4,800', status: 'PENDING' },
              { id: 'INV-404', client: 'L. Ortiz', date: 'Oct 25', amount: '$950', status: 'PAID' },
              { id: 'INV-405', client: 'S. Connor', date: 'Oct 26', amount: '$210', status: 'OVERDUE' },
            ].map((inv) => (
              <div key={inv.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                <div>
                  <p className="text-sm font-bold text-white">{inv.client}</p>
                  <p className="text-[10px] text-on-surface-variant font-mono uppercase">{inv.id} • {inv.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-white">{inv.amount}</p>
                  <span className={`text-[8px] font-black tracking-widest ${
                    inv.status === 'PAID' ? 'text-emerald-400' :
                    inv.status === 'PENDING' ? 'text-amber-400' : 'text-red-400'
                  }`}>{inv.status}</span>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full py-4 bg-white/5 rounded-2xl text-[10px] font-black tracking-[0.2em] uppercase italic hover:bg-white/10 transition-all text-on-surface-variant hover:text-white">
            View Ledger
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinancialsView;
