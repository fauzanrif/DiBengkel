import React, { useState, useEffect } from 'react';
import { 
  User, 
  Car, 
  Wrench, 
  Calendar, 
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  ShieldCheck,
  Phone,
  Mail,
  Building,
  UserCheck,
  AlertTriangle,
  Upload,
  Clock,
  MapPin,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Step Components
import StepCustomer from '../components/booking/StepCustomer';
import StepVehicle from '../components/booking/StepVehicle';
import StepService from '../components/booking/StepService';
import StepSchedule from '../components/booking/StepSchedule';
import StepConfirmation from '../components/booking/StepConfirmation';

export type BookingData = {
  customer: {
    name: string;
    phone: string;
    email: string;
    type: 'personal' | 'company';
    companyName?: string;
    picName?: string;
  };
  vehicle: {
    plateNumber: string;
    brand: string;
    model: string;
    year: string;
    transmission: string;
    odometer: string;
    chassisNumber: string;
    engineNumber: string;
  };
  service: {
    type: string[];
    complaint: string;
    notes: string;
    photo: File | null;
    emergencyLevel: 'low' | 'medium' | 'high';
  };
  schedule: {
    method: 'walk-in' | 'on-site' | 'pickup';
    branchId: string;
    date: string;
    time: string;
    address?: string;
  };
};

const initialData: BookingData = {
  customer: {
    name: '',
    phone: '',
    email: '',
    type: 'personal'
  },
  vehicle: {
    plateNumber: '',
    brand: '',
    model: '',
    year: '',
    transmission: 'automatic',
    odometer: '',
    chassisNumber: '',
    engineNumber: ''
  },
  service: {
    type: [],
    complaint: '',
    notes: '',
    photo: null,
    emergencyLevel: 'low'
  },
  schedule: {
    method: 'walk-in',
    branchId: '',
    date: '',
    time: ''
  }
};

const steps = [
  { id: 1, title: 'Customer', icon: User, description: 'Your Information' },
  { id: 2, title: 'Vehicle', icon: Car, description: 'Vehicle Details' },
  { id: 3, title: 'Request', icon: Wrench, description: 'Service & Complaint' },
  { id: 4, title: 'Schedule', icon: Calendar, description: 'Method & Time' },
  { id: 5, title: 'Confirm', icon: CheckCircle, description: 'Final Summary' }
];

const PortalBooking: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<BookingData>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [workshops, setWorkshops] = useState<any[]>([]);
  const [isLoadingWorkshops, setIsLoadingWorkshops] = useState(true);

  useEffect(() => {
    setIsLoadingWorkshops(true);
    fetch('/api/master/workshops')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch workshops');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          console.log('Fetched workshops:', data.length);
          setWorkshops(data);
        } else {
          console.error('Workshops data is not an array:', data);
          setWorkshops([]);
        }
      })
      .catch(err => {
        console.error('Failed to fetch workshops', err);
        setWorkshops([]); // Ensure it's an array
      })
      .finally(() => {
        setIsLoadingWorkshops(false);
      });
  }, []);

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, steps.length));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const updateFormData = (step: keyof BookingData, data: any) => {
    setFormData(prev => ({
      ...prev,
      [step]: { ...prev[step], ...data }
    }));
  };

  const handleTestFill = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    
    setFormData({
      customer: {
        name: 'Test Customer',
        phone: '08123456789',
        email: 'test@example.com',
        type: 'personal'
      },
      vehicle: {
        plateNumber: 'B 1234 XYZ',
        brand: 'Toyota',
        model: 'Avanza',
        year: '2022',
        transmission: 'automatic',
        odometer: '15000',
        chassisNumber: 'MHF123',
        engineNumber: '1NR-VE'
      },
      service: {
        type: ['Ganti Oli'],
        complaint: 'Suara mesin kasar',
        notes: 'Cek sekalian kaki-kaki',
        photo: null,
        emergencyLevel: 'low'
      },
      schedule: {
        method: 'walk-in',
        branchId: workshops[0]?.id || '',
        date: dateStr,
        time: '09:00'
      }
    });
    setCurrentStep(5); // Jump to confirmation
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/orders/booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName: formData.customer.name,
          phone: formData.customer.phone,
          email: formData.customer.email,
          customerType: formData.customer.type,
          companyName: formData.customer.companyName,
          picName: formData.customer.picName,
          plateNumber: formData.vehicle.plateNumber,
          vehicleBrand: formData.vehicle.brand,
          vehicleModel: formData.vehicle.model,
          year: formData.vehicle.year,
          transmission: formData.vehicle.transmission,
          odometer: formData.vehicle.odometer,
          chassisNumber: formData.vehicle.chassisNumber,
          engineNumber: formData.vehicle.engineNumber,
          complaint: formData.service.complaint,
          serviceMethod: formData.schedule.method,
          branchId: formData.schedule.branchId,
          bookingDate: formData.schedule.date,
          bookingTime: formData.schedule.time,
          emergencyLevel: formData.service.emergencyLevel,
        }),
      });

      if (response.ok) {
        setIsSuccess(true);
      } else {
        const err = await response.json();
        console.error('Booking failed:', err);
        alert('Booking failed. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting booking:', error);
      alert('An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
     return (
       <div className="min-h-[80vh] flex items-center justify-center p-6">
         <motion.div 
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           className="max-w-md w-full bg-white rounded-3xl shadow-2xl shadow-blue-500/10 p-10 text-center border border-slate-100"
         >
           <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
             <Check size={48} className="text-green-600" />
           </div>
           <h2 className="text-3xl font-black text-slate-800 mb-4 tracking-tight">Booking Received!</h2>
           <p className="text-slate-500 mb-10 leading-relaxed">
             Your service booking for <span className="font-bold text-slate-700">{formData.vehicle.plateNumber}</span> has been registered. Our service advisor will contact you shortly to confirm the appointment.
           </p>
           <button 
             onClick={() => window.location.reload()}
             className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95"
           >
             Make Another Booking
           </button>
           <div className="mt-6 flex items-center justify-center gap-2 text-slate-400 text-xs font-medium">
             <ShieldCheck size={14} />
             Secure automated booking by DiBengkel Pro
           </div>
         </motion.div>
       </div>
     );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
      {/* Header */}
      <div className="mb-12 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight mb-2 flex items-center gap-4">
            Self Booking
            <button 
              onClick={handleTestFill}
              className="text-[10px] px-3 py-1 bg-slate-100 text-slate-400 hover:bg-amber-100 hover:text-amber-600 rounded-full font-black uppercase tracking-widest transition-colors"
            >
              Test Fill
            </button>
          </h1>
          <p className="text-slate-500 font-medium">Fast and easy vehicle service scheduling at DiBengkel</p>
        </div>
        
        {/* Stepper (Desktop) */}
        <div className="hidden lg:flex items-center gap-2">
          {steps.map((step, idx) => (
            <React.Fragment key={step.id}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 border-2 ${
                  currentStep >= step.id 
                  ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20' 
                  : 'bg-white border-slate-200 text-slate-400'
                }`}>
                  <step.icon size={18} />
                </div>
                <div className="hidden xl:block">
                  <p className={`text-[10px] uppercase font-black tracking-widest leading-none mb-0.5 ${
                    currentStep === step.id ? 'text-blue-600' : 'text-slate-400'
                  }`}>Step {step.id}</p>
                  <p className={`font-bold text-sm ${
                    currentStep === step.id ? 'text-slate-800' : 'text-slate-500 opacity-60'
                  }`}>{step.title}</p>
                </div>
              </div>
              {idx < steps.length - 1 && (
                <div className={`w-12 h-0.5 mx-2 rounded-full transition-all duration-700 ${
                  currentStep > step.id ? 'bg-blue-600' : 'bg-slate-200'
                }`}></div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Stepper (Mobile) */}
        <div className="lg:hidden flex items-center justify-between w-full bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
           <div className="flex flex-col">
             <span className="text-[10px] uppercase font-black text-blue-600 tracking-widest">Step {currentStep} of {steps.length}</span>
             <span className="text-lg font-black text-slate-800">{steps[currentStep-1].title}</span>
           </div>
           <div className="relative w-12 h-12">
             <svg className="w-full h-full transform -rotate-90">
               <circle 
                 cx="24" cy="24" r="20" fill="transparent" stroke="currentColor" strokeWidth="4" 
                 className="text-slate-100"
               />
               <circle 
                 cx="24" cy="24" r="20" fill="transparent" stroke="currentColor" strokeWidth="4" 
                 strokeDasharray={125.6}
                 strokeDashoffset={125.6 - (125.6 * (currentStep / steps.length))}
                 className="text-blue-600 transition-all duration-700 ease-out"
               />
             </svg>
             <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-slate-800">{Math.round((currentStep / steps.length) * 100)}%</span>
             </div>
           </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-transparent">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentStep === 1 && (
              <StepCustomer 
                data={formData.customer} 
                onChange={(d) => updateFormData('customer', d)} 
                onNext={nextStep}
              />
            )}
            {currentStep === 2 && (
              <StepVehicle 
                data={formData.vehicle} 
                onChange={(d) => updateFormData('vehicle', d)} 
                onNext={nextStep}
                onBack={prevStep}
              />
            )}
            {currentStep === 3 && (
              <StepService 
                data={formData.service} 
                onChange={(d) => updateFormData('service', d)} 
                onNext={nextStep}
                onBack={prevStep}
              />
            )}
            {currentStep === 4 && (
              <StepSchedule 
                data={formData.schedule} 
                branches={workshops}
                isLoadingBranches={isLoadingWorkshops}
                onChange={(d) => updateFormData('schedule', d)} 
                onNext={nextStep}
                onBack={prevStep}
              />
            )}
            {currentStep === 5 && (
              <StepConfirmation 
                data={formData} 
                branches={workshops}
                onBack={prevStep}
                onSubmit={handleFinalSubmit}
                isSubmitting={isSubmitting}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Info */}
      <div className="mt-16 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 opacity-50 gray-scale hover:opacity-100 transition-opacity">
         <div className="flex items-center gap-3">
           <ShieldCheck size={24} className="text-slate-500" />
           <div>
             <p className="text-xs font-black uppercase text-slate-800 tracking-tighter">Safe & Secure</p>
             <p className="text-[10px] text-slate-500">End-to-end encrypted booking system</p>
           </div>
         </div>
         <div className="flex items-center gap-3">
           <Clock size={24} className="text-slate-500" />
           <div>
             <p className="text-xs font-black uppercase text-slate-800 tracking-tighter">24/7 Availability</p>
             <p className="text-[10px] text-slate-500">Book anytime from anywhere</p>
           </div>
         </div>
         <div className="flex items-center gap-3">
           <MapPin size={24} className="text-slate-500" />
           <div>
             <p className="text-xs font-black uppercase text-slate-800 tracking-tighter">Multi-Branch</p>
             <p className="text-[10px] text-slate-500">Access to all our premium workshops</p>
           </div>
         </div>
      </div>
    </div>
  );
};

export default PortalBooking;
