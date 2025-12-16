// NAVIGATION SIDEBAR
// /Users/matthewsimon/Documents/Github/electron-nextjs/renderer/src/app/dashboard/_components/sidebar.tsx

"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/store/userStore";
import { useCurrentView } from "@/store/viewOrchestrator";
import { useView } from "@/providers/ViewProvider";
import {
  Plus,
  Settings,
  ChartSpline,
  Activity,
  TableOfContents,
  User,
  Download,
  LucideIcon,
  Zap,
  TrafficCone,
} from "lucide-react";
import { HeatmapIcon } from "@/components/icons/HeatmapIcon";

// Custom Waypoints Icon - follows Lucide design principles (24x24 canvas, 2px stroke, round caps/joins)
function WaypointsIcon({ className, isActive }: { className?: string; isActive?: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(
        "h-5 w-5 transition-colors",
        isActive ? "text-foreground" : "text-muted-foreground",
        className
      )}
    >
      {/* Waypoint marker dot */}
      <circle cx="5" cy="6" r="2" fill="currentColor" />
      {/* Smooth wavelength path */}
      <path d="M2 18 Q 7 12 12 16 Q 17 20 22 14" />
    </svg>
  );
}

// Custom Soloist Icon - exact Lucide circle-fading-plus paths without the plus
function SoloistIcon({ className, isActive }: { className?: string; isActive?: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(
        "h-5.5 w-5.5 transition-colors",
        isActive ? "text-foreground" : "text-muted-foreground",
        className
      )}
    >
      {/* Exact Lucide circle-fading-plus paths (without plus) */}
      <path d="M12 2a10 10 0 0 1 7.38 16.75" />
      <path d="M2.5 8.875a10 10 0 0 0-.5 3" />
      <path d="M2.83 16a10 10 0 0 0 2.43 3.4" />
      <path d="M4.636 5.235a10 10 0 0 1 .891-.857" />
      <path d="M8.644 21.42a10 10 0 0 0 7.631-.38" />
    </svg>
  );
}

