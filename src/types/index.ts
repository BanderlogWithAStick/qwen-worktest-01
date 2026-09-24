export type SaleStatus = 'Paid' | 'Cancelled' | 'Refunded';

export interface Manager {
  id: number;
  name: string;
  team: string;
  avatar?: string;
  initials: string;
  color: string;
}

export interface Customer {
  id: number;
  name: string;
  company: string;
  segment: 'Enterprise' | 'SMB' | 'Startup' | 'Government';
}

export interface Category {
  id: number;
  name: string;
  color: string;
}

export interface Product {
  id: number;
  name: string;
  categoryId: number;
  price: number;
  cost: number;
}

export interface Sale {
  id: number;
  managerId: number;
  customerId: number;
  date: string;
  status: SaleStatus;
  items: SaleItem[];
}

export interface SaleItem {
  productId: number;
  quantity: number;
  unitPrice: number;
  unitCost: number;
}

export interface KPIData {
  revenue: number;
  grossProfit: number;
  margin: number;
  salesCount: number;
  averageCheck: number;
  bestManager: string;
  prevRevenue: number;
  prevGrossProfit: number;
  prevMargin: number;
  prevSalesCount: number;
  prevAverageCheck: number;
}

export interface ManagerRating {
  manager: Manager;
  salesCount: number;
  revenue: number;
  grossProfit: number;
  averageCheck: number;
  margin: number;
  prevGrossProfit: number;
  prevAverageCheck: number;
  gpChange: number;
  acChange: number;
}

export interface TimeSeriesPoint {
  date: string;
  revenue: number;
  grossProfit: number;
  salesCount: number;
}

export interface CategoryStat {
  category: Category;
  revenue: number;
  grossProfit: number;
  salesCount: number;
}

export interface ProductStat {
  product: Product;
  revenue: number;
  grossProfit: number;
  quantitySold: number;
}

export interface RecentSale {
  id: number;
  date: string;
  manager: Manager;
  customer: Customer;
  products: string[];
  status: SaleStatus;
  amount: number;
  grossProfit: number;
}

export type PeriodType = 'today' | '7days' | '30days' | 'thisMonth' | 'lastMonth' | 'custom';

export interface DateRange {
  from: Date;
  to: Date;
}
