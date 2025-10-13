// ENABLE BLOOMBERG TRADING MODE
// Quick utility to enable trading mode on host agent

import { useHostAgentStore } from '@/lib/stores/host/hostAgentStore';

/**
 * Enable Bloomberg Trading Mode
 * 
 * This switches the host agent to Bloomberg analyst mode with:
 * - 480 WPM streaming (50% faster)
 * - NASDAQ-100 focus
 * - Ultra-concise, data-packed narration
 * - Automatic market-moving news detection
 */
export function enableBloombergMode() {
  const store = useHostAgentStore.getState();
  
  console.log('📊 Enabling Bloomberg Trading Mode...');
  
  // Enable trading mode
  store.enableTradingMode();
  
  console.log('✅ Bloomberg mode enabled!');
  console.log('   - Streaming: 480 WPM (fast)');
  console.log('   - Focus: NASDAQ-100 companies');
  console.log('   - Style: Ultra-concise, data-packed');
  console.log('   - Auto-narrates market-moving news');
  
  return true;
}

/**
 * Disable Bloomberg Trading Mode
 * 
 * This reverts the host agent to standard mode with:
 * - 314 WPM streaming (professional)
 * - General news focus
 * - Standard verbosity
 */
export function disableBloombergMode() {
  const store = useHostAgentStore.getState();
  
  console.log('📴 Disabling Bloomberg Trading Mode...');
  
  // Disable trading mode
  store.disableTradingMode();
  
  console.log('✅ Standard mode enabled');
  console.log('   - Streaming: 314 WPM (professional)');
  console.log('   - Focus: General news');
  console.log('   - Style: Standard verbosity');
  
  return true;
}

/**
 * Get Bloomberg Mode Status
 */
export function getBloombergStatus() {
  const store = useHostAgentStore.getState();
  const stats = store.getTradingStats();
  
  return {
    enabled: store.tradingMode,
    stats: stats ? {
      activeTickers: stats.activeTickers,
      topTickers: stats.topMentionedTickers.slice(0, 5),
      topSectors: stats.sectorMomentum.slice(0, 5)
    } : null
  };
}

// For console debugging
if (typeof window !== 'undefined') {
  (window as typeof window & { bloomberg: unknown }).bloomberg = {
    enable: enableBloombergMode,
    disable: disableBloombergMode,
    status: getBloombergStatus
  };

  console.log('💡 Bloomberg mode utilities available:');
  console.log('   window.bloomberg.enable()  - Enable Bloomberg mode');
  console.log('   window.bloomberg.disable() - Disable Bloomberg mode');
  console.log('   window.bloomberg.status()  - Get current status');
}
