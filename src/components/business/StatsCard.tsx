import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down';
  suffix?: string;
}

export function StatsCard({ title, value, change, trend, suffix }: StatsCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <p className="text-sm font-medium text-gray-600">{title}</p>
      <div className="mt-2 flex items-baseline">
        <p className="text-3xl font-bold text-gray-900">
          {value}
          {suffix && <span className="text-xl text-gray-500 ml-1">{suffix}</span>}
        </p>
        {change && trend && (
          <span
            className={`ml-2 flex items-center text-sm font-medium ${
              trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {trend === 'up' ? (
              <ArrowUpIcon className="w-4 h-4 mr-1" />
            ) : (
              <ArrowDownIcon className="w-4 h-4 mr-1" />
            )}
            {change}
          </span>
        )}
      </div>
    </div>
  );
}
