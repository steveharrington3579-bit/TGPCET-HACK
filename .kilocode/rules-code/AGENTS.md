# Project Coding Rules (Non-Obvious Only)

## State Management
- Store getters (e.g., `getFilteredSubscriptions()`) are computed on-demand—don't cache results
- `loadTransactions()` auto-runs detection—never call `detectSubscriptions()` separately
- `slashedItems` array tracks cancelled subscriptions; getters automatically exclude them

## Subscription Detection
- Requires 2+ transactions per merchant to detect subscription
- Monthly pattern: ANY interval between 25-35 days (not all intervals must match)
- Amount consistency: max 10% variation between min/max charges
- Cancel score: +30 for >500 INR, +25 for price spike >5%, +20 for duplicate category, +15 for Entertainment, +10 for <3 occurrences

## Merchant Normalization
- Pattern replacements run FIRST (e.g., `/nflx/i` → `'netflix'`)
- `MERCHANT_MAP` provides canonical display names (e.g., `'netflix'` → `'Netflix'`)
- Categories determined by keyword matching in `CATEGORY_KEYWORDS`

## Currency & Locale
- All amounts in INR (Indian Rupees), formatted with `en-IN` locale
- Price spike detection threshold: 5% increase

## File Parsing
- Auto-detects CSV/JSON by file extension
- CSV uses PapaParse with header:true
- JSON accepts both array and `{ transactions: [] }` format
- Date normalization: converts to ISO format (YYYY-MM-DD)

## Path Aliases
- Use `@/*` for imports (e.g., `@/lib/store`, `@/types`)
- Configured in [`tsconfig.json`](tsconfig.json:20-22)

## Dark Mode
- Uses next-themes with class-based approach
- `suppressHydrationWarning` on `<html>` tag required
