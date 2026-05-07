<template>
  <div class="p-8 space-y-8">
    <div class="flex justify-between items-center">
      <div>
        <h2 class="text-2xl font-black text-slate-800 tracking-tight">Workshop Operations</h2>
        <p class="text-xs text-slate-400 font-medium tracking-wide">Monitoring active jobs, part requests, and production flow</p>
      </div>
      <div class="flex gap-4">
        <div class="relative group">
          <Search :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search WO or Plate..." 
            class="bg-white border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-xs font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none w-64 transition-all"
          />
        </div>
      </div>
    </div>

    <!-- 1. Spare Part Requests (Alert Style for Admin) -->
    <div v-if="pendingPartRequests.length > 0" class="space-y-4">
      <div class="flex items-center gap-2 px-1">
        <div class="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></div>
        <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending Part Requests ({{ pendingPartRequests.length }})</h3>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <div v-for="req in pendingPartRequests" :key="req.id" class="bg-white border-2 border-red-100 rounded-2xl p-4 flex flex-col justify-between group hover:border-red-500 transition-all">
          <div>
            <div class="flex justify-between items-start mb-2">
              <div class="font-bold text-slate-800 text-sm tracking-tight">{{ req.order?.vehicle?.plateNumber }}</div>
              <span class="text-[9px] font-black text-red-500 bg-red-50 px-2 py-0.5 rounded border border-red-100 uppercase">Awaiting Approval</span>
            </div>
            <div class="space-y-1.5 mb-4">
              <div v-for="item in req.items" :key="item.id" class="flex justify-between items-center text-[11px] bg-slate-50 p-2 rounded-lg">
                <span class="font-bold text-slate-600">{{ item.part?.name }}</span>
                <span class="font-mono font-black text-blue-600">x{{ item.quantity }}</span>
              </div>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <button @click="handlePartRequest(req.id, 'rejected')" class="py-1.5 rounded-lg text-[10px] font-bold text-slate-400 hover:bg-slate-50 transition-all border border-transparent hover:border-slate-200">REJECT</button>
            <button @click="handlePartRequest(req.id, 'approved')" class="py-1.5 rounded-lg text-[10px] font-bold bg-red-500 text-white hover:bg-red-600 transition-all shadow-lg shadow-red-500/20">APPROVE</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. Active WOs -->
    <div class="space-y-4">
      <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Active Work Orders</h3>
      <div class="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
        <div v-if="orderStore.workOrders.length === 0" class="lg:col-span-full bg-white rounded-3xl border border-slate-200 p-20 text-center text-slate-300 font-medium italic">
          <div class="flex flex-col items-center gap-3">
            <div class="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
              <Wrench class="text-slate-200" />
            </div>
            No active work orders. Approve a requisition to start production.
          </div>
        </div>
        
        <div v-for="wo in orderStore.workOrders" :key="wo.id" class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
          <!-- Status Ribbon -->
          <div v-if="wo.status === 'on_progress'" class="absolute -right-8 top-4 rotate-45 bg-emerald-500 text-white px-10 py-1 text-[8px] font-black uppercase tracking-widest shadow-sm">
            IN PRODUCTION
          </div>

          <div class="flex justify-between items-start mb-6">
            <div class="space-y-1">
              <div class="text-[10px] font-mono font-black text-blue-500 bg-blue-50 px-2 py-0.5 rounded-md inline-block mb-1">{{ wo.woNumber || 'NO-WO' }}</div>
              <div class="font-black text-slate-800 text-lg tracking-tight flex items-center gap-2">
                {{ wo.vehicle?.plateNumber }}
                <span class="text-[10px] text-slate-300 font-bold font-mono">/ {{ wo.spkNumber }}</span>
              </div>
              <div class="text-[11px] text-slate-500 font-bold uppercase tracking-tight">{{ wo.vehicle?.vehicleModel?.name }} • {{ wo.customer?.name }}</div>
            </div>
            <span :class="[getStatusClass(wo.status), 'px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border']">
              {{ wo.status }}
            </span>
          </div>

          <div class="space-y-6">
            <div class="grid grid-cols-2 gap-4">
                <div class="space-y-1">
                   <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Lead Mechanic</span>
                   <div class="flex items-center gap-2">
                     <div class="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">
                        {{ wo.mechanics?.[0]?.mechanic?.name?.[0] || '?' }}
                     </div>
                     <span class="text-xs font-bold text-slate-700">{{ wo.mechanics?.[0]?.mechanic?.name || 'Unassigned' }}</span>
                   </div>
                </div>
                <div class="space-y-1 text-right">
                   <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Est. Completion</span>
                   <div class="text-xs font-bold text-slate-700">{{ new Date(Date.now() + 86400000).toLocaleDateString() }}</div>
                </div>
            </div>

            <div class="space-y-2">
               <div class="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                 <span>Job Progress</span>
                 <span>{{ wo.status === 'done' || wo.status === 'closed' ? '100%' : (wo.status === 'on_progress' ? '65%' : '0%') }}</span>
               </div>
               <div class="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                 <div 
                   :class="wo.status === 'done' || wo.status === 'closed' ? 'bg-emerald-500' : 'bg-blue-500'" 
                   class="h-full transition-all duration-1000" 
                   :style="{ width: wo.status === 'done' || wo.status === 'closed' ? '100%' : (wo.status === 'on_progress' ? '65%' : '0%') }"
                 ></div>
               </div>
            </div>

            <div class="flex gap-2 pt-2">
              <button 
                v-if="wo.status === 'approved'"
                @click="updateWOStatus(wo.id, 'on_progress')"
                class="flex-1 bg-slate-900 text-white py-2.5 rounded-xl text-[11px] font-bold hover:bg-blue-600 transition-all active:scale-95 shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2"
              >
                <Play :size="12" /> START JOB
              </button>
              <button 
                v-if="wo.status === 'on_progress'"
                @click="updateWOStatus(wo.id, 'done')"
                class="flex-1 bg-emerald-500 text-white py-2.5 rounded-xl text-[11px] font-bold hover:bg-emerald-600 transition-all active:scale-95 shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2"
              >
                <Check :size="14" /> FINISH JOB
              </button>
              <button 
                v-if="wo.status === 'done'"
                @click="updateWOStatus(wo.id, 'closed')"
                class="flex-1 bg-slate-800 text-white py-2.5 rounded-xl text-[11px] font-bold hover:bg-slate-900 transition-all active:scale-95 shadow-lg shadow-slate-800/10 flex items-center justify-center gap-2"
              >
                <Lock :size="12" /> CLOSE WO
              </button>
              <button @click="simulatePartRequest(wo.id)" class="w-10 h-10 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:bg-white hover:text-orange-500 transition-all group-hover:border-slate-300" title="Simulate Mechanic Part Request">
                <PackagePlus :size="16" />
              </button>
              <button class="w-10 h-10 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:bg-white hover:text-blue-500 transition-all group-hover:border-slate-300">
                <FileText :size="16" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed, ref } from 'vue';
