/**
 * Demo Store Initializer
 * Call this on app startup to seed demo data
 */

import { useDemoLogsStore } from './demoLogsStore';
import { useDemoForecastStore } from './demoForecastStore';
import { useDemoFeedStore } from './demoFeedStore';
import { useDemoTemplatesStore } from './demoTemplatesStore';

export const initializeDemoStores = () => {
  // Check if already initialized (has data)
  const logsStore = useDemoLogsStore.getState();
  const forecastStore = useDemoForecastStore.getState();
  const feedStore = useDemoFeedStore.getState();
  const templatesStore = useDemoTemplatesStore.getState();

  if (logsStore.logs.length === 0) {
    console.log('[Demo] Seeding logs data...');
    logsStore.seedDemoData();
  }

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
