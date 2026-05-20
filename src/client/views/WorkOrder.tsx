import React, { useEffect, useMemo, useState } from 'react';
import { Search, Wrench, Play, Check, Lock, FileText, PackagePlus } from 'lucide-react';
import { useOrders } from '../contexts/OrderContext';
import WorkOrderDetailModal from '../components/WorkOrderDetailModal';

const WorkOrder: React.FC = () => {
  const { workOrders, partRequests, fetchOrders, fetchPartRequests } = useOrders();
  const [selectedWO, setSelectedWO] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchOrders();
    fetchPartRequests();
  }, [fetchOrders, fetchPartRequests]);

  const pendingPartRequests = useMemo(() => 
    partRequests.filter((r: any) => r.status === 'pending'),
    [partRequests]
  );

  const activeSelectedWO = useMemo(() => {
    if (!selectedWO) return null;
    return workOrders.find((w: any) => w.id === selectedWO.id) || selectedWO;
  }, [selectedWO, workOrders]);

  const filteredWorkOrders = useMemo(() => {
    if (!searchTerm) return workOrders;
    const q = searchTerm.toLowerCase();
    return workOrders.filter((wo: any) => 
      (wo.woNumber && wo.woNumber.toLowerCase().includes(q)) ||
      (wo.spkNumber && wo.spkNumber.toLowerCase().includes(q)) ||
      (wo.vehicle?.plateNumber && wo.vehicle.plateNumber.toLowerCase().includes(q)) ||
      (wo.customer?.name && wo.customer.name.toLowerCase().includes(q)) ||
      (wo.vehicle?.vehicleModel?.name && wo.vehicle.vehicleModel.name.toLowerCase().includes(q))
    );
  }, [workOrders, searchTerm]);

  const simulatePartRequest = async (orderId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const partsRes = await fetch('/api/master/spare-parts');
    const parts = await partsRes.json();
    if (!parts.length) return;

    const randomPart = parts[Math.floor(Math.random() * parts.length)];
    
    try {
      const res = await fetch(`/api/orders/${orderId}/spare-parts/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{ partId: randomPart.id, quantity: Math.floor(Math.random() * 3) + 1 }]
        })
      });
      if (res.ok) {
        alert(`Requested ${randomPart.name} for this WO! Check the notifications above.`);
        await fetchPartRequests();
      }
    } catch (err) {
      console.error("Failed to simulate part request", err);
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'on_progress': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'done': return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'closed': return 'bg-slate-100 text-slate-500 border-slate-200';
      default: return 'bg-slate-50 text-slate-400 border-slate-100';
    }
  };

  const updateWOStatus = async (id: string, status: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const res = await fetch(`/api/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        await fetchOrders();
      }
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const handlePartRequest = async (requestId: string, status: string) => {
    try {
      const res = await fetch(`/api/orders/spare-parts/requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        await fetchPartRequests();
        await fetchOrders(); 
      }
    } catch (err) {
      console.error("Failed to handle part request", err);
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Workshop Operations</h2>
          <p className="text-xs text-slate-400 font-medium tracking-wide">Monitoring active jobs, part requests, and production flow</p>
        </div>
        <div className="flex gap-4">
          <div className="relative group">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search WO or Plate..." 
              className="bg-white border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-xs font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none w-64 transition-all"
            />
          </div>
        </div>
      </div>

      {/* 1. Spare Part Requests (Alert Style for Admin) */}
      {pendingPartRequests.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></div>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending Part Requests ({pendingPartRequests.length})</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {pendingPartRequests.map((req: any) => (
              <div key={req.id} className="bg-white border-2 border-red-100 rounded-2xl p-4 flex flex-col justify-between group hover:border-red-500 transition-all">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-bold text-slate-800 text-sm tracking-tight">{req.order?.vehicle?.plateNumber}</div>
                    <span className="text-[9px] font-black text-red-500 bg-red-50 px-2 py-0.5 rounded border border-red-100 uppercase">Awaiting Approval</span>
                  </div>
                  <div className="space-y-1.5 mb-4">
                    {req.items.map((item: any) => (
                      <div key={item.id} className="flex justify-between items-center text-[11px] bg-slate-50 p-2 rounded-lg">
                        <span className="font-bold text-slate-600">{item.part?.name}</span>
                        <span className="font-mono font-black text-blue-600">x{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => handlePartRequest(req.id, 'rejected')} className="py-1.5 rounded-lg text-[10px] font-bold text-slate-400 hover:bg-slate-50 transition-all border border-transparent hover:border-slate-200">REJECT</button>
                  <button onClick={() => handlePartRequest(req.id, 'approved')} className="py-1.5 rounded-lg text-[10px] font-bold bg-red-500 text-white hover:bg-red-600 transition-all shadow-lg shadow-red-500/20">APPROVE</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Active WOs */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Active Work Orders</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
          {filteredWorkOrders.length === 0 ? (
            <div className="lg:col-span-full bg-white rounded-3xl border border-slate-200 p-20 text-center text-slate-300 font-medium italic">
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
                  <Wrench className="text-slate-200" />
                </div>
                {searchTerm ? 'No work orders matching your search.' : 'No active work orders. Approve a requisition to start production.'}
              </div>
            </div>
          ) : (
            filteredWorkOrders.map((wo: any) => (
              <div 
                key={wo.id} 
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden cursor-pointer"
                onClick={() => setSelectedWO(wo)}
              >
                {wo.status === 'on_progress' && (
                  <div className="absolute -right-8 top-4 rotate-45 bg-emerald-500 text-white px-10 py-1 text-[8px] font-black uppercase tracking-widest shadow-sm">
                    IN PRODUCTION
                  </div>
                )}

                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap gap-1 items-center mb-1">
                      <span className="text-[9px] font-mono font-black text-blue-500 bg-blue-50 px-2 py-0.5 rounded-md">
                        {wo.woNumber || 'NO-WO'}
                      </span>
                      <span className="text-[9px] font-mono font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        SPK: {wo.spkNumber}
                      </span>
                      {wo.branch?.name && (
                        <span className="text-[9px] font-bold text-slate-600 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md uppercase tracking-wider">
                          📍 {wo.branch.name}
                        </span>
                      )}
                    </div>
                    <div className="font-black text-slate-800 text-lg tracking-tight">
                      {wo.vehicle?.plateNumber}
                    </div>
                    <div className="text-[11px] text-slate-500 font-bold uppercase tracking-tight">
                      {wo.vehicle?.vehicleModel?.name || wo.vehicle?.model || 'Unknown Model'} • {wo.odometer?.toLocaleString() || wo.odometer} KM
                    </div>
                  </div>
                  <span className={`${getStatusClass(wo.status)} px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border`}>
                    {wo.status}
                  </span>
                </div>

                {/* Maintenance Requisition synced fields */}
                <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-150 space-y-3 text-xs mb-4">
                  <div className="grid grid-cols-2 gap-3 pb-2.5 border-b border-slate-200/60">
                    <div>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Customer & Phone</span>
                      <span className="font-bold text-slate-700 block truncate">{wo.customer?.name}</span>
                      <span className="text-[10px] text-slate-500 block">{wo.customer?.phone || '-'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Service & Reference</span>
                      <span className="font-extrabold text-blue-600 uppercase tracking-wide text-[10px] block">{wo.serviceType}</span>
                      <span className="text-[9px] font-mono text-slate-400 block font-bold">Ref: {wo.referenceNumber || '-'}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Complaint</span>
                      <p className="text-[10px] text-slate-500 italic line-clamp-2" title={wo.complaint}>
                        {wo.complaint || 'No complaint details.'}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Total Est.</span>
                      <span className="font-black text-slate-800 text-sm">
                        ${Number(wo.estimatedTotal || 0).toLocaleString()}
                      </span>
                      <span className="text-[9px] text-slate-404 block text-slate-400 font-mono">Date: {new Date(wo.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Assigned Mechanics</span>
                         <div className="flex items-center gap-1.5 max-w-full overflow-hidden">
                           {wo.mechanics && wo.mechanics.length > 0 ? (
                             <div className="flex -space-x-2 overflow-hidden">
                               {wo.mechanics.map((m: any, index: number) => (
                                 <div 
                                   key={m.id || index} 
                                   className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 ring-2 ring-white flex items-center justify-center text-[10px] font-black uppercase"
                                   title={m.mechanic?.name}
                                 >
                                   {m.mechanic?.name?.[0] || '?'}
                                 </div>
                               ))}
                             </div>
                           ) : (
                             <span className="text-xs font-bold text-slate-400">Unassigned</span>
                           )}
                           <span className="text-xs font-bold text-slate-600 truncate ml-1">
                             {wo.mechanics && wo.mechanics.length > 0 
                               ? `${wo.mechanics.length} Mech`
                               : ''}
                           </span>
                         </div>
                      </div>
                      <div className="space-y-1 text-right">
                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Est. Completion</span>
                         <div className="text-xs font-bold text-slate-700">{new Date(Date.now() + 86400000).toLocaleDateString()}</div>
                      </div>
                  </div>

                  <div className="space-y-2">
                     <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                       <span>Job Progress</span>
                       <span>{wo.status === 'done' || wo.status === 'closed' ? '100%' : (wo.status === 'on_progress' ? '65%' : '0%')}</span>
                     </div>
                     <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                       <div 
                         className={`h-full transition-all duration-1000 ${wo.status === 'done' || wo.status === 'closed' ? 'bg-emerald-500' : 'bg-blue-500'}`} 
                         style={{ width: wo.status === 'done' || wo.status === 'closed' ? '100%' : (wo.status === 'on_progress' ? '65%' : '0%') }}
                       ></div>
                     </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    {wo.status === 'approved' && (
                        <button 
                        onClick={(e) => updateWOStatus(wo.id, 'on_progress', e)}
                        className="flex-1 bg-slate-900 text-white py-2.5 rounded-xl text-[11px] font-bold hover:bg-blue-600 transition-all active:scale-95 shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2"
                        >
                        <Play size={12} /> START JOB
                        </button>
                    )}
                    {wo.status === 'on_progress' && (
                        <button 
                        onClick={(e) => updateWOStatus(wo.id, 'done', e)}
                        className="flex-1 bg-emerald-500 text-white py-2.5 rounded-xl text-[11px] font-bold hover:bg-emerald-600 transition-all active:scale-95 shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2"
                        >
                        <Check size={14} /> FINISH JOB
                        </button>
                    )}
                    {wo.status === 'done' && (
                        <button 
                        onClick={(e) => updateWOStatus(wo.id, 'closed', e)}
                        className="flex-1 bg-slate-800 text-white py-2.5 rounded-xl text-[11px] font-bold hover:bg-slate-900 transition-all active:scale-95 shadow-lg shadow-slate-800/10 flex items-center justify-center gap-2"
                        >
                        <Lock size={12} /> CLOSE WO
                        </button>
                    )}
                    <button onClick={(e) => simulatePartRequest(wo.id, e)} className="w-10 h-10 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:bg-white hover:text-orange-500 transition-all group-hover:border-slate-300 shrink-0" title="Simulate Mechanic Part Request">
                      <PackagePlus size={16} />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedWO(wo);
                      }} 
                      className="w-10 h-10 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:bg-white hover:text-blue-500 transition-all group-hover:border-slate-300 shrink-0"
                      title="View Details & Form"
                    >
                      <FileText size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Render Work Order Detail Modal */}
      {selectedWO && (
        <WorkOrderDetailModal 
          isOpen={!!selectedWO}
          onClose={() => setSelectedWO(null)}
          order={activeSelectedWO}
          allPartRequests={partRequests}
          onSuccess={async () => {
            await fetchOrders();
            await fetchPartRequests();
          }}
        />
      )}
    </div>
  );
};

export default WorkOrder;
