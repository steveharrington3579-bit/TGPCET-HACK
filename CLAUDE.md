# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

- `npm run dev` - Start the Next.js development server
- `npm run build` - Build the production application
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint for code quality checks

## Project Overview

Subscription Slasher Dashboard is a Next.js 14 web application that analyzes bank transaction data (CSV/JSON) to automatically detect recurring subscriptions and identify wasteful spending patterns. The application provides actionable insights through visual analytics, AI-powered recommendations, and savings calculations.

## Core Architecture

### Framework Stack
- **Next.js 14.2.3** with App Router architecture
- **React 18** with Server Components and Client Components
- **TypeScript 5** with strict type checking
- **Tailwind CSS 3.4.1** for styling with dark mode support via next-themes

### State Management
- **Zustand 4.5.7** for global state management
- Single store pattern in `lib/store.ts` managing:
  - Transaction data from uploaded files
  - Detected subscriptions with cancel scores
  - User interactions (slashed items, filters, search)
  - Derived getters for analytics calculations

### Data Processing Pipeline
1. **File Upload**: Users upload CSV/JSON transaction files via `components/FileUpload.tsx`
2. **Parsing**: `lib/parser.ts` handles format detection and parsing using PapaParse for CSV
3. **Detection**: `lib/detect.ts` identifies subscription patterns using:
   - Monthly interval detection (25-35 day cycles)
   - Amount consistency analysis (max 10% variation)
   - Cancel score calculation based on cost, price increases, category overlap, etc.
4. **Normalization**: `lib/normalize.ts` standardizes merchant names and categorizes transactions
5. **State Storage**: Results stored in Zustand store for UI consumption

### Key Components Structure
- **Dashboard Layout**: `app/page.tsx` orchestrates the main dashboard with grid-based component layout
- **Data Components**:
  - `components/SubscriptionList.tsx` - Primary subscription display
  - `components/KPICards.tsx` - Key metrics overview
  - `components/AnalyticsPanel.tsx` - Category breakdown visualization
- **Analysis Tools**:
  - `components/SavingsPanel.tsx` - Savings projection
  - `components/AIAdvisor.tsx` - AI recommendations
  - `components/TimelineView.tsx` - Temporal visualization
- **Utilities**: `components/Header.tsx`, `components/FileUpload.tsx`

### Data Models
- **Transaction**: Basic transaction record with id, date, merchant, amount
- **Subscription**: Detected subscription with monthlyCost, billingCycle, cancelScore, priceHistory
- **Category**: Aggregated spend data by category for analytics

### Currency and Localization
- Indian Rupee (INR) focused with `en-IN` locale
- Uses native `Intl.NumberFormat` API for currency formatting
- Supports Indian number system (lakhs, crores)

## Development Guidelines

### File Structure Conventions
- Use absolute imports with `@/` alias (configured in tsconfig.json)
- Place utility functions in `lib/` directory
- Components follow single-responsibility principle in `components/`
- Types defined in `types/index.ts`

### Performance Considerations
- Leverage Server Components where possible to reduce client bundle size
- Use React.memo and useMemo for expensive computations
- Derived getters in Zustand store are computed on-demand
- PapaParse worker mode enabled for large file handling

### Testing Approach
- No existing test framework configured (future consideration: Jest + React Testing Library)
- Manual testing through development server is current practice

## Important Implementation Details

### Subscription Detection Logic
- Requires minimum 2 transactions per merchant
- Monthly pattern: any interval between 25-35 days triggers subscription classification
- Amount consistency: max 10% variation allowed
- Cancel scoring factors: high cost (>500 INR = +30), price increases (>5% = +25), category overlap (+20), entertainment category (+15), low occurrences (<3 = +10)

### Merchant Normalization
- Pattern-based replacements for common services (Netflix, Spotify, AWS, etc.)
- Suffix removal (Ltd, Inc, Co, etc.)
- Category mapping based on keyword matching
- Canonical name mapping for consistent display

### Theme Management
- Uses next-themes with class-based dark mode
- System preference detection with manual override capability
- Tailwind CSS configured for dark mode variants