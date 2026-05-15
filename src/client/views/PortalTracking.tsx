import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  Car, 
  Settings, 
  Clock, 
  ShieldCheck, 
  ChevronRight, 
  Search,
  ExternalLink,
  Printer,
  Download,
  Phone
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import StatusStepper, { ServiceStatus } from '../components/tracking/StatusStepper';
import RepairTimeline, { TimelineEvent } from '../components/tracking/RepairTimeline';
import EstimationSummary from '../components/tracking/EstimationCard';
import AdditionalParts from '../components/tracking/AdditionalParts';

const PortalTracking: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mockOrder = {
    id: `SPK-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    plateNumber: 'B 1234 SKR',
    model: 'Toyota Fortuner GR Sport',
    branch: 'Jakarta Pusat (Head Office)',
    serviceType: 'Major Service 40,000 KM',
    currentStatus: ServiceStatus.ON_PROGRESS,
    estimatedCompletion: 'Today, 17:30',
    progressPercentage: 65,
    mechanic: {
      name: 'Rudi Hermawan',
      role: 'Master Technician',
      avatar: 'RH'
    },
    estimation: {
      service: 850000,
      parts: [
        { name: 'Oli Mesin TMO 5W-30', qty: 7, price: 165000, status: 'installed' },
        { name: 'Filter Oli', qty: 1, price: 85000, status: 'installed' },
        { name: 'Gasket Drain Plug', qty: 1, price: 15000, status: 'installed' },
        { name: 'Engine Flush', qty: 1, price: 125000, status: 'waiting' }
      ],
      discount: 50000,
      initialEstimate: 2000000
    },
    timeline: [
      {
        id: '1',
        type: 'status_change',
        title: 'Repair Started',
        description: 'Engine oil drainage and multi-point inspection in progress.',
        timestamp: '14:20 PM',
        mechanic: { name: 'Rudi Hermawan', role: 'Master Technician' }
      },
      {
        id: '2',
        type: 'action',
        title: 'Analysis Completed',
        description: 'Brake pads, suspension, and fluids analyzed.',
        timestamp: '13:00 PM',
        mechanic: { name: 'Aris Munandar', role: 'Foreman' }
      },
      {
        id: '3',
        type: 'status_change',
        title: 'Vehicle Received',
        description: 'Unit received at workshop and registered in system.',
        timestamp: '11:45 AM',
        mechanic: { name: 'Siti Aminah', role: 'Service Advisor' }
      }
    ],
    additionalParts: [
      {
        id: 'ad-1',
        name: 'Engine Flush & Cleaner',
        price: 125000,
        reason: 'Contaminated Oil Residue',
        status: 'waiting',
        mechanicNote: 'Mesin terlihat ada endapan lumpur (sludge) tipis, sangat disarankan engine flush untuk menjaga performa.'
      }
    ]
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    
    setIsLoading(true);
    setError(null);
    
    // Simulate API call
    setTimeout(() => {
      setOrder(mockOrder);
      setIsLoading(false);
    }, 1200);
  };

  const handleApprovePart = (id: string) => {
     // Mock approval
     setOrder(prev => ({
        ...prev,
        additionalParts: prev.additionalParts.map(p => p.id === id ? { ...p, status: 'approved' } : p)
     }));
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* Decorative background accent */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-slate-900 -z-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
      
      <div className="max-w-7xl mx-auto px-6 pt-12">
        {/* Navigation & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
          <div>
            <div className="flex items-center gap-2 text-blue-400 mb-4 cursor-pointer hover:text-blue-300 transition-colors group">
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-widest">Back to Dashboard</span>
            </div>
            <h1 className="text-5xl font-black text-slate-800 tracking-tight leading-none mb-2">Track <span className="text-blue-600">Progress.</span></h1>
            <p className="text-slate-500 font-medium">Real-time transparency for your vehicle maintenance.</p>
          </div>

          <form onSubmit={handleSearch} className="relative w-full md:w-[450px] group">
            <input 
              type="text" 
              placeholder="Enter SPK Number or Plate (e.g. B 1234 SKR)"
              className="w-full bg-white border-2 border-slate-100 rounded-full pl-14 pr-32 py-5 text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all shadow-xl shadow-slate-200/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
            />
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
            <button 
              type="submit"
              disabled={isLoading}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-slate-900 text-white px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center gap-2"
            >
              {isLoading ? 'Searching...' : 'Track Now'}
            </button>
          </form>
        </div>

        <AnimatePresence mode="wait">
          {!order && !isLoading && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-16 border-4 border-dashed border-slate-200 rounded-[3rem] text-center"
            >
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-6">
                <Search size={48} />
              </div>
              <h3 className="text-2xl font-black text-slate-400 tracking-tight uppercase mb-2">No Order Tracked</h3>
              <p className="text-slate-400 font-medium max-w-md mx-auto">Enter your Work Order (SPK) number or Vehicle Plate number to see the real-time status.</p>
              <div className="mt-8 flex items-center justify-center gap-4">
                 <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Quick Search:</span>
                 <button onClick={() => setSearchQuery('B 1234 SKR')} className="text-[10px] px-4 py-2 bg-slate-100 text-slate-500 hover:bg-blue-100 hover:text-blue-600 rounded-full font-black uppercase transition-colors">B 1234 SKR</button>
              </div>
            </motion.div>
          )}

          {isLoading && (
            <div className="flex flex-col items-center justify-center py-24 space-y-6">
               <div className="w-16 h-16 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Syncing with Workshop System...</p>
            </div>
          )}

          {order && !isLoading && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="space-y-8"
            >
              {/* Top Summary Card */}
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden relative">
                <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-slate-50">
                  {/* Left Info */}
                  <div className="p-10 flex-1">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="px-3 py-1 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">{order.id}</div>
                      <div className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest">Digital Work Order</div>
                    </div>
                    
                    <div className="flex items-start gap-6">
                        <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-400">
                          <Car size={32} />
                        </div>
                        <div>
                          <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-1 uppercase">{order.plateNumber}</h2>
                          <p className="text-slate-500 font-bold uppercase tracking-tight text-sm">{order.model}</p>
                        </div>
                    </div>

                    <div className="mt-8 grid grid-cols-2 gap-8">
                       <div className="flex items-start gap-3">
                          <MapPin className="text-blue-500 mt-1" size={18} />
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Branch Location</p>
                            <p className="text-xs font-bold text-slate-700 leading-tight">{order.branch}</p>
                          </div>
                       </div>
                       <div className="flex items-start gap-3">
                          <Settings className="text-blue-500 mt-1" size={18} />
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Service Type</p>
                            <p className="text-xs font-bold text-slate-700 leading-tight">{order.serviceType}</p>
                          </div>
                       </div>
                    </div>
                  </div>

                  {/* Right Status */}
                  <div className="p-10 lg:w-[400px] bg-slate-50/50 flex flex-col justify-between">
                     <div>
                        <div className="flex items-center justify-between mb-2">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Status</p>
                           <ShieldCheck size={20} className="text-blue-600" />
                        </div>
                        <h4 className="text-2xl font-black text-blue-600 leading-tight uppercase tracking-tight">{order.currentStatus}</h4>
                     </div>

                     <div className="mt-8">
                        <div className="flex items-center justify-between mb-3 font-black text-[10px] uppercase tracking-widest">
                           <span className="text-slate-400">Estimated Completion</span>
                           <span className="text-slate-800">{order.estimatedCompletion}</span>
                        </div>
                        <div className="h-6 bg-slate-200 rounded-full overflow-hidden p-1">
                           <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${order.progressPercentage}%` }}
                              transition={{ duration: 1, ease: 'easeOut' }}
                              className="h-full bg-blue-600 rounded-full flex items-center justify-end px-2"
                           >
                              <span className="text-[8px] font-black text-white">{order.progressPercentage}%</span>
                           </motion.div>
                        </div>
                        <p className="mt-4 text-[11px] text-slate-500 font-medium leading-relaxed italic text-center">
                          "Your vehicle is currently in the mechanical phase. We are ensuring everything is handled with precision."
                        </p>
                     </div>
                  </div>
                </div>

                {/* Horizontal Stepper - Sticky on desktop Top */}
                <div className="border-t border-slate-50 bg-white">
                  <StatusStepper currentStatus={order.currentStatus} />
                </div>
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Column - History & Activity */}
                <div className="lg:col-span-7 space-y-8">
                  
                  {/* Additional Parts Approval Notification */}
                  <AdditionalParts parts={order.additionalParts} onApprove={handleApprovePart} />

                  <div className="bg-white rounded-[2rem] border border-slate-100 p-10 shadow-xl shadow-slate-200/50">
                    <div className="flex items-center justify-between mb-10">
                      <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase">Repair Activity Log</h3>
                      <button className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:underline">View Detailed Log</button>
                    </div>
                    <RepairTimeline events={order.timeline} />
                  </div>
                </div>

                {/* Right Column - Estimation & Mechanics */}
                <div className="lg:col-span-5 space-y-8">
                  <EstimationSummary 
                    serviceCharges={order.estimation.service}
                    parts={order.estimation.parts}
                    discount={order.estimation.discount}
                    initialEstimate={order.estimation.initialEstimate}
                  />

                  {/* Mechanic Card */}
                  <div className="bg-[#1E293B] rounded-[2rem] p-8 text-white relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-600/20 transition-colors"></div>
                     
                     <div className="flex items-center justify-between mb-6 relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Assigned Mechanic</p>
                        <Phone size={16} className="text-blue-400 cursor-pointer hover:scale-110 transition-transform" />
                     </div>

                     <div className="flex items-center gap-5 relative z-10">
                        <div className="w-16 h-16 rounded-3xl bg-slate-700 flex items-center justify-center text-xl font-black border-2 border-slate-600">
                           {order.mechanic.avatar}
                        </div>
                        <div>
                           <h4 className="text-xl font-black tracking-tight">{order.mechanic.name}</h4>
                           <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">{order.mechanic.role}</p>
                        </div>
                     </div>

                     <div className="mt-8 pt-8 border-t border-slate-800 flex items-center justify-between relative z-10">
                        <div>
                           <p className="text-xs font-bold text-slate-400">Completion Status</p>
                           <p className="text-lg font-black text-white">65% Progress</p>
                        </div>
                        <button className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-2">
                           Message <ChevronRight size={14} />
                        </button>
                     </div>
                  </div>

                  {/* Invoice Preview Callout */}
                  <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-xl shadow-slate-200/50">
                     <div className="flex items-center justify-between mb-6">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Document Center</h4>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Digital Only</span>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <button className="flex flex-col items-center justify-center p-6 rounded-3xl bg-slate-50 hover:bg-slate-100 transition-all gap-3 group">
                           <Download size={24} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                           <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">Download SPK</span>
                        </button>
                        <button className="flex flex-col items-center justify-center p-6 rounded-3xl bg-slate-50 hover:bg-slate-100 transition-all gap-3 group">
                           <Printer size={24} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                           <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">Print Summary</span>
                        </button>
                     </div>
                     <button className="w-full mt-6 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center gap-2 group">
                        Preview Temporary Invoice <ExternalLink size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                     </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sticky Bottom Actions Mobile Only */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-slate-100 lg:hidden z-50">
         <div className="max-w-md mx-auto">
            {!order ? (
               <p className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Searching your vehicle status...</p>
            ) : (
               <div className="flex items-center justify-between px-4">
                  <div>
                     <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Current Estimation</p>
                     <p className="text-lg font-black text-slate-900 tracking-tight">Rp {((order.estimation.service + order.estimation.parts.reduce((a, b: any) => a + (b.price * b.qty), 0)) - order.estimation.discount).toLocaleString()}</p>
                  </div>
                  <button className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20">
                     View Summary
                  </button>
               </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default PortalTracking;
