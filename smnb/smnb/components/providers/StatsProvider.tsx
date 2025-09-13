// STATS PROVIDER COMPONENT
// /Users/matthewsimon/Projects/SMNB/smnb/components/providers/StatsProvider.tsx

'use client';

import React, { createContext, useContext, ReactNode, useEffect, useRef } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { useConvex } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { APIHealthService } from '../../lib/services/apiHealthService';

interface StatsContextType {
  // Dashboard Stats
  dashboardStats: any;
  isDashboardStatsLoading: boolean;
  
  // Post Processing Stats
  postProcessingStats: any;
  isPostStatsLoading: boolean;
  
  // Pipeline Health
  pipelineHealth: any;
  isPipelineHealthLoading: boolean;
  
  // API Health
  apiHealthStatus: any;
  isAPIHealthLoading: boolean;
  apiHealthSummary: any;
  isAPIHealthSummaryLoading: boolean;
  
  // System Events
  systemEvents: any;
  isSystemEventsLoading: boolean;
  
  // Rate Limits
  rateLimits: any;
  isRateLimitsLoading: boolean;
  
  // Test Functions
  createTestData: () => Promise<void>;
  validateSystem: () => Promise<any>;
  cleanupTestData: () => Promise<void>;
  runAPIHealthCheck: () => Promise<void>;
}

const StatsContext = createContext<StatsContextType | null>(null);

interface StatsProviderProps {
  children: ReactNode;
  timeRange?: "1h" | "24h" | "7d" | "30d";
}

export function StatsProvider({ children, timeRange = "24h" }: StatsProviderProps) {
  const convex = useConvex();
  const apiHealthServiceRef = useRef<APIHealthService | null>(null);
  // Queries
  const dashboardStats = useQuery(api.stats.queries.getDashboardStats, { timeRange });
  const postProcessingStats = useQuery(api.stats.queries.getPostProcessingStats, { limit: 50 });
  const pipelineHealth = useQuery(api.stats.queries.getPipelineHealth, {});
  const systemEvents = useQuery(api.stats.queries.getSystemEvents, { limit: 20 });
  const rateLimits = useQuery(api.stats.queries.getRateLimitStatus, {});
  
  // API Health Queries
  const apiHealthStatus = useQuery(api.apiHealth.getAPIHealthStatus, {});
  const apiHealthSummary = useQuery(api.apiHealth.getAPIHealthSummary, {});
  
  // Test Mutations
  const createTestDataMutation = useMutation(api.stats.test.createTestStatsData);
  const cleanupTestDataMutation = useMutation(api.stats.test.cleanupTestData);
  
  // Test Query
  const validateSystemQuery = useQuery(api.stats.test.validateStatsSystem);
  
  // Helper functions
  const createTestData = async () => {
    try {
      console.log("🧪 Creating test stats data...");
      const result = await createTestDataMutation();
      console.log("✅ Test data created:", result);
    } catch (error) {
      console.error("❌ Failed to create test data:", error);
    }
  };
  
  const validateSystem = async () => {
    try {
      console.log("🔍 Validating stats system...");
      console.log("✅ System validation result:", validateSystemQuery);
      return validateSystemQuery;
    } catch (error) {
      console.error("❌ System validation failed:", error);
    }
  };
  
  const cleanupTestData = async () => {
    try {
      console.log("🧹 Cleaning up test data...");
      const result = await cleanupTestDataMutation();
      console.log("✅ Test data cleaned:", result);
    } catch (error) {
      console.error("❌ Failed to cleanup test data:", error);
    }
  };
  
  // Initialize API health service
  useEffect(() => {
    if (convex && !apiHealthServiceRef.current) {
      apiHealthServiceRef.current = new APIHealthService(convex);
      // Initialize health records for all endpoints
      apiHealthServiceRef.current.initializeHealthRecords();
      // Start monitoring
      apiHealthServiceRef.current.startMonitoring();
    }
  }, [convex]);

  const runAPIHealthCheck = async () => {
    try {
      console.log("🔍 Running API health check...");
      if (apiHealthServiceRef.current) {
        await apiHealthServiceRef.current.checkAllEndpoints();
        console.log("✅ API health check completed");
      } else {
        console.warn("⚠️ API health service not initialized");
      }
    } catch (error) {
      console.error("❌ API health check failed:", error);
    }
  };
  
  const value: StatsContextType = {
    // Dashboard Stats
    dashboardStats,
    isDashboardStatsLoading: dashboardStats === undefined,
    
    // Post Processing Stats  
    postProcessingStats,
    isPostStatsLoading: postProcessingStats === undefined,
    
    // Pipeline Health
    pipelineHealth,
    isPipelineHealthLoading: pipelineHealth === undefined,
    
    // API Health
    apiHealthStatus,
    isAPIHealthLoading: apiHealthStatus === undefined,
    apiHealthSummary,
    isAPIHealthSummaryLoading: apiHealthSummary === undefined,
    
    // System Events
    systemEvents,
    isSystemEventsLoading: systemEvents === undefined,
    
    // Rate Limits
    rateLimits,
    isRateLimitsLoading: rateLimits === undefined,
    
    // Test Functions
    createTestData,
    validateSystem,
    cleanupTestData,
    runAPIHealthCheck
  };
  
  return (
    <StatsContext.Provider value={value}>
      {children}
    </StatsContext.Provider>
  );
}

export function useStats() {
  const context = useContext(StatsContext);
  if (!context) {
    throw new Error('useStats must be used within a StatsProvider');
  }
  return context;
}

// Export types
export type { StatsContextType };