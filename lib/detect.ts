import { Transaction, Subscription } from '@/types';
import { getMerchantInfo } from '@/lib/normalize';

/**
 * Groups transactions by normalized merchant name
 * @param transactions - Array of transactions to group
 * @returns Map with normalized merchant names as keys and transaction arrays as values
 */
function groupTransactionsByMerchant(transactions: Transaction[]): Map<string, Transaction[]> {
  const groups = new Map<string, Transaction[]>();

  for (const transaction of transactions) {
    const merchantInfo = getMerchantInfo(transaction.merchant);
    const normalizedMerchant = merchantInfo.normalizedName;

    if (!groups.has(normalizedMerchant)) {
      groups.set(normalizedMerchant, []);
    }
    groups.get(normalizedMerchant)!.push(transaction);
  }

  return groups;
}

/**
 * Calculates the number of days between two dates
 * @param date1 - First date (ISO string)
 * @param date2 - Second date (ISO string)
 * @returns Number of days between dates
 */
function daysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Calculates median value from an array of numbers
 * @param values - Array of numbers
 * @returns Median value
 */
function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

/**
 * Detects if a subscription has experienced a price spike
 * @param subscription - Subscription object to check
 * @returns True if price increase detected (last amount > first amount by >5%)
 */
export function detectPriceSpiked(subscription: Subscription): boolean {
  if (subscription.priceHistory.length < 2) {
    return false;
  }

  const firstAmount = subscription.priceHistory[0].amount;
  const lastAmount = subscription.priceHistory[subscription.priceHistory.length - 1].amount;

  if (firstAmount === 0) return false;

  const percentageIncrease = ((lastAmount - firstAmount) / firstAmount) * 100;
  return percentageIncrease > 5;
}

/**
 * Detects subscriptions from transaction data
 * @param transactions - Array of transactions to analyze
 * @returns Array of detected subscriptions
 */
export function detectSubscriptions(transactions: Transaction[]): Subscription[] {
  const groupedTransactions = groupTransactionsByMerchant(transactions);
  const subscriptions: Subscription[] = [];
  const allDetectedCategories: string[] = [];

  // Process each merchant group
  groupedTransactions.forEach((merchantTransactions, normalizedMerchant) => {
    // Only consider groups with 2 or more transactions
    if (merchantTransactions.length < 2) {
      return;
    }

    // Sort transactions by date ascending
    const sortedTransactions = [...merchantTransactions].sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Calculate intervals between consecutive transactions
    const intervals: number[] = [];
    for (let i = 1; i < sortedTransactions.length; i++) {
      const interval = daysBetween(sortedTransactions[i - 1].date, sortedTransactions[i].date);
      intervals.push(interval);
    }

    // Check if ANY interval is between 25-35 days (monthly cycle)
    const hasMonthlyPattern = intervals.some(interval => interval >= 25 && interval <= 35);

    if (!hasMonthlyPattern) {
      return;
    }

    // Check amount consistency (max variation <= 10%)
    const amounts = sortedTransactions.map(t => t.amount);
    const minAmount = Math.min(...amounts);
    const maxAmount = Math.max(...amounts);
    const variationPercentage = minAmount === 0 ? Infinity : ((maxAmount - minAmount) / minAmount) * 100;
    const isAmountConsistent = variationPercentage <= 10;

    if (!isAmountConsistent) {
      return;
    }

    // If both checks pass, mark as subscription
    const averageAmount = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;
    const medianInterval = calculateMedian(intervals);
    const lastTransaction = sortedTransactions[sortedTransactions.length - 1];
    const priceHistory = sortedTransactions.map(t => ({
      date: t.date,
      amount: t.amount
    }));

    // Determine billing cycle based on median interval
    let billingCycle: 'monthly' | 'quarterly' | 'annual' | 'biennial' = 'monthly';
    if (medianInterval > 80 && medianInterval <= 100) {
      billingCycle = 'quarterly';
    } else if (medianInterval > 350 && medianInterval <= 380) {
      billingCycle = 'annual';
    } else if (medianInterval > 700 && medianInterval <= 750) {
      billingCycle = 'biennial';
    }

    const merchantInfo = getMerchantInfo(lastTransaction.merchant);
    allDetectedCategories.push(merchantInfo.category);

    const subscription: Subscription = {
      id: normalizedMerchant,
      merchantName: merchantInfo.originalName,
      normalizedName: normalizedMerchant,
      category: merchantInfo.category,
      monthlyCost: averageAmount,
      billingCycle,
      lastChargeDate: lastTransaction.date,
      occurrences: sortedTransactions.length,
      priceHistory,
      cancelScore: 0, // Will be calculated below
      isSlashed: false
    };

    subscriptions.push(subscription);
  });

  // Calculate cancel scores for all subscriptions
  for (const subscription of subscriptions) {
    let score = 0;

    // monthlyCost > 500 INR: +30
    if (subscription.monthlyCost > 500) {
      score += 30;
    }

    // price increase detected (last > first by >5%): +25
    if (detectPriceSpiked(subscription)) {
      score += 25;
    }

    // same category has another subscription: +20
    const categoryCount = allDetectedCategories.filter(cat => cat === subscription.category).length;
    if (categoryCount > 1) {
      score += 20;
    }

    // category is "Entertainment": +15
    if (subscription.category === 'Entertainment') {
      score += 15;
    }

    // occurrences < 3 (new/low usage signal): +10
    if (subscription.occurrences < 3) {
      score += 10;
    }

    // Ensure score is between 0-100
    subscription.cancelScore = Math.min(100, Math.max(0, score));
  }

  return subscriptions;
}