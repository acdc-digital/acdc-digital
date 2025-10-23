/**
 * Whistleblower initialization component
 * 
 * Starts system health monitoring and sets up browser console utilities
 */

'use client';

import { useEffect } from 'react';
import { whistleblower } from '@/lib/services/monitoring/whistleblowerAgent';
import { initWhistleblowerConsole } from '@/lib/utils/whistleblowerConsole';

export function WhistleblowerInit() {
  useEffect(() => {
    // Start monitoring on mount (5 second check interval)
    whistleblower.startMonitoring(5000);

    // Initialize console utilities
    initWhistleblowerConsole(whistleblower);

    // Set up emergency event listeners
    whistleblower.on('emergency:shutdown', () => {
      console.error('🚨 EMERGENCY SHUTDOWN TRIGGERED');
      // Could trigger UI notifications here
    });

    // Cleanup on unmount
    return () => {
      whistleblower.stopMonitoring();
    };
  }, []);

  return null; // This is an invisible component
}
