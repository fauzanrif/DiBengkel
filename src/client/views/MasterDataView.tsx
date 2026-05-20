import React, { useState } from 'react';
import { 
  Database, 
  Package, 
  Building2, 
  Users, 
  Car, 
  MapPin, 
  Wrench,
  Search,
  Plus,
  Filter,
  MoreVertical,
  Download,
  Terminal,
  Grid,
  List as ListIcon,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const MasterDataView: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState('sparepart');
  
  const menuItems = [
    { id: 'sparepart', name: 'Sparepart Master', icon: Package, count: 1240 },
    { id: 'supplier', name: 'Supplier Master', icon: Building2, count: 45 },
    { id: 'customer', name: 'Customer Master', icon: Users, count: 850 },
    { id: 'vehicle', name: 'Vehicle Master', icon: Car, count: 1100 },
    { id: 'branch', name: 'Branch Master', icon: MapPin, count: 8 },
    { id: 'service', name: 'Service Type Master', icon: Wrench, count: 32 },
  ];

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Internal Navigation Sidebar */}
      <aside className="w-80 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-8 pb-4">
           <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase flex items-center gap-2 mb-2">
              <Database size={24} className="text-blue-600" /> Master Data
           </h2>
           <p className="text-xs text-slate-400 font-medium tracking-tight">Centralized system records and configurations.</p>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
           {menuItems.map(item => {
             const Icon = item.icon;
             return (
               <button 
                 key={item.id}
                 onClick={() => setActiveMenu(item.id)}
                 className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all group ${
                   activeMenu === item.id 
                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' 
                    : 'hover:bg-slate-50 text-slate-500 hover:text-slate-800'
                 }`}
               >
                 <div className="flex items-center gap-4">
                    <Icon size={18} className={activeMenu === item.id ? 'text-white' : 'text-slate-400 group-hover:text-blue-600'} />
                    <span className="text-sm font-black uppercase tracking-tight">{item.name}</span>
                 </div>
                 <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${
                   activeMenu === item.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'
                 }`}>
                   {item.count}
                 </span>
               </button>
             );
           })}
        </nav>

        <div className="p-6 bg-slate-50 border-t border-slate-100">
           <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <Terminal size={16} className="text-slate-400" />
              <div className="overflow-hidden">
                 <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest truncate">System Status: OK</p>
                 <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Last Sync: 2m ago</p>
              </div>
           </div>
        </div>
      </aside>

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto bg-slate-50/30">
        <AnimatePresence mode="wait">
           <motion.div
             key={activeMenu}
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             exit={{ opacity: 0, x: -20 }}
             transition={{ duration: 0.2 }}
             className="p-10 space-y-8"
           >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                 <div>
                    <div className="flex items-center gap-2 text-blue-600 mb-2">
                       <Database size={16} />
                       <span className="text-[10px] font-black uppercase tracking-[0.3em]">Core System Master</span>
                    </div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">{menuItems.find(m => m.id === activeMenu)?.name}</h2>
                 </div>

                 <div className="flex items-center gap-3">
                    <button className="p-3 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-slate-600 transition-colors">
                       <Download size={20} />
                    </button>
                    <button className="flex items-center gap-3 px-8 py-3.5 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10">
                       <Plus size={16} /> New Record
                    </button>
                 </div>
              </div>

              {/* Universal Master Data Table Interface */}
              <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden min-h-[600px]">
                 <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/30">
                    <div className="relative flex-1 max-w-md">
                       <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                       <input 
                          type="text" 
                          placeholder={`Search in ${menuItems.find(m => m.id === activeMenu)?.name}...`}
                          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-blue-500/10 outline-none"
                       />
                    </div>
                    <div className="flex items-center gap-3">
                       <div className="flex bg-slate-200/50 p-1 rounded-xl">
                          <button className="p-2 bg-white text-blue-600 rounded-lg shadow-sm"><ListIcon size={16} /></button>
                          <button className="p-2 text-slate-400 hover:text-slate-600"><Grid size={16} /></button>
                       </div>
                       <button className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-colors">
                          <Filter size={16} /> Filters
                       </button>
                    </div>
                 </div>

                 <DataList module={activeMenu} />
              </div>
           </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