// Custom Palette Icon - color palette for Canvas view (based on Lucide palette icon)
function PaletteIcon({ className, isActive }: { className?: string; isActive?: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(
        "h-5.5 w-5.5 transition-colors",
        isActive ? "text-foreground" : "text-muted-foreground",
        className
      )}
    >
      {/* Palette shape */}
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z" />
    </svg>
  );
}
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
// Import Stores & Modals
import { SettingsDialog } from "@/app/settings/SettingsDialog";
import { ProfileModal } from "@/dashboard/user/_components/ProfileModal";
import { useFeedStore } from "@/store/feedStore";
import { useConvexUser } from "@/hooks/useConvexUser";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useBrowserEnvironment } from "@/utils/environment";
// Import SignOut component
import { SignOutWithGitHub } from "@/auth/oauth/SignOutWithGitHub";
// Import auth actions for sign out
import { useAuthActions } from "@convex-dev/auth/react";
// Import dropdown menu components
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const isBrowser = useBrowserEnvironment();
  
  // Get authenticated user following authentication rules
  const { isAuthenticated, isLoading: authLoading, userId } = useConvexUser();
  
  // Get user details from Convex when authenticated (works for both browser and desktop)
  const user = useQuery(
    api.shared.users.users.viewer,
    isAuthenticated && userId ? {} : "skip"
  );
  
  // Check subscription status (now works for both browser and desktop mode)
  const hasActiveSubscription = useQuery(
    api.shared.users.userSubscriptions.hasActiveSubscription,
    isAuthenticated && userId ? {} : "skip"
  );
  
  // Use the actual authenticated user data
  const effectiveUser = user;
  
  // Use actual subscription status for both browser and desktop mode
  const effectiveSubscription = hasActiveSubscription;
  
  // Debug: Log the values to see what's happening
  React.useEffect(() => {
    console.log('Sidebar debug:', {
      isBrowser,
      isAuthenticated,
      hasUser: !!user,
      hasEffectiveUser: !!effectiveUser,
      effectiveUser,
      shouldShowAvatar: isBrowser !== null && effectiveUser && ((isBrowser === true) || isAuthenticated)
    });
    console.log('Condition breakdown:', {
      'isBrowser !== null': isBrowser !== null,
      'effectiveUser exists': !!effectiveUser,
      'isBrowser === true': isBrowser === true,
      'isAuthenticated': isAuthenticated,
      '(isBrowser === true) || isAuthenticated': (isBrowser === true) || isAuthenticated,
      'FINAL': isBrowser !== null && effectiveUser && ((isBrowser === true) || isAuthenticated)
    });
  }, [isBrowser, isAuthenticated, user, effectiveUser]);
  
  const currentView = useCurrentView();
  const { transitionTo } = useView();
  
  // State to control the SettingsDialog
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);

  // State to control the ProfileModal
  const [isProfileModalOpen, setIsProfileModalOpen] = React.useState(false);

  // State to track dropdown open state for chevron direction
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  // Auth actions for sign out
  const { signOut } = useAuthActions();
  
  // Handlers
  const handleGoToSettings = () => {
    setIsSettingsOpen(true);
  };
  
  const handleCreateNewLog = () => {
    const {
      sidebarOpen,
      activeTab,
      resetFeed,
      setSidebarOpen,
      setSelectedDate,
      setActiveTab,
    } = useFeedStore.getState();
    
    console.log("Create New Log clicked - Current state:", { sidebarOpen, activeTab });
    
    // Set view to dashboard when creating a new log
    transitionTo("dashboard");
    
    // If it's already open on "log", close it (TOGGLE OFF)
    if (sidebarOpen && activeTab === "log") {
      console.log("Toggling sidebar OFF - closing sidebar");
      setSidebarOpen(false);
      return;
    }
    
    // Otherwise, open and set up the "log" tab (TOGGLE ON)
    console.log("Toggling sidebar ON - opening log tab");
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const dateKey = `${yyyy}-${mm}-${dd}`;
    
    resetFeed();
    setSelectedDate(dateKey);
    setActiveTab("log");
    setSidebarOpen(true);
  };
  
  const handleSoloist = () => {
    // Switch to Soloist view
    transitionTo("soloist");
    
    // Close the right sidebar if it's open
    const { setSidebarOpen } = useFeedStore.getState();
    setSidebarOpen(false);
    
    console.log("Soloist action clicked");
  };

  const handleTesting = () => {
    // Switch to Testing view
    transitionTo("testing");
    
    // Close the right sidebar if it's open
    const { setSidebarOpen } = useFeedStore.getState();
    setSidebarOpen(false);
    
    console.log("Testing action clicked");
  };

  const handleSuperpowers = () => {
    // Switch to Superpowers view
    transitionTo("superpowers");
    
    // Close the right sidebar if it's open
    const { setSidebarOpen } = useFeedStore.getState();
    setSidebarOpen(false);
    
    console.log("Superpowers action clicked");
  };

  const handleSoloistNew = () => {
    // Switch to SoloistNew view
    transitionTo("soloistNew");
    
    // Close the right sidebar if it's open
    const { setSidebarOpen } = useFeedStore.getState();
    setSidebarOpen(false);
    
    console.log("SoloistNew action clicked");
  };

  const handleCanvas = () => {
    // Switch to Canvas view
    transitionTo("canvas");
    
    // Close the right sidebar if it's open
    const { setSidebarOpen } = useFeedStore.getState();
    setSidebarOpen(false);
    
    console.log("Canvas action clicked");
  };

  const handleRoadmap = () => {
    // Switch to Roadmap view
    transitionTo("roadmap");
    
    // Close the right sidebar if it's open
    const { setSidebarOpen } = useFeedStore.getState();
    setSidebarOpen(false);
    
    console.log("Roadmap action clicked");
  };

  const handleWaypoints = () => {
    // Switch to Waypoints view
    transitionTo("waypoints");
    
    // Close the right sidebar if it's open
    const { setSidebarOpen } = useFeedStore.getState();
    setSidebarOpen(false);
    
    console.log("Waypoints action clicked");
  };

  const handleCalendar = () => {
    // Switch to Dashboard/Calendar view
    transitionTo("dashboard");
    
    // Close the right sidebar if it's open
    const { setSidebarOpen } = useFeedStore.getState();
    setSidebarOpen(false);
    
    console.log("Calendar action clicked");
  };
  
  const handleGoTohelp = () => {
    // Switch to Help view
    transitionTo("help");
    
    // Close the right sidebar if it's open
    const { setSidebarOpen } = useFeedStore.getState();
    setSidebarOpen(false);
    
    console.log("Help action clicked");
  };
  
  const handleDownload = () => {
    // Direct download for the desktop application
    const downloadUrl = 'https://github.com/acdc-digital/acdc-digital/releases/download/v2.0.0/Soloist.Pro-2.0.0-x64.dmg';

    // Create a temporary link and trigger download
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = 'Soloist.Pro-2.0.0-x64.dmg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleProfileClick = () => {
    setIsProfileModalOpen(true);
    console.log("Profile modal opened");
  };

  const handleSettingsClick = () => {
    handleGoToSettings();
  };

  const handleSignOut = () => {
    signOut();
    console.log("User signed out");
  };

  // Get user initials for avatar fallback
  const userInitials = React.useMemo(() => {
    if (!effectiveUser?.name) return "U";
    const names = effectiveUser.name.split(' ');
    if (names.length === 1) return names[0].substring(0, 1).toUpperCase();
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  }, [effectiveUser?.name]);

  // Activity bar item component matching Slack design with text labels outside highlight
  const ActivityBarItem = ({
    icon: Icon,
    label,
    isActive,
    onClick,
    disabled = false,
    variant = "default",
    iconSize = "default"
  }: {
    icon: LucideIcon;
    label: string;
    isActive?: boolean;
    onClick?: () => void;
    disabled?: boolean;
    variant?: "default" | "download";
    iconSize?: "default" | "large";
  }) => (
    <div
      className={cn(
        "w-full px-2.5 py-1.5 flex flex-col items-center gap-1",
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      )}
      onClick={disabled ? undefined : onClick}
    >
      <div
        className={cn(
          "w-full p-2 flex items-center justify-center relative transition-all duration-200 rounded-md",
          !disabled && "hover:bg-white/10",
          isActive && !disabled && "bg-white/15 border border-white/20",
          variant === "download" && !disabled && "hover:bg-emerald-500/10"
        )}
        title={label}
      >
        <Icon
          className={cn(
            iconSize === "large" ? "w-6 h-6" : "w-5 h-5",
            "transition-colors",
            disabled
              ? "text-muted-foreground/50"
              : isActive
                ? "text-foreground"
                : "text-muted-foreground",
            variant === "download" && !disabled && "text-emerald-600 dark:text-emerald-400"
          )}
        />
      </div>
      <span
        className={cn(
          "text-[10px] font-medium leading-none transition-colors",
          disabled
            ? "text-muted-foreground/50"
            : isActive
              ? "text-foreground"
              : "text-muted-foreground",
          variant === "download" && !disabled && "text-emerald-600 dark:text-emerald-400"
        )}
      >
        {label}
      </span>
    </div>
  );
  
  return (
    <TooltipProvider delayDuration={300}>
      <div className={cn("relative h-full", className)}>
        <aside
          className={cn(
            "flex flex-col h-full w-16",
            "bg-neutral-700/20 border-r border-border"
          )}
        >
          {/* TOP SECTION - Activity Bar */}
          <div className="flex flex-col items-center pt-2">
            {/* Calendar/Heatmap - Default View */}
            <div
              className="w-full px-2.5 py-1.5 flex flex-col items-center gap-1 cursor-pointer"
              onClick={handleCalendar}
            >
              <div
                className={cn(
                  "w-full p-2 flex items-center justify-center relative transition-all duration-200 rounded-md",
                  "hover:bg-white/10",
                  currentView === "dashboard" && "bg-white/15 border border-white/20"
                )}
                title="Calendar"
              >
                <HeatmapIcon isActive={currentView === "dashboard"} />
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium leading-none transition-colors",
                  currentView === "dashboard"
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                Heatmap
              </span>
            </div>

            {/* Waypoints/Base */}
            <div
              className="w-full px-2.5 py-1.5 flex flex-col items-center gap-1 cursor-pointer"
              onClick={handleWaypoints}
            >
              <div
                className={cn(
                  "w-full p-2 flex items-center justify-center relative transition-all duration-200 rounded-md",
                  "hover:bg-white/10",
                  currentView === "waypoints" && "bg-white/15 border border-white/20"
                )}
                title="Base"
              >
                <WaypointsIcon isActive={currentView === "waypoints"} />
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium leading-none transition-colors",
                  currentView === "waypoints"
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                Base
              </span>
            </div>

            {/* Soloist/Baseline - COMMENTED OUT: Replaced by new Soloist view */}
            {/* <ActivityBarItem
              icon={ChartSpline}
              label="Weekly"
              isActive={currentView === "soloist"}
              onClick={handleSoloist}
            /> */}

            {/* Playground - COMMENTED OUT: Replaced by new Soloist view */}
            {/* <ActivityBarItem
              icon={Activity}
              label="Sandbox"
              isActive={currentView === "testing"}
              onClick={handleTesting}
            /> */}

            {/* Soloist New */}
            <div
              className="w-full px-2.5 py-1.5 flex flex-col items-center gap-1 cursor-pointer"
              onClick={handleSoloistNew}
            >
              <div
                className={cn(
                  "w-full p-2 flex items-center justify-center relative transition-all duration-200 rounded-md",
                  "hover:bg-white/10",
                  currentView === "soloistNew" && "bg-white/15 border border-white/20"
                )}
                title="Soloist"
              >
                <SoloistIcon isActive={currentView === "soloistNew"} />
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium leading-none transition-colors",
                  currentView === "soloistNew"
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                Soloist
              </span>
            </div>

            {/* Canvas */}
            <div
              className="w-full px-2.5 py-1.5 flex flex-col items-center gap-1 cursor-pointer"
              onClick={handleCanvas}
            >
              <div
                className={cn(
                  "w-full p-2 flex items-center justify-center relative transition-all duration-200 rounded-md",
                  "hover:bg-white/10",
                  currentView === "canvas" && "bg-white/15 border border-white/20"
                )}
                title="Canvas"
              >
                <PaletteIcon isActive={currentView === "canvas"} />
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium leading-none transition-colors",
                  currentView === "canvas"
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                Canvas
              </span>
            </div>

            {/* Download App - Only for browser users with subscription */}
            {isBrowser === true && effectiveSubscription && (
              <ActivityBarItem
                icon={Download}
                label="Download App"
                onClick={handleDownload}
                variant="download"
              />
            )}

            {/* Help */}
            <ActivityBarItem
              icon={TableOfContents}
              label="Guide"
              onClick={handleGoTohelp}
              iconSize="large"
            />

            {/* Feedback */}
            <div
              className="w-full px-2.5 py-1.5 flex flex-col items-center gap-1 cursor-pointer"
              onClick={handleRoadmap}
            >
              <div
                className={cn(
                  "w-full p-2 flex items-center justify-center relative transition-all duration-200 rounded-md",
                  "hover:bg-white/10",
                  currentView === "roadmap" && "bg-white/15 border border-white/20"
                )}
                title="Feedback"
              >
                <TrafficCone
                  className={cn(
                    "h-5.5 w-5.5 transition-colors",
                    currentView === "roadmap" ? "text-foreground" : "text-muted-foreground"
                  )}
                />
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium leading-none transition-colors",
                  currentView === "roadmap"
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                Service
              </span>
            </div>

            {/* Create New Log - Icon only - COMMENTED OUT: Cleaning up sidebar navigation */}
            {/* <div
              className="w-full px-2.5 py-1.5 flex flex-col items-center cursor-pointer"
              onClick={handleCreateNewLog}
            >
              <div
                className="w-full p-2 flex items-center justify-center relative transition-all duration-200 rounded-md hover:bg-white/10"
                title="New Log"
              >
                <Plus className="w-5 h-5 text-muted-foreground transition-colors" />
              </div>
            </div> */}
          </div>

          {/* FOOTER SECTION - User Avatar */}
          <div className={cn(
            "mt-auto flex flex-col items-center",
            isBrowser === true ? "pb-4" : "pb-4"
          )}>
            {/* Show avatar when: in browser mode (once determined) OR authenticated in desktop */}
            {isBrowser !== null && effectiveUser && ((isBrowser === true) || isAuthenticated) && (
              <Tooltip>
                <DropdownMenu onOpenChange={setIsDropdownOpen}>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="w-12 h-12 hover:bg-accent/10 flex items-center justify-center cursor-pointer relative transition-all duration-200"
                        title={effectiveUser.name || "User"}
                      >
                        <Avatar className="h-7 w-7">
                          <AvatarImage src={effectiveUser.image || undefined} alt={effectiveUser.name || "User"} />
                          <AvatarFallback className="text-xs bg-muted text-muted-foreground border border-zinc-500">
                            {userInitials}
                          </AvatarFallback>
                        </Avatar>
                      </button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{effectiveUser.name || "User"}</p>
                  </TooltipContent>
                  <DropdownMenuContent className="w-56 mb-2 ml-10" align="start" side="top">
                    <div className="flex flex-col space-y-1 p-2">
                      <p className="text-sm font-medium leading-none">{effectiveUser.name || "User"}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {effectiveUser.email || "user@example.com"}
                      </p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleProfileClick}
                      className="cursor-pointer flex items-center gap-2"
                    >
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleSettingsClick}
                      className="cursor-pointer flex items-center gap-2"
                    >
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="cursor-pointer flex items-center gap-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <Settings className="h-4 w-4" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </Tooltip>
            )}
          </div>
        </aside>
        
        {/* Our SettingsDialog component, controlled by local state */}
        <SettingsDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
        


        {/* Our ProfileModal component, controlled by local state */}
        <ProfileModal open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen} />
      </div>
    </TooltipProvider>
  );
}