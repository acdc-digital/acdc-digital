/**
 * Demo Store Initializer
 * Call this on app startup to seed demo data
 */

import { useDemoLogsStore } from './demoLogsStore';
import { useDemoForecastStore } from './demoForecastStore';
import { useDemoFeedStore } from './demoFeedStore';
import { useDemoTemplatesStore } from './demoTemplatesStore';

export const initializeDemoStores = () => {
  console.log('[initDemoStores] Starting initialization...');
  
  // Check if already initialized (has data)
  const logsStore = useDemoLogsStore.getState();
  const forecastStore = useDemoForecastStore.getState();
  const feedStore = useDemoFeedStore.getState();
  const templatesStore = useDemoTemplatesStore.getState();

  console.log('[initDemoStores] Current logs count:', logsStore.logs.length);

  // Always re-seed logs to get the new 2025 data
  console.log('[initDemoStores] Seeding logs data...');
  logsStore.seedDemoData();
  
  // Check after seeding
  const logsStoreAfter = useDemoLogsStore.getState();
  console.log('[initDemoStores] Logs count after seeding:', logsStoreAfter.logs.length);
  console.log('[initDemoStores] Sample logs after seeding:', logsStoreAfter.logs.slice(0, 2));

  if (forecastStore.forecasts.length === 0) {
    console.log('[Demo] Seeding forecast data...');
    forecastStore.seedDemoData();
  }

  if (feedStore.summaries.length === 0) {
    console.log('[Demo] Seeding feed data...');
    feedStore.seedDemoData();
  }

  if (templatesStore.templates.length === 0) {
    console.log('[Demo] Seeding templates data...');
    templatesStore.seedDemoData();
  }

  console.log('[Demo] Initialization complete!');
};

// Auto-initialize on import (client-side only)
if (typeof window !== 'undefined') {
  // Run after a short delay to ensure stores are ready
  setTimeout(() => {
    initializeDemoStores();
  }, 100);
}
