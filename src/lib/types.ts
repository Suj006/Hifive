export type ItemType = "RAW_MATERIAL" | "PRODUCT";

export interface Category {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  _count?: { items: number };
}

export interface ProductName {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  _count?: { items: number };
}

export interface Item {
  id: string;
  code: string;
  name: string;
  type: ItemType;
  unit: string;
  group: string | null;
  categoryId: string | null;
  category: Category | null;
  openingStock: number;
  reorderLevel: number;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { purchases: number; sales: number; productions: number };
  stock?: number;
  purchasedQty?: number;
  soldQty?: number;
  producedQty?: number;
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

export interface Production {
  id: string;
  date: string;
  itemId: string;
  item: Item;
  quantity: number;
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
  trend: { label: string; purchases: number; sales: number }[];
  categoryBreakdown: { category: string; amount: number }[];
}

export interface ReportsData {
  totals: {
    purchaseAmount: number;
    purchaseQty: number;
    saleAmount: number;
    saleQty: number;
  };
  itemWisePurchases: {
    itemId: string;
    name: string;
    code: string;
    unit: string;
    qty: number;
    amount: number;
  }[];
  itemWiseSales: {
    itemId: string;
    name: string;
    code: string;
    unit: string;
    category: string;
    qty: number;
    amount: number;
  }[];
  vendorWise: { vendorId: string; name: string; qty: number; amount: number; entries: number }[];
  customerWise: { customerId: string; name: string; qty: number; amount: number; entries: number }[];
  categoryWise: { category: string; qty: number; amount: number }[];
  itemWiseProduction: {
    itemId: string;
    name: string;
    code: string;
    unit: string;
    category: string;
    qty: number;
  }[];
  productInventory: {
    itemId: string;
    name: string;
    code: string;
    unit: string;
    category: string;
    openingStock: number;
    made: number;
    sold: number;
    remaining: number;
  }[];
}
