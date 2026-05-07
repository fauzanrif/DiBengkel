<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="$emit('close')"></div>
    
    <!-- Modal -->
    <div class="relative bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[90vh]">
      <header class="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div>
          <h2 class="text-xl font-bold text-slate-800 tracking-tight">New Maintenance Requisition</h2>
          <p class="text-xs text-slate-400 font-medium tracking-wide">Enter customer request and build an initial estimate</p>
        </div>
        <button @click="$emit('close')" class="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
          <X :size="20" />
        </button>
      </header>

      <div class="flex-1 overflow-hidden flex">
        <!-- Form Area -->
        <div class="flex-1 overflow-y-auto p-8 space-y-8 border-r border-slate-100 bg-white">
          <!-- 1. Workshop & Method -->
          <section class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-1.5">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <MapPin :size="12" /> Workshop
              </label>
              <select v-model="form.workshopId" class="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all">
                <option value="">Select Branch</option>
                <option v-for="w in masters.workshops" :key="w.id" :value="w.id">{{ w.name }}</option>
              </select>
            </div>
            <div class="space-y-1.5">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Settings :size="12" /> Service Method
              </label>
              <select v-model="form.serviceMethod" class="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all">
                <option value="walk-in">Walk-In</option>
                <option value="onsite">Onsite-Service</option>
                <option value="pickup-delivery">Pick up delivery</option>
              </select>
            </div>
          </section>

          <!-- 2. Customer & Vehicle -->
          <section class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-4">
                <div class="flex justify-between items-center px-1">
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <User :size="12" /> Customer Information
                  </label>
                  <div class="flex gap-2 bg-slate-100 p-1 rounded-lg">
                    <button 
                      @click="form.customerType = 'individual'"
                      :class="[form.customerType === 'individual' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400']"
                      class="text-[9px] font-black px-2 py-1 rounded-md transition-all"
                    >PRIVATE</button>
                    <button 
                       @click="form.customerType = 'corporate'"
                      :class="[form.customerType === 'corporate' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400']"
                      class="text-[9px] font-black px-2 py-1 rounded-md transition-all"
                    >CORP</button>
                  </div>
                </div>
                
                <div v-if="form.customerType === 'corporate'" class="space-y-2">
                   <select v-model="form.customerId" class="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all">
                    <option value="">Select Corporate Account</option>
                    <option v-for="c in masters.corporateCustomers" :key="c.id" :value="c.id">{{ c.name }}</option>
                  </select>
                </div>
                <div v-else class="grid grid-cols-1 gap-3">
                  <input v-model="form.customerName" placeholder="Customer Name" class="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-medium outline-none">
                  <input v-model="form.phone" placeholder="Phone Number" class="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-medium outline-none">
                </div>
              </div>

              <div class="space-y-4">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Car :size="12" /> Vehicle Information
                </label>
                <div class="grid grid-cols-1 gap-3">
                  <input v-model="form.plateNumber" placeholder="Plate Number (e.g. B 1234 ABC)" class="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-bold uppercase outline-none">
                  <select v-model="form.vehicleModelId" class="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-bold outline-none">
                    <option value="">Select Vehicle Model</option>
                    <option v-for="m in masters.vehicleModels" :key="m.id" :value="m.id">{{ m.name }}</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-1.5">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Odometer (KM)</label>
                <input v-model="form.odometer" type="number" class="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-bold outline-none">
              </div>
              <div class="space-y-1.5">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reference Number</label>
                <input v-model="form.referenceNumber" type="text" class="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-bold outline-none">
              </div>
            </div>
          </section>

          <!-- 3. Complaint & Analysis -->
          <section class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-1.5">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Wrench :size="12" /> Complaint
              </label>
              <textarea v-model="form.complaint" rows="3" class="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm font-medium outline-none" placeholder="Issues reported by customer..."></textarea>
            </div>
            <div class="space-y-1.5">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                 <ClipboardList :size="12" /> Initial Analysis
              </label>
              <textarea v-model="form.analysis" rows="3" class="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm font-medium outline-none" placeholder="Mechanic's first thoughts..."></textarea>
            </div>
          </section>

          <!-- 4. Tasks & Parts Selection -->
          <section class="space-y-6">
             <div class="flex justify-between items-center">
                <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tasks & Spareparts</h3>
                <div class="flex gap-2">
                   <button @click="addTask" class="text-[9px] font-black bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-600 hover:text-white transition-all">+ ADD TASK</button>
                   <button @click="addPart" class="text-[9px] font-black bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg hover:bg-emerald-600 hover:text-white transition-all">+ ADD PART</button>
                </div>
             </div>

             <div class="space-y-3">
                <!-- Headers for Entry -->
                <div v-if="form.tasks.length > 0 || form.parts.length > 0" class="flex items-center gap-3 px-10 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  <div class="flex-1">Product / Service Selection</div>
                  <div class="w-16 text-center">Qty</div>
                  <div class="w-24 text-right pr-2">Unit Price</div>
                  <div class="w-20 text-center">Discount</div>
                  <div class="w-6"></div>
                </div>

                <div v-for="(t, idx) in form.tasks" :key="'t-'+idx" class="flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-100">
                   <div class="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-[9px] font-black shrink-0">T</div>
                   <select v-model="t.taskId" class="flex-1 bg-white border border-slate-200 rounded-lg py-1.5 px-3 text-xs font-bold outline-none">
                      <option value="">Select Service Task</option>
                      <option v-for="tm in masters.tasks" :key="tm.id" :value="tm.id">{{ tm.name }}</option>
                   </select>
                   <input v-model.number="t.quantity" type="number" placeholder="Qty" class="w-16 bg-white border border-slate-200 rounded-lg py-1.5 px-2 text-xs font-bold text-center outline-none">
                   <div class="w-24 text-right text-[11px] font-mono font-bold text-slate-400 pr-2">
                     ${{ (masters.tasks || []).find(m => m.id === t.taskId)?.standardPrice || '0.00' }}
                   </div>
                   <input v-model.number="t.discount" type="number" placeholder="Disc" class="w-20 bg-white border border-slate-200 rounded-lg py-1.5 px-2 text-xs font-bold text-center outline-none">
                   <button @click="form.tasks.splice(idx, 1)" class="text-slate-300 hover:text-red-500 shrink-0"><X :size="14"/></button>
                </div>

                <div v-for="(p, idx) in form.parts" :key="'p-'+idx" class="flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-100">
                   <div class="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-[9px] font-black shrink-0">P</div>
                   <select v-model="p.partId" class="flex-1 bg-white border border-slate-200 rounded-lg py-1.5 px-3 text-xs font-bold outline-none">
                      <option value="">Select Sparepart</option>
                      <option v-for="pm in masters.parts" :key="pm.id" :value="pm.id">{{ pm.name }} ({{ pm.code }})</option>
                   </select>
                   <input v-model.number="p.quantity" type="number" placeholder="Qty" class="w-16 bg-white border border-slate-200 rounded-lg py-1.5 px-2 text-xs font-bold text-center outline-none">
                   <div class="w-24 text-right text-[11px] font-mono font-bold text-slate-400 pr-2">
                     ${{ (masters.parts || []).find(m => m.id === p.partId)?.basePrice || '0.00' }}
                   </div>
                   <input v-model.number="p.discount" type="number" placeholder="Disc" class="w-20 bg-white border border-slate-200 rounded-lg py-1.5 px-2 text-xs font-bold text-center outline-none">
                   <button @click="form.parts.splice(idx, 1)" class="text-slate-300 hover:text-red-500 shrink-0"><X :size="14"/></button>
                </div>
             </div>
          </section>

          <!-- 5. Mechanic & Status -->
          <section class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-1.5">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Users :size="12" /> Assign Mechanic
                </label>
                <select v-model="form.mechanicId" class="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-bold outline-none">
                  <option value="">Select Mechanic</option>
                  <option v-for="m in masters.mechanics" :key="m.id" :value="m.id">{{ m.name }}</option>
                </select>
            </div>
            <div class="space-y-1.5">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <ClipboardList :size="12" /> Status
                </label>
                <select v-model="form.status" class="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-bold outline-none">
                  <option value="draft">DRAFT</option>
                  <option value="book">BOOK</option>
                  <option value="approved">APPROVE</option>
                </select>
            </div>
          </section>
        </div>

        <!-- Summary Sidebar -->
        <aside class="w-96 bg-slate-50/50 p-8 flex flex-col">
           <h3 class="text-xs font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
             <Receipt :size="14" /> Sales Summary (Estimate)
           </h3>

           <div class="flex-1 space-y-4 overflow-y-auto">
              <div v-for="item in summaryItems" :key="item.id" class="flex justify-between items-start gap-4">
                 <div class="space-y-0.5">
                    <div class="text-[11px] font-bold text-slate-800 leading-tight">{{ item.name }}</div>
                    <div class="text-[9px] text-slate-400 font-medium">Qty: {{ item.qty }} {{ item.uom }}</div>
                 </div>
                 <div class="text-right">
                    <div class="text-[11px] font-bold text-slate-800">${{ item.total }}</div>
                    <div v-if="item.discount > 0" class="text-[9px] text-red-500 font-bold">-${{ item.discount }}</div>
                 </div>
              </div>
              
              <div v-if="summaryItems.length === 0" class="text-center py-10 text-slate-300 italic text-[11px]">
                 No items added to estimate yet.
              </div>
           </div>

           <div class="mt-8 pt-6 border-t-2 border-dashed border-slate-200 space-y-3">
              <div class="flex justify-between text-xs font-medium text-slate-500">
                 <span>Subtotal</span>
                 <span>${{ subtotalAmount }}</span>
              </div>
              <div class="flex justify-between text-xs font-medium text-red-500">
                 <span>Total Discount</span>
                 <span>-${{ totalDiscountAmount }}</span>
              </div>
              <div class="flex justify-between items-baseline pt-2">
                 <span class="text-xs font-black text-slate-800 uppercase">Grand Total</span>
                 <span class="text-2xl font-black text-blue-600">${{ grandTotalAmount }}</span>
              </div>
           </div>
        </aside>
      </div>

      <footer class="p-6 border-t border-slate-100 bg-white flex justify-end gap-3">
        <button 
          @click="$emit('close')"
          class="px-6 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition-all uppercase tracking-widest"
        >
          CANCEL
        </button>
        <button 
          @click="handleSubmit"
          :disabled="isSubmitting"
          class="bg-blue-600 text-white px-8 py-2.5 rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-50 flex items-center gap-2 uppercase tracking-widest"
        >
          <span v-if="isSubmitting">PROCESSING...</span>
          <span v-else>CONFIRM REQUISITION</span>
        </button>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { X, Search, Car, User, Wrench, MapPin, Settings, ClipboardList, Package, Users, Receipt } from 'lucide-vue-next';

