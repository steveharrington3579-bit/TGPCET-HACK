'use client';

import { useSubscriptionStore } from '@/lib/store';
import { Subscription } from '@/types';

export default function SavingsPanel() {
  const totalMonthlySpend = useSubscriptionStore((state) => state.getTotalMonthlySpend());
  const monthlySavings = useSubscriptionStore((state) => state.getMonthlySavings());
  const subscriptions = useSubscriptionStore((state) => state.subscriptions);
  const slashedItems = useSubscriptionStore((state) => state.slashedItems);

  // Get slashed subscriptions
  const slashedSubscriptions = subscriptions.filter(sub =>
    slashedItems.includes(sub.id)
  );

  // Calculate savings percentage
  const savingsPercentage = totalMonthlySpend > 0
    ? (monthlySavings / totalMonthlySpend) * 100
    : 0;

  const annualSavings = monthlySavings * 12;

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Savings</h3>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600 dark:text-gray-400">Savings Progress</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {savingsPercentage.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div
            className="h-2.5 rounded-full bg-green-500 transition-all duration-300"
            style={{ width: `${Math.min(savingsPercentage, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Running Total */}
      <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-lg">
        <p className="text-center font-bold text-green-800 dark:text-green-200">
          Total saved: {formatCurrency(monthlySavings)}/mo | {formatCurrency(annualSavings)}/yr
        </p>
      </div>

      {/* Celebratory Message */}
      {savingsPercentage > 20 && (
        <div className="mb-6 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800/50 rounded-lg">
          <p className="text-center text-sm font-medium text-green-800 dark:text-green-200">
            🎉 Great job! You've cut {savingsPercentage.toFixed(1)}% of wasteful spend
          </p>
        </div>
      )}

      {/* Slashed Subscriptions List */}
      {slashedSubscriptions.length > 0 ? (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Slashed subscriptions ({slashedSubscriptions.length}):
          </p>
          {slashedSubscriptions.map((sub) => (
            <div key={sub.id} className="flex justify-between items-center py-1">
              <span className="text-sm text-gray-600 dark:text-gray-400 line-through">
                {sub.merchantName}
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white line-through">
                {formatCurrency(sub.monthlyCost)}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Slash subscriptions to see your savings here
          </p>
        </div>
      )}
    </div>
  );
}