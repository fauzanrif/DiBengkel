import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  Clock, 
  Receipt, 
  ArrowRight, 
  DollarSign, 
  Printer, 
  Calendar,
  Send,
  CreditCard,
  X
} from 'lucide-react';

const BillingView: React.FC = () => {
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const [invoiceDiscount, setInvoiceDiscount] = useState({
    type: null as string | null,
    value: 0
  });

  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    method: 'cash',
    accountId: '',
    reference: ''
  });

  const finalEstimatedTotal = useMemo(() => {
    if (!selectedOrder) return 0;
    const base = Number(selectedOrder.estimatedTotal);
    if (!invoiceDiscount.type) return base;
    
    if (invoiceDiscount.type === 'percentage') {
        return base - (base * (invoiceDiscount.value / 100));
    } else {
        return base - invoiceDiscount.value;
    }
  }, [selectedOrder, invoiceDiscount]);

  const isOverdue = (date: any) => {
    return new Date(date) < new Date() && date !== null;
  };

  const totalRevenue = useMemo(() => {
    return invoices.reduce((sum, inv) => {
        const paid = inv.payments?.reduce((s: number, p: any) => s + Number(p.amount), 0) || 0;
        return sum + paid;
    }, 0);
  }, [invoices]);

  const fetchBillingData = async () => {
    try {
      const [pRes, iRes, aRes] = await Promise.all([
        fetch('/api/billing/pending'),
        fetch('/api/billing/invoices'),
        fetch('/api/billing/accounts')
      ]);
      if (pRes.ok) setPendingOrders(await pRes.json());
      if (iRes.ok) setInvoices(await iRes.json());
      if (aRes.ok) setAccounts(await aRes.json());
    } catch (err) {
      console.error("Billing: Failed to fetch data", err);
    }
  };

  useEffect(() => {
    fetchBillingData();
  }, []);

  const updateInvStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/billing/invoices/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) await fetchBillingData();
    } catch (err) {
      console.error("Billing: Update status failed", err);
    }
  };

  const openConfirmModal = (order: any) => {
      setSelectedOrder(order);
      setInvoiceDiscount({ type: null, value: 0 });
      setIsConfirmModalOpen(true);
  };

  const confirmAndGenerateInvoice = async () => {
      try {
          const res = await fetch('/api/billing/invoices', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                  orderId: selectedOrder.id,
                  discountType: invoiceDiscount.type,
                  discountValue: invoiceDiscount.value
              })
          });
          if (res.ok) {
              setIsConfirmModalOpen(false);
              await fetchBillingData();
          }
      } catch (err) {
          console.error("Billing: Failed to generate invoice", err);
      }
  };

  const openPaymentModal = (inv: any) => {
      setSelectedInvoice(inv);
      const remaining = Number(inv.totalAmount) - (inv.payments?.reduce((s: number, p: any) => s + Number(p.amount), 0) || 0);
      setPaymentForm({
          amount: remaining,
          method: 'cash',
          accountId: accounts[0]?.id || '',
          reference: ''
      });
      setIsPaymentModalOpen(true);
  };

  const submitPayment = async () => {
      try {
          const res = await fetch(`/api/billing/invoices/${selectedInvoice.id}/payments`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(paymentForm)
          });
          if (res.ok) {
              setIsPaymentModalOpen(false);
              await fetchBillingData();
          }
      } catch (err) {
          console.error("Billing: Payment failed", err);
      }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'partially_paid': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'delivered': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'approved': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'draft': return 'bg-slate-50 text-slate-500 border-slate-200';
      default: return 'bg-slate-50 text-slate-400 border-slate-100';
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      {/* Header Section */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Billing & Finance</h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Operational Revenue & Invoice Management</p>
        </div>
        <div className="flex gap-4">
          {accounts.map((acc: any) => (
            <div key={acc.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 shadow-sm min-w-[200px]">
              <div className={`${acc.type === 'bank' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'} w-10 h-10 rounded-xl flex items-center justify-center`}>
                {acc.type === 'bank' ? <CreditCard size={20} /> : <DollarSign size={20} />}
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate max-w-[120px]">{acc.name}</p>
                <p className="text-sm font-black text-slate-800">${Number(acc.balance).toLocaleString()}</p>
              </div>
            </div>
          ))}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-4 shadow-xl">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white">
              <TrendingUp size={20} />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Revenue</p>
              <p className="text-lg font-black text-white">${totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-4 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
              <Clock size={14} className="text-amber-500" /> Pending Billing
            </h3>
            <span className="bg-amber-100 text-amber-600 px-2.5 py-0.5 rounded-full text-[10px] font-black">{pendingOrders.length}</span>
          </div>

          {pendingOrders.length === 0 && (
            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-3xl p-12 text-center">
                <p className="text-xs font-bold text-slate-400 italic">No completed jobs awaiting billing.</p>
            </div>
          )}

          {pendingOrders.map((order) => (
            <div key={order.id} className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm hover:border-blue-400 transition-all group relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-[10px] font-mono font-bold text-slate-300 mb-1">#{order.spkNumber}</div>
                  <h4 className="font-black text-slate-800 tracking-tight">{order.vehicle?.plateNumber}</h4>
                  <p className="text-[10px] font-bold text-slate-500 uppercase truncate max-w-[180px]">{order.customer?.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-slate-800 leading-none">${Number(order.estimatedTotal).toLocaleString()}</p>
                  <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">Ready to Invoice</p>
                </div>
              </div>

              <button 
                onClick={() => openConfirmModal(order)}
                className="w-full bg-slate-900 text-white py-2.5 rounded-xl text-xs font-black hover:bg-blue-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10 active:scale-95"
              >
                GENERATE INVOICE <ArrowRight size={14} />
              </button>
            </div>
          ))}
        </div>

        <div className="xl:col-span-8 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
              <Receipt size={14} className="text-blue-500" /> Invoice History
            </h3>
          </div>

          <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
            <table className="w-full text-left border-separate border-spacing-0">
              <thead className="bg-slate-50/50 text-slate-500 uppercase text-[10px] font-black tracking-widest">
                <tr>
                  <th className="px-8 py-5 border-b border-slate-100">Invoice / Dates</th>
                  <th className="px-8 py-5 border-b border-slate-100">Customer & Vehicle</th>
                  <th className="px-8 py-5 border-b border-slate-100 text-right">Amount</th>
                  <th className="px-8 py-5 border-b border-slate-100 text-center">Status</th>
                  <th className="px-8 py-5 border-b border-slate-100 text-right">Workflow</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center text-slate-300 font-medium italic">No invoices found.</td>
                  </tr>
                ) : (
                  invoices.map((inv) => (
                    <tr key={inv.id} className="group hover:bg-slate-50 transition-colors">
                      <td className="px-8 py-5">
                         <div className="font-black text-slate-800 text-sm tracking-tight">{inv.number}</div>
                         <div className="text-[9px] font-bold text-slate-400 mt-1 uppercase flex items-center gap-1">
                           <Calendar size={10} /> {new Date(inv.createdAt).toLocaleDateString()}
                         </div>
                         {inv.deliveryDate && (
                           <div className="text-[9px] font-bold text-blue-500 mt-0.5 uppercase flex items-center gap-1">
                             <Send size={10} /> Del: {new Date(inv.deliveryDate).toLocaleDateString()}
                           </div>
                         )}
                      </td>
                      <td className="px-8 py-5">
                         <div className="font-bold text-slate-800">{inv.order?.customer?.name}</div>
                         <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{inv.order?.vehicle?.plateNumber} • {inv.order?.vehicle?.model || 'Generic'}</div>
                      </td>
                      <td className="px-8 py-5 text-right">
                         <div className="font-black text-slate-800 text-sm">${Number(inv.totalAmount).toLocaleString()}</div>
                         {inv.discountValue > 0 && (
                           <div className="text-[9px] font-bold text-emerald-500 uppercase">
                             -{inv.discountType === 'percentage' ? inv.discountValue + '%' : '$' + inv.discountValue}
                           </div>
                         )}
                         {inv.dueDate && (
                           <div className={`text-[9px] font-bold ${isOverdue(inv.dueDate) ? 'text-red-500' : 'text-slate-400'}`}>
                             Due: {new Date(inv.dueDate).toLocaleDateString()}
                           </div>
                         )}
                      </td>
                      <td className="px-8 py-5 text-center">
                         <span className={`${getStatusStyles(inv.status)} px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider border`}>
                           {inv.status.replace('_', ' ')}
                         </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                         <div className="flex gap-2 justify-end">
                           {inv.status === 'draft' && (
                             <button onClick={() => updateInvStatus(inv.id, 'approved')} className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-xl text-[10px] font-black hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                               APPROVE
                             </button>
                           )}
                           {inv.status === 'approved' && (
                             <button onClick={() => updateInvStatus(inv.id, 'delivered')} className="bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-xl text-[10px] font-black hover:bg-indigo-600 hover:text-white transition-all shadow-sm flex items-center gap-1">
                               <Send size={12} /> DELIVER
                             </button>
                           )}
                           {(inv.status === 'delivered' || inv.status === 'partially_paid') && (
                             <button onClick={() => openPaymentModal(inv)} className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-xl text-[10px] font-black hover:bg-emerald-600 hover:text-white transition-all shadow-sm flex items-center gap-1">
                               <DollarSign size={12} /> RECEIVE
                             </button>
                           )}
                           <div className="w-px h-6 bg-slate-200 mx-1"></div>
                           <button className="bg-slate-50 text-slate-400 p-2 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                             <Printer size={16} />
                           </button>
                         </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {isPaymentModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
              <div className="bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl">
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-2">Register Payment</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">Inv: {selectedInvoice?.number}</p>

                  <div className="space-y-6">
                      <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Deposit To Account</label>
                          <select 
                              value={paymentForm.accountId}
                              onChange={(e) => setPaymentForm(prev => ({ ...prev, accountId: e.target.value }))}
                              className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm font-black outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                          >
                              <option value="">Select Financial Account</option>
                              {accounts.map((acc: any) => (
                                  <option key={acc.id} value={acc.id}>
                                      {acc.name} (Bal: ${Number(acc.balance).toLocaleString()})
                                  </option>
                              ))}
                          </select>
                      </div>

                      <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Payment Method</label>
                          <div className="grid grid-cols-2 gap-3">
                              {['cash', 'bank_transfer'].map((method) => (
                                  <button 
                                      key={method}
                                      onClick={() => setPaymentForm(prev => ({ ...prev, method }))}
                                      className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all ${paymentForm.method === method ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 ring-1 ring-blue-600' : 'bg-slate-50 text-slate-500 border border-slate-100'}`}
                                  >
                                      {method.replace('_', ' ')}
                                  </button>
                              ))}
                          </div>
                      </div>

                      <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Amount to Pay</label>
                          <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm">$</span>
                              <input 
                                  value={paymentForm.amount}
                                  onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                                  type="number" 
                                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-8 pr-4 text-sm font-black outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                              />
                          </div>
                      </div>

                      <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Reference / Note</label>
                          <input 
                              value={paymentForm.reference}
                              onChange={(e) => setPaymentForm(prev => ({ ...prev, reference: e.target.value }))}
                              placeholder="TRX Num, Cheque, etc."
                              className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all truncate"
                          />
                      </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-10">
                      <button onClick={() => setIsPaymentModalOpen(false)} className="py-3 rounded-xl text-xs font-black text-slate-400 uppercase hover:bg-slate-50 transition-all font-mono">Cancel</button>
                      <button 
                          onClick={submitPayment}
                          className="bg-emerald-500 text-white py-3 rounded-xl text-xs font-black uppercase hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                      >
                          Confirm Payment
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Confirm Invoice Modal */}
      {isConfirmModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
              <div className="bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl">
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-2 text-center">Confirm Invoice</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8 text-center">Set Final Adjustments for {selectedOrder?.vehicle?.plateNumber}</p>

                  <div className="space-y-6">
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex justify-between items-center">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Base Subtotal</span>
                          <span className="text-lg font-black text-slate-800">${Number(selectedOrder?.estimatedTotal).toLocaleString()}</span>
                      </div>

                      <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Discount Type</label>
                          <div className="grid grid-cols-3 gap-2">
                              {[{val: null, label: 'NONE'}, {val: 'percentage', label: '%'}, {val: 'flat', label: '$'}].map((type) => (
                                  <button 
                                      key={type.label}
                                      onClick={() => setInvoiceDiscount(prev => ({ ...prev, type: type.val as any }))}
                                      className={`py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${invoiceDiscount.type === type.val ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-slate-50 text-slate-500 border border-slate-100'}`}
                                  >
                                      {type.label}
                                  </button>
                              ))}
                          </div>
                      </div>

                      {invoiceDiscount.type && (
                          <div>
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1 px-1">Discount Value ({invoiceDiscount.type === 'percentage' ? '%' : '$'})</label>
                              <input 
                                  value={invoiceDiscount.value}
                                  onChange={(e) => setInvoiceDiscount(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                                  type="number" 
                                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm font-black outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                                  placeholder="Enter value..."
                              />
                          </div>
                      )}

                      <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estimated Total</p>
                         <p className="text-2xl font-black text-blue-600 tracking-tighter">${finalEstimatedTotal.toLocaleString()}</p>
                      </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-10">
                      <button onClick={() => setIsConfirmModalOpen(false)} className="py-3 rounded-xl text-xs font-black text-slate-400 uppercase hover:bg-slate-50 transition-all">Cancel</button>
                      <button 
                          onClick={confirmAndGenerateInvoice}
                          className="bg-slate-900 text-white py-3 rounded-xl text-xs font-black uppercase hover:bg-blue-600 shadow-lg shadow-slate-900/10 transition-all active:scale-95"
                      >
                          Generate Now
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default BillingView;
