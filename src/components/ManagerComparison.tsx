import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ManagerRating } from '../types';
import { TrendingUp } from 'lucide-react';

interface ManagerComparisonProps {
  data: ManagerRating[];
}

function formatCurrency(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M ₽`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K ₽`;
  return `${value.toFixed(0)} ₽`;
}

export default function ManagerComparison({ data }: ManagerComparisonProps) {
  // Top 8 by gross profit
  const topManagers = [...data]
    .sort((a, b) => b.grossProfit - a.grossProfit)
    .slice(0, 8)
    .map(d => ({
      name: d.manager.name.split(' ')[0],
      grossProfit: d.grossProfit,
      revenue: d.revenue,
      color: d.manager.color,
    }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.6 }}
      className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <TrendingUp size={20} className="text-emerald-500" />
          Top Performers
        </h3>
        <span className="text-xs text-gray-400">Gross Profit comparison</span>
      </div>

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={topManagers} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v) => formatCurrency(v)}
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              width={60}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              formatter={(value: number, name: string) => [
                formatCurrency(value),
                name === 'grossProfit' ? 'Gross Profit' : 'Revenue',
              ]}
            />
            <Bar dataKey="revenue" fill="#e2e8f0" radius={[4, 4, 0, 0]} animationDuration={800} />
            <Bar dataKey="grossProfit" fill="#10b981" radius={[4, 4, 0, 0]} animationDuration={800} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
