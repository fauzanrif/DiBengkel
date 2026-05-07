<template>
  <div class="p-8 pb-24">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h2 class="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
          <Package class="text-blue-600" :size="32" />
          Inventory Tracking
        </h2>
        <p class="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
          Real-time Stock Movement & Physical Location Control
        </p>
      </div>
      <div class="flex gap-3">
        <!-- Notification Bell -->
        <div class="relative">
          <button 
            @click="isNotificationsOpen = !isNotificationsOpen" 
            class="bg-white border border-slate-200 p-2.5 rounded-xl text-slate-500 hover:bg-slate-50 transition-all shadow-sm relative"
          >
            <Bell :size="20" />
            <span v-if="unreadCount > 0" class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
              {{ unreadCount }}
            </span>
          </button>

          <!-- Notifications Dropdown -->
          <div v-if="isNotificationsOpen" class="absolute right-0 mt-3 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 z-[70] overflow-hidden">
            <div class="p-5 border-b border-slate-50 flex items-center justify-between">
              <h4 class="text-xs font-black text-slate-800 uppercase tracking-widest">Alerts & Notifications</h4>
              <button @click="isNotificationsOpen = false" class="text-slate-400 hover:text-slate-800">
                <X :size="16" />
              </button>
            </div>
            <div class="max-h-[400px] overflow-y-auto">
              <div v-for="n in notifications" :key="n.id" @click="handleNotificationClick(n)" :class="[n.isRead ? 'opacity-60' : 'bg-blue-50/30']" class="p-4 border-b border-slate-50 hover:bg-slate-50 transition-all cursor-pointer">
                <div class="flex gap-3">
                  <div :class="n.type === 'warning' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'" class="w-8 h-8 shrink-0 rounded-xl flex items-center justify-center">
                    <AlertTriangle v-if="n.type === 'warning'" :size="16" />
                    <Info v-else :size="16" />
                  </div>
                  <div>
                    <p class="text-[11px] font-black text-slate-800 leading-tight">{{ n.title }}</p>
                    <p class="text-[10px] font-medium text-slate-500 mt-1 leading-snug">{{ n.message }}</p>
                    <p class="text-[8px] font-black text-slate-400 uppercase mt-2 tracking-widest">{{ formatDateShort(n.createdAt) }}</p>
                  </div>
                </div>
              </div>
              <div v-if="notifications.length === 0" class="p-12 text-center">
                <p class="text-[10px] font-black text-slate-300 uppercase tracking-widest">No notifications</p>
              </div>
            </div>
            <div class="p-3 bg-slate-50 text-center">
              <button class="text-[10px] font-black text-blue-600 uppercase tracking-widest">Clear All</button>
            </div>
          </div>
        </div>

        <button @click="openMoveModal('in')" class="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2">
          <Plus :size="16" /> Stock In
        </button>
        <button @click="openMoveModal('transfer')" class="bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2">
          <ArrowRightLeft :size="16" /> Transfer
        </button>
      </div>
    </div>

    <!-- Stats & Filters -->
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
      <!-- Quick Stats Card -->
      <div class="lg:col-span-1 space-y-4">
        <div class="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Health Status</p>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-slate-500">Low Stock</span>
              <span class="px-2 py-1 bg-red-50 text-red-600 text-[10px] font-black rounded-lg">{{ lowStockCount }} ITEMS</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-slate-500">Reserved</span>
              <span class="px-2 py-1 bg-amber-50 text-amber-600 text-[10px] font-black rounded-lg">{{ totalReserved }} UNITS</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-slate-500">Consignment</span>
              <span class="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-lg">8 ITEMS</span>
            </div>
          </div>
        </div>
        
        <!-- Warehouse Toggle -->
        <div class="bg-slate-900 p-5 rounded-3xl shadow-xl">
          <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Current Warehouse</p>
          <select 
            v-model="selectedWarehouseId"
            class="w-full bg-slate-800 border-none text-white text-sm font-black rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500 transition-all appearance-none cursor-pointer"
          >
            <option value="">All Warehouses</option>
            <option v-for="wh in warehouses" :key="wh.id" :value="wh.id">{{ wh.name }}</option>
          </select>
        </div>
      </div>

      <!-- Search & Main Items -->
      <div class="lg:col-span-3 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <!-- Search Header -->
          <div class="p-4 border-b border-slate-100 flex gap-4">
            <div class="relative flex-1 group">
                <Search class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" :size="18" />
                <input 
                    v-model="searchQuery"
                    type="text" 
                    placeholder="Search Part Name, Code, Barcode, or Position..." 
                    class="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                >
            </div>
            <div class="flex items-center gap-2">
                <button class="bg-slate-50 p-3 rounded-2xl text-slate-500 hover:bg-slate-100 transition-colors">
                    <Filter :size="20" />
                </button>
            </div>
          </div>

          <!-- Inventory List -->
          <div class="flex-1 overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead class="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <tr>
                        <th class="px-6 py-4">Item Details</th>
                        <th class="px-6 py-4">Physical Position</th>
                        <th class="px-6 py-4 text-center">In Stock</th>
                        <th class="px-6 py-4 text-center">Reserved</th>
                        <th class="px-6 py-4 text-center">Available</th>
                        <th class="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-50">
                    <tr v-for="item in filteredInventory" :key="item.id" class="group hover:bg-slate-50 transition-colors cursor-pointer" @click="selectedItem = item">
                        <td class="px-6 py-5">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                    <component :is="getIcon(item.part.category)" :size="20" />
                                </div>
                                <div>
                                    <p class="text-sm font-black text-slate-800 tracking-tight">{{ item.part.name }}</p>
                                    <p class="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-tighter">{{ item.part.code }}</p>
                                </div>
                            </div>
                        </td>
                        <td class="px-6 py-5">
                            <div class="flex flex-col gap-1">
                                <div class="flex items-center gap-1.5 text-[10px] font-black text-slate-700 uppercase tracking-wider">
                                    <MapPin :size="10" class="text-blue-500" />
                                    {{ item.zone }} / {{ item.rack }}
                                </div>
                                <div class="text-[9px] font-bold text-slate-400 uppercase ml-4">
                                    S:{{ item.shelf }} BIN:{{ item.bin }}
                                </div>
                            </div>
                        </td>
                        <td class="px-6 py-5 text-center">
                            <span class="text-sm font-black text-slate-700">{{ item.quantity }}</span>
                            <span class="text-[9px] font-bold text-slate-400 ml-1 uppercase">{{ item.part.unit }}</span>
                        </td>
                        <td class="px-6 py-5 text-center">
                            <span :class="item.reserved > 0 ? 'text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg' : 'text-slate-400'" class="text-sm font-black">
                                {{ item.reserved }}
                            </span>
                        </td>
                        <td class="px-6 py-5 text-center">
                            <div class="flex flex-col items-center">
                                <span :class="getAvailableClass(item)" class="text-lg font-black tracking-tighter">
                                    {{ item.quantity - item.reserved }}
                                </span>
                                <span v-if="isLowStock(item)" class="text-[8px] font-black text-red-500 uppercase tracking-widest mt-[-2px]">LOW STOCK</span>
                            </div>
                        </td>
                        <td class="px-6 py-5 text-right">
                            <div class="flex items-center justify-end gap-2">
                                <button class="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                                    <History :size="18" />
                                </button>
                                <button class="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all">
                                    <ChevronRight :size="18" />
                                </button>
                            </div>
                        </td>
                    </tr>
                    <tr v-if="filteredInventory.length === 0">
                        <td colspan="6" class="px-6 py-20 text-center">
                            <div class="flex flex-col items-center gap-3">
                                <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                                    <PackageX :size="32" />
                                </div>
                                <p class="text-sm font-black text-slate-400 uppercase tracking-widest">No matching items found</p>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
          </div>
      </div>
    </div>

    <!-- Detail Side Drawer -->
    <transition
        enter-active-class="transform transition ease-in-out duration-300"
        enter-from-class="translate-x-full"
        enter-to-class="translate-x-0"
        leave-active-class="transform transition ease-in-out duration-300"
        leave-from-class="translate-x-0"
        leave-to-class="translate-x-full"
    >
        <div v-if="selectedItem" class="fixed inset-y-0 right-0 w-full lg:w-[480px] bg-white shadow-2xl z-50 border-l border-slate-200 flex flex-col">
            <!-- Drawer Header -->
            <div class="p-6 border-b border-slate-100 flex items-center justify-between gap-4">
                <div class="flex items-center gap-4 truncate">
                    <button @click="selectedItem = null" class="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all">
                        <X :size="20" />
                    </button>
                    <div class="truncate">
                        <h3 class="font-black text-slate-800 truncate">{{ selectedItem.part.name }}</h3>
                        <p class="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Stock Item Details</p>
                    </div>
                </div>
                <div class="flex items-center gap-2 shrink-0">
                    <span :class="selectedItem.part.isConsignment ? 'bg-indigo-50 text-indigo-600' : 'bg-blue-50 text-blue-600'" class="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider border">
                        {{ selectedItem.part.isConsignment ? 'Consignment' : 'Standard' }}
                    </span>
                </div>
            </div>

            <!-- Drawer Content -->
            <div class="flex-1 overflow-y-auto p-6 space-y-8">
                <!-- Stock Pulse -->
                <div class="grid grid-cols-3 gap-3">
                    <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                        <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">On Hand</p>
                        <p class="text-xl font-black text-slate-800 tracking-tighter">{{ selectedItem.quantity }}</p>
                    </div>
                    <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                        <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Reserved</p>
                        <p class="text-xl font-black text-amber-600 tracking-tighter">{{ selectedItem.reserved }}</p>
                    </div>
                    <div class="bg-blue-600 p-4 rounded-2xl shadow-lg shadow-blue-600/20 text-center">
                        <p class="text-[9px] font-black text-blue-200 uppercase tracking-widest mb-1">Available</p>
                        <p class="text-xl font-black text-white tracking-tighter">{{ selectedItem.quantity - selectedItem.reserved }}</p>
                    </div>
                </div>

                <!-- Position Map -->
                <div>
                    <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <MapPin :size="12" /> Physical Storage Location
                    </h4>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="flex flex-col gap-1 p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <span class="text-[8px] font-black text-slate-400 uppercase">Warehouse</span>
                            <span class="text-xs font-bold text-slate-700">{{ selectedItem.warehouse?.name }}</span>
                        </div>
                        <div class="flex flex-col gap-1 p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <span class="text-[8px] font-black text-slate-400 uppercase">Zone</span>
                            <span class="text-xs font-bold text-slate-700">{{ selectedItem.zone }}</span>
                        </div>
                        <div class="flex flex-col gap-1 p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <span class="text-[8px] font-black text-slate-400 uppercase">Rack & Shelf</span>
                            <span class="text-xs font-bold text-slate-700">{{ selectedItem.rack }} - {{ selectedItem.shelf }}</span>
                        </div>
                        <div class="flex flex-col gap-1 p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <span class="text-[8px] font-black text-slate-400 uppercase">Bin Code</span>
                            <span class="text-xs font-bold text-slate-700 font-mono tracking-tight">{{ selectedItem.bin }}</span>
                        </div>
                    </div>
                    <p class="mt-4 text-[10px] font-bold text-blue-500 bg-blue-50/50 p-3 rounded-xl border border-blue-100/50 italic">
                        Locating items fast saves 15% mechanic idle time. Always use the specified BIN.
                    </p>
                </div>

                <!-- Recent Movements -->
                <div>
                   <div class="flex items-center justify-between mb-4">
                       <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                           <History :size="12" /> Movement History
                       </h4>
                       <button class="text-[9px] font-black text-blue-600 uppercase hover:underline">View All</button>
                   </div>
                   <div class="space-y-3">
                       <div v-for="mv in selectedItem.movements?.slice(0, 5)" :key="mv.id" class="flex gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group">
                           <div :class="getMoveColor(mv.type)" class="w-8 h-8 shrink-0 rounded-xl flex items-center justify-center">
                               <component :is="getMoveIcon(mv.type)" :size="14" />
                           </div>
                           <div class="flex-1">
                               <div class="flex items-center justify-between">
                                   <p class="text-xs font-black text-slate-700 uppercase tracking-tight">{{ mv.type }}</p>
                                   <p class="text-[10px] font-black tracking-tighter" :class="mv.quantity >= 0 ? 'text-emerald-600' : 'text-red-500'">
                                       {{ mv.quantity > 0 ? '+' : '' }}{{ mv.quantity }} {{ selectedItem.part.unit }}
                                   </p>
                               </div>
                               <div class="flex items-center justify-between mt-0.5">
                                   <p class="text-[10px] font-bold text-slate-400 uppercase">{{ formatDateShort(mv.createdAt) }}</p>
                                   <p class="text-[10px] font-bold text-slate-400 italic">{{ mv.referenceType || 'Manual' }}</p>
                               </div>
                           </div>
                       </div>
                   </div>
                </div>
            </div>

            <!-- Drawer Footer Actions -->
             <div class="p-6 border-t border-slate-100 bg-slate-50/50 grid grid-cols-2 gap-4">
                 <button @click="openMoveModal('adjustment', selectedItem)" class="flex flex-col items-center gap-1 p-3 bg-white border border-slate-200 rounded-2xl hover:border-blue-500 hover:text-blue-600 transition-all group">
                     <Settings2 :size="20" class="text-slate-400 group-hover:text-blue-600" />
                     <span class="text-[9px] font-black uppercase tracking-widest">Adjust Stock</span>
                 </button>
                 <button @click="openMoveModal('transfer', selectedItem)" class="flex flex-col items-center gap-1 p-3 bg-white border border-slate-200 rounded-2xl hover:border-blue-500 hover:text-blue-600 transition-all group">
                     <ArrowRightLeft :size="20" class="text-slate-400 group-hover:text-blue-600" />
                     <span class="text-[9px] font-black uppercase tracking-widest">Transfer to...</span>
                 </button>
             </div>
        </div>
    </transition>

    <!-- Movement Modal (Stock In / Transfer / Adjustment) -->
    <div v-if="isMoveModalOpen" class="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="isMoveModalOpen = false"></div>
        <div class="bg-white w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl relative">
            <div class="p-8 border-b border-slate-100">
                <h3 class="text-2xl font-black text-slate-800 tracking-tight uppercase">{{ moveType }} Stock</h3>
                <p class="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Manual Inventory Intervention</p>
            </div>
            
            <div class="p-8 space-y-6">
                <div v-if="!actionItem">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Select Item</label>
                    <select v-model="moveForm.inventoryId" class="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-4 text-sm font-black outline-none focus:ring-4 focus:ring-blue-500/10 transition-all">
                        <option value="">Select an Item...</option>
                        <option v-for="item in inventory" :key="item.id" :value="item.id">
                            {{ item.part.name }} ({{ item.part.code }})
                        </option>
                    </select>
                </div>

                <div>
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">{{ moveType === 'adjustment' ? 'Actual Physical Count' : 'Quantity' }}</label>
                    <div class="flex items-center gap-4">
                        <input 
                            v-model.number="moveForm.quantity"
                            type="number" 
                            class="flex-1 bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-4 text-sm font-black outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                        >
                        <span class="text-xs font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-4 py-3.5 rounded-2xl">
                            {{ actionItem?.part?.unit || 'PCS' }}
                        </span>
                    </div>
                </div>

                <div>
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Note / Reason</label>
                    <textarea 
                        v-model="moveForm.note"
                        placeholder="Why are you changing this stock?" 
                        class="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-4 text-sm font-black outline-none focus:ring-4 focus:ring-blue-500/10 transition-all h-24 resize-none"
                    ></textarea>
                </div>
            </div>

            <div class="p-8 bg-slate-50 flex gap-3">
                <button @click="isMoveModalOpen = false" class="flex-1 py-4 text-xs font-black text-slate-500 uppercase tracking-widest hover:text-slate-800 transition-colors">Cancel</button>
                <button @click="submitMovement" class="flex-1 bg-slate-900 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 active:scale-95 transition-all">
                    Register Movement
                </button>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { 
  Package, 
  Plus, 
  ArrowRightLeft, 
  Search, 
  Filter, 
  MapPin, 
  ChevronRight, 
  Droplets, 
  Settings, 
  Cpu, 
  Battery, 
  Disc,
  PackageX,
  X,
  History,
  TrendingDown,
  TrendingUp,
  Settings2,
  Bell,
  AlertTriangle,
  Info
} from 'lucide-vue-next';

