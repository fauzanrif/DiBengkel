import React from 'react';
import { Info, Plus, ChevronRight, AlertCircle, Wrench } from 'lucide-react';

interface SparePart {
  name: string;
  qty: number;
  price: number;
  status: 'approved' | 'waiting' | 'installed';
}

interface EstimationSummaryProps {
  serviceCharges: number;
  parts: SparePart[];
  discount: number;
  initialEstimate: number;
}

const EstimationSummary: React.FC<EstimationSummaryProps> = ({ serviceCharges, parts, discount, initialEstimate }) => {
  const partsTotal = parts.reduce((acc, part) => acc + (part.price * part.qty), 0);
  const total = serviceCharges + partsTotal - discount;
  const isHigher = total > initialEstimate;

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase">Estimation Summary</h3>
          <div className="bg-slate-50 px-4 py-2 rounded-2xl flex items-center gap-2">
            <Info size={16} className="text-slate-400" />
            <span className="text-xs font-bold text-slate-500 tracking-tight">Prices include VAT 11%</span>
          </div>
        </div>

        <div className="space-y-6">
          {/* Service Fee */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                <Wrench size={20} />
              </div>
              <div>
                <p className="text-sm font-black text-slate-800 uppercase tracking-tight">Service Charges</p>
                <p className="text-[10px] text-slate-400 font-medium">Labor & Diagnostics</p>
              </div>
            </div>
            <p className="text-sm font-bold text-slate-800">Rp {serviceCharges.toLocaleString()}</p>
          </div>

          {/* Spare Parts Detail */}
          <div className="bg-slate-50 p-6 rounded-3xl space-y-4">
             <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Spare Parts List</p>
                <span className="text-[10px] font-bold text-slate-500">{parts.length} Items</span>
             </div>
             {parts.map((part, idx) => (
                <div key={idx} className="flex items-center justify-between group">
                   <div className="flex items-center gap-2">
                      <div className="w-1 h-3 bg-blue-200 rounded-full group-hover:bg-blue-500 transition-colors"></div>
                      <p className="text-xs font-medium text-slate-700">{part.name}</p>
                      <span className="text-[10px] text-slate-400 font-bold tracking-tighter">x{part.qty}</span>
                   </div>
                   <p className="text-xs font-bold text-slate-600">Rp {(part.price * part.qty).toLocaleString()}</p>
                </div>
             ))}
          </div>

          {/* New/Additional Notification if applicable */}
          {parts.some(p => p.status === 'waiting') && (
            <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-start gap-3">
               <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={20} />
               <div className="flex-1">
                  <p className="text-xs font-black text-amber-800 uppercase tracking-tight">Action Required</p>
                  <p className="text-[10px] text-amber-700 font-medium mt-1">Some additional parts/services need your approval.</p>
                  <button className="mt-3 flex items-center gap-2 bg-amber-600 text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-700 transition-colors">
                    Review and Approve <ChevronRight size={14} />
                  </button>
               </div>
            </div>
          )}

          {/* Total Breakdown */}
          <div className="pt-6 border-t border-dashed border-slate-200 space-y-3">
             <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase tracking-widest">Subtotal</span>
                <span className="text-xs font-bold">Rp {(serviceCharges + partsTotal).toLocaleString()}</span>
             </div>
             <div className="flex items-center justify-between text-green-600">
                <span className="text-xs font-bold uppercase tracking-widest">Discount</span>
                <span className="text-xs font-bold">- Rp {discount.toLocaleString()}</span>
             </div>
             <div className="pt-4 flex items-end justify-between">
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Estimated Total</p>
                   <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Rp {total.toLocaleString()}</h2>
                </div>
                {isHigher && (
                   <div className="text-right">
                      <p className="text-[10px] font-black text-amber-600 uppercase tracking-tight">Increased from initial</p>
                      <p className="text-xs font-bold text-amber-600">+ Rp {(total - initialEstimate).toLocaleString()}</p>
                   </div>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EstimationSummary;