const DataList = ({ module }: { module: string }) => {
   // Column definitions based on module
   const getColumns = () => {
      switch (module) {
         case 'sparepart':
            return ['Sparepart Code', 'Sparepart Name', 'Category', 'Price (Purchase / Sell)', 'Stock (Curr / Min)', 'Location'];
         case 'supplier':
            return ['Supplier Code', 'Supplier Name', 'Contact / Phone', 'Payment Term', 'Supplier Type', 'Address'];
         case 'customer':
            return ['Customer Code', 'Customer Name', 'Phone / Email', 'Customer Type', 'Discount (%)', 'Active Status'];
         case 'vehicle':
            return ['Plate Number', 'Model / Brand', 'Engine #', 'Chassis #', 'Customer Owner', 'Last Visit'];
         case 'branch':
            return ['Branch Code', 'Branch Name', 'Address', 'Manager', 'Phone', 'Operational'];
         case 'service':
            return ['Service Code', 'Service Name', 'Service Fee', 'Description', 'Category', 'EST Duration'];
         default:
            return ['Record Code', 'Description', 'Metadata', 'Pricing', 'Status'];
      }
   };

   const columns = getColumns();

   return (
      <div className="overflow-x-auto text-left">
         <table className="w-full border-collapse">
            <thead className="bg-white border-b border-slate-50 sticky top-0">
               <tr>
                  {columns.map(col => (
                     <th key={col} className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">{col}</th>
                  ))}
                  <th className="px-8 py-6"></th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
               {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
                     {module === 'sparepart' && (
                        <>
                           <td className="px-8 py-6 font-black text-slate-800 tracking-tight uppercase">OIL-2605-0{i}</td>
                           <td className="px-8 py-6 font-bold text-slate-600">TMO Engine Oil 5W-30 {i}L</td>
                           <td className="px-8 py-6 text-xs text-slate-400 font-bold uppercase tracking-widest">Lubricants</td>
                           <td className="px-8 py-6">
                              <p className="text-[10px] text-slate-400 font-bold line-through">Rp 125.000</p>
                              <p className="text-xs font-black text-slate-800">Rp 145.000</p>
                           </td>
                           <td className="px-8 py-6">
                              <span className="text-xs font-black text-blue-600">45 Unit</span>
                              <span className="text-[10px] text-slate-400 font-bold ml-2">/ 10 Min</span>
                           </td>
                           <td className="px-8 py-6 font-bold text-slate-400 uppercase tracking-widest">棚-A{i}</td>
                        </>
                     )}
                     {module === 'supplier' && (
                        <>
                           <td className="px-8 py-6 font-black text-slate-800 tracking-tight uppercase">SUP-2605-0{i}</td>
                           <td className="px-8 py-6 font-bold text-slate-600 uppercase">Astra Otoparts ID {i}</td>
                           <td className="px-8 py-6">
                              <p className="text-xs font-bold text-slate-600">Budi Santoso</p>
                              <p className="text-[10px] text-slate-400 font-bold">+62-812-445-{i}0</p>
                           </td>
                           <td className="px-8 py-6 text-xs font-black text-slate-600 tracking-tight uppercase">Net 30</td>
                           <td className="px-8 py-6">
                              <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[9px] font-black uppercase tracking-widest">Regular</span>
                           </td>
                           <td className="px-8 py-6 text-[10px] text-slate-400 font-bold line-clamp-1 max-w-[150px]">Jl. Industri Raya Blok A1 No. 5 Jakarta</td>
                        </>
                     )}
                     {module === 'customer' && (
                        <>
                           <td className="px-8 py-6 font-black text-slate-800 tracking-tight uppercase">CUST-2605-0{i}</td>
                           <td className="px-8 py-6 font-bold text-slate-600 uppercase">Fauzan Rifai {i}</td>
                           <td className="px-8 py-6">
                              <p className="text-xs font-bold text-slate-600">+62-856-224-00{i}</p>
                              <p className="text-[10px] text-slate-400 font-bold">fauzan{i}@gmail.com</p>
                           </td>
                           <td className="px-8 py-6">
                              <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-[9px] font-black uppercase tracking-widest">Fleet</span>
                           </td>
                           <td className="px-8 py-6 font-black text-slate-800">5.0%</td>
                           <td className="px-8 py-6">
                              <div className="flex items-center gap-2 text-green-600 px-3 py-1 bg-green-50 rounded-full w-fit">
                                 <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                 <span className="text-[9px] font-black uppercase tracking-widest">Active</span>
                              </div>
                           </td>
                        </>
                     )}
                     {module === 'vehicle' && (
                        <>
                           <td className="px-8 py-6 font-black text-slate-800 tracking-tight uppercase">B {1234+i} ABC</td>
                           <td className="px-8 py-6 font-bold text-slate-600 uppercase">Toyota Fortuner VRZ</td>
                           <td className="px-8 py-6 text-[10px] text-slate-400 font-bold uppercase tracking-widest">2GD-FTV-{i}23</td>
                           <td className="px-8 py-6 text-[10px] text-slate-400 font-bold uppercase tracking-widest">MHK-VRZ-{i}45</td>
                           <td className="px-8 py-6 font-bold text-blue-600 uppercase tracking-tight">Fauzan Rifai</td>
                           <td className="px-8 py-6 text-slate-400 font-bold uppercase tracking-widest text-[9px] whitespace-nowrap">2026-05-1{i}</td>
                        </>
                     )}
                     {module === 'branch' && (
                        <>
                           <td className="px-8 py-6 font-black text-slate-800 tracking-tight uppercase">BR-JKT-0{i}</td>
                           <td className="px-8 py-6 font-bold text-slate-600 uppercase tracking-tight">Jakarta Pusat Core {i}</td>
                           <td className="px-8 py-6 text-[10px] text-slate-400 font-bold line-clamp-1 max-w-[150px]">Jl. Pegangsaan Timur No. 56</td>
                           <td className="px-8 py-6 font-bold text-slate-600 uppercase text-[11px]">Hadi Santoso</td>
                           <td className="px-8 py-6 text-[10px] text-slate-400 font-bold">+62-021-123456</td>
                           <td className="px-8 py-6">
                              <div className="flex items-center gap-2 text-green-600 px-3 py-1 bg-green-50 rounded-full w-fit">
                                 <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                 <span className="text-[9px] font-black uppercase tracking-widest">Operational</span>
                              </div>
                           </td>
                        </>
                     )}
                     {module === 'service' && (
                        <>
                           <td className="px-8 py-6 font-black text-slate-800 tracking-tight uppercase">SRV-GEN-0{i}</td>
                           <td className="px-8 py-6 font-bold text-slate-600 uppercase tracking-tight">Full Engine Tuning {i}</td>
                           <td className="px-8 py-6 font-black text-slate-800">Rp {(250000 + i * 50000).toLocaleString()}</td>
                           <td className="px-8 py-6 text-[10px] text-slate-400 font-bold line-clamp-1 max-w-[150px]">Comprehensive engine health check and cleaning</td>
                           <td className="px-8 py-6 uppercase font-bold text-slate-400 text-[10px]">General Service</td>
                           <td className="px-8 py-6 font-black text-blue-600 text-xs whitespace-nowrap">120 Minutes</td>
                        </>
                     )}

                     {!['sparepart', 'supplier', 'customer', 'vehicle', 'branch', 'service'].includes(module) && (
                        <>
                           <td className="px-8 py-6 font-black text-slate-800 tracking-tight uppercase">REC-MSTR-0{i}</td>
                           <td className="px-8 py-6 font-bold text-slate-600 uppercase transition-colors group-hover:text-blue-600">Sample Record {i}</td>
                           <td className="px-8 py-6 text-slate-400 font-bold uppercase tracking-widest text-[9px]">General Metadata</td>
                           <td className="px-8 py-6 font-black text-slate-800">Rp 0</td>
                           <td className="px-8 py-6">
                              <div className="flex items-center gap-2 text-slate-400 px-3 py-1 bg-slate-50 rounded-full w-fit">
                                 <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                                 <span className="text-[9px] font-black uppercase tracking-widest">Pending</span>
                              </div>
                           </td>
                        </>
                     )}

                     <td className="px-8 py-6 text-right">
                        <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-300 hover:text-slate-800">
                           <MoreVertical size={18} />
                        </button>
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>
   )
}

export default MasterDataView;
