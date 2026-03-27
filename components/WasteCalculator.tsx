'use client';

import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useSubscriptionStore } from '@/lib/store';

const COLORS = ['#10b981', '#f59e0b']; // green for savings, amber for remaining

export default function WasteCalculator() {
  const [isClient, setIsClient] = useState(false);
  const annualWaste = useSubscriptionStore((state) => state.getAnnualWaste());
  const monthlySavings = useSubscriptionStore((state) => state.getMonthlySavings());
  const filteredSubscriptions = useSubscriptionStore((state) => state.getFilteredSubscriptions());
  const slashSubscription = useSubscriptionStore((state) => state.slashSubscription);
  const slashedItems = useSubscriptionStore((state) => state.slashedItems);

  const [slashCount, setSlashCount] = useState<number | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const annualSavings = monthlySavings * 12;
  const remainingAnnualSpend = annualWaste - annualSavings;

  // Calculate relatable comparisons
  const chaiCups = Math.floor(annualSavings / 80);
  const movieTickets = Math.floor(annualSavings / 500);
  const groceryMonths = Math.floor(annualSavings / 15000);

  // Handle "Slash all high-risk" button click
  const handleSlashHighRisk = () => {
    const highRiskSubscriptions = filteredSubscriptions.filter(
      (sub) => sub.cancelScore >= 70 && !slashedItems.includes(sub.id)
    );

    highRiskSubscriptions.forEach((sub) => {
      slashSubscription(sub.id);
    });

    setSlashCount(highRiskSubscriptions.length);

    // Reset count after 3 seconds
    setTimeout(() => {
      setSlashCount(null);
    }, 3000);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Prepare data for donut chart
  const chartData = [
    { name: 'Saved', value: annualSavings },
    { name: 'Remaining', value: remainingAnnualSpend }
  ].filter(item => item.value > 0); // Only show non-zero values

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Annual Waste Calculator</h3>

      {/* Headlines */}
      <div className="space-y-2 mb-6">
        <p className="text-xl font-bold text-gray-900 dark:text-white">
          You're spending {formatCurrency(annualWaste)} / year on subscriptions
        </p>
        {annualSavings > 0 && (
          <p className="text-lg font-semibold text-green-600 dark:text-green-400">
            You could save {formatCurrency(annualSavings)} / year
          </p>
        )}
      </div>

      {/* Relatable Comparisons */}
      {annualSavings > 0 && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-lg p-4 mb-6">
          <p className="text-sm font-medium text-green-800 dark:text-green-200 mb-3">This equals...</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">☕</span>
              <span className="text-sm text-green-700 dark:text-green-300">
                {chaiCups.toLocaleString()} cups of chai
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎬</span>
              <span className="text-sm text-green-700 dark:text-green-300">
                {movieTickets.toLocaleString()} movie tickets
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🛒</span>
              <span className="text-sm text-green-700 dark:text-green-300">
                {groceryMonths.toLocaleString()} months of groceries
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Donut Chart */}
      <div className="mb-6">
        {isClient ? (
          <>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            {annualSavings > 0 && (
              <div className="text-center mt-2">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(annualSavings)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">saved annually</p>
              </div>
            )}
          </>
        ) : (
          <div className="h-48 w-full flex items-center justify-center">
            <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded h-32 w-32"></div>
          </div>
        )}
      </div>

      {/* Slash All High-Risk Button */}
      <div className="text-center">
        <button
          type="button"
          onClick={handleSlashHighRisk}
          disabled={slashCount !== null}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            slashCount !== null
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
              : 'bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600'
          }`}
        >
          {slashCount !== null
            ? `Slashed ${slashCount} subscriptions!`
            : 'Slash all high-risk'}
        </button>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Slashes all subscriptions with risk score ≥ 70
        </p>
      </div>
    </div>
  );
}