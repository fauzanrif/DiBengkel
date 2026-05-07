<template>
  <div class="p-8 space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h2 class="text-2xl font-black text-slate-800 tracking-tight">Maintenance Requisition</h2>
        <p class="text-xs text-slate-400 font-medium tracking-wide">Customer requests awaiting analysis and estimation</p>
      </div>
      <div class="flex gap-4">
        <div class="relative group">
          <Search :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search Requisitions..." 
            class="bg-white border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-xs font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none w-64 transition-all"
          />
        </div>
        <button 
          @click="orderStore.openModal"
          class="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20 active:scale-95"
        >
          <Plus :size="16" />
          MAINTENANCE REQUISITION
        </button>
      </div>
    </div>

    <!-- Requisitions Table -->
    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead class="bg-slate-50/50 text-slate-500 uppercase text-[10px] font-bold tracking-widest">
              <tr class="border-b border-slate-200">
                <th class="px-6 py-5">Req Num</th>
                <th class="px-6 py-5">Workshop</th>
                <th class="px-6 py-5">Customer & Phone</th>
                <th class="px-6 py-5">Vehicle & KM</th>
                <th class="px-6 py-5">Service & Ref</th>
                <th class="px-6 py-5">Complaint</th>
                <th class="px-6 py-5 text-right">Total Est.</th>
                <th class="px-6 py-5 text-center">Status</th>
                <th class="px-6 py-5 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-sm">
              <tr v-if="orderStore.requisitions.length === 0">
                 <td colspan="9" class="px-8 py-20 text-center text-slate-300 font-medium italic">
                   <div class="flex flex-col items-center gap-3">
                     <div class="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
                       <ClipboardList class="text-slate-200" />
                     </div>
                     No pending requisitions in the pool.
                   </div>
                 </td>
               </tr>
               <tr v-for="req in orderStore.requisitions" :key="req.id" class="group hover:bg-slate-50 transition-colors">
                 <td class="px-6 py-5">
                   <div class="font-mono text-xs font-bold text-slate-800">{{ req.spkNumber }}</div>
                   <div class="text-[9px] text-slate-400 font-medium">{{ new Date(req.createdAt).toLocaleDateString() }}</div>
                 </td>
                 <td class="px-6 py-5">
                   <div class="text-[11px] font-bold text-slate-700">{{ req.branch?.name }}</div>
                 </td>
                 <td class="px-6 py-5">
                   <div class="font-bold text-slate-800">{{ req.customer?.name }}</div>
                   <div class="text-[10px] text-slate-400 font-medium">{{ req.customer?.phone || '-' }}</div>
                 </td>
                 <td class="px-6 py-5">
                   <div class="font-bold text-slate-800">{{ req.vehicle?.plateNumber }}</div>
                   <div class="text-[10px] text-slate-400 font-medium uppercase truncate max-w-[120px]">
                     {{ req.vehicle?.vehicleModel?.name || req.vehicle?.model }} • {{ req.odometer }} KM
                   </div>
                 </td>
                 <td class="px-6 py-5">
                   <span class="text-[10px] font-black text-slate-500 uppercase block leading-tight">{{ req.serviceType }}</span>
                   <span class="text-[9px] text-slate-400 font-bold font-mono">Ref: {{ req.referenceNumber || '-' }}</span>
                 </td>
                 <td class="px-6 py-5">
                   <div class="text-[10px] text-slate-500 italic max-w-[200px] line-clamp-2" :title="req.complaint">{{ req.complaint }}</div>
                 </td>
                 <td class="px-6 py-5 text-right font-bold text-slate-800">
                   ${{ Number(req.estimatedTotal).toLocaleString() }}
                 </td>
                 <td class="px-6 py-5 text-center">
                   <span :class="{
                     'bg-amber-50 text-amber-600 border-amber-100': req.status === 'draft',
                     'bg-blue-50 text-blue-600 border-blue-100': req.status === 'book',
                     'bg-emerald-50 text-emerald-600 border-emerald-100': req.status === 'approved'
                   }" class="border px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider whitespace-nowrap">
                     {{ req.status }}
                   </span>
                 </td>
                 <td class="px-6 py-5 text-right whitespace-nowrap">
                   <div class="flex gap-2 justify-end">
                     <button 
                       @click="downloadPDF(req)"
                       class="bg-slate-100 text-slate-600 p-1.5 rounded-lg text-xs font-bold hover:bg-slate-200 transition-all shadow-sm"
                       title="Download Print Out"
                     >
                       <Download :size="14" />
                     </button>
                     <button 
                       v-if="req.status === 'draft'"
                       @click="updateStatus(req.id, 'book')"
                       class="bg-blue-50 text-blue-600 p-1.5 rounded-lg text-[9px] font-bold hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                       title="Mark as Booked"
                     >
                       BOOK
                     </button>
                     <button 
                       v-if="req.status !== 'approved'"
                       @click="updateStatus(req.id, 'approved')"
                       class="bg-emerald-50 text-emerald-600 p-1.5 rounded-lg text-[9px] font-bold hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                       title="Approve & Create WO"
                     >
                       APPROVE
                     </button>
                   </div>
                 </td>
               </tr>
            </tbody>
          </table>
        </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { Search, Plus, ClipboardList, Loader2, Download, Printer } from 'lucide-vue-next';
