# Project Debug Rules (Non-Obvious Only)

## State Debugging
- Zustand store state is reactive—use browser devtools to inspect `useSubscriptionStore.getState()`
- Derived getters (e.g., `getFilteredSubscriptions()`) are computed on each call—check if filters are applied correctly
- `slashedItems` array affects all getters—verify it's not causing unexpected filtering

## Subscription Detection Issues
- Detection requires 2+ transactions per merchant—single transactions are silently ignored
- Monthly pattern check: ANY interval 25-35 days qualifies (not all must match)
- Amount variation >10% causes rejection—check min/max amounts in transaction group
- Cancel scores are calculated AFTER all subscriptions detected—category counts include all subscriptions

## Merchant Normalization Debugging
- Pattern replacements run FIRST and break on first match—order matters in `PATTERN_REPLACEMENTS`
- `MERCHANT_MAP` lookup uses fuzzy matching (`includes()` both ways)—may match unexpected merchants
- Category assignment uses keyword matching—check `CATEGORY_KEYWORDS` for correct category

## File Parsing Issues
- CSV parsing requires `header: true` in PapaParse config—missing headers cause silent failures
- JSON format accepts both array and `{ transactions: [] }`—other structures throw errors
- Date normalization converts to ISO format—invalid dates return original string (no error thrown)
- Amount parsing uses `parseFloat()`—non-numeric values default to 0 (filtered out)

## Currency & Formatting
- All amounts in INR—don't assume USD formatting
- `Intl.NumberFormat` with `en-IN` locale used for currency display
- Price spike detection: 5% threshold (not configurable)

## Dark Mode
- Uses class-based dark mode (not media query)
- `suppressHydrationWarning` required on `<html>` tag to prevent hydration mismatch
