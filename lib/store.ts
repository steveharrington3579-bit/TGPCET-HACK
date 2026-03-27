import { create } from 'zustand';
import { Transaction, Subscription, Category } from '@/types';
import { detectSubscriptions } from '@/lib/detect';

interface SubscriptionStore {
  // State
  transactions: Transaction[];
  subscriptions: Subscription[];
  filters: {
    category: string | null;
    searchQuery: string;
  };
  slashedItems: string[];

  // Actions
  loadTransactions: (transactions: Transaction[]) => void;
  slashSubscription: (id: string) => void;
  unslashSubscription: (id: string) => void;
  setFilter: (category: string | null) => void;
  setSearch: (searchQuery: string) => void;

  // Derived getters
  getFilteredSubscriptions: () => Subscription[];
  getTotalMonthlySpend: () => number;
  getMonthlySavings: () => number;
  getAnnualWaste: () => number;
  getCategoryBreakdown: () => Category[];
}

export const useSubscriptionStore = create<SubscriptionStore>((set, get) => ({
  // Initial state
  transactions: [],
  subscriptions: [],
  filters: {
    category: null,
    searchQuery: '',
  },
  slashedItems: [],

  // Actions
  loadTransactions: (transactions: Transaction[]) => {
    // Store raw transactions
    set({ transactions });

    // Auto-run detectSubscriptions() and store results
    const detectedSubscriptions = detectSubscriptions(transactions);
    set({ subscriptions: detectedSubscriptions });

    // Note: getCategoryBreakdown() is computed on-demand in the getter
    // since it's derived from the current subscriptions state
  },

  slashSubscription: (id: string) => {
    set((state) => ({
      slashedItems: [...state.slashedItems, id],
    }));
  },

  unslashSubscription: (id: string) => {
    set((state) => ({
      slashedItems: state.slashedItems.filter((itemId) => itemId !== id),
    }));
  },

  setFilter: (category: string | null) => {
    set((state) => ({
      filters: {
        ...state.filters,
        category,
      },
    }));
  },

  setSearch: (searchQuery: string) => {
    set((state) => ({
      filters: {
        ...state.filters,
        searchQuery,
      },
    }));
  },

  // Derived getters
  getFilteredSubscriptions: () => {
    const { subscriptions, filters, slashedItems } = get();
    const { category, searchQuery } = filters;

    let filtered = subscriptions.filter(sub => !slashedItems.includes(sub.id));

    // Apply category filter
    if (category) {
      filtered = filtered.filter(sub => sub.category === category);
    }

    // Apply search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        sub =>
          sub.merchantName.toLowerCase().includes(query) ||
          sub.normalizedName.toLowerCase().includes(query) ||
          sub.category.toLowerCase().includes(query)
      );
    }

    return filtered;
  },

  getTotalMonthlySpend: () => {
    const { getFilteredSubscriptions } = get();
    const filteredSubscriptions = getFilteredSubscriptions();

    return filteredSubscriptions.reduce((total, sub) => total + sub.monthlyCost, 0);
  },

  getMonthlySavings: () => {
    const { getFilteredSubscriptions, slashedItems } = get();
    const filteredSubscriptions = getFilteredSubscriptions();

    return filteredSubscriptions
      .filter(sub => slashedItems.includes(sub.id))
      .reduce((total, sub) => total + sub.monthlyCost, 0);
  },

  getAnnualWaste: () => {
    const { getFilteredSubscriptions, slashedItems } = get();
    const filteredSubscriptions = getFilteredSubscriptions();

    return filteredSubscriptions
      .filter(sub => !slashedItems.includes(sub.id))
      .reduce((total, sub) => total + (sub.monthlyCost * 12), 0);
  },

  getCategoryBreakdown: () => {
    const { subscriptions } = get();

    const categoryMap = new Map<string, number>();

    // Calculate total spend per category
    subscriptions.forEach(sub => {
      const currentTotal = categoryMap.get(sub.category) || 0;
      categoryMap.set(sub.category, currentTotal + sub.monthlyCost);
    });

    // Convert to Category array
    const categories: Category[] = Array.from(categoryMap.entries()).map(([name, totalSpend]) => ({
      name,
      totalSpend,
    }));

    // Sort by total spend descending
    return categories.sort((a, b) => b.totalSpend - a.totalSpend);
  },
}));