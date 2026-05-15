import React, { useState, useEffect, useMemo } from 'react';
import { X, MapPin, Settings, User, Car, Wrench, ClipboardList, Receipt, Users } from 'lucide-react';

interface NewRequisitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const NewRequisitionModal: React.FC<NewRequisitionModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [masters, setMasters] = useState({
    workshops: [],
    vehicleModels: [],
    corporateCustomers: [],
    tasks: [],
    parts: [],
    mechanics: []
  });

  const [form, setForm] = useState({
    workshopId: '',
    serviceMethod: 'walk-in',
    customerType: 'individual',
    customerId: '',
    customerName: '',
    phone: '',
    plateNumber: '',
    vehicleModelId: '',
    odometer: 0,
    referenceNumber: '',
    complaint: '',
    analysis: '',
    tasks: [] as any[],
    parts: [] as any[],
    mechanicId: '',
    status: 'draft'
  });

  const fetchMasters = async () => {
    try {
      const urls = [
        '/api/master/workshops',
        '/api/master/vehicle-models',
        '/api/master/tasks',
        '/api/master/spare-parts',
        '/api/master/mechanics',
        '/api/master/customers/corporate'
      ];
      
      const responses = await Promise.all(
        urls.map(u => fetch(u).then(r => r.ok ? r.json() : []).catch(() => []))
      );

      setMasters({
        workshops: responses[0],
        vehicleModels: responses[1],
        tasks: responses[2],
        parts: responses[3],
        mechanics: responses[4],
        corporateCustomers: responses[5]
      });
    } catch (err) {
      console.error("Failed to load master data", err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMasters();
    }
  }, [isOpen]);

  const addTask = () => {
    setForm(prev => ({
      ...prev,
      tasks: [...prev.tasks, { taskId: '', quantity: 1, discount: 0 }]
    }));
  };

  const addPart = () => {
    setForm(prev => ({
      ...prev,
      parts: [...prev.parts, { partId: '', quantity: 1, discount: 0 }]
    }));
  };

  const updateTask = (idx: number, field: string, value: any) => {
    const newTasks = [...form.tasks];
    newTasks[idx] = { ...newTasks[idx], [field]: value };
    setForm(prev => ({ ...prev, tasks: newTasks }));
  };

  const updatePart = (idx: number, field: string, value: any) => {
    const newParts = [...form.parts];
    newParts[idx] = { ...newParts[idx], [field]: value };
    setForm(prev => ({ ...prev, parts: newParts }));
  };

  const summaryItems = useMemo(() => {
    const items: any[] = [];
    
    form.tasks.forEach(t => {
      const master = masters.tasks.find((m: any) => m.id === t.taskId) as any;
      if (master) {
        items.push({
          id: 't-'+t.taskId,
          name: master.name,
          qty: t.quantity,
          uom: 'JASA',
          price: Number(master.standardPrice),
          discount: t.discount,
          total: (Number(master.standardPrice) * t.quantity)
        });
      }
    });

    form.parts.forEach(p => {
      const master = masters.parts.find((m: any) => m.id === p.partId) as any;
      if (master) {
        items.push({
          id: 'p-'+p.partId,
          name: master.name,
          qty: p.quantity,
          uom: master.unit,
          price: Number(master.basePrice),
          discount: p.discount,
          total: (Number(master.basePrice) * p.quantity)
        });
      }
    });

    return items;
  }, [form.tasks, form.parts, masters]);

  const subtotalAmount = useMemo(() => summaryItems.reduce((acc, i) => acc + i.total, 0), [summaryItems]);
  const totalDiscountAmount = useMemo(() => summaryItems.reduce((acc, i) => acc + (i.discount || 0), 0), [summaryItems]);
  const grandTotalAmount = useMemo(() => subtotalAmount - totalDiscountAmount, [subtotalAmount, totalDiscountAmount]);

  const handleSubmit = async () => {
    if (!form.plateNumber || !form.complaint) {
      alert("Please fill in plate number and complaint.");
      return;
    }

    if (form.tasks.length === 0 && form.parts.length === 0) {
        alert("Please add at least one task or part to the requisition.");
        return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (response.ok) {
        onSuccess();
        onClose();
        setForm({
          workshopId: '',
          serviceMethod: 'walk-in',
          customerType: 'individual',
          customerId: '',
          customerName: '',
          phone: '',
          plateNumber: '',
          vehicleModelId: '',
          odometer: 0,
          referenceNumber: '',
          complaint: '',
          analysis: '',
          tasks: [],
          parts: [],
          mechanicId: '',
          status: 'draft'
        });
      }
    } catch (err) {
      console.error("Failed to create Requisition", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[90vh]">
        <header className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">New Maintenance Requisition</h2>
            <p className="text-xs text-slate-400 font-medium tracking-wide">Enter customer request and build an initial estimate</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
            <X size={20} />
          </button>
        </header>

        <div className="flex-1 overflow-hidden flex">
          <div className="flex-1 overflow-y-auto p-8 space-y-8 border-r border-slate-100 bg-white">
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <MapPin size={12} /> Workshop
                </label>
                <select 
                  value={form.workshopId} 
                  onChange={(e) => setForm(prev => ({ ...prev, workshopId: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                >
                  <option value="">Select Branch</option>
                  {masters.workshops.map((w: any) => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Settings size={12} /> Service Method
                </label>
                <select 
                  value={form.serviceMethod}
                  onChange={(e) => setForm(prev => ({ ...prev, serviceMethod: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                >
                  <option value="walk-in">Walk-In</option>
                  <option value="onsite">Onsite-Service</option>
                  <option value="pickup-delivery">Pick up delivery</option>
                </select>
              </div>
            </section>

            <section className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <User size={12} /> Customer Information
                    </label>
                    <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
                      <button 
                        onClick={() => setForm(prev => ({ ...prev, customerType: 'individual' }))}
                        className={`text-[9px] font-black px-2 py-1 rounded-md transition-all ${form.customerType === 'individual' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}
                      >PRIVATE</button>
                      <button 
                        onClick={() => setForm(prev => ({ ...prev, customerType: 'corporate' }))}
                        className={`text-[9px] font-black px-2 py-1 rounded-md transition-all ${form.customerType === 'corporate' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}
                      >CORP</button>
                    </div>
                  </div>
                  
                  {form.customerType === 'corporate' ? (
                    <div className="space-y-2">
                       <select 
                        value={form.customerId}
                        onChange={(e) => setForm(prev => ({ ...prev, customerId: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                      >
                        <option value="">Select Corporate Account</option>
                        {masters.corporateCustomers.map((c: any) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      <input 
                        value={form.customerName}
                        onChange={(e) => setForm(prev => ({ ...prev, customerName: e.target.value }))}
                        placeholder="Customer Name" 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-medium outline-none" 
                      />
                      <input 
                        value={form.phone}
                        onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="Phone Number" 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-medium outline-none" 
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Car size={12} /> Vehicle Information
                  </label>
                  <div className="grid grid-cols-1 gap-3">
                    <input 
                      value={form.plateNumber}
                      onChange={(e) => setForm(prev => ({ ...prev, plateNumber: e.target.value.toUpperCase() }))}
                      placeholder="Plate Number (e.g. B 1234 ABC)" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-bold uppercase outline-none" 
                    />
                    <select 
                      value={form.vehicleModelId}
                      onChange={(e) => setForm(prev => ({ ...prev, vehicleModelId: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-bold outline-none"
                    >
                      <option value="">Select Vehicle Model</option>
                      {masters.vehicleModels.map((m: any) => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Odometer (KM)</label>
                  <input 
                    value={form.odometer}
                    onChange={(e) => setForm(prev => ({ ...prev, odometer: parseInt(e.target.value) || 0 }))}
                    type="number" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-bold outline-none" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reference Number</label>
                  <input 
                    value={form.referenceNumber}
                    onChange={(e) => setForm(prev => ({ ...prev, referenceNumber: e.target.value }))}
                    type="text" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-bold outline-none" 
                  />
                </div>
              </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Wrench size={12} /> Complaint
                </label>
                <textarea 
                  value={form.complaint}
                  onChange={(e) => setForm(prev => ({ ...prev, complaint: e.target.value }))}
                  rows={3} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm font-medium outline-none" 
                  placeholder="Issues reported by customer..."
                ></textarea>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                   <ClipboardList size={12} /> Initial Analysis
                </label>
                <textarea 
                  value={form.analysis}
                  onChange={(e) => setForm(prev => ({ ...prev, analysis: e.target.value }))}
                  rows={3} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm font-medium outline-none" 
                  placeholder="Mechanic's first thoughts..."
                ></textarea>
              </div>
            </section>

            <section className="space-y-6">
               <div className="flex justify-between items-center">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tasks & Spareparts</h3>
                  <div className="flex gap-2">
                     <button onClick={addTask} className="text-[9px] font-black bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-600 hover:text-white transition-all">+ ADD TASK</button>
                     <button onClick={addPart} className="text-[9px] font-black bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg hover:bg-emerald-600 hover:text-white transition-all">+ ADD PART</button>
                  </div>
               </div>

               <div className="space-y-3">
                  {(form.tasks.length > 0 || form.parts.length > 0) && (
                    <div className="flex items-center gap-3 px-10 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      <div className="flex-1">Product / Service Selection</div>
                      <div className="w-16 text-center">Qty</div>
                      <div className="w-24 text-right pr-2">Unit Price</div>
                      <div className="w-20 text-center">Discount</div>
                      <div className="w-6"></div>
                    </div>
                  )}

                  {form.tasks.map((t, idx) => (
                    <div key={'t-'+idx} className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-100">
                       <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-[9px] font-black shrink-0">T</div>
                       <select 
                        value={t.taskId}
                        onChange={(e) => updateTask(idx, 'taskId', e.target.value)}
                        className="flex-1 bg-white border border-slate-200 rounded-lg py-1.5 px-3 text-xs font-bold outline-none"
                      >
                          <option value="">Select Service Task</option>
                          {masters.tasks.map((tm: any) => (
                            <option key={tm.id} value={tm.id}>{tm.name}</option>
                          ))}
                       </select>
                       <input 
                        value={t.quantity}
                        onChange={(e) => updateTask(idx, 'quantity', parseInt(e.target.value) || 0)}
                        type="number" 
                        placeholder="Qty" 
                        className="w-16 bg-white border border-slate-200 rounded-lg py-1.5 px-2 text-xs font-bold text-center outline-none"
                        />
                       <div className="w-24 text-right text-[11px] font-mono font-bold text-slate-400 pr-2">
                         ${(masters.tasks as any[]).find(m => m.id === t.taskId)?.standardPrice || '0.00'}
                       </div>
                       <input 
                        value={t.discount}
                        onChange={(e) => updateTask(idx, 'discount', parseInt(e.target.value) || 0)}
                        type="number" 
                        placeholder="Disc" 
                        className="w-20 bg-white border border-slate-200 rounded-lg py-1.5 px-2 text-xs font-bold text-center outline-none" 
                       />
                       <button onClick={() => {
                         const newTasks = [...form.tasks];
                         newTasks.splice(idx, 1);
                         setForm(prev => ({ ...prev, tasks: newTasks }));
                       }} className="text-slate-300 hover:text-red-500 shrink-0"><X size={14}/></button>
                    </div>
                  ))}

                  {form.parts.map((p, idx) => (
                    <div key={'p-'+idx} className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-100">
                       <div className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-[9px] font-black shrink-0">P</div>
                       <select 
                        value={p.partId}
                        onChange={(e) => updatePart(idx, 'partId', e.target.value)}
                        className="flex-1 bg-white border border-slate-200 rounded-lg py-1.5 px-3 text-xs font-bold outline-none"
                       >
                          <option value="">Select Sparepart</option>
                          {masters.parts.map((pm: any) => (
                            <option key={pm.id} value={pm.id}>{pm.name} ({pm.code})</option>
                          ))}
                       </select>
                       <input 
                        value={p.quantity}
                        onChange={(e) => updatePart(idx, 'quantity', parseInt(e.target.value) || 0)}
                        type="number" 
                        placeholder="Qty" 
                        className="w-16 bg-white border border-slate-200 rounded-lg py-1.5 px-2 text-xs font-bold text-center outline-none" 
                       />
                       <div className="w-24 text-right text-[11px] font-mono font-bold text-slate-400 pr-2">
                         ${(masters.parts as any[]).find(m => m.id === p.partId)?.basePrice || '0.00'}
                       </div>
                       <input 
                        value={p.discount}
                        onChange={(e) => updatePart(idx, 'discount', parseInt(e.target.value) || 0)}
                        type="number" 
                        placeholder="Disc" 
                        className="w-20 bg-white border border-slate-200 rounded-lg py-1.5 px-2 text-xs font-bold text-center outline-none" 
                       />
                       <button onClick={() => {
                         const newParts = [...form.parts];
                         newParts.splice(idx, 1);
                         setForm(prev => ({ ...prev, parts: newParts }));
                       }} className="text-slate-300 hover:text-red-500 shrink-0"><X size={14}/></button>
                    </div>
                  ))}
               </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Users size={12} /> Assign Mechanic
                  </label>
                  <select 
                    value={form.mechanicId}
                    onChange={(e) => setForm(prev => ({ ...prev, mechanicId: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-bold outline-none"
                  >
                    <option value="">Select Mechanic</option>
                    {masters.mechanics.map((m: any) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
              </div>
              <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <ClipboardList size={12} /> Status
                  </label>
                  <select 
                    value={form.status}
                    onChange={(e) => setForm(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-bold outline-none"
                  >
                    <option value="draft">DRAFT</option>
                    <option value="book">BOOK</option>
                    <option value="approved">APPROVE</option>
                  </select>
              </div>
            </section>
          </div>

          <aside className="w-96 bg-slate-50/50 p-8 flex flex-col">
             <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
               <Receipt size={14} /> Sales Summary (Estimate)
             </h3>

             <div className="flex-1 space-y-4 overflow-y-auto">
                {summaryItems.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-start gap-4">
                     <div className="space-y-0.5">
                        <div className="text-[11px] font-bold text-slate-800 leading-tight">{item.name}</div>
                        <div className="text-[9px] text-slate-400 font-medium">Qty: {item.qty} {item.uom}</div>
                     </div>
                     <div className="text-right">
                        <div className="text-[11px] font-bold text-slate-800">${item.total.toLocaleString()}</div>
                        {item.discount > 0 && <div className="text-[9px] text-red-500 font-bold">-${item.discount.toLocaleString()}</div>}
                     </div>
                  </div>
                ))}
                
                {summaryItems.length === 0 && (
                  <div className="text-center py-10 text-slate-300 italic text-[11px]">
                     No items added to estimate yet.
                  </div>
                )}
             </div>

             <div className="mt-8 pt-6 border-t-2 border-dashed border-slate-200 space-y-3">
                <div className="flex justify-between text-xs font-medium text-slate-500">
                   <span>Subtotal</span>
                   <span>${subtotalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs font-medium text-red-500">
                   <span>Total Discount</span>
                   <span>-${totalDiscountAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-baseline pt-2">
                   <span className="text-xs font-black text-slate-800 uppercase">Grand Total</span>
                   <span className="text-2xl font-black text-blue-600">${grandTotalAmount.toLocaleString()}</span>
                </div>
             </div>
          </aside>
        </div>

        <footer className="p-6 border-t border-slate-100 bg-white flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition-all uppercase tracking-widest"
          >
            CANCEL
          </button>
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-blue-600 text-white px-8 py-2.5 rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-50 flex items-center gap-2 uppercase tracking-widest"
          >
            {isSubmitting ? 'PROCESSING...' : 'CONFIRM REQUISITION'}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default NewRequisitionModal;
