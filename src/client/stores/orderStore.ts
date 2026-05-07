import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useOrderStore = defineStore('orders', () => {
  const isModalOpen = ref(false);
  const orders = ref([]);

  const partRequests = ref([]);

  const requisitions = computed(() => 
    orders.value.filter(o => ['draft', 'book'].includes(o.status))
  );

  const workOrders = computed(() => 
    orders.value.filter(o => ['approved', 'on_progress', 'done'].includes(o.status))
  );

  function openModal() {
    isModalOpen.value = true;
  }

  function closeModal() {
    isModalOpen.value = false;
  }

  async function fetchOrders() {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        orders.value = await res.json();
      }
    } catch (err) {
      console.error("Store: Failed to fetch orders", err);
    }
  }

  async function fetchPartRequests() {
    try {
      const res = await fetch('/api/orders/spare-parts/requests');
      if (res.ok) {
        partRequests.value = await res.json();
      }
    } catch (err) {
      console.error("Store: Failed to fetch part requests", err);
    }
  }

  return { 
    isModalOpen, 
    orders,
    partRequests,
    requisitions,
    workOrders,
    openModal, 
    closeModal,
    fetchOrders,
    fetchPartRequests
  };
});
