export interface Transaction {
  id: string;
  date: string; // ISO date string
  merchant: string;
  amount: number;
}

export interface Merchant {
  originalName: string;
  normalizedName: string;
  category: string;
}

export interface PriceHistoryEntry {
  date: string; // ISO date string
  amount: number;
}

export interface Subscription {
  id: string;
  merchantName: string;
  normalizedName: string;
  category: string;
  monthlyCost: number;
  billingCycle: 'monthly' | 'quarterly' | 'annual' | 'biennial';
  lastChargeDate: string; // ISO date string
  occurrences: number;
  priceHistory: PriceHistoryEntry[];
  cancelScore: number; // 0-100 score indicating likelihood to cancel
  isSlashed: boolean;
}

export interface Category {
  name: string;
  totalSpend: number;
}