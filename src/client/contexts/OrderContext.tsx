import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

interface OrderContextType {
  isModalOpen: boolean;
  orders: any[];
  partRequests: any[];
  requisitions: any[];
  workOrders: any[];
  openModal: () => void;
  closeModal: () => void;
  fetchOrders: () => Promise<void>;
  fetchPartRequests: () => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [partRequests, setPartRequests] = useState<any[]>([]);

  const requisitions = useMemo(() => 
    orders.filter(o => ['draft', 'book'].includes(o.status)),
    [orders]
  );

  const workOrders = useMemo(() => 
    orders.filter(o => ['approved', 'on_progress', 'done', 'closed'].includes(o.status)),
    [orders]
  );

  const openModal = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error("Context: Failed to fetch orders", err);
    }
  }, []);

  const fetchPartRequests = useCallback(async () => {
    try {
      const res = await fetch('/api/orders/spare-parts/requests');
      if (res.ok) {
        const data = await res.json();
        setPartRequests(data);
      }
    } catch (err) {
      console.error("Context: Failed to fetch part requests", err);
    }
  }, []);

  return (
    <OrderContext.Provider value={{ 
      isModalOpen, 
      orders, 
      partRequests, 
      requisitions, 
      workOrders, 
      openModal, 
      closeModal, 
      fetchOrders, 
      fetchPartRequests 
    }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};
