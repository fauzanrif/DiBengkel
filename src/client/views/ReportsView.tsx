import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  Truck, 
  Receipt, 
  Calendar, 
  Download, 
  Filter,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Printer,
  FileText
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';

const ReportsView: React.FC = () => {
  const [activeReport, setActiveReport] = useState('revenue');
  
  const reportTypes = [
    { id: 'revenue', name: 'Revenue Report', icon: TrendingUp, color: 'text-blue-600' },
    { id: 'inventory', name: 'Inventory Report', icon: Package, color: 'text-purple-600' },
    { id: 'sales', name: 'Sales Performance', icon: ShoppingCart, color: 'text-blue-500' },
    { id: 'procurement', name: 'Procurement Stats', icon: Truck, color: 'text-amber-500' },
    { id: 'outstanding', name: 'Aging Invoices', icon: Receipt, color: 'text-red-500' },
  ];

  return (
    <div className="p-8 space-y-8 pb-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <div className="flex items-center gap-2 text-blue-600 mb-2">
              <BarChart3 size={16} />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Business Intelligence</span>
           </div>
           <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase leading-none">Management Reports</h1>
        </div>

        <div className="flex items-center gap-3">
           <div className="bg-white p-1 rounded-2xl shadow-sm border border-slate-200 flex overflow-x-auto no-scrollbar max-w-[500px]">
              {reportTypes.map(report => {
                const Icon = report.icon;
                return (
                  <button 
                    key={report.id}
                    onClick={() => setActiveReport(report.id)}
                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap ${
                      activeReport === report.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Icon size={14} /> {report.name}
                  </button>
                );
              })}
           </div>
        </div>
      </div>

      {/* Global Filters */}
      <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
         <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="space-y-1.5">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Period Range</label>
               <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <select className="pl-12 pr-8 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 outline-none cursor-pointer appearance-none">
                     <option>Last 30 Days</option>
                     <option>This Quarter</option>
                     <option>Last 12 Months</option>
                     <option>Custom Range</option>
                  </select>
               </div>
            </div>
            <div className="space-y-1.5">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Branch Focus</label>
               <div className="relative">
                  <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <select className="pl-12 pr-8 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 outline-none cursor-pointer appearance-none">
                     <option>All Branches</option>
                     <option>Jakarta Pusat</option>
                     <option>Bandung Timur</option>
                  </select>
               </div>
            </div>
         </div>

         <div className="flex items-center gap-3 self-end md:self-center">
            <button className="p-3.5 bg-slate-50 text-slate-400 border border-slate-100 rounded-2xl hover:text-blue-600 transition-colors">
               <Printer size={20} />
            </button>
            <button className="flex items-center gap-3 px-8 py-3.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10">
               <Download size={16} /> Export Detailed PDF
            </button>
         </div>
      </div>

      <AnimatePresence mode="wait">
         <motion.div
           key={activeReport}
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           exit={{ opacity: 0, y: -10 }}
           transition={{ duration: 0.2 }}
           className="space-y-8"
         >
            {activeReport === 'revenue' && <RevenueReport />}
            {activeReport === 'inventory' && <InventoryReport />}
            {activeReport === 'sales' && <SalesPerformanceReport />}
            {activeReport === 'procurement' && <ProcurementReport />}
            {activeReport === 'outstanding' && <OutstandingInvoiceReport />}
         </motion.div>
      </AnimatePresence>
    </div>
  );
};

const RevenueReport = () => {
  const data = [
    { name: 'May 01', rev: 4500000 },
    { name: 'May 05', rev: 5200000 },
    { name: 'May 10', rev: 4800000 },
    { name: 'May 15', rev: 6100000 },
    { name: 'May 20', rev: 5800000 },
    { name: 'May 25', rev: 7200000 },
    { name: 'May 30', rev: 8400000 },
  ];

  return (
    <div className="space-y-8">
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-8 text-blue-600 opacity-5 -mr-4 -mt-4 transform group-hover:scale-125 group-hover:rotate-12 transition-transform">
                <TrendingUp size={120} />
             </div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Gross Revenue</p>
             <h3 className="text-4xl font-black text-slate-800 tracking-tighter">Rp 245,5M</h3>
             <div className="mt-4 flex items-center gap-2 text-green-600 font-bold text-xs uppercase">
                <ArrowUpRight size={14} /> +15.5% vs Last Period
             </div>
          </div>

          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Profit Margin (Avg)</p>
             <h3 className="text-4xl font-black text-slate-800 tracking-tighter">32.4%</h3>
             <div className="mt-4 flex items-center gap-2 text-red-500 font-bold text-xs uppercase">
                <ArrowDownRight size={14} /> -2.1% Cost Inflation
             </div>
          </div>

          <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white">
             <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Invoice Recovery</p>
             <h3 className="text-4xl font-black tracking-tighter">94.8%</h3>
             <div className="mt-6 flex items-center gap-4">
                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                   <div className="h-full bg-blue-500 w-[94.8%]"></div>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Excellent</span>
             </div>
          </div>
       </div>

       <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-12">
             <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase">Revenue Trends & Forecasting</h3>
             <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                   <span className="text-[10px] font-black text-slate-400 uppercase">Actual Revenue</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                   <span className="text-[10px] font-black text-slate-400 uppercase">Target</span>
                </div>
             </div>
          </div>
          
          <div className="h-[400px] w-full">
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                   <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                         <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                      </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                   <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} 
                   />
                   <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                      tickFormatter={(value) => `Rp ${value / 1000000}M`}
                   />
                   <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                   />
                   <Area type="monotone" dataKey="rev" stroke="#2563eb" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
             </ResponsiveContainer>
          </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
             <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-black text-slate-800 tracking-tight uppercase">Revenue by Category</h3>
                <button className="p-2 bg-slate-50 text-slate-400 rounded-lg"><Filter size={14} /></button>
             </div>
             
             <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={[
                      { name: 'Parts', val: 4500 },
                      { name: 'Labor', val: 2800 },
                      { name: 'Tires', val: 1500 },
                      { name: 'Lubes', val: 1200 },
                   ]}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                      <YAxis hide />
                      <Tooltip />
                      <Bar dataKey="val" radius={[8, 8, 0, 0]} barSize={40}>
                         {[0, 1, 2, 3].map((entry, index) => (
                            <Cell key={index} fill={['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd'][index]} />
                         ))}
                      </Bar>
                   </BarChart>
                </ResponsiveContainer>
             </div>
          </div>

          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm">
             <h3 className="text-lg font-black text-slate-800 tracking-tight uppercase mb-8">Top Revenue Branches</h3>
             <div className="space-y-6">
                {[
                  { name: 'Jakarta Pusat (Head)', rev: 120, trend: 'up' },
                  { name: 'Bandung Timur', rev: 85, trend: 'up' },
                  { name: 'Surabaya Utara', rev: 72, trend: 'down' },
                ].map((branch, i) => (
                  <div key={i} className="flex items-center justify-between group cursor-pointer hover:bg-slate-50 p-2 -m-2 rounded-2xl transition-all">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-black text-xs group-hover:bg-blue-600 group-hover:text-white transition-colors">
                           {i + 1}
                        </div>
                        <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">{branch.name}</span>
                     </div>
                     <div className="flex items-center gap-4">
                        <span className="text-sm font-black text-slate-800 tracking-tight">Rp {branch.rev}M</span>
                        <ChevronRight size={14} className="text-slate-300" />
                     </div>
                  </div>
                ))}
             </div>
          </div>
       </div>
    </div>
  );
};

