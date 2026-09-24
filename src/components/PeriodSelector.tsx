import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { PeriodType, DateRange } from '../types';
import { format } from 'date-fns';

interface PeriodSelectorProps {
  period: PeriodType;
  customRange: DateRange;
  onPeriodChange: (period: PeriodType, range?: DateRange) => void;
}

const presets: { key: PeriodType; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: '7days', label: '7 Days' },
  { key: '30days', label: '30 Days' },
  { key: 'thisMonth', label: 'This Month' },
  { key: 'lastMonth', label: 'Last Month' },
  { key: 'custom', label: 'Custom' },
];

export default function PeriodSelector({ period, customRange, onPeriodChange }: PeriodSelectorProps) {
  const [showCustom, setShowCustom] = useState(false);
  const [fromDate, setFromDate] = useState(format(customRange.from, 'yyyy-MM-dd'));
  const [toDate, setToDate] = useState(format(customRange.to, 'yyyy-MM-dd'));

  const handlePreset = (key: PeriodType) => {
    if (key === 'custom') {
      setShowCustom(!showCustom);
    } else {
      setShowCustom(false);
      onPeriodChange(key);
    }
  };

  const handleApplyCustom = () => {
    onPeriodChange('custom', {
      from: new Date(fromDate),
      to: new Date(toDate),
    });
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
        {presets.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => handlePreset(key)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
              period === key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      
      {showCustom && (
        <div className="flex items-center gap-2 ml-2 animate-in fade-in">
          <input
            type="date"
            value={fromDate}
            onChange={e => setFromDate(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-gray-400">→</span>
          <input
            type="date"
            value={toDate}
            onChange={e => setToDate(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleApplyCustom}
            className="px-3 py-1.5 text-sm font-medium bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Apply
          </button>
        </div>
      )}

      <div className="ml-auto flex items-center gap-2 text-sm text-gray-500">
        <Calendar size={14} />
        <span>
          {period === 'custom' 
            ? `${format(customRange.from, 'dd MMM')} — ${format(customRange.to, 'dd MMM yyyy')}`
            : presets.find(p => p.key === period)?.label
          }
        </span>
      </div>
    </div>
  );
}
