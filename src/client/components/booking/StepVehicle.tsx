import React from 'react';
import { Car, Hash, Calendar, Gauge, Shield, ChevronRight, ChevronLeft } from 'lucide-react';
import { BookingData } from '../../views/PortalBooking';

interface StepProps {
  data: BookingData['vehicle'];
  onChange: (data: Partial<BookingData['vehicle']>) => void;
  onNext: () => void;
  onBack: () => void;
}

const StepVehicle: React.FC<StepProps> = ({ data, onChange, onNext, onBack }) => {
  const isFormValid = data.plateNumber && data.brand && data.model && data.odometer;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="p-8 md:p-12">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-bold">
              02
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">Vehicle Information</h3>
              <p className="text-slate-500 font-medium">Help us identify your vehicle and its maintenance status.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* License Plate */}
            <div className="md:col-span-2 lg:col-span-1 space-y-2">
              <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1">License Plate</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 opacity-40">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-800"></span>
                  <div className="w-px h-4 bg-slate-400 mx-1"></div>
                </div>
                <input
                  type="text"
                  value={data.plateNumber}
                  onChange={(e) => onChange({ plateNumber: e.target.value.toUpperCase() })}
                  placeholder="B 1234 ABC"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-black text-lg text-slate-800 placeholder:text-slate-300 uppercase tracking-widest"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1">Brand</label>
              <div className="relative">
                <Car className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <select
                  value={data.brand}
                  onChange={(e) => onChange({ brand: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-800 appearance-none cursor-pointer"
                >
                  <option value="">Select Brand</option>
                  <option value="toyota">Toyota</option>
                  <option value="honda">Honda</option>
                  <option value="mitsubishi">Mitsubishi</option>
                  <option value="suzuki">Suzuki</option>
                  <option value="bmw">BMW</option>
                  <option value="mercedes">Mercedes-Benz</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1">Model Name</label>
              <input
                type="text"
                value={data.model}
                onChange={(e) => onChange({ model: e.target.value })}
                placeholder="e.g. Avanza, CR-V"
                className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-800 placeholder:text-slate-300"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1">Year</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  value={data.year}
                  onChange={(e) => onChange({ year: e.target.value })}
                  placeholder="2022"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-800 placeholder:text-slate-300"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1">Transmission</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onChange({ transmission: 'automatic' })}
                  className={`py-4 rounded-2xl font-bold transition-all border-2 text-xs ${
                    data.transmission === 'automatic' 
                    ? 'border-blue-600 bg-blue-50 text-blue-700' 
                    : 'border-slate-100 bg-slate-50 text-slate-400'
                  }`}
                >
                  AT
                </button>
                <button
                  onClick={() => onChange({ transmission: 'manual' })}
                  className={`py-4 rounded-2xl font-bold transition-all border-2 text-xs ${
                    data.transmission === 'manual' 
                    ? 'border-blue-600 bg-blue-50 text-blue-700' 
                    : 'border-slate-100 bg-slate-50 text-slate-400'
                  }`}
                >
                  MT
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1">Current Odometer (km)</label>
              <div className="relative">
                <Gauge className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="number"
                  value={data.odometer}
                  onChange={(e) => onChange({ odometer: e.target.value })}
                  placeholder="12500"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-800 placeholder:text-slate-300"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1">Chassis Number (Optional)</label>
              <input
                type="text"
                value={data.chassisNumber}
                onChange={(e) => onChange({ chassisNumber: e.target.value.toUpperCase() })}
                placeholder="MHR..."
                className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-800 placeholder:text-slate-300"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1">Engine Number (Optional)</label>
              <input
                type="text"
                value={data.engineNumber}
                onChange={(e) => onChange({ engineNumber: e.target.value.toUpperCase() })}
                placeholder="2TR..."
                className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-800 placeholder:text-slate-300"
              />
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
              onClick={onNext}
              disabled={!isFormValid}
              className={`flex items-center gap-3 px-10 py-4 font-bold rounded-2xl transition-all shadow-xl active:scale-95 ${
                isFormValid 
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/25 cursor-pointer' 
                : 'bg-slate-200 text-slate-400 shadow-none cursor-not-allowed'
              }`}
            >
              Service Details
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepVehicle;
