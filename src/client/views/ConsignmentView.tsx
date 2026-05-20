import React, { useState } from 'react';
import { 
  Layers, 
  RefreshCw, 
  Calculator, 
  BarChart, 
  Search, 
  Filter, 
  ArrowRightLeft,
  Calendar,
  ChevronRight,
  TrendingDown,
  Building2,
  Box,
  Truck,
  MoreVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const ConsignmentView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'stock' | 'usage' | 'settlement'>('stock');
  
  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Consignment Partner Portal</h1>
          <p className="text-slate-500 text-sm font-medium">Manage supplier-owned inventory and settlement workflows.</p>
        </div>
        
        <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-200">
          <button 
            onClick={() => setActiveTab('stock')}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
              activeTab === 'stock' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Box size={14} /> Partner Stock
          </button>
          <button 
            onClick={() => setActiveTab('usage')}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
              activeTab === 'usage' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <RefreshCw size={14} /> Usage Log
          </button>
          <button 
            onClick={() => setActiveTab('settlement')}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
              activeTab === 'settlement' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calculator size={14} /> Settlements
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'stock' && <PartnerStockModule />}
          {activeTab === 'usage' && <UsageModule />}
          {activeTab === 'settlement' && <SettlementModule />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const PartnerStockModule = () => {
  return (
    <div className="space-y-6 text-left">
      <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
           <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Search Sparepart or Supplier..." className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 outline-none" />
           </div>
        </div>
        <button className="flex items-center gap-2 px-8 py-3.5 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20">
           <Box size={16} /> Add Consignment Stock
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden text-left min-h-[400px]">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-100 uppercase">
             <tr>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 tracking-widest">Sparepart Code</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 tracking-widest">Sparepart Name</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 tracking-widest">Supplier Name</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 tracking-widest text-center">Stock Balance</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 tracking-widest">Last Withdrawal</th>
                <th className="px-8 py-5"></th>
             </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
             {[
               { code: 'OIL-SHELL-540', name: 'Shell Helix HX8 5W-40', supplier: 'Shell Indonesia', stock: 120, lastWithdraw: '2026-05-18' },
               { code: 'FIL-DENSO-001', name: 'Denso Oil Filter', supplier: 'Denso Indonesia', stock: 450, lastWithdraw: '2026-05-19' },
             ].map(item => (
               <tr key={item.code} className="hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-5 font-black text-slate-800 uppercase tracking-tight">{item.code}</td>
                  <td className="px-8 py-5 font-bold text-slate-600">{item.name}</td>
                  <td className="px-8 py-5 font-bold text-blue-600">{item.supplier}</td>
                  <td className="px-8 py-5 text-center">
                     <span className={`px-4 py-1.5 rounded-xl font-black ${item.stock < 100 ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
                        {item.stock} Unit
                     </span>
                  </td>
                  <td className="px-8 py-5 text-slate-400 font-bold uppercase tracking-widest">{item.lastWithdraw}</td>
                  <td className="px-8 py-5 text-right">
                     <button className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-colors">Withdraw Item</button>
                  </td>
               </tr>
             ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const UsageModule = () => {
   return (
    <div className="space-y-6 text-left">
      <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
           <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Search Usage Reference or Sparepart..." className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 outline-none" />
           </div>
        </div>
        <button className="flex items-center gap-2 px-8 py-3.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10">
           Manual Usage Entry
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden text-left min-h-[400px]">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-100 uppercase">
             <tr>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 tracking-widest">Usage Date</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 tracking-widest">Sparepart</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 tracking-widest">Qty Used</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 tracking-widest">Ref Sales Invoice</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 tracking-widest">Status</th>
                <th className="px-8 py-5"></th>
             </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
             {[
               { date: '2026-05-19 14:20', part: 'Shell Helix HX8 5W-40', qty: 4, inv: 'INV-2605-101', status: 'Used' },
               { date: '2026-05-18 10:45', part: 'Denso Oil Filter', qty: 1, inv: 'INV-2605-098', status: 'Settled' },
             ].map((usage, i) => (
               <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-5 text-slate-500 font-bold uppercase tracking-widest">{usage.date}</td>
                  <td className="px-8 py-5 font-black text-slate-800 uppercase tracking-tight">{usage.part}</td>
                  <td className="px-8 py-5 font-black text-slate-600">{usage.qty} Unit</td>
                  <td className="px-8 py-5 font-black text-blue-600">{usage.inv}</td>
                  <td className="px-8 py-5">
                     <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                       usage.status === 'Settled' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
                     }`}>
                       {usage.status}
                     </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                     <button className="text-slate-300 hover:text-slate-800 transition-colors"><MoreVertical size={16} /></button>
                  </td>
               </tr>
             ))}
          </tbody>
        </table>
      </div>
    </div>
   );
};

const SettlementModule = () => {
   return (
    <div className="space-y-6 text-left">
      <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
           <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Search Settlement Number or Supplier..." className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 outline-none" />
           </div>
        </div>
        <button className="flex items-center gap-2 px-8 py-3.5 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20">
           <Calculator size={16} /> New Settlement Run
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden text-left min-h-[400px]">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-100 uppercase">
             <tr>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 tracking-widest">Settlement No</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 tracking-widest">Date</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 tracking-widest">Supplier</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 tracking-widest text-right">Total Amount</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 tracking-widest text-center">Status</th>
                <th className="px-8 py-5"></th>
             </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-left">
             {[
               { id: 'SETL-2605-01', date: '2026-05-15', supplier: 'Shell Indonesia', total: 18500200, status: 'Paid' },
               { id: 'SETL-2605-02', date: '2026-05-19', supplier: 'Denso Indonesia', total: 4200000, status: 'Draft' },
             ].map(stl => (
               <tr key={stl.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-5 font-black text-slate-800">{stl.id}</td>
                  <td className="px-8 py-5 font-bold text-slate-400 uppercase tracking-widest">{stl.date}</td>
                  <td className="px-8 py-5 font-bold text-blue-600">{stl.supplier}</td>
                  <td className="px-8 py-5 text-right font-black text-slate-800 tracking-tight">Rp {stl.total.toLocaleString()}</td>
                  <td className="px-8 py-5 text-center">
                     <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                       stl.status === 'Paid' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-600'
                     }`}>
                       {stl.status}
                     </span>
                  </td>
                  <td className="px-8 py-5 text-right font-black">
                     <button className="text-slate-300 hover:text-slate-800 transition-colors"><MoreVertical size={16} /></button>
                  </td>
               </tr>
             ))}
          </tbody>
        </table>
      </div>
    </div>
   );
};

export default ConsignmentView;
