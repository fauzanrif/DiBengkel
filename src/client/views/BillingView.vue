<template>
  <div class="p-8 space-y-8 max-w-[1600px] mx-auto">
    <!-- Header Section -->
    <div class="flex justify-between items-end">
      <div>
        <h2 class="text-3xl font-black text-slate-800 tracking-tight">Billing & Finance</h2>
        <p class="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Operational Revenue & Invoice Management</p>
      </div>
      <div class="flex gap-4">
        <div v-for="acc in accounts" :key="acc.id" class="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 shadow-sm min-w-[200px]">
          <div :class="acc.type === 'bank' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'" class="w-10 h-10 rounded-xl flex items-center justify-center">
            <CreditCard v-if="acc.type === 'bank'" :size="20" />
            <DollarSign v-else :size="20" />
          </div>
          <div>
            <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate max-w-[120px]">{{ acc.name }}</p>
            <p class="text-sm font-black text-slate-800">${{ Number(acc.balance).toLocaleString() }}</p>
          </div>
        </div>
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-4 shadow-xl">
          <div class="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white">
            <TrendingUp :size="20" />
          </div>
          <div>
            <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Revenue</p>
            <p class="text-lg font-black text-white">${{ totalRevenue.toLocaleString() }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Grid -->
    <div class="grid grid-cols-1 xl:grid-cols-12 gap-8">
      
      <!-- Left: Pending Billing (WOs done but not invoiced) -->
      <div class="xl:col-span-4 space-y-6">
        <div class="flex items-center justify-between px-2">
          <h3 class="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
            <Clock :size="14" class="text-amber-500" /> Pending Billing
          </h3>
          <span class="bg-amber-100 text-amber-600 px-2.5 py-0.5 rounded-full text-[10px] font-black">{{ pendingOrders.length }}</span>
        </div>

        <div v-if="pendingOrders.length === 0" class="bg-slate-50 border border-dashed border-slate-200 rounded-3xl p-12 text-center">
            <p class="text-xs font-bold text-slate-400 italic">No completed jobs awaiting billing.</p>
        </div>

        <div v-for="order in pendingOrders" :key="order.id" class="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm hover:border-blue-400 transition-all group relative overflow-hidden">
          <div class="flex justify-between items-start mb-4">
            <div>
              <div class="text-[10px] font-mono font-bold text-slate-300 mb-1">#{{ order.spkNumber }}</div>
              <h4 class="font-black text-slate-800 tracking-tight">{{ order.vehicle?.plateNumber }}</h4>
              <p class="text-[10px] font-bold text-slate-500 uppercase truncate max-w-[180px]">{{ order.customer?.name }}</p>
            </div>
            <div class="text-right">
              <p class="text-lg font-black text-slate-800 leading-none">${{ Number(order.estimatedTotal).toLocaleString() }}</p>
              <p class="text-[9px] font-bold text-slate-400 mt-1 uppercase">Ready to Invoice</p>
            </div>
          </div>

          <button 
            @click="generateInvoice(order.id)"
            class="w-full bg-slate-900 text-white py-2.5 rounded-xl text-xs font-black hover:bg-blue-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10 active:scale-95"
          >
            GENERATE INVOICE <ArrowRight :size="14" />
          </button>
        </div>
      </div>

      <!-- Right: Invoices History -->
      <div class="xl:col-span-8 space-y-6">
        <div class="flex items-center justify-between px-2">
          <h3 class="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
            <Receipt :size="14" class="text-blue-500" /> Invoice History
          </h3>
        </div>

        <div class="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
          <table class="w-full text-left border-separate border-spacing-0">
            <thead class="bg-slate-50/50 text-slate-500 uppercase text-[10px] font-black tracking-widest">
              <tr>
                <th class="px-8 py-5 border-b border-slate-100">Invoice / Dates</th>
                <th class="px-8 py-5 border-b border-slate-100">Customer & Vehicle</th>
                <th class="px-8 py-5 border-b border-slate-100 text-right">Amount</th>
                <th class="px-8 py-5 border-b border-slate-100 text-center">Status</th>
                <th class="px-8 py-5 border-b border-slate-100 text-right">Workflow</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr v-if="invoices.length === 0">
                <td colspan="5" class="px-8 py-20 text-center text-slate-300 font-medium italic">No invoices found.</td>
              </tr>
              <tr v-for="inv in invoices" :key="inv.id" class="group hover:bg-slate-50 transition-colors">
                <td class="px-8 py-5">
                   <div class="font-black text-slate-800 text-sm tracking-tight">{{ inv.number }}</div>
                   <div class="text-[9px] font-bold text-slate-400 mt-1 uppercase flex items-center gap-1">
                     <Calendar :size="10" /> {{ new Date(inv.createdAt).toLocaleDateString() }}
                   </div>
                   <div v-if="inv.deliveryDate" class="text-[9px] font-bold text-blue-500 mt-0.5 uppercase flex items-center gap-1">
                     <Send :size="10" /> Del: {{ new Date(inv.deliveryDate).toLocaleDateString() }}
                   </div>
                </td>
                <td class="px-8 py-5">
                   <div class="font-bold text-slate-800">{{ inv.order?.customer?.name }}</div>
                   <div class="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{{ inv.order?.vehicle?.plateNumber }} • {{ inv.order?.vehicle?.model || 'Generic' }}</div>
                </td>
                <td class="px-8 py-5 text-right">
                   <div class="font-black text-slate-800 text-sm">${{ Number(inv.totalAmount).toLocaleString() }}</div>
                   <div v-if="inv.dueDate" class="text-[9px] font-bold" :class="isOverdue(inv.dueDate) ? 'text-red-500' : 'text-slate-400'">
                     Due: {{ new Date(inv.dueDate).toLocaleDateString() }}
                   </div>
                </td>
                <td class="px-8 py-5 text-center">
                   <span :class="getStatusStyles(inv.status)" class="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider border">
                     {{ inv.status.replace('_', ' ') }}
                   </span>
                </td>
                <td class="px-8 py-5 text-right">
                   <div class="flex gap-2 justify-end">
                     <!-- Workflow Buttons -->
                     <button v-if="inv.status === 'draft'" @click="updateInvStatus(inv.id, 'approved')" class="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-xl text-[10px] font-black hover:bg-blue-600 hover:text-white transition-all shadow-sm" title="Approve Invoice">
                       APPROVE
                     </button>
                     <button v-if="inv.status === 'approved'" @click="updateInvStatus(inv.id, 'delivered')" class="bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-xl text-[10px] font-black hover:bg-indigo-600 hover:text-white transition-all shadow-sm flex items-center gap-1" title="Deliver to Customer">
                       <Send :size="12" /> DELIVER
                     </button>
                     <button v-if="inv.status === 'delivered' || inv.status === 'partially_paid'" @click="openPaymentModal(inv)" class="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-xl text-[10px] font-black hover:bg-emerald-600 hover:text-white transition-all shadow-sm flex items-center gap-1" title="Receive Payment">
                       <DollarSign :size="12" /> RECEIVE
                     </button>
                     
                     <div class="w-px h-6 bg-slate-200 mx-1"></div>
                     
                     <button class="bg-slate-50 text-slate-400 p-2 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                       <Printer :size="16" />
                     </button>
                   </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Simple Payment Modal -->
    <div v-if="isPaymentModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
        <div class="bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95">
            <h3 class="text-2xl font-black text-slate-800 tracking-tight mb-2">Register Payment</h3>
            <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">Inv: {{ selectedInvoice?.number }}</p>

            <div class="space-y-6">
                <div>
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Deposit To Account</label>
                    <select 
                        v-model="paymentForm.accountId"
                        class="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm font-black outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                    >
                        <option value="">Select Financial Account</option>
                        <option v-for="acc in accounts" :key="acc.id" :value="acc.id">
                            {{ acc.name }} (Bal: ${{ Number(acc.balance).toLocaleString() }})
                        </option>
                    </select>
                </div>

                <div>
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Payment Method</label>
                    <div class="grid grid-cols-2 gap-3">
                        <button 
                            v-for="method in ['cash', 'bank_transfer']" 
                            :key="method"
                            @click="paymentForm.method = method"
                            :class="[paymentForm.method === method ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 ring-1 ring-blue-600' : 'bg-slate-50 text-slate-500 border border-slate-100']"
                            class="py-3 rounded-xl text-[10px] font-black uppercase transition-all"
                        >
                            {{ method.replace('_', ' ') }}
                        </button>
                    </div>
                </div>

                <div>
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Amount to Pay</label>
                    <div class="relative">
                        <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm">$</span>
                        <input 
                            v-model.number="paymentForm.amount"
                            type="number" 
                            class="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-8 pr-4 text-sm font-black outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                        />
                    </div>
                </div>

                <div>
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Reference / Note</label>
                    <input 
                        v-model="paymentForm.reference"
                        placeholder="TRX Num, Cheque, etc."
                        class="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all whitespace-nowrap overflow-hidden text-ellipsis"
                    />
                </div>
            </div>

            <div class="grid grid-cols-2 gap-4 mt-10">
                <button @click="isPaymentModalOpen = false" class="py-3 rounded-xl text-xs font-black text-slate-400 uppercase hover:bg-slate-50 transition-all font-mono">Cancel</button>
                <button 
                    @click="submitPayment"
                    class="bg-emerald-500 text-white py-3 rounded-xl text-xs font-black uppercase hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                >
                    Confirm Payment
                </button>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { 
  TrendingUp, 
  Clock, 
  Receipt, 
  ArrowRight, 
  DollarSign, 
  Printer, 
  TrendingDown,
  Calendar,
  Send,
  CreditCard
} from 'lucide-vue-next';

const pendingOrders = ref([]);
const invoices = ref([]);
const accounts = ref([]);
const isPaymentModalOpen = ref(false);
const selectedInvoice = ref(null);

const paymentForm = ref({
    amount: 0,
    method: 'cash',
    accountId: '',
    reference: ''
});

const isOverdue = (date) => {
    return new Date(date) < new Date() && date !== null;
};

const totalRevenue = computed(() => {
    return invoices.value
        .reduce((sum, inv) => {
            const paid = inv.payments?.reduce((s, p) => s + Number(p.amount), 0) || 0;
            return sum + paid;
        }, 0);
});

const fetchBillingData = async () => {
  try {
    const [pRes, iRes, aRes] = await Promise.all([
      fetch('/api/billing/pending'),
      fetch('/api/billing/invoices'),
      fetch('/api/billing/accounts')
    ]);
    if (pRes.ok) pendingOrders.value = await pRes.json();
    if (iRes.ok) invoices.value = await iRes.json();
    if (aRes.ok) accounts.value = await aRes.json();
  } catch (err) {
    console.error("Billing: Failed to fetch data", err);
  }
};

const updateInvStatus = async (id, status) => {
  try {
    const res = await fetch(`/api/billing/invoices/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (res.ok) await fetchBillingData();
  } catch (err) {
    console.error("Billing: Update status failed", err);
  }
};

const generateInvoice = async (orderId) => {
  try {
    const res = await fetch('/api/billing/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId })
    });
    if (res.ok) {
      await fetchBillingData();
    }
  } catch (err) {
    console.error("Billing: Failed to generate invoice", err);
  }
};

const openPaymentModal = (inv) => {
    selectedInvoice.value = inv;
    paymentForm.value.amount = Number(inv.totalAmount) - (inv.payments?.reduce((s, p) => s + Number(p.amount), 0) || 0);
    paymentForm.value.method = 'cash';
    paymentForm.value.accountId = accounts.value[0]?.id || '';
    paymentForm.value.reference = '';
    isPaymentModalOpen.value = true;
};

const submitPayment = async () => {
    try {
        const res = await fetch(`/api/billing/invoices/${selectedInvoice.value.id}/payments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(paymentForm.value)
        });
        if (res.ok) {
            isPaymentModalOpen.value = false;
            await fetchBillingData();
        }
    } catch (err) {
        console.error("Billing: Payment failed", err);
    }
};

const getStatusStyles = (status) => {
  switch (status) {
    case 'paid': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    case 'partially_paid': return 'bg-amber-50 text-amber-600 border-amber-100';
    case 'delivered': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
    case 'approved': return 'bg-blue-50 text-blue-600 border-blue-100';
    case 'draft': return 'bg-slate-50 text-slate-500 border-slate-200';
    default: return 'bg-slate-50 text-slate-400 border-slate-100';
  }
};

onMounted(fetchBillingData);
</script>
