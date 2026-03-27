'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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
    default:
      return '#6b7280'; // gray-500
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
      </div>
    );
  }
  return null;
};

export default function CategoryChart() {
  const categoryBreakdown = useSubscriptionStore((state) => state.getCategoryBreakdown());

  // Format data for Recharts
  const chartData = categoryBreakdown.map(category => ({
    name: category.name,
    totalSpend: category.totalSpend,
    color: getCategoryColor(category.name)
  }));

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
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Category Breakdown</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid horizontal={true} vertical={false} strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              type="number"
              tickFormatter={(value) => formatCurrency(value).replace('₹', '')}
              tick={{ fill: '#6b7280' }}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: '#6b7280' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="totalSpend"
              radius={[0, 4, 4, 0]}
              fill="#8884d8"
            >
              {chartData.map((entry, index) => (
                <rect key={`bar-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}