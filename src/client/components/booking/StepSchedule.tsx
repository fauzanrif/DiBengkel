import React from 'react';
import { Calendar, Clock, MapPin, Warehouse, Truck, House, ChevronRight, ChevronLeft } from 'lucide-react';
import { BookingData } from '../../views/PortalBooking';

interface StepProps {
  data: BookingData['schedule'];
  branches: any[];
  isLoadingBranches?: boolean;
  onChange: (data: Partial<BookingData['schedule']>) => void;
  onNext: () => void;
  onBack: () => void;
}

const timeSlots = [
  '08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'
];

const StepSchedule: React.FC<StepProps> = ({ data, branches = [], isLoadingBranches, onChange, onNext, onBack }) => {
  const isFormValid = data.branchId && data.date && data.time;

  const safeBranches = Array.isArray(branches) ? branches : [];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="p-8 md:p-12">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-bold">
              04
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">Schedule & Method</h3>
              <p className="text-slate-500 font-medium">Choose how and when you want your vehicle serviced.</p>
            </div>
          </div>

          <div className="space-y-10">
            {/* Service Method */}
            <div>
              <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1 mb-4 block">Service Method</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => onChange({ method: 'walk-in' })}
                  className={`p-6 rounded-3xl border-2 transition-all flex items-center gap-4 text-left ${
                    data.method === 'walk-in' 
                    ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-lg shadow-blue-500/10' 
                    : 'border-slate-50 bg-slate-50 text-slate-500 hover:border-slate-200'
                  }`}
                >
                  <Warehouse className={data.method === 'walk-in' ? 'text-blue-600' : 'text-slate-400'} size={32} />
                  <div>
                    <p className="font-black text-sm uppercase tracking-tight">Walk-in</p>
                    <p className="text-[10px] opacity-70">Drive to branch</p>
                  </div>
                </button>

                <button
                  onClick={() => onChange({ method: 'on-site' })}
                  className={`p-6 rounded-3xl border-2 transition-all flex items-center gap-4 text-left ${
                    data.method === 'on-site' 
                    ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-lg shadow-blue-500/10' 
                    : 'border-slate-50 bg-slate-50 text-slate-500 hover:border-slate-200'
                  }`}
                >
                  <House className={data.method === 'on-site' ? 'text-blue-600' : 'text-slate-400'} size={32} />
                  <div>
                    <p className="font-black text-sm uppercase tracking-tight">On-Site</p>
                    <p className="text-[10px] opacity-70">We come to you</p>
                  </div>
                </button>

                <button
                  onClick={() => onChange({ method: 'pickup' })}
                  className={`p-6 rounded-3xl border-2 transition-all flex items-center gap-4 text-left ${
                    data.method === 'pickup' 
                    ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-lg shadow-blue-500/10' 
                    : 'border-slate-50 bg-slate-50 text-slate-500 hover:border-slate-200'
                  }`}
                >
                  <Truck className={data.method === 'pickup' ? 'text-blue-600' : 'text-slate-400'} size={32} />
                  <div>
                    <p className="font-black text-sm uppercase tracking-tight">Pickup</p>
                    <p className="text-[10px] opacity-70">Pickup & Delivery</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Branch Selection */}
            <div>
              <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1 mb-4 block">Select Workshop / Branch</label>
              {isLoadingBranches ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2].map(i => (
                    <div key={i} className="h-24 bg-slate-100 rounded-3xl animate-pulse"></div>
                  ))}
                </div>
              ) : safeBranches.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {safeBranches.map(branch => (
                    <button
                      key={branch.id}
                      onClick={() => onChange({ branchId: branch.id })}
                      className={`p-5 rounded-3xl border-2 transition-all text-left flex flex-col justify-between h-full ${
                        data.branchId === branch.id 
                        ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-lg shadow-blue-500/10' 
                        : 'border-slate-50 bg-slate-50 text-slate-500 hover:border-slate-200'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                           <MapPin className={data.branchId === branch.id ? 'text-blue-600' : 'text-slate-400'} size={20} />
                           {data.branchId === branch.id && <div className="w-2 h-2 bg-blue-600 rounded-full"></div>}
                        </div>
                        <p className="font-black text-sm uppercase tracking-tight line-clamp-1">{branch.name}</p>
                        <p className="text-[10px] opacity-70 line-clamp-2 mt-1">{branch.address || 'Premium Workshop Location'}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-8 bg-slate-50 rounded-3xl text-center border border-dashed border-slate-200">
                  <p className="text-slate-400 text-sm font-medium">No active branches found</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {/* Date Picker */}
               <div className="space-y-2">
                 <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1">Booking Date</label>
                 <div className="relative">
                   <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                   <input
                     type="date"
                     value={data.date}
                     min={new Date().toISOString().split('T')[0]}
                     onChange={(e) => onChange({ date: e.target.value })}
                     className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-800"
                   />
                 </div>
               </div>
            </div>

            {/* Time Slot Selector */}
            <div>
              <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1 mb-4 block">Preferred Arrival Time</label>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                 {timeSlots.map(time => (
                   <button
                     key={time}
                     onClick={() => onChange({ time })}
                     className={`py-3 rounded-xl font-bold text-xs transition-all border ${
                       data.time === time 
                       ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20' 
                       : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300 hover:text-slate-700'
                     }`}
                   >
                     {time}
                   </button>
                 ))}
              </div>
            </div>

            {/* Conditional Address */}
            {(data.method === 'on-site' || data.method === 'pickup') && (
               <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                 <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1">
                   {data.method === 'on-site' ? 'On-Site Service Address' : 'Pickup Address'}
                 </label>
                 <div className="relative">
                   <MapPin className="absolute left-4 top-4 text-slate-400" size={18} />
                   <textarea
                     value={data.address || ''}
                     onChange={(e) => onChange({ address: e.target.value })}
                     placeholder="Street name, house number, landmarks..."
                     rows={3}
                     className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-800 placeholder:text-slate-300 resize-none"
                   />
                 </div>
               </div>
            )}
          </div>

          <div className="mt-12 flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-3 px-8 py-4 font-bold rounded-2xl transition-all text-slate-500 hover:text-slate-800 hover:bg-slate-50"
            >
              <ChevronLeft size={20} />
              Back
            </button>
            <button
              onClick={onNext}
              disabled={!isFormValid}
              className={`flex items-center gap-3 px-10 py-4 font-bold rounded-2xl transition-all shadow-xl active:scale-95 ${
                isFormValid 
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/25 cursor-pointer' 
                : 'bg-slate-200 text-slate-400 shadow-none cursor-not-allowed'
              }`}
            >
              Review Booking
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepSchedule;
