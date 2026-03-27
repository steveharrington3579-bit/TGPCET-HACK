'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useSubscriptionStore } from '@/lib/store';
import Header from '@/components/Header';
import KPICards from '@/components/KPICards';
import FileUpload from '@/components/FileUpload';
import SubscriptionList from '@/components/SubscriptionList';
import AnalyticsPanel from '@/components/AnalyticsPanel';
import TimelineView from '@/components/TimelineView';
import WasteCalculator from '@/components/WasteCalculator';
import AIAdvisor from '@/components/AIAdvisor';
import SavingsPanel from '@/components/SavingsPanel';
import { Transaction } from '@/types';

export default function DashboardPage() {
  const transactions = useSubscriptionStore((state) => state.transactions);
  const loadTransactions = useSubscriptionStore((state) => state.loadTransactions);
  const [isLoadingSample, setIsLoadingSample] = useState(false);
  const [hasLoadedSample, setHasLoadedSample] = useState(false);

  // Load sample data on first visit if no transactions exist
  useEffect(() => {
    if (transactions.length === 0 && !isLoadingSample && !hasLoadedSample) {
      setIsLoadingSample(true);
      setHasLoadedSample(true);
      // Try to load sample data from the data directory
      fetch('/data/transactions.json')
        .then(response => {
          if (response.ok) {
            return response.json();
          }
          throw new Error('Sample data not found');
        })
        .then(data => {
          loadTransactions(data);
        })
        .catch(() => {
          // Sample data not available, show upload component
        })
        .finally(() => {
          setIsLoadingSample(false);
        });
    }
  }, [transactions.length, loadTransactions, isLoadingSample, hasLoadedSample]);

  const handleFileParsed = useCallback((parsedTransactions: Transaction[]) => {
    loadTransactions(parsedTransactions);
  }, [loadTransactions]);

  // Memoize the loading state
  const isLoading = useMemo(() => isLoadingSample, [isLoadingSample]);

  if (transactions.length === 0 && !isLoadingSample) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Welcome to Subscription Slasher
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Upload your transaction data to identify and manage recurring subscriptions
            </p>
            <FileUpload onParsed={handleFileParsed} isLoading={isLoading} />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top row: KPI Cards (full width) */}
        <div className="mb-8">
          <KPICards />
        </div>

        {/* Second row: Subscription List (60%) | Analytics Panel (40%) */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
          <div className="lg:col-span-3">
            <SubscriptionList />
          </div>
          <div className="lg:col-span-2">
            <AnalyticsPanel />
          </div>
        </div>

        {/* Third row: Timeline View (50%) | Waste Calculator (50%) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div>
            <TimelineView />
          </div>
          <div>
            <WasteCalculator />
          </div>
        </div>

        {/* Fourth row: AI Advisor (60%) | Savings Panel (40%) */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <AIAdvisor />
          </div>
          <div className="lg:col-span-2">
            <SavingsPanel />
          </div>
        </div>
      </main>
    </div>
  );
}