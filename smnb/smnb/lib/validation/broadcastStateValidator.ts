/**
 * Broadcast State Validation Agent
 * 
 * Automated state validation and health monitoring system.
 * Runs checks on the broadcast orchestrator and child stores to detect:
 * - Invalid state combinations
 * - State drift between stores
 * - Missing dependencies
 * - Performance issues
 * 
 * Usage:
 * - Run in development mode for automatic validation
 * - Use in tests for state assertion
 * - Enable in production for health monitoring
 */

import { useEffect } from 'react';
import { 
  useBroadcastOrchestrator,
  type BroadcastSnapshot 
} from '@/lib/stores/orchestrator/broadcastOrchestrator';

// ============================================================================
// TYPES
// ============================================================================

export type ValidationSeverity = 'error' | 'warning' | 'info';

export interface ValidationIssue {
  id: string;
  severity: ValidationSeverity;
  category: ValidationCategory;
  message: string;
  details?: string;
  timestamp: number;
  snapshot?: BroadcastSnapshot;
}

export type ValidationCategory = 
  | 'state_machine'      // FSM violations
  | 'dependency'         // Missing dependencies
  | 'synchronization'    // Store sync issues
  | 'performance'        // Performance concerns
  | 'configuration'      // Config issues
  | 'data_integrity';    // Data consistency

export interface ValidationReport {
  timestamp: number;
  duration: number;
  checksRun: number;
  issuesFound: number;
  issues: ValidationIssue[];
  snapshot: BroadcastSnapshot;
}

export interface ValidationRule {
  id: string;
  name: string;
  category: ValidationCategory;
  check: (snapshot: BroadcastSnapshot) => ValidationIssue | null;
}

// ============================================================================
// VALIDATION RULES
// ============================================================================

