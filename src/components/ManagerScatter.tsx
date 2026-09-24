import { motion } from 'framer-motion';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis, Cell } from 'recharts';
import { ManagerRating } from '../types';
import { Users } from 'lucide-react';

interface ManagerScatterProps {
  data: ManagerRating[];
}

function formatCurrency(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M ₽`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K ₽`;
  return `${value.toFixed(0)} ₽`;
}

export default function ManagerScatter({ data }: ManagerScatterProps) {
  const scatterData = data
    .filter(d => d.salesCount > 0)
    .map(d => ({
      name: d.manager.name,
      revenue: d.revenue,
      margin: d.margin,
      salesCount: d.salesCount,
      color: d.manager.color,
    }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.55 }}
      className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Users size={20} className="text-purple-500" />
          Revenue vs Margin
        </h3>
        <span className="text-xs text-gray-400">Bubble size = # of sales</span>
      </div>

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="revenue"
              name="Revenue"
              tickFormatter={(v) => formatCurrency(v)}
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              dataKey="margin"
              name="Margin"
              tickFormatter={(v) => `${v.toFixed(0)}%`}
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              width={45}
            />
            <ZAxis dataKey="salesCount" range={[40, 400]} name="Sales" />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-white border border-gray-200 rounded-lg p-2.5 shadow-lg text-xs">
                    <div className="font-semibold text-gray-900 mb-1">{d.name}</div>
                    <div className="text-gray-500">Revenue: {formatCurrency(d.revenue)}</div>
                    <div className="text-gray-500">Margin: {d.margin.toFixed(1)}%</div>
                    <div className="text-gray-500">Sales: {d.salesCount}</div>
                  </div>
                );
              }}
            />
            <Scatter data={scatterData} animationDuration={800}>
              {scatterData.map((entry, index) => (
                <Cell key={index} fill={entry.color} fillOpacity={0.7} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
