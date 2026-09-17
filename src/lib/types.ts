export type ItemType = "RAW_MATERIAL" | "PRODUCT";

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  unit: string;
  category: string | null;
  openingStock: number;
  reorderLevel: number;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { purchases: number; sales: number };
  stock?: number;
  purchasedQty?: number;
  soldQty?: number;
}

export interface Vendor {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  _count?: { purchases: number };
}

export interface Customer {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  _count?: { sales: number };
}

export interface Purchase {
  id: string;
  date: string;
  itemId: string;
  item: Item;
  vendorId: string;
  vendor: Vendor;
  quantity: number;
  rate: number;
  amount: number;
  invoiceNumber: string | null;
  paymentMode: string | null;
  notes: string | null;
  createdAt: string;
}

export interface Sale {
  id: string;
  date: string;
  itemId: string;
  item: Item;
  customerId: string;
  customer: Customer;
  quantity: number;
  rate: number;
  amount: number;
  discount: number;
  invoiceNumber: string | null;
  paymentMode: string | null;
  notes: string | null;
  createdAt: string;
}

export interface DashboardData {
  totals: {
    purchases: number;
    sales: number;
    profit: number;
    purchaseQty: number;
    saleQty: number;
  };
  month: { purchases: number; sales: number };
  counts: { items: number; vendors: number; customers: number };
  recentPurchases: Purchase[];
  recentSales: Sale[];
  lowStock: {
    id: string;
    name: string;
    unit: string;
    stock: number;
    reorderLevel: number;
  }[];
  topProducts: { id: string; name: string; soldQty: number; soldAmount: number }[];
}
