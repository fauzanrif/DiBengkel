import React, { useMemo } from 'react';
import { Package, Search, ArrowRight } from 'lucide-react';
import { useOrders } from '../contexts/OrderContext';

const Dashboard: React.FC = () => {
  const { orders, workOrders } = useOrders();

  const stats = useMemo(() => [
    { label: "Active Orders", value: workOrders.length.toString(), change: "+12%", trend: "up" },
    { label: "Pending Billing", value: orders.filter((o: any) => o.status === 'done' && !o.invoice).length.toString(), change: "Ready", trend: "up", isAlert: true },
    { label: "Low Stock Parts", value: "08", change: "-2", trend: "down" },
    { label: "Efficiency Rate", value: "92%", change: "+2.1%", trend: "up" },
  ], [orders, workOrders]);

  const dashboardOrders = useMemo(() => 
    orders.slice(0, 5).map((o: any) => ({
      spk: o.spkNumber,
      vehicle: `${o.vehicle?.plateNumber} (${o.vehicle?.vehicleModel?.name || o.vehicle?.model || 'N/A'})`,
      client: o.customer?.name,
      status: o.status,
      statusColor: getStatusColor(o.status),
      total: `$${o.estimatedTotal}`
    })),
    [orders]
  );

  function getStatusColor(status: string) {
    switch(status) {
      case 'draft': return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'approved': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'on_progress': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'done': return 'bg-slate-100 text-slate-500 border-slate-200';
      default: return 'bg-amber-100 text-amber-700 border-amber-200';
    }
  }

  const inventoryAlerts = [
    { name: 'Shell Helix 5W-30', meta: 'JKT Branch • Liter', stock: '4 / 50', reserved: '8', color: 'bg-red-100 text-red-600', critical: true },
    { name: 'Brake Pad Front XL', meta: 'JKT Branch • Units', stock: '12 / 60', reserved: '2', color: 'bg-orange-100 text-orange-600', critical: false },
    { name: 'Spark Plug Bosch', meta: 'JKT Branch • Units', stock: '15 / 100', reserved: '4', color: 'bg-orange-100 text-orange-600', critical: false },
  ];

  const logs = [
    { text: 'Stock reserved for SPK-JKT-2402 (Brake Oil x2)', color: 'bg-blue-500' },
    { text: 'Invoice #INV-9921 generated for Astra International', color: 'bg-green-500' },
    { text: 'Mechanic "Rahmat" updated status for SPK-JKT-2401', color: 'bg-yellow-500' },
  ];

  return (
    <div className="p-8 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-1 hover:shadow-md transition-all group relative overflow-hidden">
            {stat.isAlert && stat.value !== '0' && (
              <div className="absolute -right-2 -top-2 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
                 <span className="text-white text-[10px] font-black">!</span>
              </div>
            )}
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</span>
            <div className="flex items-end gap-2 mt-1">
              <span className="text-3xl font-bold text-slate-800 tracking-tight">{stat.value}</span>
              <span className={`${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'} text-[11px] font-bold pb-1`}>
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Workshop Floor */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 flex flex-col overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              Live Workshop Floor
            </h2>
            <div className="flex gap-2">
              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-[10px] font-bold uppercase">5 Waiting Approval</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-[10px] font-bold uppercase">12 On Progress</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/30 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                <tr className="border-b border-slate-200">
                  <th className="px-6 py-4">SPK Identification</th>
                  <th className="px-6 py-4">Vehicle / Client</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Est. Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {dashboardOrders.map((order: any) => (
                  <tr key={order.spk} className="hover:bg-slate-50/80 transition-colors group cursor-pointer">
                    <td className="px-6 py-4">
                      <div className="font-mono text-xs font-bold text-slate-700 bg-slate-100 w-fit px-2 py-1 rounded group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors">
                        {order.spk}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{order.vehicle}</div>
                      <div className="text-[11px] text-slate-400 font-medium">{order.client}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`${order.statusColor} px-2 py-1 rounded-lg text-[10px] font-bold uppercase whitespace-nowrap shadow-sm border`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-700">
                      {order.total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Critical Inventory */}
        <div className="bg-white rounded-2xl border border-slate-200 flex flex-col overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h2 className="text-sm font-bold text-slate-800">Critical Stock Alerts</h2>
            <Search size={14} className="text-slate-400" />
          </div>
          <div className="p-5 space-y-5">
            {inventoryAlerts.map((part) => (
              <div key={part.name} className="flex items-center justify-between p-3 rounded-2xl border border-transparent hover:border-slate-100 hover:bg-slate-50 transition-all cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className={`${part.color} w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm`}>
                    <Package size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">{part.name}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{part.meta}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`${part.critical ? 'text-red-600' : 'text-orange-600'} text-xs font-black`}>{part.stock}</p>
                  <p className="text-[10px] text-slate-400 font-medium italic">Res: {part.reserved}</p>
                </div>
              </div>
            ))}

            <div className="mt-6 pt-6 border-t border-slate-100">
               <div className="flex justify-between items-center mb-4">
                 <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Recent Activity</h3>
                 <ArrowRight size={14} className="text-blue-500" />
               </div>
               <div className="space-y-4">
                 {logs.map((log, idx) => (
                   <div key={idx} className="flex gap-4">
                     <div className={`${log.color} w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 shadow-sm`}></div>
                     <p className="text-[11px] text-slate-600 font-medium leading-relaxed">{log.text}</p>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
