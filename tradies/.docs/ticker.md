# Ticker
URL: /components/finance/ticker
Composable financial ticker components for React and Next.js applications. Built with TypeScript support, Tailwind CSS styling, and shadcn/ui design for professional stock prices, currency rates, and market data visualization.

***

title: Ticker
description: Composable financial ticker components for React and Next.js applications. Built with TypeScript support, Tailwind CSS styling, and shadcn/ui design for professional stock prices, currency rates, and market data visualization.
icon: DollarSign
----------------

<Preview path="ticker" />

## Installation

<Installer packageName="ticker" />

## Features

* **Flexible composition** offering optional icon, symbol, price, and change components for React financial interfaces
* **Color-coded indicators** displaying up/down price changes with percentage formatting using Tailwind CSS utilities
* **International support** featuring ISO 4217 currencies and IETF BCP 47 locales for Next.js applications
* **Smart fallbacks** providing automatic icon-to-symbol fallback when sources are invalid using TypeScript safety
* **Responsive layouts** adapting ticker displays across device sizes with mobile-friendly design using shadcn/ui components
* **Real-time updates** supporting dynamic price changes and market data refresh with JavaScript state management
* **Accessibility compliant** including screen reader support, keyboard navigation, and semantic markup
* **Open source freedom** providing unlimited use for financial applications without licensing restrictions

## Examples

### With percentage change

<Preview path="ticker-percent" />

### Currencies and locales

<Preview path="ticker-currency" />

### Icon fallback to symbol

<Preview path="ticker-fallback" />

### Inline usage

<Preview path="ticker-inline" />

## Use Cases

This free open source React component works well for:

* **Trading platforms** - Displaying real-time stock prices and market data with color-coded changes for Next.js applications
* **Financial dashboards** - Showing portfolio performance and asset prices with responsive layouts using TypeScript safety
* **Cryptocurrency exchanges** - Presenting digital asset prices with percentage changes using Tailwind CSS styling
* **Banking applications** - Displaying currency rates and exchange information with international locale support using shadcn/ui
* **Investment apps** - Showing market indices and stock performance with professional ticker displays for JavaScript applications
* **Financial news sites** - Embedding market data and price tickers with accessible design and mobile optimization

## Implementation Notes

* **Composable architecture** using React component composition for flexible ticker layouts and content organization
* **Color-coded styling** leveraging Tailwind CSS utilities for automatic red/green price change indicators
* **Internationalization** supporting ISO 4217 currency codes and IETF BCP 47 locale formatting with proper number display
* **TypeScript integration** ensuring type safety for financial data structures, price formatting, and locale handling
* **Fallback mechanisms** implementing smart icon-to-symbol fallback with error handling for missing assets
* **shadcn/ui theming** using design tokens for consistent styling across financial ticker interfaces
* **Performance optimized** with efficient rendering and minimal re-renders for real-time price updates

---
'use client';
import {
  Ticker,
  TickerIcon,
  TickerPrice,
  TickerPriceChange,
  TickerSymbol,
} from '@/components/ui/shadcn-io/ticker';
const Example = () => (
  <Ticker>
    <TickerIcon
      src="https://raw.githubusercontent.com/nvstly/icons/refs/heads/main/ticker_icons/GOOG.png"
      symbol="GOOG"
    />
    <TickerSymbol symbol="GOOG" />
    <TickerPrice price={175.41} />
    <TickerPriceChange change={2.13} />
  </Ticker>
);
export default Example;
---