const inventory = ref([]);
const warehouses = ref([]);
const notifications = ref([]);
const isNotificationsOpen = ref(false);
const selectedWarehouseId = ref('');
const searchQuery = ref('');
const selectedItem = ref(null);

const unreadCount = computed(() => {
    return notifications.value.filter(n => !n.isRead).length;
});

const isMoveModalOpen = ref(false);
const moveType = ref('in');
const actionItem = ref(null);
const moveForm = ref({
    inventoryId: '',
    quantity: 0,
    note: ''
});

const lowStockCount = computed(() => {
    return inventory.value.filter(i => (i.quantity - i.reserved) <= i.minStock).length;
});

const totalReserved = computed(() => {
    return inventory.value.reduce((s, i) => s + i.reserved, 0);
});

const filteredInventory = computed(() => {
    return inventory.value.filter(item => {
        const matchesWarehouse = !selectedWarehouseId.value || item.warehouseId === selectedWarehouseId.value;
        const q = searchQuery.value.toLowerCase();
        const matchesSearch = !q || 
            item.part.name.toLowerCase().includes(q) || 
            item.part.code.toLowerCase().includes(q) ||
            item.zone?.toLowerCase().includes(q) ||
            item.rack?.toLowerCase().includes(q) ||
            item.bin?.toLowerCase().includes(q);
            
        return matchesWarehouse && matchesSearch;
    });
});

