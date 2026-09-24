import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CategoryStat, ProductStat } from '../types';

interface CategoryBreakdownProps {
  categories: CategoryStat[];
  products: ProductStat[];
}

function formatCurrency(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M ₽`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K ₽`;
  return `${value.toFixed(0)} ₽`;
}

export default function CategoryBreakdown({ categories, products }: CategoryBreakdownProps) {
  const totalRevenue = categories.reduce((s, c) => s + c.revenue, 0);
  
  const pieData = categories.map(c => ({
    name: c.category.name,
    value: c.revenue,
    color: c.category.color,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Category Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
        <div className="flex items-center gap-4">
          <div className="w-40 h-40 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                  animationDuration={800}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-2">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.category.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.05 }}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.category.color }} />
                  <span className="text-gray-700">{cat.category.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-900 font-medium">{formatCurrency(cat.revenue)}</span>
                  <span className="text-xs text-gray-400 w-10 text-right">
                    {totalRevenue > 0 ? ((cat.revenue / totalRevenue) * 100).toFixed(0) : 0}%
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Top Products */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.45 }}
        className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Products</h3>
        <div className="space-y-3">
          {products.slice(0, 7).map((prod, i) => {
            const maxRev = products[0]?.revenue || 1;
            return (
              <motion.div
                key={prod.product.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.05 }}
                className="flex items-center gap-3"
              >
                <span className="text-xs text-gray-400 w-4">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-700 truncate">{prod.product.name}</span>
                    <span className="text-sm font-medium text-gray-900 ml-2">{formatCurrency(prod.revenue)}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(prod.revenue / maxRev) * 100}%` }}
                      transition={{ duration: 0.6, delay: 0.5 + i * 0.05 }}
                      className="h-full rounded-full bg-blue-400"
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
