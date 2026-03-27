# Project Documentation Rules (Non-Obvious Only)

## Architecture Overview
- Zustand store in [`lib/store.ts`](lib/store.ts) manages all state—no React Context used
- Subscription detection runs automatically in `loadTransactions()`—don't call `detectSubscriptions()` separately
- Derived getters (e.g., `getFilteredSubscriptions()`) compute on-demand—no caching layer

## Key Business Logic
- Subscription detection: 2+ transactions, monthly pattern (25-35 day intervals), max 10% amount variation
- Cancel score calculation: +30 for >500 INR, +25 for price spike >5%, +20 for duplicate category, +15 for Entertainment, +10 for <3 occurrences
- Merchant normalization: pattern replacements → suffix removal → category assignment

## Data Flow
1. File upload → [`parseTransactions()`](lib/parser.ts:89) → raw transactions
2. `loadTransactions()` → [`detectSubscriptions()`](lib/detect.ts:76) → subscriptions array
3. Store getters filter/aggregate subscriptions based on `filters` and `slashedItems`

## Currency & Locale
- All amounts in INR (Indian Rupees)—not USD
- Formatted with `en-IN` locale using `Intl.NumberFormat`
- Price spike threshold: 5% increase (hardcoded)

## File Format Support
- CSV: requires headers, uses PapaParse
- JSON: accepts array or `{ transactions: [] }` format
- Date normalization: converts to ISO format (YYYY-MM-DD)

## Path Aliases
- `@/*` maps to project root (e.g., `@/lib/store`, `@/types`)
- Configured in [`tsconfig.json`](tsconfig.json:20-22)

## Dark Mode
- Class-based approach via next-themes
- `suppressHydrationWarning` on `<html>` tag prevents hydration mismatch
