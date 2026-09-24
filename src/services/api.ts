const API_BASE = '/api';

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

export interface KpiResponse {
  revenue: number;
  grossProfit: number;
  margin: number;
  salesCount: number;
  averageCheck: number;
  bestManager: { id: string; name: string; grossProfit: number } | null;
  delta: {
    revenuePct: number;
    grossProfitPct: number;
    marginPct: number;
    salesCountPct: number;
    averageCheckPct: number;
  };
}

export interface ManagerRatingResponse {
  rank: number;
  managerId: string;
  managerName: string;
  team: string;
  avatarUrl: string | null;
  salesCount: number;
  revenue: number;
  grossProfit: number;
  averageCheck: number;
  margin: number;
  deltaPct: number;
}

export interface DynamicsPointResponse {
  date: string;
  revenue: number;
  grossProfit: number;
  salesCount: number;
}

export interface CategoryStatResponse {
  categoryId: string;
  name: string;
  revenue: number;
  grossProfit: number;
  salesCount: number;
}

export interface TopProductResponse {
  productId: string;
  name: string;
  categoryName: string;
  unitsSold: number;
  revenue: number;
  grossProfit: number;
}

export interface RecentSaleResponse {
  id: string;
  date: string;
  managerName: string;
  customerName: string;
  productsSummary: string;
  status: 'Paid' | 'Cancelled' | 'Refunded';
  amount: number;
  grossProfit: number;
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export const api = {
  getKpi: (from: Date, to: Date) =>
    fetchJson<KpiResponse>(`${API_BASE}/dashboard/kpi?from=${formatDate(from)}&to=${formatDate(to)}`),

  getManagerRating: (from: Date, to: Date, sortBy = 'GrossProfit', order = 'desc') =>
    fetchJson<ManagerRatingResponse[]>(`${API_BASE}/dashboard/managers/rating?from=${formatDate(from)}&to=${formatDate(to)}&sortBy=${sortBy}&order=${order}`),

  getDynamics: (from: Date, to: Date, granularity = 'day') =>
    fetchJson<DynamicsPointResponse[]>(`${API_BASE}/dashboard/dynamics?from=${formatDate(from)}&to=${formatDate(to)}&granularity=${granularity}`),

  getCategories: (from: Date, to: Date) =>
    fetchJson<CategoryStatResponse[]>(`${API_BASE}/dashboard/categories?from=${formatDate(from)}&to=${formatDate(to)}`),

  getTopProducts: (from: Date, to: Date, limit = 10) =>
    fetchJson<TopProductResponse[]>(`${API_BASE}/dashboard/products/top?from=${formatDate(from)}&to=${formatDate(to)}&limit=${limit}`),

  getRecentSales: (from: Date, to: Date, limit = 20) =>
    fetchJson<RecentSaleResponse[]>(`${API_BASE}/dashboard/sales/recent?from=${formatDate(from)}&to=${formatDate(to)}&limit=${limit}`),
};