const VALIDATION_RULES: ValidationRule[] = [
  // ========================================================================
  // STATE MACHINE RULES
  // ========================================================================
  
  {
    id: 'SM001',
    name: 'Host must not be active in idle state',
    category: 'state_machine',
    check: (snapshot) => {
      if (snapshot.orchestrator.state === 'idle' && snapshot.host.isActive) {
        return {
          id: 'SM001',
          severity: 'error',
          category: 'state_machine',
          message: 'Host agent is active while orchestrator is in idle state',
          details: 'Host should be stopped when orchestrator is idle',
          timestamp: Date.now(),
          snapshot,
        };
      }
      return null;
    },
  },
  
  {
    id: 'SM002',
    name: 'Live feed must be active when broadcasting',
    category: 'state_machine',
    check: (snapshot) => {
      if (snapshot.orchestrator.state === 'live' && !snapshot.liveFeed.isLive) {
        return {
          id: 'SM002',
          severity: 'error',
          category: 'state_machine',
          message: 'Orchestrator is live but live feed is not active',
          details: 'Live feed must be active during broadcast',
          timestamp: Date.now(),
          snapshot,
        };
      }
      return null;
    },
  },
  
  {
    id: 'SM003',
    name: 'Producer should be active when broadcasting',
    category: 'state_machine',
    check: (snapshot) => {
      if (snapshot.orchestrator.state === 'live' && !snapshot.producer.isActive) {
        return {
          id: 'SM003',
          severity: 'warning',
          category: 'state_machine',
          message: 'Broadcasting without producer active',
          details: 'Producer should typically be active during broadcast',
          timestamp: Date.now(),
          snapshot,
        };
      }
      return null;
    },
  },
  
  {
    id: 'SM004',
    name: 'Session must be active when broadcasting',
    category: 'state_machine',
    check: (snapshot) => {
      if (snapshot.orchestrator.state === 'live' && !snapshot.session.isActive) {
        return {
          id: 'SM004',
          severity: 'error',
          category: 'state_machine',
          message: 'Broadcasting without active session',
          details: 'Broadcast session should be tracking broadcast duration',
          timestamp: Date.now(),
          snapshot,
        };
      }
      return null;
    },
  },
  
  // ========================================================================
  // DEPENDENCY RULES
  // ========================================================================
  
  {
    id: 'DEP001',
    name: 'Host agent must be initialized before ready state',
    category: 'dependency',
    check: (snapshot) => {
      if (snapshot.orchestrator.state === 'ready' && !snapshot.host.isInitialized) {
        return {
          id: 'DEP001',
          severity: 'error',
          category: 'dependency',
          message: 'Orchestrator is ready but host agent not initialized',
          details: 'Host agent must be initialized before ready state',
          timestamp: Date.now(),
          snapshot,
        };
      }
      return null;
    },
  },
  
  {
    id: 'DEP002',
    name: 'Content required before broadcast',
    category: 'dependency',
    check: (snapshot) => {
      if (snapshot.orchestrator.state === 'live' && !snapshot.liveFeed.hasContent) {
        return {
          id: 'DEP002',
          severity: 'error',
          category: 'dependency',
          message: 'Broadcasting without any content',
          details: 'Live feed has no posts to narrate',
          timestamp: Date.now(),
          snapshot,
        };
      }
      return null;
    },
  },
  
  {
    id: 'DEP003',
    name: 'Host active requires host initialized',
    category: 'dependency',
    check: (snapshot) => {
      if (snapshot.host.isActive && !snapshot.host.isInitialized) {
        return {
          id: 'DEP003',
          severity: 'error',
          category: 'dependency',
          message: 'Host is active but not initialized',
          details: 'This should be impossible - indicates store corruption',
          timestamp: Date.now(),
          snapshot,
        };
      }
      return null;
    },
  },
  
  // ========================================================================
  // SYNCHRONIZATION RULES
  // ========================================================================
  
  {
    id: 'SYNC001',
    name: 'Convex session should exist when syncing enabled',
    category: 'synchronization',
    check: (snapshot) => {
      if (
        snapshot.orchestrator.state === 'live' && 
        !snapshot.convex.sessionId &&
        // Assuming enableConvexSync is true by default
        true
      ) {
        return {
          id: 'SYNC001',
          severity: 'warning',
          category: 'synchronization',
          message: 'Broadcasting without Convex session',
          details: 'Consider providing session ID for backend sync',
          timestamp: Date.now(),
          snapshot,
        };
      }
      return null;
    },
  },
  
  {
    id: 'SYNC002',
    name: 'Host and session state should match',
    category: 'synchronization',
    check: (snapshot) => {
      const hostActive = snapshot.host.isActive;
      const sessionActive = snapshot.session.isActive;
      
      if (hostActive !== sessionActive) {
        return {
          id: 'SYNC002',
          severity: 'warning',
          category: 'synchronization',
          message: 'Host and session state mismatch',
          details: `Host: ${hostActive}, Session: ${sessionActive}`,
          timestamp: Date.now(),
          snapshot,
        };
      }
      return null;
    },
  },
  
  // ========================================================================
  // PERFORMANCE RULES
  // ========================================================================
  
  {
    id: 'PERF001',
    name: 'Host queue length reasonable',
    category: 'performance',
    check: (snapshot) => {
      if (snapshot.host.queueLength > 100) {
        return {
          id: 'PERF001',
          severity: 'warning',
          category: 'performance',
          message: 'Host narration queue is very long',
          details: `Queue length: ${snapshot.host.queueLength}. Consider rate limiting.`,
          timestamp: Date.now(),
          snapshot,
        };
      }
      return null;
    },
  },
  
  {
    id: 'PERF002',
    name: 'Broadcast session duration tracking',
    category: 'performance',
    check: (snapshot) => {
      const twoHours = 2 * 60 * 60 * 1000; // 2 hours in ms
      
      if (snapshot.session.isActive && snapshot.session.duration > twoHours) {
        return {
          id: 'PERF002',
          severity: 'info',
          category: 'performance',
          message: 'Long-running broadcast session detected',
          details: `Duration: ${Math.floor(snapshot.session.duration / 60000)} minutes`,
          timestamp: Date.now(),
          snapshot,
        };
      }
      return null;
    },
  },
  
  // ========================================================================
  // DATA INTEGRITY RULES
  // ========================================================================
  
  {
    id: 'DATA001',
    name: 'State transitions should be logged',
    category: 'data_integrity',
    check: (snapshot) => {
      if (
        snapshot.orchestrator.state !== 'idle' && 
        !snapshot.orchestrator.lastTransition
      ) {
        return {
          id: 'DATA001',
          severity: 'warning',
          category: 'data_integrity',
          message: 'No transition history available',
          details: 'State changed but no transition was recorded',
          timestamp: Date.now(),
          snapshot,
        };
      }
      return null;
    },
  },
];

