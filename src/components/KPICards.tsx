import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Percent, Users, Award, ShoppingCart } from 'lucide-react';
import { KPIData } from '../types';

function formatCurrency(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M ₽`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K ₽`;
  return `${value.toFixed(0)} ₽`;
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

interface KPICardProps {
  title: string;
  value: string;
  prevValue: string;
  change: number;
  icon: React.ReactNode;
  color: string;
  delay: number;
}

function KPICard({ title, value, prevValue, change, icon, color, delay }: KPICardProps) {
  const isPositive = change >= 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-500">{title}</span>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="flex items-center gap-2">
        <span className={`inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-full ${
          isPositive ? 'text-emerald-700 bg-emerald-50' : 'text-red-700 bg-red-50'
        }`}>
          {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {Math.abs(change).toFixed(1)}%
        </span>
        <span className="text-xs text-gray-400">vs prev: {prevValue}</span>
      </div>
    </motion.div>
  );
}

interface KPICardsProps {
  data: KPIData;
}

export default function KPICards({ data }: KPICardsProps) {
  const revenueChange = data.prevRevenue > 0 ? ((data.revenue - data.prevRevenue) / data.prevRevenue) * 100 : 0;
  const gpChange = data.prevGrossProfit > 0 ? ((data.grossProfit - data.prevGrossProfit) / data.prevGrossProfit) * 100 : 0;
  const marginChange = data.margin - data.prevMargin;
  const salesChange = data.prevSalesCount > 0 ? ((data.salesCount - data.prevSalesCount) / data.prevSalesCount) * 100 : 0;
  const acChange = data.prevAverageCheck > 0 ? ((data.averageCheck - data.prevAverageCheck) / data.prevAverageCheck) * 100 : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      <KPICard
        title="Revenue"
        value={formatCurrency(data.revenue)}
        prevValue={formatCurrency(data.prevRevenue)}
        change={revenueChange}
        icon={<DollarSign size={18} className="text-white" />}
        color="bg-blue-500"
        delay={0}
      />
      <KPICard
        title="Gross Profit"
        value={formatCurrency(data.grossProfit)}
        prevValue={formatCurrency(data.prevGrossProfit)}
        change={gpChange}
        icon={<BarChart3 size={18} className="text-white" />}
        color="bg-emerald-500"
        delay={0.05}
      />
      <KPICard
        title="Margin"
        value={formatPercent(data.margin)}
        prevValue={formatPercent(data.prevMargin)}
        change={marginChange}
        icon={<Percent size={18} className="text-white" />}
        color="bg-purple-500"
        delay={0.1}
      />
      <KPICard
        title="Sales"
        value={data.salesCount.toString()}
        prevValue={data.prevSalesCount.toString()}
        change={salesChange}
        icon={<ShoppingCart size={18} className="text-white" />}
        color="bg-amber-500"
        delay={0.15}
      />
      <KPICard
        title="Avg Check"
        value={formatCurrency(data.averageCheck)}
        prevValue={formatCurrency(data.prevAverageCheck)}
        change={acChange}
        icon={<Users size={18} className="text-white" />}
        color="bg-cyan-500"
        delay={0.2}
      />
      <KPICard
        title="Best Manager"
        value={data.bestManager}
        prevValue=""
        change={0}
        icon={<Award size={18} className="text-white" />}
        color="bg-rose-500"
        delay={0.25}
      />
    </div>
  );
}
