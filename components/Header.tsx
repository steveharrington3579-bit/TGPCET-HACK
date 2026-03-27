'use client';

import { useState, useCallback } from 'react';
import { Transaction } from '@/types';
import FileUpload from '@/components/FileUpload';
import { useSubscriptionStore } from '@/lib/store';

export default function Header() {
  const [showUpload, setShowUpload] = useState(false);
  const loadTransactions = useSubscriptionStore((state) => state.loadTransactions);
  const transactions = useSubscriptionStore((state) => state.transactions);

  const handleFileParsed = useCallback((transactions: Transaction[]) => {
    loadTransactions(transactions);
    setShowUpload(false);
  }, [loadTransactions]);

  const handleReset = useCallback(() => {
    // Clear the store by loading empty transactions
    loadTransactions([]);
    setShowUpload(true);
  }, [loadTransactions]);

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 text-red-500">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Subscription Slasher</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Cut your recurring expenses</p>
          </div>
        </div>

        {transactions.length > 0 ? (
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-red-500 dark:hover:bg-red-600"
          >
            Reset / Load New File
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setShowUpload(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            Upload File
          </button>
        )}
      </div>

      {showUpload && (
        <div className="mt-6 max-w-2xl mx-auto">
          <FileUpload onParsed={handleFileParsed} />
        </div>
      )}
    </header>
  );
}