import React from 'react';
import { User, Phone, Mail, Building, UserCheck, ChevronRight } from 'lucide-react';
import { BookingData } from '../../views/PortalBooking';

interface StepProps {
  data: BookingData['customer'];
  onChange: (data: Partial<BookingData['customer']>) => void;
  onNext: () => void;
}

const StepCustomer: React.FC<StepProps> = ({ data, onChange, onNext }) => {
  const isFormValid = data.name && data.phone && data.email;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="p-8 md:p-12">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-bold">
              01
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">Customer Information</h3>
              <p className="text-slate-500 font-medium">Please provide your contact details for booking verification.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Customer Type Selection */}
            <div className="md:col-span-2">
              <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-3 block">Customer Type</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => onChange({ type: 'personal' })}
                  className={`p-4 rounded-2xl flex items-center justify-center gap-3 font-bold transition-all border-2 ${
                    data.type === 'personal' 
                    ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-lg shadow-blue-500/10' 
                    : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'
                  }`}
                >
                  <User size={20} />
                  Personal
                </button>
                <button
                  onClick={() => onChange({ type: 'company' })}
                  className={`p-4 rounded-2xl flex items-center justify-center gap-3 font-bold transition-all border-2 ${
                    data.type === 'company' 
                    ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-lg shadow-blue-500/10' 
                    : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'
                  }`}
                >
                  <Building size={20} />
                  Company
                </button>
              </div>
            </div>

            {/* Standard Fields */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  value={data.name}
                  onChange={(e) => onChange({ name: e.target.value })}
                  placeholder="John Doe"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-800 placeholder:text-slate-300"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="tel"
                  value={data.phone}
                  onChange={(e) => onChange({ phone: e.target.value })}
                  placeholder="+62 812 3456 7890"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-800 placeholder:text-slate-300"
                />
              </div>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  value={data.email}
                  onChange={(e) => onChange({ email: e.target.value })}
                  placeholder="john@example.com"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-800 placeholder:text-slate-300"
                />
              </div>
            </div>

            {/* Conditional Company Fields */}
            {data.type === 'company' && (
              <>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1">Company Name</label>
                  <div className="relative">
                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      value={data.companyName || ''}
                      onChange={(e) => onChange({ companyName: e.target.value })}
                      placeholder="Acme Corp"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-800 placeholder:text-slate-300"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1">PIC Name</label>
                  <div className="relative">
                    <UserCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      value={data.picName || ''}
                      onChange={(e) => onChange({ picName: e.target.value })}
                      placeholder="Person In Charge"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-800 placeholder:text-slate-300"
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="mt-12 flex justify-end">
            <button
              onClick={onNext}
              disabled={!isFormValid}
              className={`flex items-center gap-3 px-10 py-4 font-bold rounded-2xl transition-all shadow-xl active:scale-95 ${
                isFormValid 
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/25 cursor-pointer' 
                : 'bg-slate-200 text-slate-400 shadow-none cursor-not-allowed'
              }`}
            >
              Continue to Vehicle
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-blue-50/50 p-6 rounded-2xl border border-blue-100/50 flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <User size={20} />
          </div>
          <div>
            <p className="font-bold text-slate-800">Returning customer?</p>
            <p className="text-sm text-slate-500 opacity-80">Our system will automatically link your previous service history based on your phone number.</p>
          </div>
      </div>
    </div>
  );
};

export default StepCustomer;
