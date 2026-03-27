# Project Architecture Rules (Non-Obvious Only)

## State Management Architecture
- Zustand store with derived getters—no separate selectors or memoization
- `loadTransactions()` auto-runs detection—state mutation and detection are coupled
- `slashedItems` array affects all getters—implicit filtering layer

## Subscription Detection Pipeline
- Merchant grouping → interval analysis → amount validation → cancel scoring
- Detection is stateless—runs on every `loadTransactions()` call
- Cancel scores calculated AFTER all subscriptions detected—category counts are global

## Merchant Normalization Flow
- Pattern replacements (regex) → suffix removal → category assignment
- `MERCHANT_MAP` provides canonical names—fuzzy matching via `includes()` both ways
- Categories determined by keyword matching in `CATEGORY_KEYWORDS`—not hierarchical

## Data Flow Constraints
- File parsing → store → detection → getters (linear pipeline)
- No persistence layer—state resets on page reload
- Derived getters compute on each call—no caching or memoization

## Currency & Locale
- INR (Indian Rupees) only—hardcoded in formatting functions
- `Intl.NumberFormat` with `en-IN` locale
- Price spike threshold: 5% (hardcoded in detection)

## File Format Support
- CSV: requires headers, uses PapaParse with `header: true`
- JSON: accepts array or `{ transactions: [] }` format
- Date normalization: converts to ISO format (YYYY-MM-DD)

## Path Aliases
- `@/*` maps to project root
- Configured in [`tsconfig.json`](tsconfig.json:20-22)

## Dark Mode
- Class-based approach via next-themes
- `suppressHydrationWarning` on `<html>` tag required
