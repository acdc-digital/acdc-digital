// DASHBOARD PAGE
// /Users/matthewsimon/Documents/Github/electron-nextjs/renderer/src/app/dashboard/page.tsx

"use client";

import React, { useEffect, useState } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { parseISO, format } from "date-fns";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Hooks & Stores
import { useUser } from "@/hooks/useUser";
import { useConvexUser } from "@/hooks/useConvexUser";
import { useUserStore } from "@/store/userStore";
import { useFeedStore } from "@/store/feedStore";
import { useDashboardStore } from "@/store/dashboardStore";
import { useCurrentView } from "@/store/viewOrchestrator";
import { useView } from "@/providers/ViewProvider";
import { getUserId } from "@/utils/userUtils";
import { shallowEqual } from "@/utils/objectEquals";
import { useBrowserEnvironment } from "@/utils/environment";

// Components
import { Sidebar } from "./_components/sidebar";
import { BrowserNavbar } from "@/app/dashboard/_components/BrowserNavbar";
import { BrowserFooter } from "@/app/dashboard/_components/BrowserFooter";
import Heatmap from "./_components/Heatmap";
import Controls from "./_components/Controls";
import DailyLogForm from "./_components/dailyLogForm";
import Feed from "./_components/Feed";
import { RightSidebar } from "./_components/RightSidebar";
import SoloistPage from "./soloist/page";
import TestingPage from "./testing/page";
import WaypointsPage from "./waypoints/page";
import { Loader2, ArrowRightToLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tag } from "./_components/Tags";
import TemplateSelector from "./_components/TemplateSelector";
import Templates, { Template } from "./_components/Templates";
import { useTemplates } from "@/hooks/useTemplates";
import { ViewContainer, ViewsWrapper } from "@/components/ViewContainer";

// Add scoreColors import
import { getColorClass, getTextColorClass } from "@/lib/scoreColors";
import { getHeatmapColorClass, getHeatmapTextColorClass } from "@/lib/scoreColors";

// Responsive breakpoint for auto-collapse in pixels
const SIDEBAR_AUTO_COLLAPSE_WIDTH = 1256;

