'use client';

import { useSubscriptionStore } from '@/lib/store';
import CategoryChart from '@/components/CategoryChart';

// Get category color classes for dots
const getCategoryDotColor = (category: string) => {
  switch (category.toLowerCase()) {
    case 'entertainment':
      return 'bg-purple-500';
    case 'software':
      return 'bg-blue-500';
    case 'health':
      return 'bg-green-500';
    case 'utilities':
      return 'bg-amber-500';
    case 'food':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

export default function AnalyticsPanel() {
  const categoryBreakdown = useSubscriptionStore((state) => state.getCategoryBreakdown());
  const filteredSubscriptions = useSubscriptionStore((state) => state.getFilteredSubscriptions());
  const totalMonthlySpend = useSubscriptionStore((state) => state.getTotalMonthlySpend());

  // Find biggest drain subscription
  const biggestDrain = filteredSubscriptions.reduce(
    (max, sub) => (sub.monthlyCost > max.monthlyCost ? sub : max),
    { monthlyCost: 0, merchantName: '' } as any
  );

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Category Chart */}
      <CategoryChart />

      {/* Category Rankings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Category Rankings</h3>
        <div className="space-y-3">
          {categoryBreakdown.map((category) => {
            const percentage = totalMonthlySpend > 0
              ? (category.totalSpend / totalMonthlySpend) * 100
              : 0;

            return (
              <div key={category.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className={`w-3 h-3 rounded-full ${getCategoryDotColor(category.name)}`}></div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {category.name}
                  </span>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <span className="text-sm text-gray-600 dark:text-gray-300 min-w-[80px] text-right">
                    {formatCurrency(category.totalSpend)}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 min-w-[40px] text-right">
                    {percentage.toFixed(1)}%
                  </span>
                  <div className="flex-1 max-w-[120px] ml-2">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full bg-blue-500"
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Biggest Drain Callout */}
      {biggestDrain.merchantName && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border border-red-200 dark:border-red-800/50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">Biggest Drain</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {biggestDrain.merchantName}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {formatCurrency(biggestDrain.monthlyCost)}
              </p>
              <p className="text-xs text-red-600 dark:text-red-400">per month</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}