// ============================================================================
// VALIDATION AGENT
// ============================================================================

export class BroadcastStateValidator {
  private static instance: BroadcastStateValidator;
  private validationHistory: ValidationReport[] = [];
  private issueCallbacks: Array<(issue: ValidationIssue) => void> = [];
  
  private constructor() {}
  
  static getInstance(): BroadcastStateValidator {
    if (!BroadcastStateValidator.instance) {
      BroadcastStateValidator.instance = new BroadcastStateValidator();
    }
    return BroadcastStateValidator.instance;
  }
  
  /**
   * Run all validation rules against current state
   */
  validate(): ValidationReport {
    const startTime = Date.now();
    const snapshot = useBroadcastOrchestrator.getState().getSnapshot();
    const issues: ValidationIssue[] = [];
    
    // Run all validation rules
    for (const rule of VALIDATION_RULES) {
      const issue = rule.check(snapshot);
      if (issue) {
        issues.push(issue);
        
        // Notify callbacks
        this.issueCallbacks.forEach(callback => callback(issue));
      }
    }
    
    const report: ValidationReport = {
      timestamp: startTime,
      duration: Date.now() - startTime,
      checksRun: VALIDATION_RULES.length,
      issuesFound: issues.length,
      issues,
      snapshot,
    };
    
    this.validationHistory.push(report);
    
    // Keep only last 100 reports
    if (this.validationHistory.length > 100) {
      this.validationHistory = this.validationHistory.slice(-100);
    }
    
    return report;
  }
  
  /**
   * Run validation and log results to console
   */
  validateAndLog(): ValidationReport {
    const report = this.validate();
    
    if (report.issuesFound > 0) {
      console.group(`🔍 State Validation: ${report.issuesFound} issue(s) found`);
      
      report.issues.forEach(issue => {
        const icon = issue.severity === 'error' ? '❌' : 
                     issue.severity === 'warning' ? '⚠️' : 'ℹ️';
        
        console.log(`${icon} [${issue.id}] ${issue.message}`);
        if (issue.details) {
          console.log(`   ${issue.details}`);
        }
      });
      
      console.groupEnd();
    } else {
      console.log('✅ State Validation: No issues found');
    }
    
    return report;
  }
  
  /**
   * Check for specific rule violations
   */
  checkRule(ruleId: string): ValidationIssue | null {
    const rule = VALIDATION_RULES.find(r => r.id === ruleId);
    if (!rule) {
      console.warn(`Validation rule ${ruleId} not found`);
      return null;
    }
    
    const snapshot = useBroadcastOrchestrator.getState().getSnapshot();
    return rule.check(snapshot);
  }
  
  /**
   * Get validation history
   */
  getHistory(limit?: number): ValidationReport[] {
    if (limit) {
      return this.validationHistory.slice(-limit);
    }
    return [...this.validationHistory];
  }
  
  /**
   * Get issues by severity
   */
  getIssuesBySeverity(severity: ValidationSeverity): ValidationIssue[] {
    return this.validationHistory
      .flatMap(report => report.issues)
      .filter(issue => issue.severity === severity);
  }
  
  /**
   * Get issues by category
   */
  getIssuesByCategory(category: ValidationCategory): ValidationIssue[] {
    return this.validationHistory
      .flatMap(report => report.issues)
      .filter(issue => issue.category === category);
  }
  
