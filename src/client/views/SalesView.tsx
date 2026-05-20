import React, { useState } from 'react';
import { 
  ShoppingCart, 
  History, 
  FileText, 
  Search, 
  Plus, 
  Trash2, 
  CreditCard, 
  User, 
  Filter,
  Download,
  MoreVertical,
  CheckCircle2,
  Clock,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const SalesView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pos' | 'invoices' | 'history'>('pos');
  const [showPOSForm, setShowPOSForm] = useState(false);
  
  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Sales Management</h1>
          <p className="text-slate-500 text-sm font-medium">Manage sparepart sales, invoices, and transaction history.</p>
        </div>
        
        <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-200">
          <button 
            onClick={() => setActiveTab('pos')}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
              activeTab === 'pos' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShoppingCart size={14} /> Sparepart Sales
          </button>
          <button 
            onClick={() => setActiveTab('invoices')}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
              activeTab === 'invoices' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText size={14} /> Sales Invoice
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
              activeTab === 'history' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <History size={14} /> Sales History
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
          {activeTab === 'pos' && <POSModule />}
          {activeTab === 'invoices' && <InvoicesModule />}
          {activeTab === 'history' && <HistoryModule />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const POSModule = () => {
  const [cart, setCart] = useState<any[]>([
    { id: '1', code: 'OIL-TMO-530', name: 'TMO 5W-30 Engine Oil', location: '棚-A1', stock: 45, qty: 2, unit: 'Litre', price: 165000, discount: 5000, subtotal: 320000 },
  ]);
  const [customerInfo, setCustomerInfo] = useState({
    invoiceNum: 'INV/2026/05/1024',
    branch: 'Jakarta Pusat',
    date: '2026-05-19',
    name: '',
    type: 'Regular',
    payment: 'Cash',
    salesperson: 'Dedi Kurniawan',
    memo: ''
  });

  const addToCart = (product: any) => {
    setCart([...cart, { ...product, qty: 1, discount: 0, subtotal: product.price }]);
  };

  const updateCartItem = (id: string, field: string, value: any) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newItem = { ...item, [field]: value };
        if (field === 'qty' || field === 'price' || field === 'discount') {
          const qty = field === 'qty' ? value : item.qty;
          const price = field === 'price' ? value : item.price;
          const discount = field === 'discount' ? value : item.discount;
          newItem.subtotal = (qty * price) - discount;
        }
        return newItem;
      }
      return item;
    }));
  };

  const totalItems = cart.length;
  const totalQty = cart.reduce((acc, item) => acc + Number(item.qty), 0);
  const grossTotal = cart.reduce((acc, item) => acc + (item.qty * item.price), 0);
  const discountTotal = cart.reduce((acc, item) => acc + Number(item.discount), 0);
  const grandTotal = grossTotal - discountTotal;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-8 space-y-6">
        {/* Header Form */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
               <FileText size={18} />
            </div>
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Header Information</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-1.5">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Invoice Number</label>
               <input type="text" value={customerInfo.invoiceNum} readOnly className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold text-slate-400 outline-none cursor-not-allowed" />
            </div>
            <div className="space-y-1.5">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Branch</label>
               <select className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold text-slate-600 outline-none">
                  <option>Jakarta Pusat</option>
                  <option>Bandung Timur</option>
               </select>
            </div>
            <div className="space-y-1.5">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sales Date</label>
               <input type="date" defaultValue={customerInfo.date} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold text-slate-600 outline-none" />
            </div>
            <div className="space-y-1.5">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Payment Method</label>
               <select className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold text-slate-600 outline-none">
                  <option>Cash</option>
                  <option>Bank Transfer</option>
                  <option>Credit Card</option>
                  <option>QRIS</option>
               </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="space-y-1.5">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Customer Name</label>
               <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input type="text" placeholder="Search customer..." className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 outline-none" />
               </div>
            </div>
            <div className="space-y-1.5">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Customer Type</label>
               <select className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold text-slate-600 outline-none">
                  <option>Regular</option>
                  <option>Fleet / Corporate</option>
                  <option>Member</option>
               </select>
            </div>
            <div className="space-y-1.5">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Salesperson</label>
               <input type="text" defaultValue={customerInfo.salesperson} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold text-slate-600 outline-none" />
            </div>
          </div>
        </div>

        {/* Item Detail Table */}
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Sparepart Items</h3>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/10">
               <Plus size={14} /> Add Item
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Sparepart Code/Name</th>
                  <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Loc</th>
                  <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Stock</th>
                  <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Qty</th>
                  <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Unit</th>
                  <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Price</th>
                  <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Disc</th>
                  <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Subtotal</th>
                  <th className="px-6 py-4 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cart.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                       <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{item.name}</p>
                       <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{item.code}</p>
                    </td>
                    <td className="px-6 py-4">
                       <span className="text-[10px] font-black text-slate-500">{item.location}</span>
                    </td>
                    <td className="px-6 py-4">
                       <span className="text-[10px] font-black text-green-600">{item.stock}</span>
                    </td>
                    <td className="px-6 py-4">
                       <input 
                         type="number" 
                         value={item.qty} 
                         onChange={(e) => updateCartItem(item.id, 'qty', e.target.value)}
                         className="w-16 bg-slate-50 border border-slate-100 rounded-lg px-2 py-1 text-xs font-bold text-slate-800 outline-none" 
                       />
                    </td>
                    <td className="px-6 py-4">
                       <span className="text-[10px] font-black text-slate-500 uppercase">{item.unit}</span>
                    </td>
                    <td className="px-6 py-4">
                       <input 
                         type="number" 
                         value={item.price} 
                         onChange={(e) => updateCartItem(item.id, 'price', e.target.value)}
                         className="w-24 bg-slate-50 border border-slate-100 rounded-lg px-2 py-1 text-xs font-bold text-slate-800 outline-none" 
                       />
                    </td>
                    <td className="px-6 py-4">
                       <input 
                         type="number" 
                         value={item.discount} 
                         onChange={(e) => updateCartItem(item.id, 'discount', e.target.value)}
                         className="w-20 bg-slate-50 border border-slate-100 rounded-lg px-2 py-1 text-xs font-bold text-slate-800 outline-none" 
                       />
                    </td>
                    <td className="px-6 py-4 text-right">
                       <span className="text-xs font-black text-slate-800 tabular-nums">Rp {item.subtotal.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button className="text-slate-300 hover:text-red-500 transition-colors">
                          <Trash2 size={16} />
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="lg:col-span-4 space-y-6">
        <div className="bg-[#1E293B] p-8 rounded-[2.5rem] text-white shadow-2xl shadow-slate-900/20">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm font-black uppercase tracking-widest text-blue-400">Transaction Summary</h3>
              <div className="px-3 py-1 bg-white/10 rounded-full text-[9px] font-black uppercase tracking-widest">Draft</div>
           </div>
           
           <div className="space-y-4">
              <div className="flex items-center justify-between">
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Items / Qty</span>
                 <span className="text-xs font-black">{totalItems} SKU / {totalQty} Unit</span>
              </div>
              <div className="flex items-center justify-between">
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gross Total</span>
                 <span className="text-xs font-black">Rp {grossTotal.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Discount Total</span>
                 <span className="text-xs font-black text-red-400">- Rp {discountTotal.toLocaleString()}</span>
              </div>
              <div className="pt-6 border-t border-slate-700 flex items-center justify-between">
                 <span className="text-xs font-black uppercase tracking-tight">Grand Total</span>
                 <span className="text-3xl font-black text-blue-400 tracking-tighter">Rp {grandTotal.toLocaleString()}</span>
              </div>
           </div>

           <div className="mt-10 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                 <button className="py-4 bg-white/5 border border-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                    Save Draft
                 </button>
                 <button className="py-4 bg-white/5 border border-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                    Print Preview
                 </button>
              </div>
              <button className="w-full py-5 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-xl shadow-blue-500/20">
                 Complete & Submit
              </button>
              <button className="w-full py-3 text-slate-400 hover:text-red-400 text-[10px] font-black uppercase tracking-widest transition-colors">
                 Discard Transaction
              </button>
           </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Transaction Notes</label>
           <textarea 
             placeholder="Add internal notes or customer requests..."
             className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold text-slate-600 outline-none h-32 resize-none"
           ></textarea>
        </div>
      </div>
    </div>
  );
};

const InvoicesModule = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
           <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Search by Invoice No or Customer..." className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 outline-none" />
           </div>
           <div className="flex items-center gap-3">
              <select className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 outline-none">
                 <option>All Status</option>
                 <option>Unpaid</option>
                 <option>Paid</option>
                 <option>Cancelled</option>
              </select>
              <button className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 hover:text-slate-800 transition-colors">
                 <Filter size={18} />
              </button>
           </div>
        </div>
        <button className="flex items-center gap-2 px-8 py-3.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10">
           Manual Invoice Entry
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden text-left">
        <table className="w-full">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Invoice Number</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Grand Total</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              <th className="px-8 py-5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-600 font-medium">
            {[
              { id: 'INV/2026/05/201', date: '2026-05-18', customer: 'PT Berkah Tech', total: 5400000, pMethod: 'Transfer', status: 'Paid' },
              { id: 'INV/2026/05/202', date: '2026-05-18', customer: 'Jane Smith', total: 1250000, pMethod: 'Cash', status: 'Unpaid' },
              { id: 'INV/2026/05/203', date: '2026-05-17', customer: 'Budi Santoso', total: 89000, pMethod: 'QRIS', status: 'Paid' },
            ].map(inv => (
              <tr key={inv.id} className="hover:bg-slate-50 group cursor-pointer transition-colors">
                <td className="px-8 py-5 font-black text-slate-800">{inv.id}</td>
                <td className="px-8 py-5 uppercase">{inv.date}</td>
                <td className="px-8 py-5 font-bold">{inv.customer}</td>
                <td className="px-8 py-5 font-black text-slate-800">Rp {inv.total.toLocaleString()}</td>
                <td className="px-8 py-5 uppercase font-bold text-slate-400">{inv.pMethod}</td>
                <td className="px-8 py-5">
                   <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest w-fit ${
                     inv.status === 'Paid' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
                   }`}>
                     {inv.status}
                   </div>
                </td>
                <td className="px-8 py-5 text-right">
                   <button className="text-slate-300 hover:text-slate-800 transition-colors">
                      <MoreVertical size={16} />
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const HistoryModule = () => {
  return (
    <div className="space-y-6">
       <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-1.5">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date Range</label>
             <input type="text" placeholder="Select dates..." className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold text-slate-600 outline-none" />
          </div>
          <div className="space-y-1.5">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Branch</label>
             <select className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold text-slate-600 outline-none">
                <option>All Branches</option>
                <option>Jakarta Pusat</option>
             </select>
          </div>
          <div className="space-y-1.5">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Customer</label>
             <input type="text" placeholder="Filter customer..." className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold text-slate-600 outline-none" />
          </div>
          <div className="flex items-end">
             <button className="w-full bg-slate-900 text-white rounded-xl py-3 text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all">
                Run Filter
             </button>
          </div>
       </div>

       <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden text-left">
        <table className="w-full">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Invoice Number</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Status</th>
              <th className="px-8 py-5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {[1, 2, 3, 4, 5].map(i => (
              <tr key={i} className="hover:bg-slate-50 transition-colors">
                <td className="px-8 py-5 font-black text-slate-800 uppercase tracking-tight">INV/2026/05/20{i}</td>
                <td className="px-8 py-5 font-bold text-slate-600">Global Customer Service {i}</td>
                <td className="px-8 py-5 text-slate-400 font-bold uppercase">2026-05-{10+i}</td>
                <td className="px-8 py-5 font-black text-slate-800">Rp 1.450.000</td>
                <td className="px-8 py-5">
                   <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle2 size={14} />
                      <span className="font-black uppercase tracking-widest text-[9px]">Settled</span>
                   </div>
                </td>
                <td className="px-8 py-5 text-right">
                   <button className="text-[10px] font-black uppercase text-blue-600 hover:underline">View History</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
       </div>
    </div>
  );
};

export default SalesView;
