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
  X,
  ChevronRight,
  Info,
  CheckCircle,
  FileText,
  Search,
  AlertCircle,
  User,
  Car,
  MapPin,
  HelpCircle,
  Plus,
  RefreshCw,
  Layers,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const BillingView: React.FC = () => {
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Tab selector for sidebar: 'all' (Invoices list) vs 'pending' (Ready to bill)
  const [sidebarTab, setSidebarTab] = useState<'all' | 'pending'>('all');
  
  // Modals state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  
  // Active Invoice & Selected Order state
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // Discount options for invoice creation
  const [invoiceDiscount, setInvoiceDiscount] = useState({
    type: null as string | null,
    value: 0
  });

  // Payment registration form
  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    method: 'cash',
    accountId: '',
    reference: ''
  });

  // Calculate dynamic totals for the invoice generation setup
  const finalEstimatedTotal = useMemo(() => {
    if (!selectedOrder) return 0;
    const base = Number(selectedOrder.estimatedTotal);
    if (!invoiceDiscount.type) return base;
    
    if (invoiceDiscount.type === 'percentage') {
        return Math.max(0, base - (base * (invoiceDiscount.value / 100)));
    } else {
        return Math.max(0, base - invoiceDiscount.value);
    }
  }, [selectedOrder, invoiceDiscount]);

  // Read financial overview states
  const totalRevenue = useMemo(() => {
    return invoices.reduce((sum, inv) => {
        const paid = inv.payments?.reduce((s: number, p: any) => s + Number(p.amount), 0) || 0;
        return sum + paid;
    }, 0);
  }, [invoices]);

  const totalOutstanding = useMemo(() => {
    return invoices.reduce((sum, inv) => {
      if (inv.status === 'paid') return sum;
      const total = Number(inv.totalAmount);
      const paid = inv.payments?.reduce((s: number, p: any) => s + Number(p.amount), 0) || 0;
      return sum + Math.max(0, total - paid);
    }, 0);
  }, [invoices]);

  // Load backend records
  const fetchBillingData = async () => {
    try {
      const [pRes, iRes, aRes] = await Promise.all([
        fetch('/api/billing/pending'),
        fetch('/api/billing/invoices'),
        fetch('/api/billing/accounts')
      ]);
      if (pRes.ok) setPendingOrders(await pRes.json());
      
      if (iRes.ok) {
        const invs = await iRes.json();
        setInvoices(invs);
        // Automatically select the first invoice if none is loaded or selected
        if (invs.length > 0 && !selectedInvoice) {
          setSelectedInvoice(invs[0]);
        } else if (selectedInvoice) {
          const refreshed = invs.find((inv: any) => inv.id === selectedInvoice.id);
          if (refreshed) setSelectedInvoice(refreshed);
        }
      }
      
      if (aRes.ok) {
        const accs = await aRes.json();
        setAccounts(accs);
      }
    } catch (err) {
      console.error("Billing data loading error", err);
    }
  };

  useEffect(() => {
    fetchBillingData();
  }, []);

  // Update State Pipeline
  const updateInvStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/billing/invoices/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        await fetchBillingData();
      }
    } catch (err) {
      console.error("Billing status update failed", err);
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
          console.error("Invoice generation failed", err);
      }
  };

  const openPaymentModal = (inv: any) => {
      setSelectedInvoice(inv);
      const remaining = Number(inv.totalAmount) - (inv.payments?.reduce((s: number, p: any) => s + Number(p.amount), 0) || 0);
      setPaymentForm({
          amount: Math.max(0, remaining),
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
          console.error("Invoice payment error", err);
      }
  };

  // Modern tiny status badges
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid': 
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200/50 px-2 py-0.5 rounded text-[10px] font-bold tracking-wide">
            ● Paid
          </span>
        );
      case 'partially_paid': 
        return (
          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200/50 px-2 py-0.5 rounded text-[10px] font-bold tracking-wide">
            ● Partial Paid
          </span>
        );
      case 'delivered': 
        return (
          <span className="inline-flex items-center gap-1 bg-violet-50 text-violet-700 border border-violet-200/50 px-2 py-0.5 rounded text-[10px] font-bold tracking-wide">
            ● Shipped
          </span>
        );
      case 'approved': 
        return (
          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200/50 px-2 py-0.5 rounded text-[10px] font-bold tracking-wide">
            ● Approved
          </span>
        );
      case 'draft': 
        return (
          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded text-[10px] font-bold tracking-wide">
            ● Draft
          </span>
        );
      default: 
        return (
          <span className="inline-flex items-center bg-slate-50 text-slate-500 border border-slate-150 px-2 py-0.5 rounded text-[10px] font-bold">
            {status}
          </span>
        );
    }
  };

  const activeInvoiceDetails = useMemo(() => {
    if (!selectedInvoice) return null;
    
    const invoicePaid = selectedInvoice.payments?.reduce((sum: number, p: any) => sum + Number(p.amount), 0) || 0;
    const grandTotal = Number(selectedInvoice.totalAmount);
    const outstanding = Math.max(0, grandTotal - invoicePaid);

    const items = selectedInvoice.order?.items || [];
    const lines = items.map((item: any, idx: number) => {
      const isService = item.isService;
      const name = isService ? (item.task?.name || item.serviceName || 'Service & Labor') : (item.part?.name || 'Sparepart Material');
      const qty = Number(item.quantity);
      const price = Number(item.price);
      const discount = Number(item.discount || 0);
      const subtotal = qty * price;
      const total = subtotal - discount;

      return {
        id: item.id || `line-${idx}`,
        lineNo: (idx + 1) * 10,
        productName: name,
        quantity: qty,
        unit: isService ? 'hr' : (item.part?.unit || 'pcs'),
        price: price,
        discount: discount,
        total: total,
      };
    });

    return {
      subtotal: Number(selectedInvoice.subtotal),
      discountValue: Number(selectedInvoice.discountValue || 0),
      discountType: selectedInvoice.discountType,
      grandTotal,
      invoicePaid,
      outstanding,
      lines
    };
  }, [selectedInvoice]);

  // Filtered invoices lists
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv: any) => {
      const docNo = inv.number.toLowerCase();
      const customerName = (inv.order?.customer?.name || '').toLowerCase();
      const plate = (inv.order?.vehicle?.plateNumber || '').toLowerCase();
      const s = searchQuery.toLowerCase();
      return docNo.includes(s) || customerName.includes(s) || plate.includes(s);
    });
  }, [invoices, searchQuery]);

  return (
    <div className="p-4 md:p-5 max-w-[1700px] mx-auto bg-slate-50/40 min-h-screen font-sans antialiased text-slate-800 flex flex-col gap-4">
      
      {/* MINIMAL HIGH-DENSITY HEADER BAR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200/80 p-3 px-5 rounded-2xl shadow-sm">
        
        {/* Title and breadcrumb */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shadow-sm shrink-0">
            <Receipt size={18} />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Billing & Invoice Workspace</h2>
            <p className="text-[11px] text-slate-450 font-medium">Sleek processing workspace • Cash flows & accounts receivable</p>
          </div>
        </div>

        {/* Small inline telemetry counters instead of massive blocks */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-1.5 px-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Paid:</span>
            <span className="text-xs font-mono font-extrabold text-emerald-600">${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>

          <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-1.5 px-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">AR Outstanding:</span>
            <span className="text-xs font-mono font-extrabold text-red-600">${totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>

          <div className="bg-amber-50/50 border border-amber-200/40 rounded-xl p-1.5 px-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-amber-550 rounded-full animate-pulse"></span>
            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wide">Open:</span>
            <span className="text-xs font-mono font-extrabold text-amber-900">{pendingOrders.length} SPK Queue</span>
          </div>

          <button 
            onClick={fetchBillingData} 
            className="p-1 px-2.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-650 hover:text-slate-800 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 shrink-0"
          >
            <RefreshCw size={12} /> Sync
          </button>
        </div>

      </div>

      {/* COMPACT VIEW CONTAINING PREVENT-SCROLL BOX */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        
        {/* LEFT COLUMN: DUAL-TAB DOCUMENT REGISTRY (4 COLS) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3.5 h-[calc(100vh-125px)] flex flex-col">
          
          {/* SEARCH SYSTEM */}
          <div className="relative shrink-0">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400">
              <Search size={14} />
            </span>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari #, nama pelanggan, nopol..."
              className="w-full pl-8 pr-8 py-1.5 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-blue-500 transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] bg-slate-200 hover:bg-slate-350 text-slate-650 px-1 py-0.5 rounded font-black transition-all"
              >
                Reset
              </button>
            )}
          </div>

          {/* DUAL SECTIONS TAB CONTROLLER */}
          <div className="bg-slate-50 border border-slate-200/60 p-1 rounded-xl grid grid-cols-2 gap-1 shrink-0">
            
            <button 
              onClick={() => setSidebarTab('all')}
              className={`py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                sidebarTab === 'all' 
                ? 'bg-white text-slate-900 border border-slate-200 shadow-sm font-extrabold' 
                : 'text-slate-500 hover:text-slate-950'
              }`}
            >
              <FileText size={13} />
              <span>Invoices ({filteredInvoices.length})</span>
            </button>

            <button 
              onClick={() => setSidebarTab('pending')}
              className={`py-1.5 rounded-lg text-xs font-bold transition-all relative flex items-center justify-center gap-1.5 ${
                sidebarTab === 'pending' 
                ? 'bg-white text-slate-900 border border-slate-200 shadow-sm font-extrabold' 
                : 'text-slate-500 hover:text-slate-950'
              }`}
            >
              <Clock size={13} />
              <span>Ready to Bill</span>
              {pendingOrders.length > 0 && (
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full absolute right-3 top-3 animate-ping"></span>
              )}
            </button>

          </div>

          {/* LIST BOX WITH RESTRICTED SCROLL VIEWPORT */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-2">
            
            {sidebarTab === 'all' ? (
              filteredInvoices.length === 0 ? (
                <div className="text-center py-20 text-slate-400 text-xs italic">
                  Invoice tidak ditemukan.
                </div>
              ) : (
                filteredInvoices.map((inv) => {
                  const isSelected = selectedInvoice?.id === inv.id;
                  const totalPaid = inv.payments?.reduce((s: number, p: any) => s + Number(p.amount), 0) || 0;
                  const balanceLeft = Math.max(0, Number(inv.totalAmount) - totalPaid);

                  return (
                    <div 
                      key={inv.id} 
                      onClick={() => setSelectedInvoice(inv)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex justify-between items-center relative overflow-hidden group ${
                        isSelected 
                        ? 'border-blue-500 bg-blue-50/15 shadow-sm ring-1 ring-blue-500' 
                        : 'border-slate-150 bg-slate-50/20 hover:bg-slate-50/80'
                      }`}
                    >
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono text-xs font-black text-slate-800">{inv.number}</span>
                          <span className="text-[10px] font-bold text-slate-350">•</span>
                          <span className="text-[10px] text-slate-450 font-bold">{new Date(inv.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs font-extrabold text-slate-800 truncate">{inv.order?.customer?.name || 'Walk-in Cust'}</p>
                        <p className="text-[10px] text-slate-450 font-mono">
                          Nopol: <span className="font-extrabold text-slate-705">{inv.order?.vehicle?.plateNumber}</span>
                        </p>
                      </div>

                      <div className="text-right pl-3 flex flex-col items-end shrink-0">
                        <div className="text-xs font-extrabold text-slate-900">${Number(inv.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                        {balanceLeft > 0 ? (
                          <div className="text-[9px] text-red-500 font-bold mt-0.5">Due: ${balanceLeft.toLocaleString()}</div>
                        ) : (
                          <div className="text-[9px] text-emerald-600 font-bold uppercase tracking-wide mt-0.5">Lunas</div>
                        )}
                        <span className="mt-1 transform scale-75 origin-right block">
                          {getStatusBadge(inv.status)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )
            ) : (
              pendingOrders.length === 0 ? (
                <div className="text-center py-20 text-slate-400 text-xs italic">
                  Semua SPK sudah dibuatkan penagihannya.
                </div>
              ) : (
                pendingOrders.map((order) => (
                  <div 
                    key={order.id} 
                    className="p-3 bg-amber-50/20 hover:bg-amber-50/40 border border-amber-200/50 rounded-xl transition-all flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="bg-slate-900 text-white font-mono text-[9px] px-1.5 py-0.5 rounded font-bold">SPK #{order.spkNumber}</span>
                        <span className="font-mono text-xs font-black text-slate-800 truncate">{order.vehicle?.plateNumber}</span>
                      </div>
                      <p className="text-xs font-bold text-slate-700 truncate">{order.customer?.name}</p>
                      <p className="text-[10px] text-slate-450 truncate">{order.branch?.name}</p>
                    </div>

                    <div className="text-right flex flex-col items-end shrink-0">
                      <p className="text-xs font-mono font-extrabold text-slate-800">${Number(order.estimatedTotal).toLocaleString()}</p>
                      <button 
                        onClick={() => openConfirmModal(order)}
                        className="mt-1.5 bg-amber-600 hover:bg-amber-700 text-white px-2 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 shadow-sm"
                      >
                        Bill <Plus size={10} />
                      </button>
                    </div>
                  </div>
                ))
              )
            )}

          </div>

        </div>

        {/* RIGHT COLUMN: HIGH-DENSITY INTERACTIVE INVOICE FORM (8 COLS) */}
        <div className="lg:col-span-8 h-[calc(100vh-125px)] flex flex-col bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          
          {selectedInvoice ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              
              {/* COMPACT ACTIVE DOCUMENT META & ACTIONS BAR */}
              <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shrink-0">
                
                {/* ID & Status */}
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-extrabold text-slate-900">{selectedInvoice.number}</span>
                  <span className="text-slate-350">|</span>
                  <div className="scale-90 select-none">
                    {getStatusBadge(selectedInvoice.status)}
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">UID: {selectedInvoice.id.slice(0, 8)}</span>
                </div>

                {/* Status Trigger buttons in single clean line */}
                <div className="flex items-center gap-2 flex-wrap">
                  
                  {selectedInvoice.status === 'draft' && (
                    <button 
                      onClick={() => updateInvStatus(selectedInvoice.id, 'approved')}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1 shadow-sm"
                    >
                      <CheckCircle size={13} /> Approve Bill
                    </button>
                  )}

                  {selectedInvoice.status === 'approved' && (
                    <button 
                      onClick={() => updateInvStatus(selectedInvoice.id, 'delivered')}
                      className="bg-violet-600 hover:bg-violet-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1 shadow-sm"
                    >
                      <Send size={13} /> Release Document
                    </button>
                  )}

                  {(selectedInvoice.status === 'delivered' || selectedInvoice.status === 'partially_paid') && (
                    <button 
                      onClick={() => openPaymentModal(selectedInvoice)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1 shadow-sm"
                    >
                      <DollarSign size={13} /> Receive Payment
                    </button>
                  )}

                  <button 
                    onClick={() => alert('PDF copy printable spooler ready!')}
                    className="bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                  >
                    <Printer size={13} className="text-slate-400" /> Cetak PDF
                  </button>

                </div>

              </div>

              {/* CLEAN FORM GRID (SCROLLABLE ONLY ON HIGH CONTENT VIEWPORTS) */}
              <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4">
                
                {/* BLOCK A: BUSINESS PARTNER & DATE INFO CARD (COMPACT NESTED CONTAINER) */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-3 bg-slate-50/50 rounded-xl border border-slate-200/65 text-xs text-slate-750">
                  
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Pemilik Utama</span>
                    <p className="font-extrabold text-slate-800 truncate">{selectedInvoice.order?.customer?.name || "Pelanggan Biasa"}</p>
                    <p className="text-[10px] text-slate-450 truncate">{selectedInvoice.order?.customer?.phone || "No phone registered"}</p>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Workshop Pengelola</span>
                    <p className="font-bold text-slate-800 truncate">{selectedInvoice.order?.branch?.name || "Main Workshop HQ"}</p>
                    <p className="text-[10px] text-slate-400">Jakarta Outlet</p>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Tanggal Tagihan</span>
                    <p className="font-bold text-slate-800">{new Date(selectedInvoice.createdAt).toLocaleDateString()}</p>
                    <p className="text-[10px] text-slate-450">Tanggal Jurnal</p>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Batas Pelunasan</span>
                    <p className="font-bold text-slate-800 flex items-center gap-1">
                      <span>{selectedInvoice.dueDate ? new Date(selectedInvoice.dueDate).toLocaleDateString() : 'Cash on Delivery'}</span>
                    </p>
                    <span className="text-[10px] text-red-500 font-bold uppercase tracking-wide">
                      {activeInvoiceDetails && activeInvoiceDetails.outstanding > 0 ? 'Tertagih' : 'Selesai'}
                    </span>
                  </div>

                </div>

                {/* BLOCK B: THE ACTIVE SERVICE RUN CAR DETAILS */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-blue-50/15 border border-blue-200/50 rounded-xl p-3 gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-blue-550/10 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
                      <Car size={15} />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Unit Kendaraan Service</p>
                      <p className="font-black text-slate-800">{selectedInvoice.order?.vehicle?.brand} {selectedInvoice.order?.vehicle?.model} • Plater: <span className="font-mono text-xs text-blue-700 bg-blue-50 px-1 py-0.5 rounded">{selectedInvoice.order?.vehicle?.plateNumber}</span></p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right text-[11px]">
                    <div className="flex items-center gap-1 justify-start sm:justify-end">
                      <FileText size={12} className="text-blue-500" />
                      <span className="font-bold text-slate-700">SPK Link:</span>
                      <span className="font-mono font-black text-blue-600">#{selectedInvoice.order?.spkNumber}</span>
                    </div>
                    <p className="text-[10px] text-slate-450">Nomor Work-Order: {selectedInvoice.order?.woNumber || 'Direct'}</p>
                  </div>
                </div>

                {/* BLOCK C: WORKSPACE DETAILS & ITEMIZED LINES (STRICTLY CONTROLS GROW TO PREVENT SCROLL) */}
                <div className="space-y-1.5 flex-1 min-h-[160px] flex flex-col">
                  <div className="flex justify-between items-center text-[11px] text-slate-450 uppercase font-black tracking-wider px-1">
                    <span>Daftar Item Sparepart & Jasa Kerja</span>
                    <span className="font-mono text-[10px] text-slate-400 font-bold">Line Items: {activeInvoiceDetails?.lines.length}</span>
                  </div>

                  {/* RESTRICTED HEIGHT WRAPPER FOR TABLE LINES SCREEN BUDGETING */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white max-h-[180px] overflow-y-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[9px] border-b border-slate-250 sticky top-0 z-10">
                        <tr>
                          <th className="px-3 py-2 text-center w-12">Line ID</th>
                          <th className="px-3 py-2">Uraian / Pekerjaan / Sparepart</th>
                          <th className="px-3 py-2 text-right">Volume / Qty</th>
                          <th className="px-3 py-2 text-right">Harga Jual</th>
                          <th className="px-4 py-2 text-right">Total Net</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {activeInvoiceDetails?.lines.map((ln) => (
                          <tr key={ln.id} className="hover:bg-slate-50/40 text-[11px]">
                            <td className="px-3 py-2 text-center font-mono text-slate-400 font-bold">{ln.lineNo}</td>
                            <td className="px-3 py-2">
                              <span className="font-semibold text-slate-850 block">{ln.productName}</span>
                            </td>
                            <td className="px-3 py-2 text-right font-bold text-slate-800 font-mono">{ln.quantity} {ln.unit}</td>
                            <td className="px-3 py-2 text-right text-slate-705 font-mono">${ln.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            <td className="px-4 py-2 text-right font-extrabold text-slate-900 font-mono">${ln.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* BLOCK D: LOWER PANEL METRIC SPLIT */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start shrink-0">
                  
                  {/* Ledger payment proofs List (Max controlled height block) */}
                  <div className="space-y-1.5 h-full">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Histori Pembayaran Pelanggan</span>
                      <span className="text-[9px] bg-slate-100 text-slate-500 font-mono px-1.5 py-0.5 rounded font-black">Payments ({selectedInvoice.payments?.length || 0})</span>
                    </div>

                    {!selectedInvoice.payments || selectedInvoice.payments.length === 0 ? (
                      <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-[11px] text-slate-450 italic justify-center">
                        <Info size={12} className="text-slate-400 shrink-0" /> Belum ada pembayaran untuk invoice ini.
                      </div>
                    ) : (
                      <div className="space-y-1.5 max-h-[110px] overflow-y-auto pr-1">
                        {selectedInvoice.payments.map((p: any) => (
                          <div key={p.id} className="p-2 bg-slate-50 rounded-xl border border-slate-150 text-[11px] flex justify-between gap-3">
                            <div className="min-w-0">
                              <p className="font-bold text-slate-750 truncate">Via: {p.method.replace('_', ' ').toUpperCase()}</p>
                              <p className="text-[9px] text-slate-400 truncate">Kas: {p.account?.name || 'Kas Kasir'} {p.reference ? `• Ref: ${p.reference}` : ''}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-emerald-700 font-black font-mono">+${Number(p.amount).toLocaleString()}</span>
                              <span className="text-[9px] block text-slate-400">{new Date(p.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Elegant High-density ledger board calculations */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
                    
                    <div className="flex justify-between items-center text-slate-500 font-medium">
                      <span>Subtotal Harga:</span>
                      <span className="font-mono text-slate-805 font-bold">${activeInvoiceDetails?.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>

                    {activeInvoiceDetails && activeInvoiceDetails.discountValue > 0 && (
                      <div className="flex justify-between items-center text-emerald-600 font-semibold">
                        <span>Potongan / Diskon:</span>
                        <span className="font-mono">-${activeInvoiceDetails.discountValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-slate-500 font-medium pt-1 border-t border-slate-200">
                      <span>Sudah Dibayarkan:</span>
                      <span className="font-mono text-slate-805 font-bold">${activeInvoiceDetails?.invoicePaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>

                    <div className="flex justify-between items-center p-1.5 px-2 bg-rose-50/50 border border-rose-100 rounded-lg text-rose-700 mt-1 select-none">
                      <span className="font-bold text-[11px] uppercase tracking-wide">Sisa Piutang:</span>
                      <span className="font-mono font-black text-sm">${activeInvoiceDetails?.outstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>

                  </div>

                </div>

              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-20 text-center text-slate-350 italic font-medium">
              <div className="flex flex-col items-center gap-3">
                <Receipt className="text-slate-300" size={32} />
                <p className="text-xs text-slate-400">Silakan pilih salah satu Invoice atau SPK dari panel kiri registry untuk memuat data penagihan lengkap.</p>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* RENDER MODAL: PAYMENT REGISTRATION */}
      {isPaymentModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
              <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl space-y-4">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-950 tracking-tight">Penerimaan Pembayaran</h3>
                  <p className="text-[10px] text-slate-400 font-mono tracking-wide uppercase mt-0.5">Invoice: {selectedInvoice?.number}</p>
                </div>

                <div className="space-y-3.5 text-xs">
                    <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Setor ke Finansial Akun</label>
                        <select 
                            value={paymentForm.accountId}
                            onChange={(e) => setPaymentForm(prev => ({ ...prev, accountId: e.target.value }))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-2.5 text-xs font-bold outline-none cursor-pointer"
                        >
                            <option value="">Select Financial Account</option>
                            {accounts.map((acc: any) => (
                                <option key={acc.id} value={acc.id}>
                                    {acc.name} (${Number(acc.balance).toLocaleString()})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Jenis Pembayaran</label>
                        <div className="grid grid-cols-2 gap-2">
                            {['cash', 'bank_transfer'].map((method) => (
                                <button 
                                    key={method}
                                    type="button"
                                    onClick={() => setPaymentForm(prev => ({ ...prev, method }))}
                                    className={`py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all border ${paymentForm.method === method ? 'bg-slate-900 text-white border-slate-900 shadow-sm' : 'bg-slate-50 text-slate-500 border-slate-150'}`}
                                >
                                    {method.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Nilai Nominal Pembayaran ($)</label>
                        <div className="relative">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">$</span>
                            <input 
                                value={paymentForm.amount}
                                onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                                type="number" 
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-6 pr-2.5 font-bold outline-none font-mono"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Kode Referensi / Catatan</label>
                        <input 
                            value={paymentForm.reference}
                            onChange={(e) => setPaymentForm(prev => ({ ...prev, reference: e.target.value }))}
                            placeholder="Bank Ref, No. Cek, Kwitansi dll."
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-2.5 outline-none font-medium text-slate-700"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
                    <button 
                      type="button"
                      onClick={() => setIsPaymentModalOpen(false)} 
                      className="py-2.5 rounded-lg text-xs font-bold text-slate-500 uppercase hover:bg-slate-50 transition-all"
                    >
                      Batal
                    </button>
                    <button 
                        type="button"
                        onClick={submitPayment}
                        className="bg-emerald-600 text-white py-2 rounded-lg text-xs font-bold uppercase hover:bg-emerald-700 transition-all shadow-sm"
                    >
                        Proses Terima
                    </button>
                </div>
              </div>
          </div>
      )}

      {/* RENDER MODAL: CONFIRM WORK ORDER INVOICING ADJUSTMENTS */}
      {isConfirmModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
              <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl space-y-4">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-950 tracking-tight">Kalkulasi Tagihan Baru</h3>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">SPK Link Code: {selectedOrder?.spkNumber}</p>
                </div>

                <div className="space-y-3.5 text-xs">
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-150 flex justify-between items-center">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Subtotal Awal SPK</span>
                        <span className="font-extrabold text-slate-800">${Number(selectedOrder?.estimatedTotal).toLocaleString()}</span>
                    </div>

                    <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Berikan Potongan Diskon</label>
                        <div className="grid grid-cols-3 gap-2">
                            {[{val: null, label: 'KOSONG'}, {val: 'percentage', label: 'PERSEN %'}, {val: 'flat', label: 'FLAT $'}].map((type) => (
                                <button 
                                    key={type.label}
                                    type="button"
                                    onClick={() => setInvoiceDiscount(prev => ({ ...prev, type: type.val as any }))}
                                    className={`py-1.5 rounded-lg text-[9px] font-bold uppercase transition-all border ${invoiceDiscount.type === type.val ? 'bg-slate-900 text-white border-slate-900 shadow-sm' : 'bg-slate-50 text-slate-500 border-slate-150'}`}
                                >
                                    {type.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {invoiceDiscount.type && (
                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase block">Jumlah Potongan ({invoiceDiscount.type === 'percentage' ? '%' : '$'})</label>
                            <input 
                                value={invoiceDiscount.value}
                                onChange={(e) => setInvoiceDiscount(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                                type="number" 
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-2.5 font-bold outline-none font-mono"
                                placeholder="0"
                            />
                        </div>
                    )}

                    <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Total Akhir Ter-tagih</p>
                       <p className="text-base font-black text-blue-600 tracking-tight">${finalEstimatedTotal.toLocaleString()}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
                    <button 
                      type="button"
                      onClick={() => setIsConfirmModalOpen(false)} 
                      className="py-2 rounded-lg text-xs font-bold text-slate-500 uppercase hover:bg-slate-50 transition-all font-mono"
                    >
                      Batal
                    </button>
                    <button 
                        type="button"
                        onClick={confirmAndGenerateInvoice}
                        className="bg-slate-900 text-white py-2 rounded-lg text-xs font-bold uppercase hover:bg-blue-600 shadow-sm transition-all"
                    >
                        Buat Invoice
                    </button>
                </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default BillingView;
