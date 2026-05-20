import React, { useState, useEffect, useMemo } from 'react';
import { X, User, Car, Wrench, ClipboardList, Users, Plus, Check, AlertCircle, Package, Layers } from 'lucide-react';

interface WorkOrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  onSuccess: () => void;
  allPartRequests: any[];
}

const WorkOrderDetailModal: React.FC<WorkOrderDetailModalProps> = ({ 
  isOpen, 
  onClose, 
  order, 
  onSuccess,
  allPartRequests
}) => {
  const [mechanics, setMechanics] = useState<any[]>([]);
  const [spareParts, setSpareParts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Assign mechanic states
  const [assignedMechanicIds, setAssignedMechanicIds] = useState<string[]>([]);
  const [isSavingMechanics, setIsSavingMechanics] = useState(false);

  // Request additional parts states
  const [selectedPartId, setSelectedPartId] = useState('');
  const [partQuantity, setPartQuantity] = useState(1);
  const [isRequestingPart, setIsRequestingPart] = useState(false);

  // Load master data
  useEffect(() => {
    if (!isOpen || !order) return;

    // Load available mechanics
    const fetchMechanics = async () => {
      try {
        const res = await fetch('/api/master/mechanics');
        if (res.ok) {
          const data = await res.json();
          setMechanics(data);
        }
      } catch (err) {
        console.error('Failed to fetch mechanics list', err);
      }
    };

    // Load available parts
    const fetchParts = async () => {
      try {
        const res = await fetch('/api/master/spare-parts');
        if (res.ok) {
          const data = await res.json();
          setSpareParts(data);
        }
      } catch (err) {
        console.error('Failed to fetch spare parts list', err);
      }
    };

    fetchMechanics();
    fetchParts();

    // Set currently assigned mechanics
    if (order.mechanics) {
      const currentIds = order.mechanics.map((m: any) => m.mechanicId || m.mechanic?.id);
      setAssignedMechanicIds(currentIds.filter(Boolean));
    }
  }, [isOpen, order]);

  // Extract parts from original Requisition/Order Items
  const requisitionParts = useMemo(() => {
    if (!order || !order.items) return [];
    return order.items.filter((item: any) => !item.isService && item.part);
  }, [order]);

  // Extract additional requests for this order
  const additionalRequests = useMemo(() => {
    if (!order) return [];
    return allPartRequests.filter((req: any) => req.orderId === order.id);
  }, [order, allPartRequests]);

  // Handle saving mechanics assignment
  const handleSaveMechanics = async () => {
    if (!order) return;
    setIsSavingMechanics(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/mechanics`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mechanicIds: assignedMechanicIds })
      });
      if (res.ok) {
        alert('Mechanics assigned successfully!');
        onSuccess();
      } else {
        alert('Failed to save mechanic assignment');
      }
    } catch (err) {
      console.error('Error saving mechanics', err);
      alert('Error updating mechanics');
    } finally {
      setIsSavingMechanics(false);
    }
  };

  // Toggle mechanic selection
  const toggleMechanic = (mechanicId: string) => {
    setAssignedMechanicIds(prev => 
      prev.includes(mechanicId) 
        ? prev.filter(id => id !== mechanicId) 
        : [...prev, mechanicId]
    );
  };

  // Submit additional part request
  const handleRequestPart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order || !selectedPartId || partQuantity <= 0) {
      alert('Please select a part and valid quantity.');
      return;
    }

    setIsRequestingPart(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/spare-parts/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{ partId: selectedPartId, quantity: partQuantity }]
        })
      });

      if (res.ok) {
        alert('Additional part request submitted successfully! Awaiting approval.');
        setSelectedPartId('');
        setPartQuantity(1);
        onSuccess();
      } else {
        alert('Failed to submit part request.');
      }
    } catch (err) {
      console.error('Error requesting part', err);
      alert('Error requesting part.');
    } finally {
      setIsRequestingPart(false);
    }
  };

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[90vh]">
        {/* Header */}
        <header className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono font-black text-blue-500 bg-blue-50 px-2.5 py-1 rounded-md">
                {order.woNumber || 'NO-WO'}
              </span>
              <span className="text-[10px] font-mono font-black text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                SPK: {order.spkNumber}
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              <Wrench className="text-blue-500" size={18} /> Work Order Form & Details
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
            <X size={20} />
          </button>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/20">
          
          {/* Main Info Block */}
          <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <Car size={10} /> Vehicle Info
              </span>
              <div className="font-bold text-slate-800 text-sm">
                {order.vehicle?.plateNumber}
              </div>
              <div className="text-xs text-slate-500">
                {order.vehicle?.vehicleModel?.name || 'Unknown Model'}
              </div>
              <div className="text-[10px] bg-slate-50 text-slate-500 rounded px-2 py-0.5 inline-block font-bold">
                Odometer: {order.odometer?.toLocaleString()} KM
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <User size={10} /> Customer
              </span>
              <div className="font-bold text-slate-800 text-sm">
                {order.customer?.name}
              </div>
              <div className="text-xs text-slate-500">
                {order.customer?.phone || 'No phone'}
              </div>
              <div className="text-[10px] text-blue-600 bg-blue-50 font-bold px-2 py-0.5 rounded inline-block uppercase tracking-wider">
                {order.serviceType}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <ClipboardList size={10} /> Job Details
              </span>
              <div className="text-xs text-slate-700 font-semibold line-clamp-2" title={order.complaint}>
                <span className="text-red-500 font-bold">Complaint:</span> {order.complaint}
              </div>
              {order.analysis && (
                <div className="text-xs text-slate-500 line-clamp-2 mt-1" title={order.analysis}>
                  <span className="text-blue-500 font-bold">Analysis:</span> {order.analysis}
                </div>
              )}
            </div>
          </section>

          {/* Grid for Left-Side (Requisition Parts & Additional Request History) and Right-Side (Mechanic & New Part Request Form) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left Box: Parts list */}
            <div className="space-y-6">
              
              {/* Parts from Requisition */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Layers className="text-slate-500" size={16} />
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">Original Parts from Requisition</h3>
                    <p className="text-[10px] text-slate-400">Parts inputted during initial Maintenance Requisition</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {requisitionParts.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-xs italic bg-slate-50/55 rounded-xl border border-dashed border-slate-200">
                      No parts were originally requested in the Maintenance Requisition.
                    </div>
                  ) : (
                    requisitionParts.map((item: any) => (
                      <div key={item.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div>
                          <p className="text-xs font-bold text-slate-800">{item.part?.name}</p>
                          <p className="text-[9px] text-slate-400 font-mono font-bold uppercase tracking-wide">CODE: {item.part?.code}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-mono font-black text-blue-600 bg-blue-50 px-2 py-1 rounded">
                            x{item.quantity} {item.part?.unit || 'Units'}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Additional Requested Parts List History */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Package className="text-slate-500" size={16} />
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">Additional Parts Requested</h3>
                    <p className="text-[10px] text-slate-400">Trace additional requests sent during production</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {additionalRequests.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-xs italic bg-slate-50/55 rounded-xl border border-dashed border-slate-200">
                      No additional parts requested yet.
                    </div>
                  ) : (
                    additionalRequests.map((req: any) => (
                      <div key={req.id} className="p-3.5 border border-slate-200 rounded-xl bg-white space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">
                            Requested {new Date(req.createdAt).toLocaleDateString()}
                          </span>
                          <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded tracking-wider border ${
                            req.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                            req.status === 'rejected' ? 'bg-red-50 text-red-600 border-red-100' :
                            'bg-amber-50 text-amber-600 border-amber-100'
                          }`}>
                            {req.status}
                          </span>
                        </div>
                        <div className="space-y-1">
                          {req.items?.map((it: any) => (
                            <div key={it.id} className="flex justify-between text-xs text-slate-700">
                              <span className="font-medium">• {it.part?.name || 'Part'}</span>
                              <span className="font-mono font-bold">Qty: {it.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            {/* Right Box: Action Forms */}
            <div className="space-y-6">

              {/* Assign Mechanics Form */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Users className="text-slate-500" size={16} />
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">1. Assign Mechanic</h3>
                      <p className="text-[10px] text-slate-400">Select one or more technicians for this job</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleSaveMechanics}
                    disabled={isSavingMechanics}
                    className="bg-slate-900 text-white hover:bg-slate-800 active:scale-95 text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
                  >
                    {isSavingMechanics ? 'SAVING...' : 'SAVE MECHANICS'}
                  </button>
                </div>

                <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
                  {mechanics.length === 0 ? (
                    <div className="text-center py-4 text-slate-300 italic text-xs">
                      Loading mechanics...
                    </div>
                  ) : (
                    mechanics.map((mech) => {
                      const isAssigned = assignedMechanicIds.includes(mech.id);
                      return (
                        <div 
                          key={mech.id} 
                          onClick={() => toggleMechanic(mech.id)}
                          className={`flex justify-between items-center p-3 rounded-xl border cursor-pointer transition-all ${
                            isAssigned 
                              ? 'border-blue-500 bg-blue-50/40 text-blue-700' 
                              : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              isAssigned ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500'
                            }`}>
                              {mech.name?.[0]?.toUpperCase()}
                            </div>
                            <span className="text-xs font-bold leading-none">{mech.name}</span>
                          </div>
                          <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                            isAssigned ? 'bg-blue-500 border-blue-500 text-white' : 'border-slate-300'
                          }`}>
                            {isAssigned && <Check size={10} strokeWidth={4} />}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Request Additional Parts Form */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Plus className="text-slate-500" size={16} />
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">2. Request Additional Parts</h3>
                    <p className="text-[10px] text-slate-400">Request extra spareparts required on progress</p>
                  </div>
                </div>

                <form onSubmit={handleRequestPart} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Select Spare Part</label>
                    <select 
                      value={selectedPartId}
                      onChange={(e) => setSelectedPartId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                      required
                    >
                      <option value="">-- Choose Sparepart --</option>
                      {spareParts.map((part) => (
                        <option key={part.id} value={part.id}>
                          {part.name} ({part.code}) - ${Number(part.basePrice).toLocaleString()}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Quantity</label>
                      <input 
                        type="number" 
                        min="1"
                        value={partQuantity}
                        onChange={(e) => setPartQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3.5 text-xs font-bold outline-none"
                        required
                      />
                    </div>
                    <div className="flex items-end">
                      <button 
                        type="submit"
                        disabled={isRequestingPart || !selectedPartId}
                        className="w-full bg-blue-600 text-white hover:bg-blue-700 active:scale-95 text-xs font-bold py-2 px-4 rounded-xl transition-all shadow-md shadow-blue-500/10 disabled:opacity-50 flex items-center justify-center gap-1.5"
                      >
                        <Plus size={14} /> REQUEST PART
                      </button>
                    </div>
                  </div>
                </form>
              </div>

            </div>

          </div>

        </div>

        {/* Footer */}
        <footer className="p-6 border-t border-slate-100 bg-white flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition-all uppercase tracking-widest"
          >
            CLOSE
          </button>
        </footer>
      </div>
    </div>
  );
};

export default WorkOrderDetailModal;
