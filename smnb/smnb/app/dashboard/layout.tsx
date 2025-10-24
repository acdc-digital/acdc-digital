// DASHBOARD LAYOUT
// /Users/matthewsimon/Projects/SMNB/smnb/app/dashboard/layout.tsx

'use client';

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { ThemeToggle } from "@/app/components/ui/ThemeToggle";
import TokenCounter from '@/app/components/ui/TokenCounter';
import EmbeddingCounter from '@/app/components/ui/EmbeddingCounter';
import { RuntimeCounter } from '@/app/components/ui/RuntimeCounter';
import { DailySentiment } from "@/app/components/ui/DailySentiment";
import { ApiKeyInput } from "@/app/components/ui/ApiKeyInput";
import ActivityBar from "./activityBar/ActivityBar";
import { Fingerprint } from "lucide-react";
import { DashboardProvider, useDashboard } from "./DashboardContext";
import FeedSidebar from "./feed/FeedSidebar";
import Studio from "./studio/Studio";
import Heatmap from "./studio/heatmap/Heatmap";
import Spline from "./studio/spline/Spline";

import Wiki from "./studio/wiki/Wiki";
import { Sessions } from "./studio/sessions/Sessions";
import { SessionManager } from "./studio/manager/SessionManager";
import Settings from "./studio/settings/Settings";
import Users from "./studio/user/Users";
import Landmark from "./studio/landmark/Landmark";
import Engine from "./studio/engine/Engine";
import { useBroadcastOrchestrator } from "@/lib/stores/orchestrator/broadcastOrchestrator";
// import { BroadcastStateMonitor } from "@/components/debug/BroadcastStateMonitor"; // Commented out for now
import { startValidationMonitoring } from "@/lib/validation/broadcastStateValidator";
import { TickerProvider } from "./ticker/_context/TickerContext";
import { CacheProvider } from "@/lib/context/CacheContext";
import { SessionProvider } from "./SessionContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

function DashboardContent({}: DashboardLayoutProps) {
  const { activePanel, setActivePanel } = useDashboard();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  
  // Redirect to homepage if not authenticated
  useEffect(() => {
    if (isLoaded && !user) {
      console.log('🔒 DASHBOARD: User not authenticated, redirecting to homepage...');
      router.push('/');
    }
  }, [isLoaded, user, router]);
  
  // Initialize broadcast orchestrator (replaces old individual store initialization)
  // Orchestrator coordinates all stores: host, producer, livefeed, session
  const { initialize } = useBroadcastOrchestrator();
  
  useEffect(() => {
    // Only initialize if user is authenticated
    if (!isLoaded || !user) return;
    
    console.log('🛠️ DASHBOARD: Initializing broadcast orchestrator...');
    
    // Initialize the orchestrator (handles all services)
    initialize().catch(error => {
      console.error('❌ DASHBOARD: Orchestrator initialization failed:', error);
    });
    
    // Start state validation monitoring in development
    let stopValidation: (() => void) | undefined;
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 DASHBOARD: Starting state validation monitoring...');
      stopValidation = startValidationMonitoring(5000); // Check every 5 seconds
    }
    
    return () => {
      console.log('🧹 DASHBOARD: Cleanup on unmount...');
      if (stopValidation) {
        stopValidation();
      }
    };
  }, [initialize, isLoaded, user]);
  
  // Show loading state while checking authentication
  if (!isLoaded || !user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-black">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-neutral-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen font-sf text-xs overflow-hidden">
      {/* Top thin border / bar */}
      <div className="w-full h-12 flex items-center gap-3 px-4 text-foreground/60 border-b border-black/10 dark:border-white/10 bg-[#181818]">
        <div className="h-5.25 w-5.25 p-0.5 flex items-center justify-center overflow-hidden">
          <Image 
            src="/logoFrame.png" 
            alt="ACDC Logo" 
            width={14} 
            height={14}
            className="object-cover"
          />
        </div>
        <span className="text-[#858585] text-lg font-sans flex items-center gap-3">
          <span className="font-newsreader font-extrabold text-white text-xl">SMNB</span>
          <span className="pb-1 font-light font-mono">Terminal</span>
        </span>
        <div className="pb-1 w-2 h-2 rounded-full bg-green-600"></div>
        
        <div className="ml-auto flex items-center gap-4">
          <ThemeToggle />
        </div>
      </div>

      {/* Main content area with panel switching */}
      <div className="flex flex-1 overflow-hidden">
        {/* Activity Bar */}
        <ActivityBar 
          activePanel={activePanel}
          onPanelChange={setActivePanel}
        />
        
        {/* Panel Content - Conditional rendering instead of CSS hiding */}
        <div className="flex flex-1 min-w-0 overflow-hidden relative">
          {activePanel === "archive" && (
            <div className="absolute inset-0 flex">
              <Sessions isActive={true} />
            </div>
          )}
          
          {activePanel === "manager" && (
            <div className="absolute inset-0 flex">
              <SessionManager isActive={true} />
            </div>
          )}
          
          {activePanel === "heatmap" && (
            <div className="absolute inset-0 flex">
              <Heatmap isActive={true} />
            </div>
          )}
          
          {activePanel === "spline" && (
            <div className="absolute inset-0 flex">
              <Spline />
            </div>
          )}
          
          {activePanel === "landmark" && (
            <div className="absolute inset-0 flex">
              <Landmark isActive={true} />
            </div>
          )}
          
          {activePanel === "engine" && (
            <div className="absolute inset-0 flex">
              <Engine isActive={true} />
            </div>
          )}
          
          {activePanel === "docs" && (
            <div className="absolute inset-0 flex">
              <Wiki />
            </div>
          )}
          
          {activePanel === "settings" && (
            <div className="absolute inset-0 flex">
              <Settings />
            </div>
          )}
          
          {activePanel === "account" && (
            <div className="absolute inset-0 flex">
              <Users />
            </div>
          )}
          
          {activePanel === "home" && (
            <div className="absolute inset-0 flex">
              <FeedSidebar />
              <Studio />
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="h-[32px] shrink-0 flex items-center justify-between px-4 text-xs border-t border-black/10 dark:border-white/10 bg-[#181818]">
        <div className="flex items-center gap-2 text-foreground/90">
          <span>© built by ACDC.digital</span>
        </div>
        <div className="flex items-center gap-4 text-foreground/50">
          <span>Status: <span className="text-green-500">Ready</span></span>
          <span className="hidden sm:inline">v0.1.0</span>
          <DailySentiment />
          <TokenCounter className="hidden md:flex" />
          <EmbeddingCounter className="hidden md:flex" />
          <RuntimeCounter className="flex" />
        </div>
      </footer>
      
      {/* State Monitor (Development Only) - Commented out for now, uncomment if needed */}
      {/* {process.env.NODE_ENV === 'development' && <BroadcastStateMonitor />} */}
    </div>
  );
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <DashboardProvider>
      <SessionProvider>
        <TickerProvider>
          <CacheProvider>
            <DashboardContent>{children}</DashboardContent>
          </CacheProvider>
        </TickerProvider>
      </SessionProvider>
    </DashboardProvider>
  );
}
