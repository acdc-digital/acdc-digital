"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function StateManagementPage() {

  return (
    <div className="max-w-5xl ml-8">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-5xl font-bold tracking-tight mb-4">State Management Architecture</h1>
        <p className="text-xl text-muted-foreground">
          Keep-mounted views with FSM orchestration for persistent UI state
        </p>
      </div>

      {/* Overview */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Overview</CardTitle>
          <CardDescription>
            Soloist uses a sophisticated state management pattern to eliminate state loss during navigation
          </CardDescription>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
          <p>
            The state management system consists of three main components working together:
          </p>
          <ul>
            <li><strong>Global Zustand Stores</strong> - Centralized state management with persistence</li>
            <li><strong>Keep-Mounted Views</strong> - Components stay alive, hidden via CSS instead of unmounting</li>
            <li><strong>View Orchestrator FSM</strong> - Finite State Machine coordinating view transitions</li>
          </ul>
        </CardContent>
      </Card>

      {/* The Problem */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>The Problem We Solved</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Before: Conditional Rendering</h3>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`{currentView === "dashboard" ? (
  <Dashboard />
) : currentView === "soloist" ? (
  <Soloist />
) : ...
}`}
            </pre>
            <p className="text-destructive font-semibold mt-2">
              ❌ Problem: When switching views, components completely unmount and remount,
              losing all local state like selected date, filters, scroll position, and form inputs.
            </p>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">After: Keep-Mounted Pattern</h3>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`<ViewsWrapper>
  <ViewContainer view="dashboard" currentView={currentView}>
    <Dashboard />
  </ViewContainer>
  <ViewContainer view="soloist" currentView={currentView}>
    <Soloist />
  </ViewContainer>
  {/* All views stay mounted, hidden with CSS */}
</ViewsWrapper>`}
            </pre>
            <p className="text-green-600 dark:text-green-400 font-semibold mt-2">
              ✅ Solution: All views remain mounted in the DOM. Only visibility changes via CSS.
              State persists across navigation!
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Global Stores */}
      <Card className="mb-8" id="dashboardStore">
        <CardHeader>
          <CardTitle>Global Zustand Stores</CardTitle>
          <CardDescription>Centralized state with persistence middleware</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              dashboardStore.ts
              <Badge>Primary</Badge>
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              Manages all dashboard UI state including date selection, filters, tags, and template UI.
            </p>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`// State structure
interface DashboardState {
  selectedYear: number;
  selectedDate: string;
  availableTags: Tag[];
  selectedTags: Tag[];
  selectedLegend: string | null;
  showTemplates: boolean;
  isCreatingNewTemplate: boolean;
  refreshSubscription: boolean;
}

// Usage in components
const { selectedYear, selectedDate } = useDashboardStore();
const setSelectedYear = useDashboardStore(s => s.setSelectedYear);`}
            </pre>
          </div>

          <div id="feedStore">
            <h3 className="text-lg font-semibold mb-2">feedStore.ts</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Manages feed view state and coordinates with dashboard for template operations.
            </p>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`// Coordination methods
syncDateWithDashboard(dashboardDate: string): void
setShowTemplates(show: boolean): void
setIsCreatingTemplate(creating: boolean): void`}
            </pre>
          </div>

          <div id="viewOrchestrator">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              viewOrchestrator.ts
              <Badge variant="outline">FSM</Badge>
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              Finite State Machine that coordinates view transitions with validation and cleanup.
            </p>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`// FSM States
type TransitionState = "idle" | "transitioning" | "active" | "error";

// State diagram
idle → transitioning → active
  ↑         ↓
  └─────error

// Usage
const { transitionTo, canTransitionTo } = useView();

if (canTransitionTo("soloist")) {
  await transitionTo("soloist"); // Validated transition with cleanup
}`}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* View System */}
      <Card className="mb-8" id="viewContainer">
        <CardHeader>
          <CardTitle>Keep-Mounted View System</CardTitle>
          <CardDescription>Components that never unmount</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">ViewContainer Component</h3>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`<ViewContainer view="dashboard" currentView={currentView}>
  <Dashboard />
</ViewContainer>

// Implementation
- Uses absolute positioning (inset-0)
- Toggles 'hidden' class (CSS only, no unmounting)
- data-view and data-active attributes for debugging`}
            </pre>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">ViewsWrapper Component</h3>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`<ViewsWrapper>
  <ViewContainer view="dashboard" currentView={currentView}>
    <Dashboard />
  </ViewContainer>
  <ViewContainer view="soloist" currentView={currentView}>
    <Soloist />
  </ViewContainer>
  <ViewContainer view="testing" currentView={currentView}>
    <TestingPage />
  </ViewContainer>
  <ViewContainer view="waypoints" currentView={currentView}>
    <WaypointsPage />
  </ViewContainer>
</ViewsWrapper>

// All 4 views mounted simultaneously
// Only visibility controlled by CSS`}
            </pre>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Benefits</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-green-600 dark:text-green-400">✓</span>
                <span><strong>State Persistence:</strong> Selected dates, filters, form inputs survive navigation</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 dark:text-green-400">✓</span>
                <span><strong>Scroll Position:</strong> Each view remembers scroll position when you return</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 dark:text-green-400">✓</span>
                <span><strong>Instant Transitions:</strong> No re-rendering or data fetching on view switch</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 dark:text-green-400">✓</span>
                <span><strong>Form State:</strong> Partially filled forms remain intact when navigating away</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Orchestrator Details */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>View Orchestrator FSM</CardTitle>
          <CardDescription>Coordinated transitions with validation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">State Machine</h3>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono">
{`┌──────┐
│ idle │ ← Initial state
└──┬───┘
   │ transitionTo()
   ↓
┌──────────────┐
│ transitioning│ ← Transition in progress
└──────┬───────┘
       │ success
       ↓
   ┌────────┐
   │ active │ ← Stable state
   └────┬───┘
        │ error occurs
        ↓
    ┌───────┐
    │ error │ ← Error state
    └───┬───┘
        │ clearError()
        └─→ back to active`}
            </pre>
          </div>

          <div id="viewProvider">
            <h3 className="text-lg font-semibold mb-2">ViewProvider Context</h3>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`// Context API
interface ViewContextValue {
  currentView: ViewType;
  transitionTo: (view: ViewType) => Promise<void>;
  canTransitionTo: (view: ViewType) => boolean;
  isTransitioning: boolean;
  lastError: string | null;
  clearError: () => void;
}

// Usage hooks
const { currentView, transitionTo } = useView();
const currentView = useCurrentView(); // selector hook`}
            </pre>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Transition Logic</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400">1.</span>
                <span><strong>Validation:</strong> Check if transition is allowed via canTransitionTo guard</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400">2.</span>
                <span><strong>Cleanup:</strong> Run preTransitionCleanup hook for current view</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400">3.</span>
                <span><strong>Transition:</strong> Update state to transitioning, then to new view</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400">4.</span>
                <span><strong>Recording:</strong> Track transition in history (last 10 transitions)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400">5.</span>
                <span><strong>Completion:</strong> Set state to active, ready for next transition</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Convex Integration (Planned) */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Convex Integration
            <Badge variant="outline">Phase 4 - Planned</Badge>
          </CardTitle>
          <CardDescription>Cloud sync for cross-device state persistence</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div id="convexSchema">
            <h3 className="text-lg font-semibold mb-2">Schema Extension</h3>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`// convex/schema.ts
userPreferences: defineTable({
  userId: v.string(),
  currentView: v.string(),
  dashboardPreferences: v.object({
    selectedYear: v.number(),
    selectedDate: v.string(),
    selectedTags: v.array(v.object({
      id: v.string(),
      name: v.string(),
      color: v.string(),
    })),
  }),
  lastSyncedAt: v.number(),
}).index("by_userId", ["userId"])`}
            </pre>
          </div>

          <div id="userPreferences">
            <h3 className="text-lg font-semibold mb-2">Sync Hook</h3>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`// hooks/useViewSync.ts
- Debounced sync (300ms) to avoid excessive writes
- Bidirectional: localStorage ↔ Convex
- Load preferences on app start
- Save changes automatically
- Cross-device state consistency`}
            </pre>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Future Benefits</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-purple-600 dark:text-purple-400">→</span>
                <span><strong>Cross-Device:</strong> Same state on desktop and mobile</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 dark:text-purple-400">→</span>
                <span><strong>Cloud Backup:</strong> State survives cache clear or reinstall</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 dark:text-purple-400">→</span>
                <span><strong>Offline First:</strong> localStorage as cache, sync when online</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Implementation Status */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Implementation Phases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Badge className="bg-green-600 mt-1">Complete</Badge>
              <div>
                <div className="font-semibold">Phase 1: Global Stores Foundation</div>
                <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                  <li>• Created dashboardStore.ts with persist middleware</li>
                  <li>• Enhanced feedStore.ts with template coordination</li>
                  <li>• Migrated 8 useState instances from dashboard page</li>
                  <li>• Added Tag type support with TagColors union</li>
                </ul>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Badge className="bg-green-600 mt-1">Complete</Badge>
              <div>
                <div className="font-semibold">Phase 2: Keep-Mounted View System</div>
                <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                  <li>• Created ViewContainer and ViewsWrapper components</li>
                  <li>• Refactored dashboard page from conditional to keep-mounted</li>
                  <li>• Fixed RightSidebar positioning (sibling to ViewsWrapper)</li>
                  <li>• All 4 views now stay mounted, CSS visibility only</li>
                </ul>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Badge className="bg-green-600 mt-1">Complete</Badge>
              <div>
                <div className="font-semibold">Phase 3: View Orchestration FSM</div>
                <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                  <li>• Created viewOrchestrator.ts FSM with devtools</li>
                  <li>• Built ViewProvider context with hooks</li>
                  <li>• Updated layout.tsx with ViewProvider wrapper</li>
                  <li>• Migrated sidebar to use orchestrator transitions</li>
                </ul>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-1">Planned</Badge>
              <div>
                <div className="font-semibold">Phase 4: Convex Integration</div>
                <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                  <li>• Extend schema with userPreferences table</li>
                  <li>• Create savePreferences and loadPreferences mutations</li>
                  <li>• Build useViewSync hook with debouncing</li>
                  <li>• Enable cross-device state synchronization</li>
                </ul>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-1">Planned</Badge>
              <div>
                <div className="font-semibold">Phase 5: Monitoring & Validation</div>
                <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                  <li>• Create ViewStateMonitor debug component</li>
                  <li>• Build state consistency validators</li>
                  <li>• Add auto-fix for common state mismatches</li>
                  <li>• Enhanced devtools integration</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Files Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Key Files Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div>
              <code className="bg-muted px-2 py-1 rounded text-xs">
                /renderer/store/dashboardStore.ts
              </code>
              <p className="text-muted-foreground mt-1">Primary dashboard state store with persist middleware</p>
            </div>
            <div>
              <code className="bg-muted px-2 py-1 rounded text-xs">
                /renderer/store/feedStore.ts
              </code>
              <p className="text-muted-foreground mt-1">Feed view state with dashboard coordination methods</p>
            </div>
            <div>
              <code className="bg-muted px-2 py-1 rounded text-xs">
                /renderer/store/viewOrchestrator.ts
              </code>
              <p className="text-muted-foreground mt-1">FSM orchestrator with transition validation and history</p>
            </div>
            <div>
              <code className="bg-muted px-2 py-1 rounded text-xs">
                /renderer/components/ViewContainer.tsx
              </code>
              <p className="text-muted-foreground mt-1">View wrapper with keep-mounted pattern implementation</p>
            </div>
            <div>
              <code className="bg-muted px-2 py-1 rounded text-xs">
                /renderer/providers/ViewProvider.tsx
              </code>
              <p className="text-muted-foreground mt-1">Context provider with useView and useViewSafe hooks</p>
            </div>
            <div id="dashboardPage">
              <code className="bg-muted px-2 py-1 rounded text-xs">
                /renderer/app/dashboard/page.tsx
              </code>
              <p className="text-muted-foreground mt-1">Refactored dashboard using keep-mounted pattern</p>
            </div>
            <div id="appLayout">
              <code className="bg-muted px-2 py-1 rounded text-xs">
                /renderer/app/layout.tsx
              </code>
              <p className="text-muted-foreground mt-1">Root layout with ViewProvider integration</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
