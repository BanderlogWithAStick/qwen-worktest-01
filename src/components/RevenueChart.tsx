import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TimeSeriesPoint } from '../types';
import { format, parseISO } from 'date-fns';

interface RevenueChartProps {
  data: TimeSeriesPoint[];
  metric: 'revenue' | 'grossProfit' | 'salesCount';
  onMetricChange: (metric: 'revenue' | 'grossProfit' | 'salesCount') => void;
}

function formatValue(value: number, metric: string): string {
  if (metric === 'salesCount') return value.toString();
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M ₽`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K ₽`;
  return `${value.toFixed(0)} ₽`;
}

const metrics = [
  { key: 'revenue' as const, label: 'Revenue', color: '#3b82f6' },
  { key: 'grossProfit' as const, label: 'Gross Profit', color: '#10b981' },
  { key: 'salesCount' as const, label: 'Sales', color: '#f59e0b' },
];

export default function RevenueChart({ data, metric, onMetricChange }: RevenueChartProps) {
  const currentMetric = metrics.find(m => m.key === metric)!;
  
  // Aggregate by week if too many points
  const chartData = data.length > 60 ? data.filter((_, i) => i % Math.ceil(data.length / 60) === 0) : data;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.35 }}
      className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Dynamics</h3>
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
          {metrics.map(m => (
            <button
              key={m.key}
              onClick={() => onMetricChange(m.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                metric === m.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id={`gradient-${metric}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={currentMetric.color} stopOpacity={0.2} />
                <stop offset="95%" stopColor={currentMetric.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="date"
              tickFormatter={(date) => format(parseISO(date), 'dd MMM')}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v) => formatValue(v, metric)}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              width={70}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                fontSize: '12px',
              }}
              labelFormatter={(date) => format(parseISO(date as string), 'dd MMMM yyyy')}
              formatter={(value: number) => [formatValue(value, metric), currentMetric.label]}
            />
            <Area
              type="monotone"
              dataKey={metric}
              stroke={currentMetric.color}
              strokeWidth={2}
              fill={`url(#gradient-${metric})`}
              animationDuration={800}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
