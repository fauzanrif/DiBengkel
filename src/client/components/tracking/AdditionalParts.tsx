import React from 'react';
import { Wrench, Package, ChevronRight, AlertTriangle } from 'lucide-react';

interface AdditionalPart {
  id: string;
  name: string;
  price: number;
  reason: string;
  status: 'waiting' | 'approved' | 'rejected';
  mechanicNote: string;
}

interface AdditionalPartsProps {
  parts: AdditionalPart[];
  onApprove: (id: string) => void;
}

const AdditionalParts: React.FC<AdditionalPartsProps> = ({ parts, onApprove }) => {
  const waitingParts = parts.filter(p => p.status === 'waiting');

  if (waitingParts.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">New Recommendations</h4>
        <span className="px-2 py-0.5 bg-amber-100 text-amber-600 rounded-full text-[8px] font-black uppercase animate-pulse">Waiting Confirmation</span>
      </div>
      
      {waitingParts.map(part => (
        <div key={part.id} className="group relative bg-white border border-slate-100 rounded-3xl p-6 shadow-xl shadow-slate-200/40 hover:border-blue-200 transition-all">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
              <Package size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h5 className="text-sm font-black text-slate-800 uppercase tracking-tight truncate">{part.name}</h5>
                <p className="text-sm font-black text-blue-600">Rp {part.price.toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={12} className="text-amber-500" />
                <p className="text-[10px] font-bold text-slate-500 uppercase">{part.reason}</p>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-4">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Mechanic Note:</p>
                <p className="text-[11px] text-slate-600 font-medium leading-relaxed italic">"{part.mechanicNote}"</p>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => onApprove(part.id)}
                  className="flex-1 bg-blue-600 text-white rounded-xl py-3 text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  Confirm & Add <ChevronRight size={14} />
                </button>
                <button className="px-6 py-3 border border-slate-200 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
                  Decline
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdditionalParts;
