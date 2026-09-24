import { useState, useMemo, useCallback, useEffect } from 'react';
import { BarChart3, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { PeriodType, DateRange, KPIData, ManagerRating, TimeSeriesPoint, CategoryStat, ProductStat, RecentSale } from './types';
import { sales, managers, customers, products, categories, getManager, getCustomer, getProduct } from './data/mockData';
import {
  computeKPI,
  computeManagerRating,
  computeTimeSeries,
  computeCategoryStats,
  computeProductStats,
  computeRecentSales,
} from './utils/analytics';
import { api } from './services/api';
import KPICards from './components/KPICards';
import PeriodSelector from './components/PeriodSelector';
import ManagerRatingComponent from './components/ManagerRating';
import RevenueChart from './components/RevenueChart';
import CategoryBreakdown from './components/CategoryBreakdown';
import RecentSalesComponent from './components/RecentSales';
import ManagerScatter from './components/ManagerScatter';
import ManagerComparison from './components/ManagerComparison';
import StatusDistribution from './components/StatusDistribution';
import { DashboardSkeleton } from './components/Skeleton';

function getDateRange(period: PeriodType, customRange?: DateRange): DateRange {
  const now = new Date('2025-12-15');
  
  switch (period) {
    case 'today':
      return { from: now, to: now };
    case '7days': {
      const from = new Date(now);
      from.setDate(from.getDate() - 6);
      return { from, to: now };
    }
    case '30days': {
      const from = new Date(now);
      from.setDate(from.getDate() - 29);
      return { from, to: now };
    }
    case 'thisMonth': {
      const from = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from, to: now };
    }
    case 'lastMonth': {
      const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const to = new Date(now.getFullYear(), now.getMonth(), 0);
      return { from, to };
    }
    case 'custom':
      return customRange || { from: new Date('2025-01-01'), to: now };
    default:
      return { from: new Date('2025-01-01'), to: now };
  }
}

// Convert API response to frontend types
function mapApiKpi(data: any): KPIData {
  return {
    revenue: data.revenue,
    grossProfit: data.grossProfit,
    margin: data.margin,
    salesCount: data.salesCount,
    averageCheck: data.averageCheck,
    bestManager: data.bestManager?.name || 'N/A',
    prevRevenue: data.revenue / (1 + data.delta.revenuePct / 100),
    prevGrossProfit: data.grossProfit / (1 + data.delta.grossProfitPct / 100),
    prevMargin: data.margin - data.delta.marginPct,
    prevSalesCount: Math.round(data.salesCount / (1 + data.delta.salesCountPct / 100)),
    prevAverageCheck: data.averageCheck / (1 + data.delta.averageCheckPct / 100),
  };
}

function mapApiManagerRating(data: any[]): ManagerRating[] {
  return data.map(d => ({
    manager: {
      id: 0,
      name: d.managerName,
      team: d.team,
      initials: d.managerName.split(' ').map((n: string) => n[0]).join(''),
      color: '#3b82f6',
    },
    salesCount: d.salesCount,
    revenue: d.revenue,
    grossProfit: d.grossProfit,
    averageCheck: d.averageCheck,
    margin: d.margin,
    prevGrossProfit: 0,
    prevAverageCheck: 0,
    gpChange: d.deltaPct,
    acChange: 0,
  }));
}

function mapApiTimeSeries(data: any[]): TimeSeriesPoint[] {
  return data.map(d => ({
    date: d.date.split('T')[0],
    revenue: d.revenue,
    grossProfit: d.grossProfit,
    salesCount: d.salesCount,
  }));
}

function mapApiCategories(data: any[]): CategoryStat[] {
  return data.map(d => ({
    category: { id: 0, name: d.name, color: '#3b82f6' },
    revenue: d.revenue,
    grossProfit: d.grossProfit,
    salesCount: d.salesCount,
  }));
}

function mapApiProducts(data: any[]): ProductStat[] {
  return data.map(d => ({
    product: { id: 0, name: d.name, categoryId: 0, price: 0, cost: 0 },
    revenue: d.revenue,
    grossProfit: d.grossProfit,
    quantitySold: d.unitsSold,
  }));
}

function mapApiRecentSales(data: any[]): RecentSale[] {
  const colors = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
  return data.map((d, i) => ({
    id: 0,
    date: d.date.split('T')[0],
    manager: {
      id: 0,
      name: d.managerName,
      team: '',
      initials: d.managerName.split(' ').map((n: string) => n[0]).join(''),
      color: colors[i % colors.length],
    },
    customer: { id: 0, name: d.customerName, company: d.customerName, segment: 'SMB' as const },
    products: d.productsSummary.split(', '),
    status: d.status,
    amount: d.amount,
    grossProfit: d.grossProfit,
  }));
}

