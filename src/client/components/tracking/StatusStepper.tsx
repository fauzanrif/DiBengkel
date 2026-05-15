import React from 'react';
import { Check } from 'lucide-react';

export enum ServiceStatus {
  BOOKING_RECEIVED = 'Booking Received',
  VEHICLE_ANALYSIS = 'Vehicle Analysis',
  WAITING_APPROVAL = 'Waiting Approval',
  ON_PROGRESS = 'On Progress',
  QC_PROCESS = 'QC Process',
  COMPLETED = 'Completed',
  INVOICE_GENERATED = 'Invoice Generated',
  PAID = 'Paid'
}

const statusOrder = [
  ServiceStatus.BOOKING_RECEIVED,
  ServiceStatus.VEHICLE_ANALYSIS,
  ServiceStatus.WAITING_APPROVAL,
  ServiceStatus.ON_PROGRESS,
  ServiceStatus.QC_PROCESS,
  ServiceStatus.COMPLETED,
  ServiceStatus.INVOICE_GENERATED,
  ServiceStatus.PAID
];

interface StatusStepperProps {
  currentStatus: ServiceStatus;
}

const StatusStepper: React.FC<StatusStepperProps> = ({ currentStatus }) => {
  const currentIndex = statusOrder.indexOf(currentStatus);

  return (
    <div className="w-full py-8 overflow-x-auto no-scrollbar">
      <div className="flex items-start min-w-[800px] justify-between relative px-4 text-center">
        {/* Progress Line Background */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-200 -z-10 mx-12"></div>
        
        {/* Active Progress Line */}
        <div 
          className="absolute top-5 left-0 h-0.5 bg-blue-600 -z-10 transition-all duration-500 ease-in-out mx-12"
          style={{ width: `${(currentIndex / (statusOrder.length - 1)) * 100}%` }}
        ></div>

        {statusOrder.map((status, index) => {
          const isActive = index <= currentIndex;
          const isCurrent = index === currentIndex;
          const isCompleted = index < currentIndex;

          return (
            <div key={status} className="flex flex-col items-center flex-1 relative group">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-4 ${
                  isCurrent 
                    ? 'bg-blue-600 border-blue-100 text-white shadow-lg shadow-blue-500/20 scale-110 z-10' 
                    : isCompleted 
                      ? 'bg-blue-600 border-blue-50 text-white' 
                      : 'bg-white border-slate-100 text-slate-300'
                }`}
              >
                {isCompleted ? (
                  <Check size={18} strokeWidth={3} />
                ) : (
                  <span className="text-[10px] font-black">{index + 1}</span>
                )}
              </div>
              
              <div className="mt-4 px-2">
                <p 
                  className={`text-[10px] uppercase font-black tracking-widest transition-colors ${
                    isActive ? 'text-blue-600' : 'text-slate-400'
                  }`}
                >
                  {status}
                </p>
                {isCurrent && (
                  <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-600 text-[8px] font-bold rounded-full animate-pulse">
                    LIVE
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatusStepper;