const fetchInventoryData = async () => {
    try {
        const [invRes, whRes, notiRes] = await Promise.all([
            fetch('/api/inventory'),
            fetch('/api/inventory/warehouses'),
            fetch('/api/inventory/notifications')
        ]);
        if (invRes.ok) inventory.value = await invRes.json();
        if (whRes.ok) warehouses.value = await whRes.json();
        if (notiRes.ok) notifications.value = await notiRes.json();
    } catch (err) {
        console.error("Inventory: Failed to fetch data", err);
    }
};

const handleNotificationClick = async (n) => {
    if (!n.isRead) {
        try {
            await fetch(`/api/inventory/notifications/${n.id}/read`, { method: 'PATCH' });
            n.isRead = true;
        } catch (err) {
            console.error("Failed to mark read", err);
        }
    }
    
    if (n.category === 'inventory' && n.referenceId) {
        const item = inventory.value.find(i => i.id === n.referenceId);
        if (item) {
            selectedItem.value = item;
            isNotificationsOpen.value = false;
        }
    }
};

const openMoveModal = (type, item = null) => {
    moveType.value = type;
    actionItem.value = item;
    moveForm.value = {
        inventoryId: item ? item.id : '',
        quantity: type === 'adjustment' && item ? item.quantity : 0,
        note: ''
    };
    isMoveModalOpen.value = true;
};

