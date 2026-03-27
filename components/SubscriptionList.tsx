'use client';

import { useState, useEffect } from 'react';
import { useSubscriptionStore } from '@/lib/store';
import SubscriptionCard from '@/components/SubscriptionCard';

const CATEGORIES = [
  { id: 'all', name: 'All' },
  { id: 'Entertainment', name: 'Entertainment' },
  { id: 'Software', name: 'Software' },
  { id: 'Health', name: 'Health' },
  { id: 'Utilities', name: 'Utilities' },
  { id: 'Food', name: 'Food' },
];

export default function SubscriptionList() {
  const filteredSubscriptions = useSubscriptionStore((state) => state.getFilteredSubscriptions());
  const setSearch = useSubscriptionStore((state) => state.setSearch);
  const setFilter = useSubscriptionStore((state) => state.setFilter);
  const currentCategory = useSubscriptionStore((state) => state.filters.category);
  const currentSearch = useSubscriptionStore((state) => state.filters.searchQuery);

  const [searchInput, setSearchInput] = useState(currentSearch);

  // Sync search input with store
  useEffect(() => {
    setSearchInput(currentSearch);
  }, [currentSearch]);

  // Handle search input changes with debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchInput);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchInput, setSearch]);

  // Sort subscriptions by cancelScore descending
  const sortedSubscriptions = [...filteredSubscriptions].sort(
    (a, b) => b.cancelScore - a.cancelScore
  );

  const handleCategoryChange = (categoryId: string | null) => {
    setFilter(categoryId === 'all' ? null : categoryId);
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Search subscriptions
            </label>
            <input
              type="text"
              id="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by merchant, category..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Category Filter */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Filter by category
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id === 'all' ? null : category.id)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    (category.id === 'all' && !currentCategory) || currentCategory === category.id
                      ? 'bg-blue-600 text-white dark:bg-blue-500'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Cards */}
      {sortedSubscriptions.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {sortedSubscriptions.map((subscription) => (
            <SubscriptionCard key={subscription.id} subscription={subscription} />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            {currentSearch || currentCategory
              ? 'No subscriptions match your filters.'
              : 'No subscriptions detected yet.'}
          </p>
        </div>
      )}
    </div>
  );
}