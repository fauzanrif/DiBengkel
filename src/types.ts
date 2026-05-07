export type UserRole = 'admin' | 'mechanic' | 'head_workshop';

export interface User {
  id: string;
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  branchId: string;
  isLead?: boolean;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
}

export interface Customer {
  id: string;
  name: string;
  type: 'individual' | 'corporate';
  email?: string;
  phone?: string;
  address?: string;
  corporatePricing?: 'fixed' | 'flexible';
  termsDays?: number;
}

export interface Vehicle {
  id: string;
  plateNumber: string;
  chassisNumber: string;
  engineNumber: string;
  model: string;
  customerId: string;
}

export type OrderStatus = 
  | 'draft' 
  | 'analysis' 
  | 'estimate' 
  | 'waiting_approval' 
  | 'approved' 
  | 'on_progress' 
  | 'qc' 
  | 'completed' 
  | 'invoiced' 
  | 'paid' 
  | 'cancelled' 
  | 'pending_sparepart';

export interface Order {
  id: string;
  spkNumber: string;
  branchId: string;
  customerId: string;
  vehicleId: string;
  complaint: string;
  analysis?: string;
  serviceType: 'walk-in' | 'on-site' | 'pickup-delivery';
  odometer: number;
  status: OrderStatus;
  leadMechanicId?: string;
  mechanicIds: string[];
  estimatedTotal: number;
  createdAt: any;
  updatedAt: any;
}

export interface SparePart {
  id: string;
  name: string;
  code: string;
  unit: string;
  category: string;
  basePrice: number;
  isConsignment: boolean;
  supplierId?: string;
}

export interface Inventory {
  id: string;
  partId: string;
  branchId: string;
  quantity: number;
  reserved: number;
  minStock: number;
}
