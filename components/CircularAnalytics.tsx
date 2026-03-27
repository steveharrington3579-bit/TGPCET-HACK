'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useSubscriptionStore } from '@/lib/store';

// Get category color for charts
const getCategoryColor = (category: string) => {
  switch (category.toLowerCase()) {
    case 'entertainment':
      return '#8b5cf6'; // purple-500
    case 'software':
      return '#3b82f6'; // blue-500
    case 'health':
      return '#10b981'; // green-500
    case 'utilities':
      return '#f59e0b'; // amber-500
    case 'food':
      return '#ef4444'; // red-500
    case 'finance':
      return '#8b5cf6'; // purple-500 (same as entertainment)
    default:
      return '#6b7280'; // gray-500 for "Other"
  }
};

// Custom tooltip component
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const formattedAmount = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(data.totalSpend);

    return (
      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded shadow-lg">
        <p className="font-medium text-gray-900 dark:text-white">{data.name}</p>
        <p className="text-sm text-gray-600 dark:text-gray-300">{formattedAmount}/mo</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{data.percentage}%</p>
      </div>
    );
  }
  return null;
};

export default function CircularAnalytics() {
  const categoryBreakdown = useSubscriptionStore((state) => state.getCategoryBreakdown());
  const totalMonthlySpend = useSubscriptionStore((state) => state.getTotalMonthlySpend());

  // Format data for Recharts with percentages
  const chartData = categoryBreakdown.map(category => {
    const percentage = totalMonthlySpend > 0
      ? ((category.totalSpend / totalMonthlySpend) * 100).toFixed(1)
      : '0.0';

    return {
      name: category.name,
      totalSpend: category.totalSpend,
      percentage: parseFloat(percentage),
      color: getCategoryColor(category.name)
    };
  });

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Category Distribution</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="totalSpend"
              nameKey="name"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-4 space-y-2">
        {chartData.map((entry) => (
          <div key={entry.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              ></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {entry.name}
              </span>
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {formatCurrency(entry.totalSpend)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}