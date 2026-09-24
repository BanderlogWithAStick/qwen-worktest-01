import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Trophy, DollarSign } from 'lucide-react';
import { ManagerRating as ManagerRatingType } from '../types';

interface ManagerRatingProps {
  data: ManagerRatingType[];
}

function formatCurrency(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M ₽`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K ₽`;
  return `${value.toFixed(0)} ₽`;
}

type SortMode = 'grossProfit' | 'averageCheck';

export default function ManagerRating({ data }: ManagerRatingProps) {
  const [sortMode, setSortMode] = useState<SortMode>('grossProfit');

  const sorted = [...data].sort((a, b) => {
    if (sortMode === 'grossProfit') return b.grossProfit - a.grossProfit;
    return b.averageCheck - a.averageCheck;
  });

  const maxGP = Math.max(...data.map(d => d.grossProfit), 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="bg-white rounded-xl border border-gray-100 shadow-sm"
    >
      <div className="flex items-center justify-between p-5 border-b border-gray-50">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Trophy size={20} className="text-amber-500" />
          Manager Rating
        </h3>
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
          <button
            onClick={() => setSortMode('grossProfit')}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              sortMode === 'grossProfit' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <TrendingUp size={12} /> Gross Profit
          </button>
          <button
            onClick={() => setSortMode('averageCheck')}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              sortMode === 'averageCheck' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <DollarSign size={12} /> Avg Check
          </button>
        </div>
      </div>

      <div className="overflow-hidden">
        <AnimatePresence mode="popLayout">
          {sorted.map((item, index) => (
            <motion.div
              key={item.manager.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, delay: index * 0.02 }}
              className="flex items-center gap-4 px-5 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
            >
              {/* Rank */}
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                index === 0 ? 'bg-amber-100 text-amber-700' :
                index === 1 ? 'bg-gray-100 text-gray-600' :
                index === 2 ? 'bg-orange-50 text-orange-600' :
                'bg-gray-50 text-gray-400'
              }`}>
                {index + 1}
              </div>

              {/* Avatar */}
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                style={{ backgroundColor: item.manager.color }}
              >
                {item.manager.initials}
              </div>

              {/* Name & Team */}
              <div className="w-40 shrink-0">
                <div className="text-sm font-medium text-gray-900 truncate">{item.manager.name}</div>
                <div className="text-xs text-gray-400">{item.manager.team}</div>
              </div>

              {/* Progress bar */}
              <div className="flex-1 hidden xl:block">
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.grossProfit / maxGP) * 100}%` }}
                    transition={{ duration: 0.8, delay: index * 0.03 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: item.manager.color }}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 text-sm">
                <div className="text-right w-16">
                  <div className="font-medium text-gray-900">{item.salesCount}</div>
                  <div className="text-xs text-gray-400">sales</div>
                </div>
                <div className="text-right w-20">
                  <div className="font-medium text-gray-900">{formatCurrency(item.revenue)}</div>
                  <div className="text-xs text-gray-400">revenue</div>
                </div>
                <div className="text-right w-20">
                  <div className="font-semibold text-emerald-600">{formatCurrency(item.grossProfit)}</div>
                  <div className="text-xs text-gray-400">profit</div>
                </div>
                <div className="text-right w-20">
                  <div className="font-medium text-gray-900">{formatCurrency(item.averageCheck)}</div>
                  <div className="text-xs text-gray-400">avg check</div>
                </div>
                <div className="text-right w-16">
                  <div className="font-medium text-gray-900">{item.margin.toFixed(1)}%</div>
                  <div className="text-xs text-gray-400">margin</div>
                </div>
                <div className="text-right w-16">
                  {item.grossProfit > 0 ? (
                    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${
                      item.gpChange >= 0 ? 'text-emerald-600' : 'text-red-500'
                    }`}>
                      {item.gpChange >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {Math.abs(item.gpChange).toFixed(0)}%
                    </span>
                  ) : (
                    <span className="text-xs text-gray-300">—</span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
