/**
 * Window type extensions for Whistleblower monitoring
 */

import { WhistleblowerAgent } from '../services/monitoring/whistleblowerAgent';

declare global {
  interface Performance {
    memory?: {
      usedJSHeapSize: number;
      totalJSHeapSize: number;
      jsHeapSizeLimit: number;
    };
  }

  interface Window {
    __whistleblower?: WhistleblowerAgent;
    whistleblower?: {
      status(): void;
      history(): void;
      check(): void;
      reset(): void;
      help(): void;
    };
  }
}

export {};