const submitMovement = async () => {
    try {
        const res = await fetch('/api/inventory/movements', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...moveForm.value,
                type: moveType.value
            })
        });
        if (res.ok) {
            isMoveModalOpen.value = false;
            await fetchInventoryData();
            if (selectedItem.value) {
                // Refresh drawer
                const updated = inventory.value.find(i => i.id === selectedItem.value.id);
                selectedItem.value = updated;
            }
        }
    } catch (err) {
        console.error("Inventory: Update failed", err);
    }
};

const getIcon = (category) => {
    switch (category?.toLowerCase()) {
        case 'oil': return Droplets;
        case 'filter': return Settings;
        case 'engine': return Cpu;
        case 'battery': return Battery;
        case 'brake': return Disc;
        default: return Package;
    }
};

const getMoveIcon = (type) => {
    switch (type) {
        case 'in': return TrendingUp;
        case 'out': return TrendingDown;
        case 'reservation': return Package;
        case 'release': return ArrowRightLeft;
        default: return Settings2;
    }
};

const getMoveColor = (type) => {
    switch (type) {
        case 'in': return 'bg-emerald-50 text-emerald-600';
        case 'out': return 'bg-red-50 text-red-600';
        case 'reservation': return 'bg-amber-50 text-amber-600';
        case 'release': return 'bg-blue-50 text-blue-600';
        default: return 'bg-slate-50 text-slate-500';
    }
};

const getAvailableClass = (item) => {
    const avail = item.quantity - item.reserved;
    if (avail <= 0) return 'text-red-600 underline decoration-red-200 decoration-4';
    if (avail <= item.minStock) return 'text-amber-600';
    return 'text-blue-600';
};

const isLowStock = (item) => {
    return (item.quantity - item.reserved) <= item.minStock;
};

const formatDateShort = (date) => {
    return new Date(date).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

onMounted(fetchInventoryData);
</script>

<style scoped>
/* Custom transitions for drawer */
.drawer-enter-active, .drawer-leave-active {
    transition: transform 0.3s ease-in-out;
}
.drawer-enter-from, .drawer-leave-to {
    transform: translateX(100%);
}

/* Custom scrollbar for lean look */
::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #E2E8F0;
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: #CBD5E1;
}
</style>