defineProps(['isOpen']);
const emit = defineEmits(['close', 'success']);

const isSubmitting = ref(false);

const masters = reactive({
  workshops: [],
  vehicleModels: [],
  corporateCustomers: [],
  tasks: [],
  parts: [],
  mechanics: []
});

const form = reactive({
  workshopId: '',
  serviceMethod: 'walk-in',
  customerType: 'individual',
  customerId: '',
  customerName: '',
  phone: '',
  plateNumber: '',
  vehicleModelId: '',
  odometer: 0,
  referenceNumber: '',
  complaint: '',
  analysis: '',
  tasks: [],
  parts: [],
  mechanicId: '',
  status: 'draft'
});

const fetchMasters = async () => {
  try {
    const urls = [
      '/api/master/workshops',
      '/api/master/vehicle-models',
      '/api/master/tasks',
      '/api/master/spare-parts',
      '/api/master/mechanics',
      '/api/master/customers/corporate'
    ];
    
    const [ws, vm, ts, ps, mc, cc] = await Promise.all(
      urls.map(u => fetch(u).then(r => {
        if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`);
        return r.json();
      }).catch(e => {
        console.warn(`Failed to fetch ${u}:`, e);
        return []; // Return empty array on failure
      }))
    );

    masters.workshops = Array.isArray(ws) ? ws : [];
    masters.vehicleModels = Array.isArray(vm) ? vm : [];
    masters.tasks = Array.isArray(ts) ? ts : [];
    masters.parts = Array.isArray(ps) ? ps : [];
    masters.mechanics = Array.isArray(mc) ? mc : [];
    masters.corporateCustomers = Array.isArray(cc) ? cc : [];
  } catch (err) {
    console.error("Failed to load master data", err);
  }
};

onMounted(fetchMasters);

const addTask = () => {
  form.tasks.push({ taskId: '', quantity: 1, discount: 0 });
};

const addPart = () => {
  form.parts.push({ partId: '', quantity: 1, discount: 0 });
};

const summaryItems = computed(() => {
  const items = [];
  
  (form.tasks || []).forEach(t => {
    const master = (masters.tasks || []).find(m => m.id === t.taskId);
    if (master) {
      items.push({
        id: 't-'+t.taskId,
        name: master.name,
        qty: t.quantity,
        uom: 'JASA',
        price: Number(master.standardPrice),
        discount: t.discount,
        total: (Number(master.standardPrice) * t.quantity)
      });
    }
  });

  (form.parts || []).forEach(p => {
    const master = (masters.parts || []).find(m => m.id === p.partId);
    if (master) {
      items.push({
        id: 'p-'+p.partId,
        name: master.name,
        qty: p.quantity,
        uom: master.unit,
        price: Number(master.basePrice),
        discount: p.discount,
        total: (Number(master.basePrice) * p.quantity)
      });
    }
  });

  return items;
});

const subtotalAmount = computed(() => summaryItems.value.reduce((acc, i) => acc + i.total, 0));
const totalDiscountAmount = computed(() => summaryItems.value.reduce((acc, i) => acc + (i.discount || 0), 0));
const grandTotalAmount = computed(() => subtotalAmount.value - totalDiscountAmount.value);

const handleSubmit = async () => {
  if (!form.plateNumber || !form.complaint) {
    alert("Please fill in plate number and complaint.");
    return;
  }

  // Validate tasks and parts selection/quantity
  for (const t of form.tasks) {
    if (!t.taskId) {
      alert("Please select a service product/jasa for all added task rows.");
      return;
    }
    if (t.quantity < 1 || t.quantity === null || t.quantity === undefined) {
      alert("Quantity for service must be at least 1.");
      return;
    }
  }

  for (const p of form.parts) {
    if (!p.partId) {
      alert("Please select a sparepart for all added part rows.");
      return;
    }
    if (p.quantity < 1 || p.quantity === null || p.quantity === undefined) {
      alert("Quantity for spareparts must be at least 1.");
      return;
    }
  }

  if (form.tasks.length === 0 && form.parts.length === 0) {
    alert("Please add at least one task or part to the requisition.");
    return;
  }

  isSubmitting.value = true;
  try {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });

    if (response.ok) {
      emit('success');
      emit('close');
      // Reset form
      Object.assign(form, {
          workshopId: '',
          serviceMethod: 'walk-in',
          customerType: 'individual',
          customerId: '',
          customerName: '',
          phone: '',
          plateNumber: '',
          vehicleModelId: '',
          odometer: 0,
          referenceNumber: '',
          complaint: '',
          analysis: '',
          tasks: [],
          parts: [],
          mechanicId: '',
          status: 'draft'
      });
    }
  } catch (err) {
    console.error("Failed to create Requisition", err);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

