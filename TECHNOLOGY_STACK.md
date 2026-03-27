# Technology Stack - Subscription Slasher Dashboard

## Overview
Subscription Slasher Dashboard is a Next.js 14 web application that detects recurring subscriptions from transaction data and helps users identify wasteful spending. The application analyzes bank transaction exports (CSV/JSON) to automatically detect subscription patterns and provide actionable insights.

---

## Core Framework

### Next.js 14.2.3
- **Purpose**: Full-stack React framework for server-side rendering and static site generation
- **Features Used**:
  - App Router (app directory structure)
  - Server Components
  - Client Components
  - API Routes
  - Built-in optimization (Image, Font, Script optimization)

### React 18
- **Purpose**: UI component library
- **Features Used**:
  - Hooks (useState, useEffect, useMemo, useCallback)
  - Context API
  - Concurrent Mode features
  - Server Components

### TypeScript 5
- **Purpose**: Static type checking for JavaScript
- **Benefits**:
  - Type safety across the application
  - Better IDE support and IntelliSense
  - Reduced runtime errors
  - Enhanced code maintainability

---

## State Management

### Zustand 4.5.7
- **Purpose**: Lightweight state management library
- **Features Used**:
  - Global store for application state
  - Derived getters (computed on-demand)
  - Subscription tracking (slashed items)
  - Transaction and subscription data management
- **Implementation**: [`lib/store.ts`](lib/store.ts)

---

## Styling & UI

### Tailwind CSS 3.4.1
- **Purpose**: Utility-first CSS framework
- **Features Used**:
  - Responsive design utilities
  - Dark mode support
  - Custom color palette
  - JIT (Just-In-Time) compilation
- **Configuration**: [`tailwind.config.ts`](tailwind.config.ts)

### PostCSS 8
- **Purpose**: CSS transformation tool
- **Plugins**:
  - Autoprefixer (vendor prefixes)
  - Tailwind CSS integration
- **Configuration**: [`postcss.config.js`](postcss.config.js)

### Autoprefixer 10
- **Purpose**: Automatically adds vendor CSS prefixes
- **Benefits**: Cross-browser compatibility

---

## Data Visualization

### Recharts 2.15.4
- **Purpose**: Composable charting library built on React components
- **Charts Used**:
  - Category distribution charts
  - Timeline visualizations
  - Analytics dashboards
- **Components**: [`components/CategoryChart.tsx`](components/CategoryChart.tsx), [`components/TimelineView.tsx`](components/TimelineView.tsx)

---

## Data Processing

### PapaParse 5.5.3
- **Purpose**: Fast, in-browser CSV parser
- **Features Used**:
  - CSV file parsing with headers
  - Automatic type detection
  - Streaming support for large files
- **Implementation**: [`lib/parser.ts`](lib/parser.ts)

---

## Theme Management

### next-themes 0.4.6
- **Purpose**: Dark mode and theme management for Next.js
- **Features Used**:
  - System preference detection
  - Manual theme switching
  - Persistent theme storage
  - Class-based dark mode
- **Implementation**: [`app/layout.tsx`](app/layout.tsx)

---

## Application Architecture

### Core Modules

#### Subscription Detection Engine
- **File**: [`lib/detect.ts`](lib/detect.ts)
- **Purpose**: Analyzes transactions to identify recurring subscription patterns
- **Algorithm Features**:
  - Monthly pattern detection (25-35 day intervals)
  - Amount consistency analysis (max 10% variation)
  - Cancel score calculation
  - Merchant normalization

#### Merchant Normalization
- **File**: [`lib/normalize.ts`](lib/normalize.ts)
- **Purpose**: Standardizes merchant names and categorizes transactions
- **Features**:
  - Pattern-based name normalization
  - Canonical merchant name mapping
  - Category keyword matching
  - INR currency formatting

#### Data Parsing
- **File**: [`lib/parser.ts`](lib/parser.ts)
- **Purpose**: Parses transaction data from CSV and JSON formats
- **Features**:
  - Auto-detection by file extension
  - Date normalization (ISO format)
  - Amount parsing
  - Error handling

---

## Component Architecture

