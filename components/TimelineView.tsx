'use client';

import { useState, useEffect } from 'react';
import { useSubscriptionStore } from '@/lib/store';
import { Subscription } from '@/types';

interface DayCellProps {
  day: number;
  subscriptions: Subscription[];
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const DayCell = ({ day, subscriptions, isHovered, onMouseEnter, onMouseLeave }: DayCellProps) => {
  const subscriptionCount = subscriptions.length;
  const hasSubscriptions = subscriptionCount > 0;

  // Determine cell background color
  let bgColor = 'bg-gray-100 dark:bg-gray-800';
  if (hasSubscriptions) {
    bgColor = subscriptionCount === 1
      ? 'bg-amber-200 dark:bg-amber-900/50'
      : 'bg-red-200 dark:bg-red-900/50';
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div
      className={`relative flex items-center justify-center h-12 w-12 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium transition-all duration-200 ${bgColor} ${
        isHovered ? 'ring-2 ring-blue-500 z-10' : ''
      }`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <span className="text-gray-700 dark:text-gray-300">{day}</span>

      {/* Count badge for multiple subscriptions */}
      {subscriptionCount > 1 && (
        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
          {subscriptionCount}
        </span>
      )}

      {/* Tooltip */}
      {isHovered && hasSubscriptions && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 min-w-[200px] z-20">
          <p className="font-medium text-gray-900 dark:text-white mb-2">
            {subscriptionCount} subscription{subscriptionCount > 1 ? 's' : ''} on {day}{getOrdinalSuffix(day)}
          </p>
          <div className="space-y-1">
            {subscriptions.map((sub) => (
              <div key={sub.id} className="flex justify-between text-sm">
                <span className="text-gray-700 dark:text-gray-300">{sub.merchantName}</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatCurrency(sub.monthlyCost)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

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

export default function TimelineView() {
  const filteredSubscriptions = useSubscriptionStore((state) => state.getFilteredSubscriptions());
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);

  // Group subscriptions by billing day
  const billingDays: Record<number, Subscription[]> = {};

  filteredSubscriptions.forEach((sub) => {
    const day = new Date(sub.lastChargeDate).getDate();
    if (!billingDays[day]) {
      billingDays[day] = [];
    }
    billingDays[day].push(sub);
  });

  // Calculate heaviest week (7-day window with highest total charges)
  const calculateHeaviestWeek = () => {
    let maxTotal = 0;
    let heaviestStartDay = 1;

    // Check all possible 7-day windows (1-7, 2-8, ..., 25-31)
    for (let startDay = 1; startDay <= 25; startDay++) {
      let weekTotal = 0;
      for (let day = startDay; day <= Math.min(startDay + 6, 31); day++) {
        if (billingDays[day]) {
          weekTotal += billingDays[day].reduce((sum, sub) => sum + sub.monthlyCost, 0);
        }
      }
      if (weekTotal > maxTotal) {
        maxTotal = weekTotal;
        heaviestStartDay = startDay;
      }
    }

    return {
      startDay: heaviestStartDay,
      endDay: Math.min(heaviestStartDay + 6, 31),
      total: maxTotal
    };
  };

  const heaviestWeek = calculateHeaviestWeek();

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Create array of days 1-31
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 w-full">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Billing Timeline</h3>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2 mb-6">
        {days.map((day) => (
          <DayCell
            key={day}
            day={day}
            subscriptions={billingDays[day] || []}
            isHovered={hoveredDay === day}
            onMouseEnter={() => setHoveredDay(day)}
            onMouseLeave={() => setHoveredDay(null)}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-amber-200 dark:bg-amber-900/50 rounded"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Single charge</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-200 dark:bg-red-900/50 rounded"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Multiple charges</span>
        </div>
      </div>

      {/* Heaviest Week Callout */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800/50 rounded-lg p-4">
        <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">Heaviest Week</p>
        <p className="text-lg font-bold text-gray-900 dark:text-white">
          {heaviestWeek.startDay}{getOrdinalSuffix(heaviestWeek.startDay)} - {heaviestWeek.endDay}{getOrdinalSuffix(heaviestWeek.endDay)}
        </p>
        <p className="text-sm text-blue-600 dark:text-blue-400">
          {formatCurrency(heaviestWeek.total)} in total charges
        </p>
      </div>
    </div>
  );
}