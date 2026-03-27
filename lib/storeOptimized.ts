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
  isLoading: boolean;
  error: string | null;

  // Actions
  loadTransactions: (transactions: Transaction[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  slashSubscription: (id: string) => void;
  unslashSubscription: (id: string) => void;
  setFilter: (category: string | null) => void;
  setSearch: (searchQuery: string) => void;
  clearAll: () => void;

  // Derived getters (memoized in components)
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
  isLoading: false,
  error: null,

  // Actions
  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  setError: (error) => {
    set({ error });
  },

  loadTransactions: (transactions: Transaction[]) => {
    // Prevent unnecessary updates if data is the same
    const currentTransactions = get().transactions;
    if (
      currentTransactions.length === transactions.length &&
      currentTransactions.every((t, i) =>
        t.id === transactions[i].id &&
        t.date === transactions[i].date &&
        t.merchant === transactions[i].merchant &&
        t.amount === transactions[i].amount
      )
    ) {
      return; // No change, skip update
    }

    // Store raw transactions
    set({ transactions });

    // Auto-run detectSubscriptions() and store results
    const detectedSubscriptions = detectSubscriptions(transactions);
    set({ subscriptions: detectedSubscriptions });
  },

  clearAll: () => {
    set({
      transactions: [],
      subscriptions: [],
      filters: { category: null, searchQuery: '' },
      slashedItems: [],
      isLoading: false,
      error: null,
    });
  },

  slashSubscription: (id: string) => {
    set((state) => {
      if (state.slashedItems.includes(id)) {
        return state; // Already slashed, no change needed
      }
      return {
        slashedItems: [...state.slashedItems, id],
      };
    });
  },

  unslashSubscription: (id: string) => {
    set((state) => {
      const newSlashedItems = state.slashedItems.filter((itemId) => itemId !== id);
      if (newSlashedItems.length === state.slashedItems.length) {
        return state; // No change needed
      }
      return { slashedItems: newSlashedItems };
    });
  },

  setFilter: (category: string | null) => {
    set((state) => {
      if (state.filters.category === category) {
        return state; // No change needed
      }
      return {
        filters: {
          ...state.filters,
          category,
        },
      };
    });
  },

  setSearch: (searchQuery: string) => {
    set((state) => {
      if (state.filters.searchQuery === searchQuery) {
        return state; // No change needed
      }
      return {
        filters: {
          ...state.filters,
          searchQuery,
        },
      };
    });
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