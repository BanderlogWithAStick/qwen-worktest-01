import { motion } from 'framer-motion';
import { Clock, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { RecentSale } from '../types';
import { format, parseISO } from 'date-fns';

interface RecentSalesProps {
  data: RecentSale[];
}

function formatCurrency(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M ₽`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K ₽`;
  return `${value.toFixed(0)} ₽`;
}

const statusConfig = {
  Paid: { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50', label: 'Paid' },
  Cancelled: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', label: 'Cancelled' },
  Refunded: { icon: RotateCcw, color: 'text-amber-500', bg: 'bg-amber-50', label: 'Refunded' },
};

export default function RecentSales({ data }: RecentSalesProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
      className="bg-white rounded-xl border border-gray-100 shadow-sm"
    >
      <div className="flex items-center justify-between p-5 border-b border-gray-50">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Clock size={20} className="text-blue-500" />
          Recent Sales
        </h3>
        <span className="text-xs text-gray-400">{data.length} transactions</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-xs text-gray-400 border-b border-gray-50">
              <th className="text-left px-5 py-2 font-medium">Date</th>
              <th className="text-left px-3 py-2 font-medium">Manager</th>
              <th className="text-left px-3 py-2 font-medium">Customer</th>
              <th className="text-left px-3 py-2 font-medium">Products</th>
              <th className="text-left px-3 py-2 font-medium">Status</th>
              <th className="text-right px-3 py-2 font-medium">Amount</th>
              <th className="text-right px-5 py-2 font-medium">Gross Profit</th>
            </tr>
          </thead>
          <tbody>
            {data.map((sale, i) => {
              const status = statusConfig[sale.status];
              const StatusIcon = status.icon;
              return (
                <motion.tr
                  key={sale.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-5 py-2.5 text-sm text-gray-600">
                    {format(parseISO(sale.date), 'dd MMM')}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                        style={{ backgroundColor: sale.manager.color }}
                      >
                        {sale.manager.initials}
                      </div>
                      <span className="text-sm text-gray-700 truncate max-w-[120px]">{sale.manager.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-sm text-gray-600 truncate max-w-[140px]">
                    {sale.customer.company}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex flex-wrap gap-1">
                      {sale.products.slice(0, 2).map((p, idx) => (
                        <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded truncate max-w-[100px]">
                          {p}
                        </span>
                      ))}
                      {sale.products.length > 2 && (
                        <span className="text-xs text-gray-400">+{sale.products.length - 2}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${status.bg} ${status.color}`}>
                      <StatusIcon size={10} />
                      {status.label}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-sm font-medium text-gray-900 text-right">
                    {formatCurrency(sale.amount)}
                  </td>
                  <td className="px-5 py-2.5 text-sm text-right">
                    {sale.status === 'Paid' ? (
                      <span className="font-medium text-emerald-600">{formatCurrency(sale.grossProfit)}</span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
