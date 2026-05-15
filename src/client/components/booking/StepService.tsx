import React from 'react';
import { Wrench, AlertTriangle, Upload, ChevronRight, ChevronLeft, Check, Camera } from 'lucide-react';
import { BookingData } from '../../views/PortalBooking';

interface StepProps {
  data: BookingData['service'];
  onChange: (data: Partial<BookingData['service']>) => void;
  onNext: () => void;
  onBack: () => void;
}

const serviceTypes = [
  { id: 'ac', name: 'AC Repair', icon: '❄️' },
  { id: 'engine', name: 'Engine Repair', icon: '⚙️' },
  { id: 'suspension', name: 'Suspension', icon: '🚜' },
  { id: 'body', name: 'Body Repair', icon: '✨' },
  { id: 'power_steering', name: 'Power Steering', icon: '☸️' },
  { id: 'general', name: 'General Service', icon: '🛠️' }
];

const StepService: React.FC<StepProps> = ({ data, onChange, onNext, onBack }) => {
  const isFormValid = data.complaint.trim().length >= 3;

  const handleNext = () => {
    if (data.type.length === 0) {
      onChange({ type: ['general'] });
    }
    onNext();
  };

  const toggleService = (id: string) => {
    const newTypes = data.type.includes(id) 
      ? data.type.filter(t => t !== id) 
      : [...data.type, id];
    onChange({ type: newTypes });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="p-8 md:p-12">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-bold">
              03
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">Complaint & Service</h3>
              <p className="text-slate-500 font-medium">Describe what needs attention on your vehicle.</p>
            </div>
          </div>

          <div className="space-y-10">
            {/* Service Type Cards */}
            <div>
              <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1 mb-4 block">Select Service Category</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {serviceTypes.map((service) => {
                  const isSelected = data.type.includes(service.id);
                  return (
                    <button
                      key={service.id}
                      onClick={() => toggleService(service.id)}
                      className={`p-6 rounded-3xl border-2 transition-all group relative overflow-hidden flex flex-col items-center gap-3 text-center ${
                        isSelected 
                        ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-lg shadow-blue-500/10' 
                        : 'border-slate-50 bg-slate-50 text-slate-500 hover:border-slate-200'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-3 right-3 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white scale-110">
                          <Check size={12} strokeWidth={4} />
                        </div>
                      )}
                      <span className="text-4xl group-hover:scale-110 transition-transform duration-300">{service.icon}</span>
                      <span className="font-bold text-sm">{service.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Complaint Field */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1">Main Complaint</label>
              <textarea
                value={data.complaint}
                onChange={(e) => onChange({ complaint: e.target.value })}
                placeholder="Briefly describe the symptoms or problems..."
                rows={4}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-800 placeholder:text-slate-300 resize-none"
              />
              <p className="text-[10px] text-slate-400 font-medium italic ml-1">Please provide a brief description of your vehicle issue.</p>
            </div>

            {/* Emergency & Additional */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-2">
                 <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1">Emergency Level</label>
                 <div className="flex gap-2">
                   {['low', 'medium', 'high'].map((level) => (
                     <button
                       key={level}
                       onClick={() => onChange({ emergencyLevel: level as any })}
                       className={`flex-1 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border-2 ${
                         data.emergencyLevel === level 
                         ? level === 'high' ? 'bg-red-50 border-red-500 text-red-700' : level === 'medium' ? 'bg-amber-50 border-amber-500 text-amber-700' : 'bg-green-50 border-green-500 text-green-700'
                         : 'bg-slate-50 border-slate-100 text-slate-400 opacity-60'
                       }`}
                     >
                       {level}
                     </button>
                   ))}
                 </div>
               </div>

               <div className="space-y-2">
                 <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1">Photo Reference (Optional)</label>
                 <div className="group relative">
                   <div className="w-full flex items-center justify-between px-5 py-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl group-hover:border-blue-400 transition-colors cursor-pointer overflow-hidden">
                     <div className="flex items-center gap-3">
                       <Camera className="text-slate-400" size={18} />
                       <span className="text-sm font-bold text-slate-500">Upload Photo</span>
                     </div>
                     <Upload className="text-slate-400" size={18} />
                   </div>
                   <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => onChange({ photo: e.target.files?.[0] || null })} />
                 </div>
               </div>
            </div>
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
              onClick={handleNext}
              disabled={!isFormValid}
              className={`flex items-center gap-3 px-10 py-4 font-bold rounded-2xl transition-all shadow-xl active:scale-95 ${
                isFormValid 
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/25 cursor-pointer' 
                : 'bg-slate-200 text-slate-400 shadow-none cursor-not-allowed'
              }`}
            >
              Set Schedule
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepService;
