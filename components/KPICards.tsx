'use client';

import { useSubscriptionStore } from '@/lib/store';

export default function KPICards() {
  const totalMonthlySpend = useSubscriptionStore((state) => state.getTotalMonthlySpend());
  const annualWaste = useSubscriptionStore((state) => state.getAnnualWaste());
  const filteredSubscriptions = useSubscriptionStore((state) => state.getFilteredSubscriptions());
  const monthlySavings = useSubscriptionStore((state) => state.getMonthlySavings());

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Total Monthly Spend */}
      <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-6 border border-blue-100 dark:border-blue-800/50">
        <div className="flex items-center">
          <div className="p-2 bg-blue-100 dark:bg-blue-800/50 rounded-lg">
            <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Monthly Spend</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalMonthlySpend)}/mo</p>
          </div>
        </div>
      </div>

      {/* Annual Waste */}
      <div className="bg-red-50 dark:bg-red-900/30 rounded-lg p-6 border border-red-100 dark:border-red-800/50">
        <div className="flex items-center">
          <div className="p-2 bg-red-100 dark:bg-red-800/50 rounded-lg">
            <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Annual Waste</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(annualWaste)}</p>
          </div>
        </div>
      </div>

      {/* Active Subscriptions */}
      <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-6 border border-green-100 dark:border-green-800/50">
        <div className="flex items-center">
          <div className="p-2 bg-green-100 dark:bg-green-800/50 rounded-lg">
            <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Active Subs</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{filteredSubscriptions.length}</p>
          </div>
        </div>
      </div>

      {/* Potential Savings */}
      <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-6 border border-purple-100 dark:border-purple-800/50">
        <div className="flex items-center">
          <div className="p-2 bg-purple-100 dark:bg-purple-800/50 rounded-lg">
            <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Potential Savings</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(monthlySavings)}/mo</p>
          </div>
        </div>
      </div>
    </div>
  );
}