import { Search, Wrench, Play, Check, Lock, FileText, PackagePlus } from 'lucide-vue-next';
import { useOrderStore } from '../stores/orderStore';

const orderStore = useOrderStore();
const isLoading = ref(false);

const simulatePartRequest = async (orderId) => {
  // Find a random part to request
  const partsRes = await fetch('/api/master/parts');
  const parts = await partsRes.json();
  if (!parts.length) return;

  const randomPart = parts[Math.floor(Math.random() * parts.length)];
  
  try {
    const res = await fetch(`/api/orders/${orderId}/spare-parts/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ partId: randomPart.id, quantity: Math.floor(Math.random() * 3) + 1 }]
      })
    });
    if (res.ok) {
      alert(`Requested ${randomPart.name} for this WO! Check the notifications above.`);
      await orderStore.fetchPartRequests();
    }
  } catch (err) {
    console.error("Failed to simulate part request", err);
  }
};

const pendingPartRequests = computed(() => 
  orderStore.partRequests.filter(r => r.status === 'pending')
);

const getStatusClass = (status) => {
  switch (status) {
    case 'approved': return 'bg-blue-50 text-blue-600 border-blue-100';
    case 'on_progress': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    case 'done': return 'bg-purple-50 text-purple-600 border-purple-100';
    case 'closed': return 'bg-slate-100 text-slate-500 border-slate-200';
    default: return 'bg-slate-50 text-slate-400 border-slate-100';
  }
};

const updateWOStatus = async (id, status) => {
  try {
    const res = await fetch(`/api/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (res.ok) {
      await orderStore.fetchOrders();
    }
  } catch (err) {
    console.error("Failed to update status", err);
  }
};

const handlePartRequest = async (requestId, status) => {
  try {
    const res = await fetch(`/api/orders/spare-parts/requests/${requestId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (res.ok) {
      await orderStore.fetchPartRequests();
      await orderStore.fetchOrders(); // Refresh orders because total might have changed
    }
  } catch (err) {
    console.error("Failed to handle part request", err);
  }
};

onMounted(() => {
  orderStore.fetchOrders();
  orderStore.fetchPartRequests();
});
</script>
