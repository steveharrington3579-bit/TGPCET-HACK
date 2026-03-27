'use client';

import { useSubscriptionStore } from '@/lib/store';
import { Subscription } from '@/types';

// Helper function to detect price increase
const hasPriceIncrease = (subscription: Subscription): boolean => {
  if (subscription.priceHistory.length < 2) {
    return false;
  }

  const firstAmount = subscription.priceHistory[0].amount;
  const lastAmount = subscription.priceHistory[subscription.priceHistory.length - 1].amount;

  if (firstAmount === 0) return false;

  const percentageIncrease = ((lastAmount - firstAmount) / firstAmount) * 100;
  return percentageIncrease > 5;
};

// Helper function to check for duplicate categories
const hasDuplicateCategory = (subscription: Subscription, allSubscriptions: Subscription[]): boolean => {
  const categoryCount = allSubscriptions.filter(sub => sub.category === subscription.category).length;
  return categoryCount > 1;
};

// Main recommendation function
const getRecommendation = (sub: Subscription, allSubscriptions: Subscription[]): { text: string; type: 'cancel' | 'monitor' | 'keep' } => {
  const priceIncreased = hasPriceIncrease(sub);
  const duplicateCategory = hasDuplicateCategory(sub, allSubscriptions);

  if (sub.cancelScore >= 70 && priceIncreased) {
    const firstAmount = sub.priceHistory[0].amount;
    const lastAmount = sub.priceHistory[sub.priceHistory.length - 1].amount;
    const percentageIncrease = firstAmount > 0 ? ((lastAmount - firstAmount) / firstAmount) * 100 : 0;

    return {
      text: `⚠️ Cancel recommended — cost has gone up ${percentageIncrease.toFixed(1)}% and this is a high spend`,
      type: 'cancel'
    };
  }

  if (sub.cancelScore >= 70 && duplicateCategory) {
    return {
      text: `Consider cancelling — you have another ${sub.category} subscription`,
      type: 'cancel'
    };
  }

  if (sub.monthlyCost > 1000 && sub.occurrences < 3) {
    return {
      text: 'High cost, low history — cancel if not actively using',
      type: 'cancel'
    };
  }

  if (sub.cancelScore >= 40 && sub.cancelScore <= 69) {
    return {
      text: 'Monitor this — not urgent but worth reviewing',
      type: 'monitor'
    };
  }

  return {
    text: 'Low priority — looks like a core subscription',
    type: 'keep'
  };
};

// Get recommendation text color classes
const getRecommendationColor = (type: 'cancel' | 'monitor' | 'keep') => {
  switch (type) {
    case 'cancel':
      return 'text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/50';
    case 'monitor':
      return 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/50';
    case 'keep':
      return 'text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/50';
    default:
      return 'text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
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

export default function AIAdvisor() {
  const filteredSubscriptions = useSubscriptionStore((state) => state.getFilteredSubscriptions());
  const slashSubscription = useSubscriptionStore((state) => state.slashSubscription);

  // Get top 3 highest cancelScore subscriptions
  const topRecommendations = [...filteredSubscriptions]
    .sort((a, b) => b.cancelScore - a.cancelScore)
    .slice(0, 3);

  // Count subscriptions that need attention (cancelScore >= 40)
  const attentionNeeded = filteredSubscriptions.filter(sub => sub.cancelScore >= 40).length;

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
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">AI Cancel Advisor</h3>

      {/* Summary line */}
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        {attentionNeeded} subscription{attentionNeeded !== 1 ? 's' : ''} need{attentionNeeded === 1 ? 's' : ''} your attention
      </p>

      {/* Recommendations */}
      {topRecommendations.length > 0 ? (
        <div className="space-y-4">
          {topRecommendations.map((subscription) => {
            const recommendation = getRecommendation(subscription, filteredSubscriptions);

            return (
              <div
                key={subscription.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                      {subscription.merchantName}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatCurrency(subscription.monthlyCost)}/mo
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCancelScoreColor(subscription.cancelScore)}`}>
                    Risk: {subscription.cancelScore}
                  </span>
                </div>

                <div className={`p-3 rounded-md border ${getRecommendationColor(recommendation.type)}`}>
                  <p className="text-sm font-medium">{recommendation.text}</p>
                </div>

                <div className="mt-3 flex justify-end">
                  <button
                    onClick={() => slashSubscription(subscription.id)}
                    className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md dark:bg-red-500 dark:hover:bg-red-600 transition-colors"
                  >
                    Take action
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            No subscriptions to analyze yet.
          </p>
        </div>
      )}
    </div>
  );
}