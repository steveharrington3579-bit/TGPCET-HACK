'use client';

import { Subscription } from '@/types';
import { useSubscriptionStore } from '@/lib/store';

interface SubscriptionTableProps {
  subscriptions: Subscription[];
}

export default function SubscriptionTable({ subscriptions }: SubscriptionTableProps) {
  const slashSubscription = useSubscriptionStore((state) => state.slashSubscription);
  const unslashSubscription = useSubscriptionStore((state) => state.unslashSubscription);
  const slashedItems = useSubscriptionStore((state) => state.slashedItems);

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'entertainment':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'software':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'health':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'utilities':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      case 'food':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'finance':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getCancelScoreColor = (score: number) => {
    if (score >= 70) {
      return 'text-red-600 dark:text-red-400';
    } else if (score >= 40) {
      return 'text-amber-600 dark:text-amber-400';
    } else {
      return 'text-green-600 dark:text-green-400';
    }
  };

  const hasPriceSpike = (subscription: Subscription): boolean => {
    if (subscription.priceHistory.length < 2) {
      return false;
    }
    const firstAmount = subscription.priceHistory[0].amount;
    const lastAmount = subscription.priceHistory[subscription.priceHistory.length - 1].amount;
    if (firstAmount === 0) return false;
    const percentageIncrease = ((lastAmount - firstAmount) / firstAmount) * 100;
    return percentageIncrease > 5;
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getOrdinalSuffix = (day: number): string => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Merchant
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Category
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Monthly Cost
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Billing Day
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Risk Score
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {subscriptions.map((subscription) => {
            const isSlashed = slashedItems.includes(subscription.id);
            const nextBillingDay = new Date(subscription.lastChargeDate).getDate();
            const priceSpike = hasPriceSpike(subscription);

            return (
              <tr
                key={subscription.id}
                className={`${isSlashed ? 'opacity-60' : ''}`}
              >
                <td className={`px-6 py-4 whitespace-nowrap ${isSlashed ? 'line-through' : ''}`}>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {subscription.merchantName}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getCategoryColor(subscription.category)}`}>
                    {subscription.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {formatCurrency(subscription.monthlyCost)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {nextBillingDay}{getOrdinalSuffix(nextBillingDay)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getCancelScoreColor(subscription.cancelScore)}`}>
                    {subscription.cancelScore}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {priceSpike && (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                      ↑ PRICE SPIKE
                    </span>
                  )}
                  {!priceSpike && subscription.occurrences >= 3 && (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                      Stable
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {isSlashed ? (
                    <button
                      onClick={() => unslashSubscription(subscription.id)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Restore
                    </button>
                  ) : (
                    <button
                      onClick={() => slashSubscription(subscription.id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Slash
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}