  /**
   * Register callback for new issues
   */
  onIssue(callback: (issue: ValidationIssue) => void): () => void {
    this.issueCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.issueCallbacks = this.issueCallbacks.filter(cb => cb !== callback);
    };
  }
  
  /**
   * Clear validation history
   */
  clearHistory(): void {
    this.validationHistory = [];
  }
  
  /**
   * Assert no errors exist (for testing)
   */
  assertNoErrors(): void {
    const report = this.validate();
    const errors = report.issues.filter(i => i.severity === 'error');
    
    if (errors.length > 0) {
      throw new Error(
        `State validation failed with ${errors.length} error(s):\n` +
        errors.map(e => `  - ${e.message}`).join('\n')
      );
    }
  }
  
  /**
   * Get validation statistics
   */
  getStats() {
    const allIssues = this.validationHistory.flatMap(r => r.issues);
    
    return {
      totalValidations: this.validationHistory.length,
      totalIssues: allIssues.length,
      errors: allIssues.filter(i => i.severity === 'error').length,
      warnings: allIssues.filter(i => i.severity === 'warning').length,
      info: allIssues.filter(i => i.severity === 'info').length,
      avgIssuesPerValidation: allIssues.length / this.validationHistory.length || 0,
      mostCommonIssue: this.getMostCommonIssue(),
    };
  }
  
  private getMostCommonIssue(): string | null {
    const allIssues = this.validationHistory.flatMap(r => r.issues);
    const issueCounts = new Map<string, number>();
    
    allIssues.forEach(issue => {
      issueCounts.set(issue.id, (issueCounts.get(issue.id) || 0) + 1);
    });
    
    let maxCount = 0;
    let mostCommon: string | null = null;
    
    issueCounts.forEach((count, id) => {
      if (count > maxCount) {
        maxCount = count;
        mostCommon = id;
      }
    });
    
    return mostCommon;
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Run validation on interval
 */
export function startValidationMonitoring(intervalMs: number = 5000): () => void {
  const validator = BroadcastStateValidator.getInstance();
  
  const intervalId = setInterval(() => {
    validator.validateAndLog();
  }, intervalMs);
  
  // Return stop function
  return () => {
    clearInterval(intervalId);
  };
}

/**
 * Validate state before action
 */
export function validateBeforeAction(actionName: string): void {
  const validator = BroadcastStateValidator.getInstance();
  const report = validator.validate();
  
  const errors = report.issues.filter(i => i.severity === 'error');
  if (errors.length > 0) {
    console.error(
      `🚨 Cannot proceed with "${actionName}" - state validation errors:`,
      errors.map(e => e.message)
    );
    throw new Error(
      `State validation failed before ${actionName}: ${errors[0].message}`
    );
  }
}

/**
 * Validate state after action
 */
export function validateAfterAction(actionName: string): void {
  const validator = BroadcastStateValidator.getInstance();
  const report = validator.validate();
  
  if (report.issuesFound > 0) {
    console.warn(
      `⚠️ Issues detected after "${actionName}":`,
      report.issues.map(i => `${i.severity}: ${i.message}`)
    );
  }
}

/**
 * Create validation hook for React components
 */
export function useStateValidation(options?: { 
  autoValidate?: boolean;
  onError?: (issue: ValidationIssue) => void;
}) {
  const { autoValidate = false, onError } = options || {};
  const validator = BroadcastStateValidator.getInstance();
  
  // Run validation on mount if autoValidate enabled
  useEffect(() => {
    if (autoValidate) {
      const report = validator.validate();
      
      if (onError) {
        report.issues
          .filter(i => i.severity === 'error')
          .forEach(onError);
      }
    }
  }, [autoValidate, onError, validator]);
  
  // Subscribe to issues
  useEffect(() => {
    if (onError) {
      return validator.onIssue(issue => {
        if (issue.severity === 'error') {
          onError(issue);
        }
      });
    }
  }, [onError, validator]);
  
  return {
    validate: () => validator.validate(),
    validateAndLog: () => validator.validateAndLog(),
    assertNoErrors: () => validator.assertNoErrors(),
    getHistory: () => validator.getHistory(),
    getStats: () => validator.getStats(),
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export { VALIDATION_RULES };

// Singleton instance
export const stateValidator = BroadcastStateValidator.getInstance();
