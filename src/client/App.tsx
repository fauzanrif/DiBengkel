import React, { useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Wrench, 
  Package, 
  Receipt, 
  Users, 
  Bell, 
  MapPin,
  Clock
} from 'lucide-react';
import { OrderProvider, useOrders } from './contexts/OrderContext';
import NewRequisitionModal from './components/NewRequisitionModal';

// Components (We will convert these next)
import Dashboard from './views/Dashboard';
import MaintenanceRequisition from './views/MaintenanceRequisition';
import WorkOrder from './views/WorkOrder';
import InventoryView from './views/InventoryView';
import BillingView from './views/BillingView';

import PortalBooking from './views/PortalBooking';
import PortalTracking from './views/PortalTracking';

const AppContent: React.FC = () => {
  const location = useLocation();
  const { isModalOpen, closeModal, fetchOrders, openModal } = useOrders();

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const menuItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Maint. Requisition", path: "/requisitions", icon: ClipboardList },
    { name: "Work Orders", path: "/work-orders", icon: Wrench },
    { name: "Inventory Tracking", path: "/inventory", icon: Package },
    { name: "Billing & Invoices", path: "/billing", icon: Receipt },
    { name: "Mechanics & Flow", path: "/mechanics", icon: Users },
  ];

  const portalItems = [
    { name: "Self Booking", path: "/portal/booking", icon: MapPin },
    { name: "Track Progress", path: "/portal/tracking", icon: Clock },
  ];

  return (
    <div className="flex h-screen w-full bg-[#F1F5F9] font-sans selection:bg-blue-100">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1E293B] flex flex-col h-full shrink-0 shadow-xl overflow-hidden active-sidebar transition-all duration-300">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20 text-xs">
            DI
          </div>
          <span className="text-white font-bold tracking-tight text-lg">
            Di<span className="text-blue-400 font-medium">Bengkel</span>
          </span>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto">
          <div className="px-3 mb-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 opacity-60">Main ERP</p>
          </div>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all group ${
                  isActive ? 'bg-blue-600/20 text-blue-400 ring-1 ring-blue-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon size={18} className="group-hover:scale-110 transition-transform" />
                {item.name}
              </Link>
            );
          })}

          <div className="px-3 mt-8 mb-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 opacity-60">Customer Portal</p>
          </div>
          {portalItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all group ${
                  isActive ? 'bg-blue-600/20 text-blue-400 ring-1 ring-blue-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon size={18} className="group-hover:scale-110 transition-transform" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-700/50">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/30">
            <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center text-white ring-2 ring-slate-700 font-bold overflow-hidden">
              A
            </div>
            <div className="overflow-hidden">
              <p className="text-xs text-slate-200 font-bold truncate">Senior Architect</p>
              <p className="text-[10px] text-slate-500 truncate lowercase">admin@dibengkel.pro</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shadow-sm sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold text-slate-800 tracking-tight">Workshop Dashboard</h1>
            <div className="h-4 w-px bg-slate-300"></div>
            <select className="bg-slate-50 border border-slate-100 text-[10px] font-bold text-slate-600 focus:ring-0 cursor-pointer rounded-lg px-2 py-1 uppercase tracking-wide">
              <option>Branch: Jakarta Pusat (Head)</option>
              <option>Branch: Bandung Timur</option>
              <option>Branch: Surabaya Utara</option>
            </select>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative group cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors">
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
              <Bell size={20} className="text-slate-400 group-hover:text-slate-600" />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/requisitions" element={<MaintenanceRequisition />} />
            <Route path="/work-orders" element={<WorkOrder />} />
            <Route path="/inventory" element={<InventoryView />} />
            <Route path="/billing" element={<BillingView />} />
            <Route path="/portal/booking" element={<PortalBooking />} />
            <Route path="/portal/tracking" element={<PortalTracking />} />
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </div>

        
        <div id="requisition-modal-wrapper">
          <NewRequisitionModal 
            isOpen={isModalOpen} 
            onClose={closeModal} 
            onSuccess={fetchOrders}
          />
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <OrderProvider>
      <AppContent />
    </OrderProvider>
  );
};

export default App;
