import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '../views/Dashboard.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: Dashboard,
    },
    {
      path: '/requisitions',
      name: 'requisitions',
      component: () => import('@/views/MaintenanceRequisition.vue'),
    },
    {
      path: '/work-orders',
      name: 'work-orders',
      component: () => import('@/views/WorkOrder.vue'),
    },
    {
      path: '/billing',
      name: 'billing',
      component: () => import('@/views/BillingView.vue'),
    },
    {
      path: '/inventory',
      name: 'inventory',
      component: () => import('@/views/InventoryView.vue'),
    },
    // Add other routes as needed
  ],
});

export default router;
