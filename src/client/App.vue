<template>
  <div class="flex h-screen w-full bg-[#F1F5F9] font-sans selection:bg-blue-100">
    <!-- Sidebar -->
    <aside class="w-64 bg-[#1E293B] flex flex-col h-full shrink-0 shadow-xl overflow-hidden active-sidebar transition-all duration-300">
      <div class="p-6 flex items-center gap-3">
        <div class="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
          AS
        </div>
        <span class="text-white font-bold tracking-tight text-lg">
          AutoSync <span class="text-blue-400 font-medium">Pro</span>
        </span>
      </div>
      
      <nav class="flex-1 px-4 space-y-1 mt-4 overflow-y-auto">
        <router-link 
          v-for="item in menuItems" 
          :key="item.path" 
          :to="item.path"
          class="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all group"
          :class="[$route.path === item.path ? 'bg-blue-600/20 text-blue-400 ring-1 ring-blue-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800']"
        >
          <component :is="item.icon" :size="18" class="group-hover:scale-110 transition-transform" />
          {{ item.name }}
        </router-link>
      </nav>

      <div class="p-4 border-t border-slate-700/50">
        <div class="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/30">
          <div class="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center text-white ring-2 ring-slate-700 font-bold overflow-hidden">
            A
          </div>
          <div class="overflow-hidden">
            <p class="text-xs text-slate-200 font-bold truncate">Senior Architect</p>
            <p class="text-[10px] text-slate-500 truncate lowercase">admin@autosyncpro.com</p>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
      <header class="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <div class="flex items-center gap-4">
          <h1 class="text-lg font-bold text-slate-800 tracking-tight">Workshop Dashboard</h1>
          <div class="h-4 w-px bg-slate-300"></div>
          <select class="bg-slate-50 border border-slate-100 text-[10px] font-bold text-slate-600 focus:ring-0 cursor-pointer rounded-lg px-2 py-1 uppercase tracking-wide">
            <option>Branch: Jakarta Pusat (Head)</option>
            <option>Branch: Bandung Timur</option>
            <option>Branch: Surabaya Utara</option>
          </select>
        </div>
        
        <div class="flex items-center gap-6">
          <div class="relative group cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors">
            <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
            <Bell :size="20" class="text-slate-400 group-hover:text-slate-600" />
          </div>
        </div>
      </header>

      <div class="flex-1 overflow-y-auto overflow-x-hidden">
        <router-view v-slot="{ Component }">
          <transition 
            name="fade" 
            mode="out-in"
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0 translate-y-2"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 translate-y-1"
          >
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
      
      <div id="requisition-modal-wrapper">
        <NewRequisitionModal 
          :is-open="orderStore.isModalOpen" 
          @close="orderStore.closeModal" 
          @success="orderStore.fetchOrders"
        />
      </div>
    </main>
</div>
</template>

<script setup>
import { ref } from 'vue';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Wrench,
  Users, 
  Package, 
  Receipt, 
  BarChart3, 
  Bell, 
  Plus,
  MapPin,
  ChevronDown
} from 'lucide-vue-next';
import { useOrderStore } from './stores/orderStore';
import NewRequisitionModal from './components/NewRequisitionModal.vue';

const orderStore = useOrderStore();

const menuItems = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Maint. Requisition", path: "/requisitions", icon: ClipboardList },
  { name: "Work Orders", path: "/work-orders", icon: Wrench },
  { name: "Inventory Tracking", path: "/inventory", icon: Package },
  { name: "Billing & Invoices", path: "/billing", icon: Receipt },
  { name: "Mechanics & Flow", path: "/mechanics", icon: Users },
];
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
