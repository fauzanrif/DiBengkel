<template>
  <div class="p-8 space-y-6">
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div v-for="stat in stats" :key="stat.label" class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-1 hover:shadow-md transition-all group relative overflow-hidden">
        <div v-if="stat.isAlert && stat.value !== '0'" class="absolute -right-2 -top-2 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
           <span class="text-white text-[10px] font-black">!</span>
        </div>
        <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{{ stat.label }}</span>
        <div class="flex items-end gap-2 mt-1">
          <span class="text-3xl font-bold text-slate-800 tracking-tight">{{ stat.value }}</span>
          <span :class="[stat.trend === 'up' ? 'text-green-500' : 'text-red-500', 'text-[11px] font-bold pb-1']">
            {{ stat.change }}
          </span>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Live Workshop Floor -->
      <div class="lg:col-span-2 bg-white rounded-2xl border border-slate-200 flex flex-col overflow-hidden shadow-sm">
        <div class="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h2 class="text-sm font-bold text-slate-800 flex items-center gap-2">
            <div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            Live Workshop Floor
          </h2>
          <div class="flex gap-2">
            <span class="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-[10px] font-bold uppercase">5 Waiting Approval</span>
            <span class="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-[10px] font-bold uppercase">12 On Progress</span>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead class="bg-slate-50/30 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
              <tr class="border-b border-slate-200">
                <th class="px-6 py-4">SPK Identification</th>
                <th class="px-6 py-4">Vehicle / Client</th>
                <th class="px-6 py-4">Status</th>
                <th class="px-6 py-4 text-right">Est. Total</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-sm">
              <tr v-for="order in dashboardOrders" :key="order.spk" class="hover:bg-slate-50/80 transition-colors group cursor-pointer">
                <td class="px-6 py-4">
                  <div class="font-mono text-xs font-bold text-slate-700 bg-slate-100 w-fit px-2 py-1 rounded group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors">
                    {{ order.spk }}
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="font-bold text-slate-800">{{ order.vehicle }}</div>
                  <div class="text-[11px] text-slate-400 font-medium">{{ order.client }}</div>
                </td>
                <td class="px-6 py-4">
                  <span :class="[order.statusColor, 'px-2 py-1 rounded-lg text-[10px] font-bold uppercase whitespace-nowrap shadow-sm border']">
                    {{ order.status }}
                  </span>
                </td>
                <td class="px-6 py-4 text-right font-bold text-slate-700">
                  {{ order.total }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Critical Inventory -->
      <div class="bg-white rounded-2xl border border-slate-200 flex flex-col overflow-hidden shadow-sm">
        <div class="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h2 class="text-sm font-bold text-slate-800">Critical Stock Alerts</h2>
          <Search :size="14" class="text-slate-400" />
        </div>
        <div class="p-5 space-y-5">
          <div v-for="part in inventory" :key="part.name" class="flex items-center justify-between p-3 rounded-2xl border border-transparent hover:border-slate-100 hover:bg-slate-50 transition-all cursor-pointer group">
            <div class="flex items-center gap-4">
              <div :class="[part.color, 'w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm']">
                <Package :size="18" />
              </div>
              <div>
                <p class="text-xs font-bold text-slate-800">{{ part.name }}</p>
                <p class="text-[10px] text-slate-400 font-medium">{{ part.meta }}</p>
              </div>
            </div>
            <div class="text-right">
              <p :class="[part.critical ? 'text-red-600' : 'text-orange-600', 'text-xs font-black']">{{ part.stock }}</p>
              <p class="text-[10px] text-slate-400 font-medium italic">Res: {{ part.reserved }}</p>
            </div>
          </div>

          <div class="mt-6 pt-6 border-t border-slate-100">
             <div class="flex justify-between items-center mb-4">
               <h3 class="text-[11px] font-black text-slate-400 uppercase tracking-widest">Recent Activity</h3>
               <ArrowRight :size="14" class="text-blue-500" />
             </div>
             <div class="space-y-4">
               <div v-for="(log, idx) in logs" :key="idx" class="flex gap-4">
                 <div :class="[log.color, 'w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 shadow-sm']"></div>
                 <p class="text-[11px] text-slate-600 font-medium leading-relaxed">{{ log.text }}</p>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import { Package, Search, ArrowRight } from 'lucide-vue-next';
import { useOrderStore } from '../stores/orderStore';

const orderStore = useOrderStore();

onMounted(orderStore.fetchOrders);

const stats = computed(() => [
  { label: "Active Orders", value: orderStore.workOrders.length.toString(), change: "+12%", trend: "up" },
  { label: "Pending Billing", value: orderStore.orders.filter(o => o.status === 'done' && !o.invoice).length.toString(), change: "Ready", trend: "up", isAlert: true },
  { label: "Low Stock Parts", value: "08", change: "-2", trend: "down" },
  { label: "Efficiency Rate", value: "92%", change: "+2.1%", trend: "up" },
]);

const dashboardOrders = computed(() => 
  orderStore.orders.slice(0, 5).map(o => ({
    spk: o.spkNumber,
    vehicle: `${o.vehicle?.plateNumber} (${o.vehicle?.vehicleModel?.name || o.vehicle?.model || 'N/A'})`,
    client: o.customer?.name,
    status: o.status,
    statusColor: getStatusColor(o.status),
    total: `$${o.estimatedTotal}`
  }))
);

const getStatusColor = (status) => {
  switch(status) {
    case 'draft': return 'bg-slate-100 text-slate-700 border-slate-200';
    case 'approved': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'on_progress': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'done': return 'bg-slate-100 text-slate-500 border-slate-200';
    default: return 'bg-amber-100 text-amber-700 border-amber-200';
  }
};

const inventory = [
  { name: 'Shell Helix 5W-30', meta: 'JKT Branch • Liter', stock: '4 / 50', reserved: '8', color: 'bg-red-100 text-red-600', critical: true },
  { name: 'Brake Pad Front XL', meta: 'JKT Branch • Units', stock: '12 / 60', reserved: '2', color: 'bg-orange-100 text-orange-600', critical: false },
  { name: 'Spark Plug Bosch', meta: 'JKT Branch • Units', stock: '15 / 100', reserved: '4', color: 'bg-orange-100 text-orange-600', critical: false },
];

const logs = [
  { text: 'Stock reserved for SPK-JKT-2402 (Brake Oil x2)', color: 'bg-blue-500' },
  { text: 'Invoice #INV-9921 generated for Astra International', color: 'bg-green-500' },
  { text: 'Mechanic "Rahmat" updated status for SPK-JKT-2401', color: 'bg-yellow-500' },
];
</script>