export default function Dashboard() {
  console.log("Dashboard rendering");
  
  const { user } = useUser();
  const { isAuthenticated, isLoading, userId: convexUserId } = useConvexUser();
  const router = useRouter();
  const setStoreUser = useUserStore((state) => state.setUser);
  const currentView = useCurrentView();
  const { transitionTo } = useView();
  const isBrowser = useBrowserEnvironment();

  // Add a state to force refresh subscription status
  const refreshSubscription = useDashboardStore((state) => state.refreshSubscription);
  const triggerRefresh = useDashboardStore((state) => state.triggerRefresh);

  // Check subscription status (now works for both browser and desktop mode)
  const hasActiveSubscription = useQuery(
    api.userSubscriptions.hasActiveSubscription,
    isAuthenticated && convexUserId ? {} : "skip"
  );

  // Test function for simulating successful checkout
  const simulateCheckout = useAction(api.stripe.simulateSuccessfulCheckout);

  // Redirect unauthenticated users to landing page (Electron mode only)
  useEffect(() => {
    if (isBrowser === false && !isLoading && !isAuthenticated) {
      console.log("User is not authenticated, redirecting to landing page");
      router.push("/");
    }
  }, [isBrowser, isAuthenticated, isLoading, router]);

  // Handle payment success from Stripe
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const sessionId = urlParams.get('session_id');
    
    if (paymentStatus === 'success' && sessionId) {
      console.log('Payment successful, session ID:', sessionId);
      
      // Simulate the webhook processing for local development
      simulateCheckout({ sessionId })
        .then(() => {
          console.log('Successfully simulated checkout completion');
          // Show success message
          alert('Payment successful! Your subscription has been activated.');
          
          // Force a refresh of the subscription status by triggering a re-render
          triggerRefresh();
          
          // Refresh the page after a short delay to allow the database to update
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        })
        .catch((error) => {
          console.error('Error simulating checkout:', error);
          alert('Payment was successful, but there was an issue activating your subscription. Please contact support.');
        });
      
      // Remove the URL parameters to clean up the URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [simulateCheckout]);

  // Show loading while checking authentication (Electron mode only)
  if (isBrowser === false && isLoading) {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-zinc-900">
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          
          <main className="flex-1 flex items-center justify-center bg-zinc-50 dark:bg-zinc-900">
            <div className="flex flex-col items-center">
              <Loader2 className="h-8 w-8 text-zinc-500 animate-spin mb-2" />
              <p className="text-sm text-zinc-400">Checking authentication...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Redirect in progress - show loading (Electron mode only)
  if (isBrowser === false && !isAuthenticated) {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-zinc-900">
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          
          <main className="flex-1 flex items-center justify-center bg-zinc-50 dark:bg-zinc-900">
            <div className="flex flex-col items-center">
              <Loader2 className="h-8 w-8 text-zinc-500 animate-spin mb-2" />
              <p className="text-sm text-zinc-400">Redirecting to sign in...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Feed-related store
  const {
    sidebarOpen,
    toggleSidebar,
    selectedDate,
    activeTab,
    setActiveTab,
    setSidebarOpen,
    updateDatePreserveTab,
  } = useFeedStore();
  
  console.log("Dashboard feed state:", {
    sidebarOpen,
    selectedDate,
    activeTab,
    currentView
  });

  // Browser mode: Automatically open sidebar and set default state
  useEffect(() => {
    if (isBrowser === true && currentView === "dashboard") {
      // Set today as selected date if none selected
      if (!selectedDate) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const dd = String(today.getDate()).padStart(2, "0");
        const dateKey = `${yyyy}-${mm}-${dd}`;
        updateDatePreserveTab(dateKey);
      }
      
      // Always keep sidebar open in browser mode
      if (!sidebarOpen) {
        setSidebarOpen(true);
      }
      
      // Default to log tab, unless we already have a feed for today
      if (activeTab !== "log" && activeTab !== "feed") {
        setActiveTab("log");
      }
    }
  }, [isBrowser, currentView, selectedDate, sidebarOpen, activeTab, updateDatePreserveTab, setSidebarOpen, setActiveTab]);

  // Tag filtering state from dashboard store
  const availableTags = useDashboardStore((state) => state.availableTags);
  const setAvailableTags = useDashboardStore((state) => state.setAvailableTags);
  const selectedTags = useDashboardStore((state) => state.selectedTags);
  const setSelectedTags = useDashboardStore((state) => state.setSelectedTags);

  // Query for the daily log score (moved from renderSidebarTitle to fix Rules of Hooks)
  const dailyLogForScore = useQuery(
    api.dailyLogs.getDailyLog,
    convexUserId && selectedDate ? { userId: convexUserId, date: selectedDate } : "skip"
  );

  // Templates state from dashboard store
  const showTemplates = useDashboardStore((state) => state.showTemplates);
  const setShowTemplates = useDashboardStore((state) => state.setShowTemplates);
  const isCreatingNewTemplate = useDashboardStore((state) => state.isCreatingNewTemplate);
  const setIsCreatingNewTemplate = useDashboardStore((state) => state.setIsCreatingNewTemplate);
  
  // Templates hook - pass selectedDate for per-day state management
  const {
    activeTemplate,
    saveTemplate,
    templates,
    setActiveTemplate,
  } = useTemplates({ 
    userId: convexUserId || undefined, 
    selectedDate: selectedDate || undefined 
  });

  /* ───────────────────────────────────────────── */
  /*  Sync user from Convex → Zustand store        */
  /* ───────────────────────────────────────────── */
  useEffect(() => {
    if (user) {
      setStoreUser({
        id: user._id ? user._id.toString() : "",
        name: user.name || "",
        email: user.email || "",
        profilePicture: user.image,
      });
    }
  }, [user, setStoreUser]);

  /*  Update store only if changed (shallow)       */
  useEffect(() => {
    if (!user) return;

    const next = {
      id: user._id?.toString() ?? "",
      name: user.name ?? "",
      email: user.email ?? "",
      profilePicture: user.image,
    };

    // Type-safe comparison - only update if different
    const prev = useUserStore.getState().user;
    if (!shallowEqual(prev, next)) {
      setStoreUser(next);
    }
  }, [user, setStoreUser]);

  /* ───────────────────────────────────────────── */
  /*  Activity bar is always collapsed - no responsive behavior needed */
  /* ───────────────────────────────────────────── */

  /* ───────────────────────────────────────────── */
  /*  Reset templates view when switching tabs     */
  /* ───────────────────────────────────────────── */
  useEffect(() => {
    if (activeTab !== "log" && showTemplates) {
      setShowTemplates(false);
    }
  }, [activeTab, showTemplates]);

  // Activity bar is always collapsed - no action needed when right sidebar opens

  // Debug handler to explicitly switch to feed tab
  const handleSwitchToFeed = () => {
    console.log("Explicitly switching to feed tab");
    if (selectedDate) {
      setActiveTab("feed");
      setSidebarOpen(true);
    } else {
      // If no date is selected, get today's date
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");
      const dateKey = `${yyyy}-${mm}-${dd}`;
      
      console.log("No date selected, setting to today:", dateKey);
      updateDatePreserveTab(dateKey);
      setActiveTab("feed");
      setSidebarOpen(true);
    }
  };

  /* ───────────────────────────────────────────── */
  /*  Heatmap year selector                        */
  /* ───────────────────────────────────────────── */
  const selectedYear = useDashboardStore((state) => state.selectedYear.toString());
  const setSelectedYear = (year: string) => useDashboardStore.getState().setSelectedYear(parseInt(year, 10));
  // Ensure selectedYear is always valid for the year range
  const minYear = 1970;
  const maxYear = new Date().getFullYear() + 10;
  const years: string[] = React.useMemo(() => {
    const arr: string[] = [];
    for (let y = minYear; y <= maxYear; y++) {
      arr.push(String(y));
    }
    return arr;
  }, [minYear, maxYear]);
  React.useEffect(() => {
    if (!years.includes(selectedYear)) {
      setSelectedYear(years[0]);
    }
  }, [selectedYear, years]);
  const selectedLegend = useDashboardStore((state) => state.selectedLegend);
  const setSelectedLegend = useDashboardStore((state) => state.setSelectedLegend);
  const userId = getUserId(user);

  /*  Fetch daily logs (dashboard view only, skip for browser mode)       */
  const dailyLogs = useQuery(
    api.dailyLogs.listDailyLogs,
    isBrowser === false && currentView === "dashboard" && convexUserId ? { userId: convexUserId, year: selectedYear } : "skip"
  );

  /* Fetch all user tags for filtering (skip for browser mode) */
  const userTags = useQuery(
    api.feed.getFeedTags,
    isBrowser === false && currentView === "dashboard" && convexUserId ? { userId: convexUserId } : "skip"
  );

  // Process tags from the backend
  useEffect(() => {
    if (userTags) {
      const processedTags: Tag[] = [];
      const tagMap = new Map<string, Tag>();
      
      userTags.forEach((item: any) => {
        // Only add each unique tag once
        if (!tagMap.has(item.tagId)) {
          const tag: Tag = {
            id: item.tagId,
            name: item.tagName,
            color: item.tagColor as any,
          };
          tagMap.set(item.tagId, tag);
          processedTags.push(tag);
        }
      });
      
      // Store processed tags with full Tag structure
      setAvailableTags(processedTags);
    }
  }, [userTags, setAvailableTags]);

  if (isBrowser === false && currentView === "dashboard" && !dailyLogs) {
    return (
      <div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-900">
        <div className="flex flex-1 overflow-hidden">
          <Sidebar
            className="backdrop-blur-md supports-[backdrop-filter]:bg-white/6"
          />
          
          <main className="flex-1 flex items-center justify-center bg-zinc-50 dark:bg-zinc-900">
            <div className="flex flex-col items-center">
              <Loader2 className="h-8 w-8 text-zinc-500 animate-spin mb-2" />
              <p className="text-sm text-zinc-400">Loading your heatmap...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  /* ───────────────────────────────────────────── */
  /*  Handlers                                     */
  /* ───────────────────────────────────────────── */
  const handleSelectDate = (dateString: string) => {
    console.log("handleSelectDate called with:", dateString);
    updateDatePreserveTab(dateString);
    setSidebarOpen(true);
    // Activity bar is always collapsed - no responsive behavior needed
  };

  function handleYearChange(newYear: string) {
    setSelectedYear(newYear);
  }

  function handleLegendFilterChange(legend: string | null) {
    setSelectedLegend(legend);
  }
  
  function handleTagFilterChange(tags: Tag[]) {
    setSelectedTags(tags);
  }

  /* ───────────────────────────────────────────── */
  /*  Sidebar title builder                        */
  /* ───────────────────────────────────────────── */
  function renderSidebarTitle() {
    console.log("renderSidebarTitle called, activeTab:", activeTab);
    
    // Daily Log
    if (activeTab === "log") {
      if (!selectedDate) {
        return (
          <div className="flex flex-col space-y-2">
            <span className="font-semibold">Daily Log Form</span>
            <TemplateSelector
              userId={convexUserId || undefined}
              selectedDate={selectedDate ? parseISO(selectedDate) : null}
              onCreateNew={() => {
                // Open templates in creation mode (without currentTemplate)
                setIsCreatingNewTemplate(true);
                setShowTemplates(true);
              }}
            />
          </div>
        );
      }
      const parsed = parseISO(selectedDate);
      const formatted = format(parsed, "MMM d, yyyy");
      return (
        <div className="flex flex-col space-y-1">
          <span className="font-semibold">Daily Log Form</span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400 pb-4">
            {formatted}
          </span>
          <TemplateSelector
            userId={convexUserId || undefined}
            selectedDate={selectedDate ? parseISO(selectedDate) : null}
            onCreateNew={() => {
              // Open templates in creation mode (without currentTemplate)
              setIsCreatingNewTemplate(true);
              setShowTemplates(true);
            }}
          />
        </div>
      );
    }

    // Feed
    if (activeTab === "feed") {
      if (!selectedDate) return "Feed";
      const parsed = parseISO(selectedDate);
      const formatted = format(parsed, "MMM d, yyyy");

      const score = dailyLogForScore?.score ?? null;

      return (
        <div className="flex items-center justify-between w-full">
          <div className="flex flex-col">
            <span className="font-semibold">Feed</span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {formatted}
            </span>
          </div>
          {score !== null && (
            <Badge
              className={`${getHeatmapColorClass(score)} ${getHeatmapTextColorClass(score)} border-0 font-semibold text-sm px-2 py-1`}
            >
              {score}
            </Badge>
          )}
        </div>
      );
    }

    return null;
  }

  /* ───────────────────────────────────────────── */
  /*  Render                                       */
  /* ───────────────────────────────────────────── */
  return (
    <div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-900">
      {/* Browser Navbar - Only show when confirmed browser mode */}
      {/* {isBrowser === true && <BrowserNavbar />} */}
      {/* Reserve space for navbar during initial load to prevent layout shift */}
      {/* {isBrowser === null && <div className="flex-shrink-0 h-[57px]" />} */}

      <div className="flex flex-1 overflow-hidden relative">
        {/* Left sidebar - Always show in both browser and Electron modes */}
        <div className="absolute left-0 top-0 bottom-0 z-20">
          <Sidebar />
        </div>

        {/* Main content - Keep all views mounted */}
        <ViewsWrapper>
          {/* Dashboard View */}
          <ViewContainer view="dashboard" currentView={currentView}>
            <main className="flex-1 flex flex-col relative bg-neutral-700/20">
              {/* Year controls */}
              <div className="sticky top-0 z-10 px-4 pt-3">
                <div className="flex justify-between items-center mb-3">
                  <Controls
                    selectedYear={selectedYear}
                    onYearChange={handleYearChange}
                    selectedLegend={selectedLegend}
                    onLegendFilterChange={handleLegendFilterChange}
                    availableTags={availableTags}
                    selectedTags={selectedTags}
                    onTagFilterChange={handleTagFilterChange}
                  />
                </div>
              </div>

              {/* Heatmap */}
              <div className="flex-1 overflow-hidden relative">
                <Heatmap
                  year={parseInt(selectedYear)}
                  onSelectDate={handleSelectDate}
                />
              </div>
            </main>
          </ViewContainer>

          {/* Soloist View */}
          <ViewContainer view="soloist" currentView={currentView}>
            <main className="flex-1 overflow-hidden">
              <SoloistPage />
            </main>
          </ViewContainer>

          {/* Testing View */}
          <ViewContainer view="testing" currentView={currentView}>
            <main className="flex-1 overflow-hidden">
              <TestingPage />
            </main>
          </ViewContainer>

          {/* Waypoints View */}
          <ViewContainer view="waypoints" currentView={currentView}>
            <main className="flex-1 overflow-hidden">
              <WaypointsPage />
            </main>
          </ViewContainer>
        </ViewsWrapper>

        {/* Right sidebar - Show only for dashboard view, positioned outside ViewContainer */}
        {currentView === "dashboard" && (
          <RightSidebar
              open={isBrowser === true ? true : sidebarOpen}
              title={renderSidebarTitle()}
              onClose={isBrowser === true ? undefined : () => {
                setShowTemplates(false); // Close templates if open
                toggleSidebar();
                updateDatePreserveTab(null);
                // Activity bar is always collapsed - no action needed
              }}
            >
              {showTemplates ? (
                <Templates
                  onClose={() => {
                    setShowTemplates(false);
                    setIsCreatingNewTemplate(false);
                  }}
                  onSaveTemplate={(template: Template) => {
                    saveTemplate(template, true); // Set as active when saved
                    setShowTemplates(false);
                    setIsCreatingNewTemplate(false);
                  }}
                  currentTemplate={isCreatingNewTemplate ? undefined : (activeTemplate || undefined)}
                  templates={templates}
                />
              ) : activeTab === "log" ? (
                selectedDate ? (
                  <DailyLogForm
                    date={selectedDate}
                    hasActiveSubscription={hasActiveSubscription}
                    showTemplates={showTemplates}
                    onCustomize={() => {
                      setIsCreatingNewTemplate(false);
                      setShowTemplates(!showTemplates);
                    }}
                    onClose={isBrowser === true ? () => setActiveTab("feed") : () => {
                      toggleSidebar();
                      updateDatePreserveTab(null);
                      // Activity bar is always collapsed - no action needed
                    }}
                  />
                ) : (
                  <div className="p-4 text-sm text-zinc-500">
                    Click a day on the calendar to open the log form.
                  </div>
                )
              ) : activeTab === "feed" ? (
                (() => {
                  console.log("Rendering Feed component", { activeTab, selectedDate });
                  return <Feed onTagsUpdate={(newTags) => setAvailableTags(newTags)} />;
                })()
              ) : (
                <div className="p-4 text-sm text-zinc-500">No content.</div>
              )}
            </RightSidebar>
          )}

          {/* Soloist View */}
          <ViewContainer view="soloist" currentView={currentView}>
            <main className="flex-1 overflow-hidden">
              <SoloistPage />
            </main>
          </ViewContainer>

          {/* Testing View */}
          <ViewContainer view="testing" currentView={currentView}>
            <main className="flex-1 overflow-hidden">
              <TestingPage />
            </main>
          </ViewContainer>

          {/* Waypoints View */}
          <ViewContainer view="waypoints" currentView={currentView}>
            <main className="flex-1 overflow-hidden">
              <WaypointsPage />
            </main>
          </ViewContainer>
      </div>
      
      {/* Browser Footer - Only show when confirmed browser mode */}
      {/* {isBrowser === true && <BrowserFooter />} */}
      {/* Reserve space for footer during initial load to prevent layout shift */}
      {/* {isBrowser === null && <div className="flex-shrink-0 h-[49px]" />} */}
    </div>
  );
}