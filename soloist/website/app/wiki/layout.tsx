"use client";

import { FileTreeSidebar } from "./_components/FileTreeSidebar";
import { Navbar } from "@/components/layout/Navbar";
import type { FileNode } from "@/store/wikiStore";

// Global wiki navigation structure - available on all pages
const globalFileTree: FileNode[] = [
  {
    name: "API Documentation",
    type: "folder",
    children: [
      { name: "users", type: "file", path: "/wiki#users" },
      { name: "dailyLogs", type: "file", path: "/wiki#dailyLogs" },
      { name: "forecast", type: "file", path: "/wiki#forecast" },
      { name: "templates", type: "file", path: "/wiki#templates" },
      { name: "payments", type: "file", path: "/wiki#payments" },
      { name: "subscriptions", type: "file", path: "/wiki#subscriptions" },
      { name: "waitlist", type: "file", path: "/wiki#waitlist" },
    ],
  },
  {
    name: "Brand Guidelines",
    type: "folder",
    children: [
      { name: "Brand Philosophy", type: "file", path: "/wiki/brand#philosophy" },
      { name: "Brand Symbolism", type: "file", path: "/wiki/brand#symbolism" },
      { name: "Logo System", type: "file", path: "/wiki/brand#logo-system" },
      { name: "Color Palette", type: "file", path: "/wiki/brand#color-palette" },
      { name: "Typography", type: "file", path: "/wiki/brand#typography" },
      { name: "Grid & Structure", type: "file", path: "/wiki/brand#grid-structure" },
      { name: "Motion Identity", type: "file", path: "/wiki/brand#motion-identity" },
      { name: "Brand Voice", type: "file", path: "/wiki/brand#brand-voice" },
      { name: "Application Examples", type: "file", path: "/wiki/brand#applications" },
      { name: "Taglines", type: "file", path: "/wiki/brand#taglines" },
      { name: "Usage Rules", type: "file", path: "/wiki/brand#usage-rules" },
    ],
  },
  {
    name: "User Guide",
    type: "folder",
    children: [
      { name: "What is Soloist?", type: "file", path: "/wiki/user-guide#what-is-soloist" },
      {
        name: "Getting Started",
        type: "folder",
        children: [
          { name: "Sign Up & Authentication", type: "file", path: "/wiki/user-guide#getting-started" },
          { name: "Subscription Setup", type: "file", path: "/wiki/user-guide#getting-started" },
        ],
      },
      {
        name: "Daily Logging",
        type: "folder",
        children: [
          { name: "Creating Your First Log", type: "file", path: "/wiki/user-guide#daily-logging" },
          { name: "Editing Past Logs", type: "file", path: "/wiki/user-guide#daily-logging" },
        ],
      },
      {
        name: "Understanding Forecasts",
        type: "folder",
        children: [
          { name: "Generating Your First Forecast", type: "file", path: "/wiki/user-guide#forecasts" },
          { name: "The 7-Day View", type: "file", path: "/wiki/user-guide#forecasts" },
        ],
      },
      {
        name: "Advanced Features",
        type: "folder",
        children: [
          { name: "Custom Templates", type: "file", path: "/wiki/user-guide#advanced-features" },
          { name: "Historical Analysis", type: "file", path: "/wiki/user-guide#advanced-features" },
          { name: "Retrospective Forecast Analysis", type: "file", path: "/wiki/user-guide#advanced-features" },
        ],
      },
      {
        name: "Privacy & Data",
        type: "folder",
        children: [
          { name: "What We Store", type: "file", path: "/wiki/user-guide#privacy" },
          { name: "Exporting Your Data", type: "file", path: "/wiki/user-guide#privacy" },
          { name: "Deleting Your Account", type: "file", path: "/wiki/user-guide#privacy" },
        ],
      },
    ],
  },
  {
    name: "Authentication",
    type: "folder",
    children: [
      { name: "Overview", type: "file", path: "/wiki/authentication#overview" },
      {
        name: "Architecture",
        type: "folder",
        children: [
          { name: "Backend (Convex)", type: "file", path: "/wiki/authentication#architecture" },
          { name: "Frontend (Next.js)", type: "file", path: "/wiki/authentication#architecture" },
        ],
      },
      {
        name: "Authentication Flow",
        type: "folder",
        children: [
          { name: "Sign Up Flow", type: "file", path: "/wiki/authentication#auth-flow" },
          { name: "Sign In Flow", type: "file", path: "/wiki/authentication#auth-flow" },
        ],
      },
      { name: "Session Management", type: "file", path: "/wiki/authentication#session-management" },
      { name: "Password Reset Flow", type: "file", path: "/wiki/authentication#password-security" },
      { name: "OAuth Integration (GitHub)", type: "file", path: "/wiki/authentication#oauth" },
      { name: "HTTP Routes & Proxy", type: "file", path: "/wiki/authentication#http-routes" },
      { name: "Database Schema", type: "file", path: "/wiki/authentication#database-schema" },
      {
        name: "Security Analysis",
        type: "folder",
        children: [
          { name: "Security Strengths", type: "file", path: "/wiki/authentication#security" },
          { name: "Potential Security Considerations", type: "file", path: "/wiki/authentication#security" },
        ],
      },
      { name: "Developer Reference", type: "file", path: "/wiki/authentication#developer-reference" },
    ],
  },
  {
    name: "State Management",
    type: "folder",
    children: [
      { name: "Overview", type: "file", path: "/wiki/statemanagement#overview" },
      {
        name: "Core Stores",
        type: "folder",
        children: [
          { name: "dashboardStore.ts", path: "/wiki/statemanagement#dashboardStore", type: "file" },
          { name: "feedStore.ts", path: "/wiki/statemanagement#feedStore", type: "file" },
          { name: "viewOrchestrator.ts", path: "/wiki/statemanagement#viewOrchestrator", type: "file" },
        ],
      },
      {
        name: "Components",
        type: "folder",
        children: [
          { name: "ViewContainer.tsx", path: "/wiki/statemanagement#viewContainer", type: "file" },
          { name: "ViewProvider.tsx", path: "/wiki/statemanagement#viewProvider", type: "file" },
        ],
      },
      {
        name: "Implementation",
        type: "folder",
        children: [
          { name: "Dashboard Page", path: "/wiki/statemanagement#dashboardPage", type: "file" },
          { name: "App Layout", path: "/wiki/statemanagement#appLayout", type: "file" },
        ],
      },
      {
        name: "Backend",
        type: "folder",
        children: [
          { name: "schema.ts", path: "/wiki/statemanagement#convexSchema", type: "file" },
          { name: "userPreferences.ts", path: "/wiki/statemanagement#userPreferences", type: "file" },
        ],
      },
    ],
  },
  {
    name: "Legal",
    type: "folder",
    children: [
      { name: "Privacy Policy", type: "file", path: "/wiki/privacy-policy" },
      { name: "Terms of Service", type: "file", path: "/wiki/terms-of-service" },
    ],
  },
];

export default function WikiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Main Navbar */}
      <Navbar />

      {/* Wiki Sub-Navigation */}
      <header className="sticky top-16 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <a
              href="/wiki"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Documentation
            </a>
            <a
              href="/wiki/brand"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Brand
            </a>
            <a
              href="/wiki/user-guide"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              User Guide
            </a>
            <a
              href="/wiki/authentication"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Authentication
            </a>
            <a
              href="/wiki/statemanagement"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              State Management
            </a>
            <a
              href="/wiki/privacy-policy"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="/wiki/terms-of-service"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms of Service
            </a>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex">
        {/* Left Sidebar - Always visible with global navigation */}
        <div className="w-64 flex-shrink-0">
          <FileTreeSidebar fileTree={globalFileTree} />
        </div>

        {/* Content Area */}
        <main className="flex-1 py-8 px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
