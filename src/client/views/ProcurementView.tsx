import React, { useState } from 'react';
import { 
  Truck, 
  FilePlus, 
  ClipboardCheck, 
  Box, 
  Building2, 
  Search, 
  Plus, 
  Filter,
  MoreVertical,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  ArrowRight,
  Trash2,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const ProcurementView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pr' | 'po' | 'gr' | 'suppliers'>('pr');
  
  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Procurement Workflow</h1>
          <p className="text-slate-500 text-sm font-medium">Manage purchase requests, orders, and goods receiving.</p>
        </div>
        
        <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-200 overflow-x-auto no-scrollbar">
          <button 
            onClick={() => setActiveTab('pr')}
            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'pr' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FilePlus size={14} /> Request (PR)
          </button>
          <button 
            onClick={() => setActiveTab('po')}
            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'po' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ClipboardCheck size={14} /> Orders (PO)
          </button>
          <button 
            onClick={() => setActiveTab('gr')}
            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'gr' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Box size={14} /> Receipt (GRN)
          </button>
          <button 
            onClick={() => setActiveTab('suppliers')}
            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'suppliers' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 size={14} /> Suppliers
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
          {activeTab === 'pr' && <PRModule />}
          {activeTab === 'po' && <POModule />}
          {activeTab === 'gr' && <GRModule />}
          {activeTab === 'suppliers' && <SupplierModule />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const PRModule = () => {
  const [showForm, setShowForm] = useState(false);
  
  return (
    <div className="space-y-6 text-left">
      <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
           <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Search PR Number, Branch, or Supplier..." className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 outline-none" />
           </div>
           <div className="flex items-center gap-3">
              <select className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 outline-none">
                 <option>All Status</option>
                 <option>Waiting Approval</option>
                 <option>Approved</option>
                 <option>Rejected</option>
              </select>
           </div>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-8 py-3.5 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20">
           <Plus size={16} /> Create Purchase Request
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-100 uppercase">
             <tr>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 tracking-widest">PR Number</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 tracking-widest">Request Date</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 tracking-widest">Branch</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 tracking-widest">Requester</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 tracking-widest">Supplier</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 tracking-widest">Status</th>
                <th className="px-8 py-5"></th>
             </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
             {[
               { id: 'PR-2605-001', date: '2026-05-18', branch: 'Jakarta Pusat', reqBy: 'Dedi Kurniawan', supplier: 'Astra Otoparts', status: 'Approved' },
               { id: 'PR-2605-002', date: '2026-05-19', branch: 'Bandung Timur', reqBy: 'Siti Aminah', supplier: 'Shell Indonesia', status: 'Waiting Approval' },
             ].map(pr => (
               <tr key={pr.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-5 font-black text-slate-800">{pr.id}</td>
                  <td className="px-8 py-5 text-slate-500 font-bold">{pr.date}</td>
                  <td className="px-8 py-5 text-slate-600 font-bold">{pr.branch}</td>
                  <td className="px-8 py-5 text-slate-500">{pr.reqBy}</td>
                  <td className="px-8 py-5 font-bold text-slate-600">{pr.supplier}</td>
                  <td className="px-8 py-5">
                     <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                       pr.status === 'Approved' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
                     }`}>
                       {pr.status}
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

      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-8">
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="bg-white rounded-[3rem] w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
               <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">New Purchase Request</h3>
                  <button onClick={() => setShowForm(false)} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all">
                     <Plus size={20} className="rotate-45" />
                  </button>
               </div>
               
               <div className="flex-1 overflow-y-auto p-10 space-y-12">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">PR Number</label>
                        <input type="text" value="PR-2605-003" readOnly className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-xs font-bold text-slate-400 outline-none" />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Request Date</label>
                        <input type="date" defaultValue="2026-05-19" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-xs font-bold text-slate-600 outline-none" />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Branch</label>
                        <select className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-xs font-bold text-slate-600 outline-none">
                           <option>Jakarta Pusat</option>
                           <option>Bandung Timur</option>
                        </select>
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Requested By</label>
                        <input type="text" defaultValue="Dedi Kurniawan" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-xs font-bold text-slate-600 outline-none" />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Supplier</label>
                        <select className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-xs font-bold text-slate-600 outline-none">
                           <option>PT Astra Otoparts</option>
                           <option>Shell Indonesia</option>
                        </select>
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Notes</label>
                        <input type="text" placeholder="Additional instructions..." className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-xs font-bold text-slate-600 outline-none" />
                     </div>
                  </div>

                  <div className="space-y-6">
                     <div className="flex items-center justify-between">
                        <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">Requested Items</h4>
                        <button className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Search Sparepart</button>
                     </div>
                     <div className="bg-slate-50 rounded-[2rem] border border-slate-100 overflow-hidden">
                        <table className="w-full text-left">
                           <thead className="bg-white/50 border-b border-slate-100 uppercase">
                              <tr>
                                 <th className="px-6 py-4 text-[9px] font-black text-slate-400 tracking-widest">Sparepart</th>
                                 <th className="px-6 py-4 text-[9px] font-black text-slate-400 tracking-widest">Req Qty</th>
                                 <th className="px-6 py-4 text-[9px] font-black text-slate-400 tracking-widest">Unit</th>
                                 <th className="px-6 py-4 text-[9px] font-black text-slate-400 tracking-widest">Cur Stock</th>
                                 <th className="px-6 py-4 text-[9px] font-black text-slate-400 tracking-widest">Min Stock</th>
                                 <th className="px-6 py-4 text-[9px] font-black text-slate-400 tracking-widest">Notes</th>
                                 <th className="px-6 py-4"></th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-100">
                              <tr>
                                 <td className="px-6 py-5">
                                    <p className="text-xs font-black text-slate-800 uppercase tracking-tight">TMO Engine Oil 5W-30</p>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">OIL-00124</p>
                                 </td>
                                 <td className="px-6 py-5"><input type="number" defaultValue="24" className="w-16 bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-black outline-none" /></td>
                                 <td className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase">Litre</td>
                                 <td className="px-6 py-5 text-xs font-black text-amber-600">5</td>
                                 <td className="px-6 py-5 text-xs font-black text-slate-400">10</td>
                                 <td className="px-6 py-5"><input type="text" placeholder="..." className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs outline-none" /></td>
                                 <td className="px-6 py-5 text-right"><button className="text-slate-300 hover:text-red-500"><Trash2 size={16} /></button></td>
                              </tr>
                           </tbody>
                        </table>
                     </div>
                  </div>
               </div>

               <div className="p-8 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
                  <button onClick={() => setShowForm(false)} className="px-8 py-3.5 text-slate-400 hover:text-slate-800 text-[10px] font-black uppercase tracking-widest transition-colors">Cancel Request</button>
                  <button className="px-10 py-3.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10">Save as Draft</button>
                  <button className="px-10 py-3.5 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20">Submit for Approval</button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const POModule = () => {
  return (
    <div className="space-y-6 text-left">
      <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
           <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Search PO Number or Supplier..." className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 outline-none" />
           </div>
        </div>
        <button className="flex items-center gap-2 px-8 py-3.5 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20">
           <Plus size={16} /> New Purchase Order
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-100 uppercase">
             <tr>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 tracking-widest">PO Number</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 tracking-widest">Supplier</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 tracking-widest">Deliv Date</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 tracking-widest">Tax (11%)</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 tracking-widest">Total</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 tracking-widest">Status</th>
                <th className="px-8 py-5"></th>
             </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
             {[
               { id: 'PO-2605-001', supplier: 'Astra Otoparts', deliv: '2026-05-25', tax: 1375000, total: 13875000, status: 'Approved' },
               { id: 'PO-2605-002', supplier: 'Shell Indonesia', deliv: '2026-05-22', tax: 450000, total: 4545000, status: 'Partial Receive' },
             ].map(po => (
               <tr key={po.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-5 font-black text-slate-800">{po.id}</td>
                  <td className="px-8 py-5 font-bold text-slate-600">{po.supplier}</td>
                  <td className="px-8 py-5 text-slate-500 font-bold uppercase">{po.deliv}</td>
                  <td className="px-8 py-5 text-slate-500">Rp {po.tax.toLocaleString()}</td>
                  <td className="px-8 py-5 font-black text-slate-800">Rp {po.total.toLocaleString()}</td>
                  <td className="px-8 py-5">
                     <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                       po.status === 'Approved' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                     }`}>
                       {po.status}
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

const GRModule = () => {
   return (
    <div className="space-y-6 text-left">
      <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
           <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Search GR Number or PO Reference..." className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 outline-none" />
           </div>
        </div>
        <button className="flex items-center gap-2 px-8 py-3.5 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20">
           <Box size={16} /> Process Goods Receipt
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-100 uppercase">
             <tr>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 tracking-widest">GR Number</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 tracking-widest">PO Reference</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 tracking-widest">Supplier</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 tracking-widest">Recv Date</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 tracking-widest">Warehouse</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 tracking-widest">Status</th>
                <th className="px-8 py-5"></th>
             </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
             {[
               { id: 'GR-2605-001', po: 'PO-2605-001', supplier: 'Astra Otoparts', date: '2026-05-19', wh: 'WH-CENTRAL', status: 'Completed' },
               { id: 'GR-2605-002', po: 'PO-2605-002', supplier: 'Shell Indonesia', date: '2026-05-19', wh: 'WH-TRANSIT', status: 'Partial Receive' },
             ].map(gr => (
               <tr key={gr.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-5 font-black text-slate-800">{gr.id}</td>
                  <td className="px-8 py-5 font-black text-blue-600">{gr.po}</td>
                  <td className="px-8 py-5 font-bold text-slate-600">{gr.supplier}</td>
                  <td className="px-8 py-5 text-slate-500 font-bold uppercase">{gr.date}</td>
                  <td className="px-8 py-5 text-slate-500 font-bold uppercase">{gr.wh}</td>
                  <td className="px-8 py-5">
                     <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                       gr.status === 'Completed' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                     }`}>
                       {gr.status}
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

const SupplierModule = () => {
  const [showForm, setShowForm] = useState(false);
  const suppliers = [
    { code: 'SUP-001', name: 'PT Astra Otoparts', contact: 'Budi Santoso', phone: '+62 21 4603550', type: 'Regular', term: '30 Days', status: 'Active' },
    { code: 'SUP-002', name: 'Denso Indonesia', contact: 'Henny Wang', phone: '+62 21 8980300', type: 'Consignment', term: '15 Days', status: 'Active' },
    { code: 'SUP-003', name: 'Shell Lubricants ID', contact: 'Reza Fahlevi', phone: '+62 21 2145321', type: 'Regular', term: 'Net 7', status: 'Active' },
  ];

  return (
    <div className="space-y-6 text-left">
      <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
           <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Search Supplier Name, Code or Type..." className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 outline-none" />
           </div>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-8 py-3.5 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20">
           <Plus size={16} /> Add New Supplier
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {suppliers.map(sup => (
            <div key={sup.code} className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm hover:border-blue-500 transition-all group">
               <div className="flex items-center justify-between mb-8">
                  <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                    sup.type === 'Consignment' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {sup.type}
                  </div>
                  <MoreVertical size={18} className="text-slate-300 group-hover:text-slate-800 transition-colors" />
               </div>
               
               <h4 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-1">{sup.name}</h4>
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-6">{sup.code}</p>
               
               <div className="space-y-4">
                  <div className="flex items-center gap-3">
                     <User size={16} className="text-slate-400" />
                     <span className="text-xs font-bold text-slate-600">{sup.contact}</span>
                  </div>
                  <div className="flex items-center gap-3">
                     <ClipboardCheck size={16} className="text-slate-400" />
                     <span className="text-xs font-bold text-slate-600">Term: {sup.term}</span>
                  </div>
                  <div className="flex items-center gap-3">
                     <Building2 size={16} className="text-slate-400" />
                     <span className="text-xs font-bold text-slate-600">{sup.phone}</span>
                  </div>
               </div>

               <div className="pt-8 mt-8 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-green-500"></div>
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{sup.status}</span>
                  </div>
                  <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">Edit Partner</button>
               </div>
            </div>
         ))}
      </div>

      <AnimatePresence>
         {showForm && (
           <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-8">
             <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="bg-white rounded-[3rem] w-full max-w-4xl shadow-2xl overflow-hidden"
             >
                <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                   <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Supplier Onboarding</h3>
                   <button onClick={() => setShowForm(false)} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all">
                      <Plus size={20} className="rotate-45" />
                   </button>
                </div>
                
                <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8 overflow-y-auto max-h-[70vh]">
                   <div className="space-y-6">
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Supplier Code</label>
                         <input type="text" placeholder="Generate Automatically..." className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-xs font-bold text-slate-600 outline-none focus:ring-4 focus:ring-blue-500/10" />
                      </div>
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Supplier Name</label>
                         <input type="text" placeholder="PT Example Indonesia" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-xs font-bold text-slate-600 outline-none focus:ring-4 focus:ring-blue-500/10" />
                      </div>
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Person</label>
                         <input type="text" placeholder="Full Name" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-xs font-bold text-slate-600 outline-none focus:ring-4 focus:ring-blue-500/10" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                            <input type="text" placeholder="+62..." className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-xs font-bold text-slate-600 outline-none focus:ring-4 focus:ring-blue-500/10" />
                         </div>
                         <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                            <input type="email" placeholder="sales@example.com" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-xs font-bold text-slate-600 outline-none focus:ring-4 focus:ring-blue-500/10" />
                         </div>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Address</label>
                         <textarea placeholder="Complete street address..." className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-xs font-bold text-slate-600 outline-none h-32 resize-none h-[126px]"></textarea>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Payment Term</label>
                            <select className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-xs font-bold text-slate-600 outline-none">
                               <option>Net 7</option>
                               <option>Net 15</option>
                               <option>Net 30</option>
                               <option>COD</option>
                            </select>
                         </div>
                         <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Supplier Type</label>
                            <select className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-xs font-bold text-slate-600 outline-none">
                               <option>Regular</option>
                               <option>Consignment</option>
                            </select>
                         </div>
                      </div>
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tax Registration (NPWP)</label>
                         <input type="text" placeholder="00.000.000.0-000.000" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-xs font-bold text-slate-600 outline-none" />
                      </div>
                   </div>
                </div>

                <div className="p-8 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
                   <button onClick={() => setShowForm(false)} className="px-8 py-3.5 text-slate-400 hover:text-red-500 text-[10px] font-black uppercase tracking-widest transition-colors">Discard</button>
                   <button className="px-12 py-3.5 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20">Register Supplier</button>
                </div>
             </motion.div>
           </div>
         )}
      </AnimatePresence>
    </div>
  )
}


export default ProcurementView;
