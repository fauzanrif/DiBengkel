import React from 'react';
import { User, Clock, CheckCircle2, Wrench, PackageCheck, FileText } from 'lucide-react';

export interface TimelineEvent {
  id: string;
  type: 'status_change' | 'action' | 'note';
  title: string;
  description: string;
  timestamp: string;
  mechanic?: {
    name: string;
    role: string;
  };
}

interface RepairTimelineProps {
  events: TimelineEvent[];
}

const RepairTimeline: React.FC<RepairTimelineProps> = ({ events }) => {
  return (
    <div className="relative pl-8 space-y-8 before:absolute before:left-3 before:top-0 before:bottom-0 before:w-0.5 before:bg-slate-100">
      {events.map((event, index) => {
        const isLatest = index === 0;
        
        return (
          <div key={event.id} className="relative group">
            {/* Timeline Dot */}
            <div 
              className={`absolute -left-8 top-1 w-6 h-6 rounded-full border-4 flex items-center justify-center translate-x-[-1px] transition-all bg-white ${
                isLatest ? 'border-blue-100 bg-blue-600 shadow-lg shadow-blue-500/20' : 'border-white bg-slate-200'
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${isLatest ? 'bg-white' : 'bg-slate-400'}`}></div>
            </div>

            <div className={`p-5 rounded-3xl border transition-all ${
              isLatest 
                ? 'bg-white border-blue-100 shadow-xl shadow-blue-500/5' 
                : 'bg-slate-50/50 border-slate-100'
            }`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
                <div>
                  <h4 className={`text-sm font-black uppercase tracking-tight ${isLatest ? 'text-slate-800' : 'text-slate-500'}`}>
                    {event.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 font-medium">{event.description}</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full shrink-0">
                  <Clock size={12} className="text-slate-400" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase">{event.timestamp}</span>
                </div>
              </div>

              {event.mechanic && (
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 overflow-hidden">
                      <User size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-800 uppercase tracking-tight">{event.mechanic.name}</p>
                      <p className="text-[9px] text-slate-400 uppercase font-bold">{event.mechanic.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                    <CheckCircle2 size={12} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Verified</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RepairTimeline;
