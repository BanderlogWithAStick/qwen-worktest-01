import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Sale, DateRange } from '../types';
import { Shield } from 'lucide-react';

interface StatusDistributionProps {
  sales: Sale[];
  dateRange: DateRange;
}

export default function StatusDistribution({ sales, dateRange }: StatusDistributionProps) {
  const data = useMemo(() => {
    const fromStr = dateRange.from.toISOString().split('T')[0];
    const toStr = dateRange.to.toISOString().split('T')[0];
    const filtered = sales.filter(s => s.date >= fromStr && s.date <= toStr);
    
    const paid = filtered.filter(s => s.status === 'Paid').length;
    const cancelled = filtered.filter(s => s.status === 'Cancelled').length;
    const refunded = filtered.filter(s => s.status === 'Refunded').length;
    const total = filtered.length;

    return [
      { name: 'Paid', value: paid, color: '#10b981', percent: total > 0 ? (paid / total * 100).toFixed(1) : '0' },
      { name: 'Cancelled', value: cancelled, color: '#ef4444', percent: total > 0 ? (cancelled / total * 100).toFixed(1) : '0' },
      { name: 'Refunded', value: refunded, color: '#f59e0b', percent: total > 0 ? (refunded / total * 100).toFixed(1) : '0' },
    ];
  }, [sales, dateRange]);

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.65 }}
      className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Shield size={20} className="text-emerald-500" />
          Order Status
        </h3>
        <span className="text-xs text-gray-400">{total} total</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-28 h-28 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={32}
                outerRadius={52}
                paddingAngle={3}
                dataKey="value"
                animationDuration={800}
              >
                {data.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 space-y-3">
          {data.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm text-gray-600">{item.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-900">{item.value}</span>
                <span className="text-xs text-gray-400 w-12 text-right">{item.percent}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
