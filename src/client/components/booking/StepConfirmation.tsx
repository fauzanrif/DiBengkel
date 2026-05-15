import React, { useState } from 'react';
import { 
  User, 
  Car, 
  Wrench, 
  Calendar, 
  MapPin, 
  ChevronLeft, 
  CheckCircle2, 
  ShieldCheck,
  Loader2,
  Clock,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { BookingData } from '../../views/PortalBooking';

interface StepProps {
  data: BookingData;
  branches: any[];
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

const StepConfirmation: React.FC<StepProps> = ({ data, branches = [], onBack, onSubmit, isSubmitting }) => {
  const [agreed, setAgreed] = useState(false);

  // Helper formats
  const formatServiceTypes = (types: string[]) => {
    return types.map(t => t.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')).join(', ');
  };

  const safeBranches = Array.isArray(branches) ? branches : [];
  const selectedBranch = safeBranches.find(b => b.id === data.schedule.branchId);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Summary Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 md:p-10">
            <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-8">Booking Summary</h3>
            
            <div className="space-y-10">
              {/* Customer Info */}
              <div className="flex gap-6">
                 <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
                   <User size={24} />
                 </div>
                 <div className="flex-1">
                   <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Customer</p>
                   <p className="font-bold text-slate-800 text-lg">{data.customer.name}</p>
                   <div className="flex flex-wrap gap-4 mt-2">
                     <p className="text-sm text-slate-500 font-medium flex items-center gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                       {data.customer.phone}
                     </p>
                     <p className="text-sm text-slate-500 font-medium flex items-center gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                       {data.customer.email}
                     </p>
                   </div>
                 </div>
              </div>

              {/* Vehicle Info */}
              <div className="flex gap-6">
                 <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                   <Car size={24} />
                 </div>
                 <div className="flex-1">
                   <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Vehicle</p>
                   <p className="font-bold text-slate-800 text-lg">
                     <span className="bg-slate-800 text-white px-2 py-0.5 rounded text-sm mr-2 tracking-widest">{data.vehicle.plateNumber}</span>
                     {data.vehicle.brand} {data.vehicle.model} ({data.vehicle.year})
                   </p>
                   <p className="text-sm text-slate-500 font-medium mt-1">
                     Odometer: {data.vehicle.odometer} km • Transmission: {data.vehicle.transmission}
                   </p>
                 </div>
              </div>

              {/* Service Request */}
              <div className="flex gap-6">
                 <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center shrink-0">
                   <Wrench size={24} />
                 </div>
                 <div className="flex-1">
                   <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Service Request</p>
                   <p className="font-bold text-slate-800 mb-1">{formatServiceTypes(data.service.type)}</p>
                   <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100 italic leading-relaxed">
                     "{data.service.complaint}"
                   </p>
                   <div className="mt-2 flex items-center gap-2">
                      <span className={`text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded ${
                        data.service.emergencyLevel === 'high' ? 'bg-red-100 text-red-700' : data.service.emergencyLevel === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                      }`}>
                        Priority: {data.service.emergencyLevel}
                      </span>
                   </div>
                 </div>
              </div>

              {/* Schedule */}
              <div className="flex gap-6">
                 <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center shrink-0">
                   <Calendar size={24} />
                 </div>
                 <div className="flex-1">
                   <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Schedule</p>
                   <p className="font-bold text-slate-800 text-lg">
                     {new Date(data.schedule.date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })} at {data.schedule.time}
                   </p>
                   <div className="flex flex-col gap-1 mt-2">
                     <p className="text-sm text-slate-500 font-medium flex items-center gap-2 uppercase tracking-wide">
                       <MapPin size={14} />
                       Method: {data.schedule.method}
                     </p>
                     <p className="text-sm text-slate-500 font-medium flex items-center gap-2">
                       <Clock size={14} />
                       Branch: {selectedBranch?.name || data.schedule.branchId}
                     </p>
                   </div>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="space-y-6">
           <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-2xl shadow-slate-900/40 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700"></div>
              
              <h4 className="text-xl font-bold mb-6 relative z-10">Ready to Book?</h4>
              
              <div className="space-y-4 mb-8 relative z-10">
                 <div className="flex items-center gap-3 text-xs text-slate-400">
                   <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[8px] font-black border border-slate-700">1</div>
                   Automated analysis generated
                 </div>
                 <div className="flex items-center gap-3 text-xs text-slate-400">
                   <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[8px] font-black border border-slate-700">2</div>
                   Priority level: {data.service.emergencyLevel}
                 </div>
                 <div className="flex items-center gap-3 text-xs text-slate-400">
                   <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[8px] font-black border border-slate-700">3</div>
                   Service method confirmed
                 </div>
              </div>

              <label className="flex items-start gap-3 cursor-pointer group/label mb-8 relative z-10">
                <input 
                  type="checkbox" 
                  checked={agreed} 
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-500 focus:ring-0 focus:ring-offset-0" 
                />
                <span className="text-[10px] leading-relaxed text-slate-400 group-hover/label:text-slate-200 transition-colors">
                  I agree to the DiBengkel Terms of Service and Privacy Policy. I confirm that all information provided is accurate.
                </span>
              </label>

              <button
                onClick={onSubmit}
                disabled={!agreed || isSubmitting}
                className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all relative z-10 ${
                  agreed && !isSubmitting 
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-500/20 active:scale-95' 
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Confirm Booking
                    <ChevronRight size={20} />
                  </>
                )}
              </button>
           </div>

           <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 flex flex-col gap-4">
              <div className="flex items-center gap-3 text-slate-500">
                <ShieldCheck size={20} />
                <span className="text-xs font-bold">Secure Booking</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Your data is processed according to ISO/IEC 27001 standards. We only share your information with our authorized service advisors.
              </p>
              <button 
                onClick={onBack}
                disabled={isSubmitting}
                className="w-full py-3 text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all border border-transparent hover:border-slate-200"
              >
                Edit Details
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default StepConfirmation;