const InventoryReport = () => {
   return (
      <div className="space-y-8 text-left">
         <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Stock Value</p>
               <h3 className="text-2xl font-black text-slate-800 tracking-tighter uppercase leading-none">Rp 12.4B</h3>
            </div>
            <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Turnover Ratio</p>
               <h3 className="text-2xl font-black text-blue-600 tracking-tighter uppercase leading-none">4.2x</h3>
            </div>
            <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Stock Accuracy</p>
               <h3 className="text-2xl font-black text-green-600 tracking-tighter uppercase leading-none">99.1%</h3>
            </div>
            <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Critical Stock</p>
               <h3 className="text-2xl font-black text-red-600 tracking-tighter uppercase leading-none">12 SKU</h3>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
            <div className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm">
               <h3 className="text-lg font-black text-slate-800 tracking-tight uppercase mb-8">Stock Value Trend</h3>
               <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                     <LineChart data={[
                        { name: 'Mon', val: 1200 }, { name: 'Tue', val: 1150 }, { name: 'Wed', val: 1300 },
                        { name: 'Thu', val: 1280 }, { name: 'Fri', val: 1400 }, { name: 'Sat', val: 1350 }, { name: 'Sun', val: 1320 }
                     ]}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                        <YAxis hide />
                        <Tooltip />
                        <Line type="monotone" dataKey="val" stroke="#2563eb" strokeWidth={4} dot={{ r: 4, fill: '#2563eb' }} />
                     </LineChart>
                  </ResponsiveContainer>
               </div>
            </div>

            <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white">
               <h3 className="text-lg font-black tracking-tight uppercase mb-8">Most Consumed Parts</h3>
               <div className="space-y-6">
                  {[
                     { name: 'Shell Helix HX8 5W-40', qty: 1250, pct: 85 },
                     { name: 'Denso Oil Filter', qty: 980, pct: 72 },
                     { name: 'Brake Pad Set Vios', qty: 420, pct: 45 },
                  ].map((part, i) => (
                     <div key={i} className="space-y-2">
                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                           <span className="text-slate-400">{part.name}</span>
                           <span className="text-blue-400">{part.qty} Unit</span>
                        </div>
                        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                           <div className="h-full bg-blue-500" style={{ width: `${part.pct}%` }}></div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </div>
   );
};

const SalesPerformanceReport = () => {
   return (
      <div className="space-y-8 text-left">
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Transactions</p>
               <h3 className="text-2xl font-black text-slate-800 tracking-tighter uppercase leading-none">1,240</h3>
            </div>
            <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Avg Ticket Size</p>
               <h3 className="text-2xl font-black text-blue-600 tracking-tighter uppercase leading-none">Rp 1.45M</h3>
            </div>
            <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm text-left">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Service vs Part</p>
               <div className="flex items-center gap-4 mt-2">
                  <div className="text-center">
                     <p className="text-xs font-black text-slate-800">40%</p>
                     <p className="text-[8px] font-bold text-slate-400">SRV</p>
                  </div>
                  <div className="w-px h-6 bg-slate-100"></div>
                  <div className="text-center">
                     <p className="text-xs font-black text-slate-800">60%</p>
                     <p className="text-[8px] font-bold text-slate-400">PRT</p>
                  </div>
               </div>
            </div>
            <div className="bg-blue-600 p-8 rounded-[2rem] text-white">
               <p className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-1">Monthly Growth</p>
               <h3 className="text-2xl font-black tracking-tighter uppercase leading-none">+22.4%</h3>
            </div>
         </div>

         <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm text-left min-h-[400px]">
            <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase mb-12">Performance by Service Type</h3>
            <div className="h-[350px]">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                     { name: 'General', rev: 450 }, { name: 'Engine', rev: 520 }, { name: 'Brake', rev: 310 },
                     { name: 'AC / Cooling', rev: 280 }, { name: 'Wiring', rev: 190 }, { name: 'Body', rev: 420 }
                  ]}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                     <YAxis hide />
                     <Tooltip />
                     <Bar dataKey="rev" fill="#2563eb" radius={[6, 6, 0, 0]} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>
      </div>
   );
};

const ProcurementReport = () => (
   <div className="space-y-8 text-left">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm col-span-2">
            <h3 className="text-lg font-black text-slate-800 tracking-tight uppercase mb-8">Supplier Fill Rate Analysis</h3>
            <div className="h-[300px]">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[
                     { name: 'Jan', rate: 92 }, { name: 'Feb', rate: 88 }, { name: 'Mar', rate: 95 },
                     { name: 'Apr', rate: 91 }, { name: 'May', rate: 94 }
                  ]}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                     <YAxis hide domain={[0, 100]} />
                     <Tooltip />
                     <Area type="monotone" dataKey="rate" stroke="#fbbf24" fill="#fbbf24" fillOpacity={0.1} strokeWidth={4} />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>
         <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <h3 className="text-lg font-black text-slate-800 tracking-tight uppercase mb-8">Lead Time Index</h3>
            <div className="space-y-8">
               {[
                  { label: 'Air Freight', time: '2-3 Days', val: 90 },
                  { label: 'Sea Freight', time: '14-20 Days', val: 40 },
                  { label: 'Local Pickup', time: 'SAME DAY', val: 100 },
               ].map((item, idx) => (
                  <div key={idx} className="space-y-3">
                     <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                        <span className="text-xs font-black text-slate-800">{item.time}</span>
                     </div>
                     <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500" style={{ width: `${item.val}%` }}></div>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>
   </div>
);

const OutstandingInvoiceReport = () => (
   <div className="space-y-8 text-left">
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
         <div className="p-10 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div>
               <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase">Aging Receivables Report</h3>
               <p className="text-xs text-slate-400 font-medium mt-1">Total Outstanding: Rp 1.54B</p>
            </div>
            <div className="flex items-center gap-2">
               <div className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Updated: Today 08:30
               </div>
            </div>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full">
               <thead className="bg-white border-b border-slate-50 sticky top-0">
                  <tr>
                     <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Customer Name</th>
                     <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Amount</th>
                     <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Due Date</th>
                     <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Aging Period</th>
                     <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {[
                     { name: 'PT Transportindo Sejahtera', amt: 45000000, due: '2026-05-15', age: '0-30 Days', color: 'bg-green-100 text-green-600' },
                     { name: 'Blue Bird Group Tbk', amt: 125000000, due: '2026-04-10', age: '31-60 Days', color: 'bg-amber-100 text-amber-600' },
                     { name: 'Mitra Adi Perkasa', amt: 15200000, due: '2026-02-28', age: '60+ Days', color: 'bg-red-100 text-red-600' },
                  ].map((inv, idx) => (
                     <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="px-8 py-6 font-black text-slate-800 uppercase tracking-tight">{inv.name}</td>
                        <td className="px-8 py-6 font-black text-slate-800 tracking-tight">Rp {inv.amt.toLocaleString()}</td>
                        <td className="px-8 py-6 text-xs text-slate-400 font-bold uppercase tracking-widest font-mono">{inv.due}</td>
                        <td className="px-8 py-6 text-center">
                           <span className="px-4 py-1.5 bg-slate-100 text-slate-600 rounded-xl text-[9px] font-black uppercase tracking-widest">{inv.age}</span>
                        </td>
                        <td className="px-8 py-6">
                           <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${inv.color}`}>Overdue</span>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
   </div>
);

export default ReportsView;