import { useOrderStore } from '../stores/orderStore';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const orderStore = useOrderStore();
const isLoading = ref(false);

const downloadPDF = (req) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text('MAINTENANCE REQUISITION', 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`REQ NO: ${req.spkNumber}`, 20, 35);
  doc.text(`DATE: ${new Date(req.createdAt).toLocaleDateString()}`, 20, 40);
  doc.text(`WORKSHOP: ${req.branch?.name || '-'}`, 20, 45);
  
  // Customer & Vehicle Info
  doc.line(20, 50, 190, 50);
  doc.text('CUSTOMER INFORMATION', 20, 57);
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${req.customer?.name || '-'}`, 20, 62);
  doc.text(`Phone: ${req.customer?.phone || '-'}`, 20, 67);
  
  doc.setFont('helvetica', 'bold');
  doc.text('VEHICLE INFORMATION', 110, 57);
  doc.setFont('helvetica', 'normal');
  doc.text(`Plate No: ${req.vehicle?.plateNumber || '-'}`, 110, 62);
  doc.text(`Model: ${req.vehicle?.vehicleModel?.name || req.vehicle?.model || '-'}`, 110, 67);
  doc.text(`Odometer: ${req.odometer} KM`, 110, 72);
  
  // Details
  doc.line(20, 77, 190, 77);
  doc.setFont('helvetica', 'bold');
  doc.text('COMPLAINT:', 20, 84);
  doc.setFont('helvetica', 'normal');
  const complaintLines = doc.splitTextToSize(req.complaint || '-', 160);
  doc.text(complaintLines, 20, 89);
  
  const analysisY = 89 + (complaintLines.length * 5) + 5;
  doc.setFont('helvetica', 'bold');
  doc.text('ANALYSIS/REMARK:', 20, analysisY);
  doc.setFont('helvetica', 'normal');
  const analysisLines = doc.splitTextToSize(req.analysis || '-', 160);
  doc.text(analysisLines, 20, analysisY + 5);
  
  // Items Table
  const tableY = analysisY + 5 + (analysisLines.length * 5) + 10;
  const tableData = req.items.map(item => [
    item.isService ? 'TASK' : 'PART',
    item.isService ? (item.task?.name || 'Service') : (item.part?.name || 'Part'),
    item.quantity,
    `$${Number(item.price).toLocaleString()}`,
    `$${Number(item.discount).toLocaleString()}`,
    `$${((Number(item.price) * item.quantity) - Number(item.discount)).toLocaleString()}`
  ]);
  
  autoTable(doc, {
    startY: tableY,
    head: [['TYPE', 'DESCRIPTION', 'QTY', 'PRICE', 'DISC', 'SUBTOTAL']],
    body: tableData,
    foot: [['', '', '', '', 'TOTAL EST.', `$${Number(req.estimatedTotal).toLocaleString()}`]],
    theme: 'grid',
    headStyles: { fillColor: [51, 65, 85] },
    footStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold' }
  });
  
  // Signatures
  const finalY = doc.lastAutoTable.finalY + 30;
  doc.text('Prepared By,', 30, finalY);
  doc.line(20, finalY + 20, 70, finalY + 20);
  
  doc.text('Approved By,', 140, finalY);
  doc.line(130, finalY + 20, 180, finalY + 20);
  
  doc.save(`REQ-${req.spkNumber}.pdf`);
};

const updateStatus = async (id, status) => {
  isLoading.value = true;
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
    console.error(`Failed to update status to ${status}`, err);
  } finally {
    isLoading.value = false;
  }
};

onMounted(orderStore.fetchOrders);
</script>
