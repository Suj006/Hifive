export type ItemType = "RAW_MATERIAL" | "PRODUCT";
export type UserRole = "ADMIN" | "VIEWER";

export interface AppUser {
  id: string;
  username: string;
  role: UserRole;
  createdAt: string;
}

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

export interface RawMaterialName {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  _count?: { items: number };
}

export type CouponDiscountType = "PERCENT" | "FLAT";

export interface Coupon {
  id: string;
  code: string;
  discountType: CouponDiscountType;
  value: number;
  maxDiscount: number | null;
  startDate: string;
  endDate: string | null;
  oncePerCustomer: boolean;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  _count?: { sales: number };
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
  code: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  _count?: { purchases: number };
  totalPurchased?: number;
}

export interface Customer {
  id: string;
  code: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  dobMonth: number | null;
  dobDay: number | null;
  isActive: boolean;
  createdAt: string;
  _count?: { sales: number };
  totalSpent?: number;
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
  amountPaid: number;
  discount: number;
  discountType: "FLAT" | "PERCENT";
  couponId: string | null;
  couponCode: string | null;
  couponDiscount: number;
  invoiceNumber: string | null;
  paymentMode: string | null;
  notes: string | null;
  createdAt: string;
}

export interface Expense {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
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
    expenses: number;
    profit: number;
    purchaseQty: number;
    saleQty: number;
    due: number;
  };
  month: { purchases: number; sales: number; expenses: number };
  counts: { items: number; vendors: number; customers: number };
  recentPurchases: Purchase[];
  recentSales: Sale[];
  recentExpenses: Expense[];
  topDues: { name: string; due: number; entries: number }[];
  topCustomers: { id: string; code: string; name: string; totalSpent: number; orders: number }[];
  lowStock: {
    id: string;
    name: string;
    unit: string;
    stock: number;
    reorderLevel: number;
  }[];
  topProducts: { id: string; name: string; soldQty: number; soldAmount: number }[];
  trend: { label: string; purchases: number; sales: number; expenses: number }[];
  categoryBreakdown: { category: string; amount: number }[];
  threeMonthTrends: ThreeMonthTrends;
}

export interface ThreeMonthProductStat {
  id: string;
  name: string;
  unit: string;
  qty: number;
  amount: number;
}

export interface ThreeMonthTrends {
  // One row per month, oldest first — `label` plus one numeric key per
  // entry in `categories` (amounts in INR for that month/category).
  monthly: Record<string, string | number>[];
  categories: string[];
  bestSellerByQty: ThreeMonthProductStat | null;
  topRevenueProduct: ThreeMonthProductStat | null;
  slowestMoverByQty: ThreeMonthProductStat | null;
  lowestRevenueProduct: ThreeMonthProductStat | null;
  topCategory: { name: string; amount: number } | null;
  deadStock: { count: number; items: { id: string; name: string }[] };
}

export interface ReportsData {
  totals: {
    purchaseAmount: number;
    purchaseQty: number;
    saleAmount: number;
    saleQty: number;
    expenseAmount: number;
    dueAmount: number;
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
  expenseWise: { category: string; amount: number; entries: number }[];
  duesByCustomer: { customerId: string; name: string; due: number; entries: number }[];
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
