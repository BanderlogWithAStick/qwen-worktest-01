import { useState, useMemo, useCallback, useEffect } from 'react';
import { BarChart3, RefreshCw } from 'lucide-react';
import { PeriodType, DateRange } from './types';
import { sales } from './data/mockData';
import {
  computeKPI,
  computeManagerRating,
  computeTimeSeries,
  computeCategoryStats,
  computeProductStats,
  computeRecentSales,
} from './utils/analytics';
import KPICards from './components/KPICards';
import PeriodSelector from './components/PeriodSelector';
import ManagerRating from './components/ManagerRating';
import RevenueChart from './components/RevenueChart';
import CategoryBreakdown from './components/CategoryBreakdown';
import RecentSales from './components/RecentSales';
import ManagerScatter from './components/ManagerScatter';
import ManagerComparison from './components/ManagerComparison';
import StatusDistribution from './components/StatusDistribution';
import { DashboardSkeleton } from './components/Skeleton';

function getDateRange(period: PeriodType, customRange?: DateRange): DateRange {
  const now = new Date('2025-12-15'); // Simulated "today" for consistent demo
  
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

export default function App() {
  const [period, setPeriod] = useState<PeriodType>('30days');
  const [customRange, setCustomRange] = useState<DateRange>({
    from: new Date('2025-11-01'),
    to: new Date('2025-12-15'),
  });
  const [chartMetric, setChartMetric] = useState<'revenue' | 'grossProfit' | 'salesCount'>('revenue');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const dateRange = useMemo(() => getDateRange(period, customRange), [period, customRange]);

  // Simulate API loading
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [period, customRange]);

  const handlePeriodChange = useCallback((newPeriod: PeriodType, range?: DateRange) => {
    setPeriod(newPeriod);
    if (range) setCustomRange(range);
  }, []);

  const kpi = useMemo(() => computeKPI(sales, dateRange.from, dateRange.to), [dateRange]);
  const managerRating = useMemo(() => computeManagerRating(sales, dateRange.from, dateRange.to), [dateRange]);
  const timeSeries = useMemo(() => computeTimeSeries(sales, dateRange.from, dateRange.to), [dateRange]);
  const categoryStats = useMemo(() => computeCategoryStats(sales, dateRange.from, dateRange.to), [dateRange]);
  const productStats = useMemo(() => computeProductStats(sales, dateRange.from, dateRange.to), [dateRange]);
  const recentSalesData = useMemo(() => computeRecentSales(sales, dateRange.from, dateRange.to), [dateRange]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-red-100">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to load dashboard</h2>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={() => { setError(null); setLoading(true); setTimeout(() => setLoading(false), 500); }}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
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
            <KPICards data={kpi} />

            {/* Charts & Rating */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <RevenueChart
                data={timeSeries}
                metric={chartMetric}
                onMetricChange={setChartMetric}
              />
              <CategoryBreakdown
                categories={categoryStats}
                products={productStats}
              />
            </div>

            {/* Additional Analytics */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              <ManagerScatter data={managerRating} />
              <ManagerComparison data={managerRating} />
              <StatusDistribution sales={sales} dateRange={dateRange} />
            </div>

            {/* Manager Rating */}
            <ManagerRating data={managerRating} />

            {/* Recent Sales */}
            <RecentSales data={recentSalesData} />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white mt-8">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between text-xs text-gray-400">
          <span>© 2025 DJI-Market.ru — Sales Analytics</span>
          <span>Data refreshes automatically • Last update: just now</span>
        </div>
      </footer>
    </div>
  );
}