### Dashboard Components
- **FileUpload**: [`components/FileUpload.tsx`](components/FileUpload.tsx) - Transaction file upload interface
- **SubscriptionList**: [`components/SubscriptionList.tsx`](components/SubscriptionList.tsx) - List of detected subscriptions
- **SubscriptionCard**: [`components/SubscriptionCard.tsx`](components/SubscriptionCard.tsx) - Individual subscription details
- **KPICards**: [`components/KPICards.tsx`](components/KPICards.tsx) - Key performance indicators
- **AnalyticsPanel**: [`components/AnalyticsPanel.tsx`](components/AnalyticsPanel.tsx) - Analytics dashboard
- **SavingsPanel**: [`components/SavingsPanel.tsx`](components/SavingsPanel.tsx) - Potential savings calculator
- **WasteCalculator**: [`components/WasteCalculator.tsx`](components/WasteCalculator.tsx) - Waste analysis tool
- **AIAdvisor**: [`components/AIAdvisor.tsx`](components/AIAdvisor.tsx) - AI-powered recommendations
- **Header**: [`components/Header.tsx`](components/Header.tsx) - Application header with navigation

---

## Configuration Files

### TypeScript Configuration
- **File**: [`tsconfig.json`](tsconfig.json)
- **Features**:
  - Path aliases (`@/*` for imports)
  - Strict mode enabled
  - ES2017 target
  - Next.js plugin integration

### Next.js Configuration
- **File**: [`next.config.mjs`](next.config.mjs) (implicit)
- **Features**:
  - App Router enabled
  - Image optimization
  - Font optimization

---

## Development Tools

### ESLint
- **Purpose**: Code linting and style enforcement
- **Integration**: Built-in Next.js linting (`npm run lint`)

### TypeScript Compiler
- **Purpose**: Type checking and compilation
- **Configuration**: Strict mode with comprehensive type definitions

---

## Currency & Localization

### Indian Rupee (INR) Support
- **Locale**: `en-IN`
- **Formatting**: Indian number system (lakhs, crores)
- **Implementation**: Native `Intl.NumberFormat` API

---

## Data Flow

1. **File Upload** → User uploads CSV/JSON transaction file
2. **Parsing** → [`lib/parser.ts`](lib/parser.ts) extracts transaction data
3. **Detection** → [`lib/detect.ts`](lib/detect.ts) identifies subscription patterns
4. **Normalization** → [`lib/normalize.ts`](lib/normalize.ts) standardizes merchant names
5. **State Management** → [`lib/store.ts`](lib/store.ts) stores and manages data
6. **Visualization** → Components render insights and recommendations

---

## Performance Optimizations

- **Server Components**: Reduce client-side JavaScript bundle
- **On-Demand Computation**: Derived getters computed only when accessed
- **Lazy Loading**: Components loaded as needed
- **Memoization**: React.memo and useMemo for expensive computations
- **Optimized Parsing**: Efficient CSV/JSON parsing algorithms

---

## Browser Compatibility

- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **Mobile**: Responsive design for all screen sizes
- **Dark Mode**: System preference detection and manual toggle

---

## Build & Deployment

### Scripts
- `npm run dev` - Start development server
- `npm run build` - Production build
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Build Output
- Static and server-rendered pages
- Optimized JavaScript bundles
- CSS extraction and minification
- Image optimization

---

## Version Summary

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14.2.3 | Full-stack framework |
| React | 18 | UI library |
| TypeScript | 5 | Type safety |
| Tailwind CSS | 3.4.1 | Styling |
| Zustand | 4.5.7 | State management |
| Recharts | 2.15.4 | Data visualization |
| PapaParse | 5.5.3 | CSV parsing |
| next-themes | 0.4.6 | Theme management |
| PostCSS | 8 | CSS processing |
| Autoprefixer | 10 | Vendor prefixes |

---

## Future Considerations

- **Testing**: Jest, React Testing Library, Cypress
- **API Integration**: Backend service for persistent storage
- **Authentication**: User accounts and data privacy
- **Export Features**: PDF reports, Excel exports
- **Mobile App**: React Native implementation
- **AI Integration**: Enhanced subscription detection with ML models
