'use client';

import { Subscription } from '@/types';
import { useSubscriptionStore } from '@/lib/store';

interface SubscriptionCardProps {
  subscription: Subscription;
}

export default function SubscriptionCard({ subscription }: SubscriptionCardProps) {
  const { slashSubscription, unslashSubscription } = useSubscriptionStore();
  const isSlashed = useSubscriptionStore((state) =>
    state.slashedItems.includes(subscription.id)
  );

  // Get day of month for next billing
  const nextBillingDay = new Date(subscription.lastChargeDate).getDate();

  // Calculate if there's a price spike (>5% increase)
  const hasPriceSpike = subscription.priceHistory.length >= 2 &&
    ((subscription.priceHistory[subscription.priceHistory.length - 1].amount -
      subscription.priceHistory[0].amount) /
      subscription.priceHistory[0].amount) > 0.05;

  // Get category color classes
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
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // Get cancel score badge color
  const getCancelScoreColor = (score: number) => {
    if (score >= 70) {
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    } else if (score >= 40) {
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
    } else {
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 transition-all duration-200 ${
      isSlashed ? 'opacity-60' : ''
    }`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className={`text-lg font-semibold text-gray-900 dark:text-white ${
              isSlashed ? 'line-through' : ''
            }`}>
              {subscription.merchantName}
            </h3>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(subscription.category)}`}>
              {subscription.category}
            </span>
          </div>

          <div className="flex items-baseline gap-4 mb-3">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(subscription.monthlyCost)}
            </p>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Bills on {nextBillingDay}{getOrdinalSuffix(nextBillingDay)}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCancelScoreColor(subscription.cancelScore)}`}>
              Risk: {subscription.cancelScore}
            </span>
            {hasPriceSpike && (
              <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 rounded-full">
                ↑ PRICE SPIKE
              </span>
            )}
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Detected {subscription.occurrences} times
            </span>
          </div>
        </div>

        <div className="ml-4">
          {isSlashed ? (
            <button
              onClick={() => unslashSubscription(subscription.id)}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Restore
            </button>
          ) : (
            <button
              onClick={() => slashSubscription(subscription.id)}
              className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md dark:bg-red-500 dark:hover:bg-red-600 transition-colors"
            >
              Slash it
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper function to get ordinal suffix for dates
const getOrdinalSuffix = (day: number): string => {
  if (day > 3 && day < 21) return 'th';
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
};