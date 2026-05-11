export type View = 'dashboard' | 'diagnostics' | 'inventory' | 'customers' | 'financials';

export interface RepairOrder {
  id: string;
  customerName: string;
  vehicle: string;
  status: 'pending' | 'in-progress' | 'completed' | 'on-hold';
  priority: 'low' | 'medium' | 'high';
  estimatedCost: number;
  issue: string;
  userId: string;
  createdAt: any;
  updatedAt: any;
}

export interface InventoryItem {
  id: string;
  name: string;
  partNumber: string;
  quantity: number;
  minStock: number;
  price: number;
  userId: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  vehicles: string[];
  userId: string;
}