export default function App() {
  const [period, setPeriod] = useState<PeriodType>('30days');
  const [customRange, setCustomRange] = useState<DateRange>({
    from: new Date('2025-11-01'),
    to: new Date('2025-12-15'),
  });
  const [chartMetric, setChartMetric] = useState<'revenue' | 'grossProfit' | 'salesCount'>('revenue');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useApi, setUseApi] = useState(false);
  const [apiAvailable, setApiAvailable] = useState(false);

  const dateRange = useMemo(() => getDateRange(period, customRange), [period, customRange]);

  // Check if API is available
  useEffect(() => {
    fetch('/api/managers')
      .then(r => { if (r.ok) setApiAvailable(true); })
      .catch(() => setApiAvailable(false));
  }, []);

  // Load data
  useEffect(() => {
    setLoading(true);
    setError(null);

    if (useApi && apiAvailable) {
      // Fetch from API
      Promise.all([
        api.getKpi(dateRange.from, dateRange.to),
        api.getManagerRating(dateRange.from, dateRange.to),
        api.getDynamics(dateRange.from, dateRange.to),
        api.getCategories(dateRange.from, dateRange.to),
        api.getTopProducts(dateRange.from, dateRange.to),
        api.getRecentSales(dateRange.from, dateRange.to),
      ])
        .then(([kpi, rating, dynamics, cats, prods, recent]) => {
          setApiData({
            kpi: mapApiKpi(kpi),
            rating: mapApiManagerRating(rating),
            timeSeries: mapApiTimeSeries(dynamics),
            categories: mapApiCategories(cats),
            products: mapApiProducts(prods),
            recentSales: mapApiRecentSales(recent),
          });
          setLoading(false);
        })
        .catch(err => {
          setError(err.message);
          setLoading(false);
        });
    } else {
      // Use mock data
      const timer = setTimeout(() => {
        setApiData({
          kpi: computeKPI(sales, dateRange.from, dateRange.to),
          rating: computeManagerRating(sales, dateRange.from, dateRange.to),
          timeSeries: computeTimeSeries(sales, dateRange.from, dateRange.to),
          categories: computeCategoryStats(sales, dateRange.from, dateRange.to),
          products: computeProductStats(sales, dateRange.from, dateRange.to),
          recentSales: computeRecentSales(sales, dateRange.from, dateRange.to),
        });
        setLoading(false);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [period, customRange, useApi, apiAvailable, dateRange]);

  const [apiData, setApiData] = useState<{
    kpi: KPIData;
    rating: ManagerRating[];
    timeSeries: TimeSeriesPoint[];
    categories: CategoryStat[];
    products: ProductStat[];
    recentSales: RecentSale[];
  }>({
    kpi: computeKPI(sales, dateRange.from, dateRange.to),
    rating: computeManagerRating(sales, dateRange.from, dateRange.to),
    timeSeries: computeTimeSeries(sales, dateRange.from, dateRange.to),
    categories: computeCategoryStats(sales, dateRange.from, dateRange.to),
    products: computeProductStats(sales, dateRange.from, dateRange.to),
    recentSales: computeRecentSales(sales, dateRange.from, dateRange.to),
  });

  const handlePeriodChange = useCallback((newPeriod: PeriodType, range?: DateRange) => {
    setPeriod(newPeriod);
    if (range) setCustomRange(range);
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-red-100 max-w-md">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to load data</h2>
          <p className="text-gray-500 mb-4 text-sm">{error}</p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => { setError(null); setLoading(true); setUseApi(false); }}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
            >
              Use Mock Data
            </button>
            <button
              onClick={() => { setError(null); setLoading(true); }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              Retry API
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
                <BarChart3 size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">DJI-Market.ru</h1>
                <p className="text-xs text-gray-400">Sales Performance Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Data source toggle */}
              <button
                onClick={() => setUseApi(!useApi)}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  useApi ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-500'
                }`}
                title={useApi ? 'Connected to API' : 'Using mock data'}
              >
                {useApi ? <Wifi size={12} /> : <WifiOff size={12} />}
                {useApi ? 'API' : 'Mock'}
              </button>
              <button
                onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 500); }}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <RefreshCw size={14} />
                Refresh
              </button>
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                АП
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-6 py-6 space-y-5">
        {/* Period Selector */}
        <PeriodSelector
          period={period}
          customRange={customRange}
          onPeriodChange={handlePeriodChange}
        />

        {loading ? (
          <DashboardSkeleton />
        ) : (
          <>
            {/* KPI Cards */}
            <KPICards data={apiData.kpi} />

            {/* Charts & Rating */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <RevenueChart
                data={apiData.timeSeries}
                metric={chartMetric}
                onMetricChange={setChartMetric}
              />
              <CategoryBreakdown
                categories={apiData.categories}
                products={apiData.products}
              />
            </div>

            {/* Additional Analytics */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              <ManagerScatter data={apiData.rating} />
              <ManagerComparison data={apiData.rating} />
              <StatusDistribution sales={sales} dateRange={dateRange} />
            </div>

            {/* Manager Rating */}
            <ManagerRatingComponent data={apiData.rating} />

            {/* Recent Sales */}
            <RecentSalesComponent data={apiData.recentSales} />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white mt-8">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between text-xs text-gray-400">
          <span>© 2025 DJI-Market.ru — Sales Analytics</span>
          <span>{useApi && apiAvailable ? 'Connected to API' : 'Demo mode with mock data'}</span>
        </div>
      </footer>
    </div>
  );
}
