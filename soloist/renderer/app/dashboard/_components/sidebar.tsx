// NAVIGATION SIDEBAR
// /Users/matthewsimon/Documents/Github/electron-nextjs/renderer/src/app/dashboard/_components/sidebar.tsx

// NAVIGATION SIDEBAR
// /Users/matthewsimon/Documents/Github/electron-nextjs/renderer/src/app/dashboard/_components/sidebar.tsx

"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/store/userStore";
import { useSidebarStore } from "@/store/sidebarStore";
import {
  Plus,
  Settings,
  PersonStanding,
  Activity,
  CircleHelpIcon,
  User,
  Calendar,
  Download,
  ClipboardCheck,
} from "lucide-react";
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
import { HelpModal } from "@/components/HelpModal";
import { ProfileModal } from "@/components/ProfileModal";
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
  
  // Get authenticated user following authentication rules (skip for browser mode)
  const { isAuthenticated, isLoading: authLoading, userId } = useConvexUser();
  
  // Get user details from Convex when authenticated (skip for browser mode)
  const user = useQuery(
    api.users.viewer,
    isBrowser === false && isAuthenticated && userId ? {} : "skip"
  );
  
  // Check subscription status (now works for both browser and desktop mode)
  const hasActiveSubscription = useQuery(
    api.userSubscriptions.hasActiveSubscription,
    isAuthenticated && userId ? {} : "skip"
  );
  
  // For browser mode, provide default user data
  const effectiveUser = isBrowser === true ? {
    name: "Web User",
    email: "web@soloist.app",
    image: null
  } : user;
  
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
  
  const { 
    currentView,
    setView
  } = useSidebarStore();
  
  // State to control the SettingsDialog
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  
  // State to control the HelpModal
  const [isHelpOpen, setIsHelpOpen] = React.useState(false);

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
    setView("dashboard");
    
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
    setView("soloist");
    
    // Close the right sidebar if it's open
    const { setSidebarOpen } = useFeedStore.getState();
    setSidebarOpen(false);
    
    console.log("Soloist action clicked");
  };

  const handleTesting = () => {
    // Switch to Testing view
    setView("testing");
    
    // Close the right sidebar if it's open
    const { setSidebarOpen } = useFeedStore.getState();
    setSidebarOpen(false);
    
    console.log("Testing action clicked");
  };

  const handleWaypoints = () => {
    // Switch to Waypoints view
    setView("waypoints");
    
    // Close the right sidebar if it's open
    const { setSidebarOpen } = useFeedStore.getState();
    setSidebarOpen(false);
    
    console.log("Waypoints action clicked");
  };

  const handleCalendar = () => {
    // Switch to Dashboard/Calendar view
    setView("dashboard");
    
    // Close the right sidebar if it's open
    const { setSidebarOpen } = useFeedStore.getState();
    setSidebarOpen(false);
    
    console.log("Calendar action clicked");
  };
  
  const handleGoTohelp = () => {
    // Open the help modal
    setIsHelpOpen(true);
    
    console.log("Help modal opened");
  };
  
  const handleDownload = () => {
    // Direct download for the desktop application
    const downloadUrl = 'https://github.com/acdc-digital/solopro/releases/download/v1.6.6/Soloist.Pro-1.6.6-x64.dmg';

    // Create a temporary link and trigger download
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = 'Soloist.Pro-1.6.6-x64.dmg';
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
  
  // Items that show only if expanded
  const mainActions = [
    { id: "soloist",  label: "Soloist",        icon: PersonStanding,  action: handleSoloist, active: currentView === "soloist", disabled: false },
    // For browser users: always show playground but disabled if no subscription
    // For desktop users: only show if they have subscription
    ...(isBrowser === true ? [{
      id: "testing", 
      label: "Playground", 
      icon: Activity, 
      action: effectiveSubscription ? handleTesting : () => {}, 
      active: currentView === "testing",
      disabled: !effectiveSubscription
    }] : effectiveSubscription ? [{
      id: "testing", 
      label: "Playground", 
      icon: Activity, 
      action: handleTesting, 
      active: currentView === "testing",
      disabled: false
    }] : []),
    { id: "calendar", label: "Calendar",       icon: Calendar,        action: handleCalendar, active: currentView === "dashboard", disabled: false },
    { id: "new-log",  label: "Create New Log", icon: Plus,            action: handleCreateNewLog, active: false, disabled: false },
    { id: "help",     label: "Help",           icon: CircleHelpIcon,  action: handleGoTohelp, disabled: false },
  ];
  
  // Get user initials for avatar fallback
  const userInitials = React.useMemo(() => {
    if (!effectiveUser?.name) return "U";
    const names = effectiveUser.name.split(' ');
    if (names.length === 1) return names[0].substring(0, 1).toUpperCase();
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  }, [effectiveUser?.name]);
  
  return (
    <TooltipProvider delayDuration={300}>
      <div className={cn("relative h-screen", className)}>
        <div
          className={cn(
            "flex flex-col justify-between h-full w-14",
            // Glass morphism effect with stronger blur and transparency
            "bg-zinc-50 dark:bg-gray-900/5 backdrop-blur-xl",
            // Very subtle border for definition
            "border-r border-white/10 dark:border-white/5",
            "overflow-hidden"
          )}
        >
          {/* TOP SECTION - Activity Bar */}
          <div className="relative flex flex-col items-center pt-4 space-y-2">
            {/* Action Buttons */}
            {/* Waypoints */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleWaypoints}
                  className={cn(
                    "h-10 w-10 rounded-lg",
                    "hover:bg-white/10 dark:hover:bg-white/5",
                    currentView === "waypoints" && "bg-blue-500/10 dark:bg-blue-400/10 border border-blue-500/30 dark:border-blue-400/30"
                  )}
                >
                  <ClipboardCheck className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Waypoints</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSoloist}
                  className={cn(
                    "h-10 w-10 rounded-lg",
                    "hover:bg-white/10 dark:hover:bg-white/5",
                    currentView === "soloist" && "bg-blue-500/10 dark:bg-blue-400/10 border border-blue-500/30 dark:border-blue-400/30"
                  )}
                >
                  <PersonStanding className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Soloist</p>
              </TooltipContent>
            </Tooltip>

            {/* Playground - Always visible, disabled if no subscription */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={effectiveSubscription ? handleTesting : undefined}
                  disabled={!effectiveSubscription}
                  className={cn(
                    "h-10 w-10 rounded-lg",
                    effectiveSubscription
                      ? "hover:bg-white/10 dark:hover:bg-white/5"
                      : "opacity-50 cursor-not-allowed",
                    currentView === "testing" && effectiveSubscription && "bg-blue-500/10 dark:bg-blue-400/10 border border-blue-500/30 dark:border-blue-400/30"
                  )}
                >
                  <Activity className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{effectiveSubscription ? "Playground" : "Playground (Subscribe)"}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCalendar}
                  className={cn(
                    "h-10 w-10 rounded-lg",
                    "hover:bg-white/10 dark:hover:bg-white/5",
                    currentView === "dashboard" && "bg-blue-500/10 dark:bg-blue-400/10 border border-blue-500/30 dark:border-blue-400/30"
                  )}
                >
                  <Calendar className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Calendar</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCreateNewLog}
                  className="h-10 w-10 rounded-lg hover:bg-white/10 dark:hover:bg-white/5"
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Create New Log</p>
              </TooltipContent>
            </Tooltip>

            {/* Download App - Only for browser users with subscription */}
            {isBrowser === true && effectiveSubscription && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleDownload}
                    className="h-10 w-10 rounded-lg hover:bg-emerald-500/10 dark:hover:bg-emerald-500/10 border border-emerald-500/20 dark:border-emerald-500/20"
                  >
                    <Download className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Download App</p>
                </TooltipContent>
              </Tooltip>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleGoTohelp}
                  className="h-10 w-10 rounded-lg hover:bg-white/10 dark:hover:bg-white/5"
                >
                  <CircleHelpIcon className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Help</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* FOOTER SECTION - User Avatar */}
        <div className={cn(
          "relative flex flex-col items-center",
          isBrowser === true ? "pb-24 mb-4" : "pb-12" // Extra padding in browser mode for footer
        )}>
          {/* Show avatar when: in browser mode (once determined) OR authenticated in desktop */}
          {isBrowser !== null && effectiveUser && ((isBrowser === true) || isAuthenticated) && (
            <div className="pt-3 w-full flex justify-center">
              <Tooltip>
                <DropdownMenu onOpenChange={setIsDropdownOpen}>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-full hover:bg-white/10 dark:hover:bg-white/5"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={effectiveUser.image || undefined} alt={effectiveUser.name || "User"} />
                          <AvatarFallback className="text-xs bg-white/20 dark:bg-white/10 text-zinc-700 dark:text-zinc-300">
                            {userInitials}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{effectiveUser.name || "User"}</p>
                  </TooltipContent>
                  <DropdownMenuContent className="w-56 mb-2 ml-12" align="start" side="top">
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
            </div>
          )}
        </div>
        </div>
        
        {/* Our SettingsDialog component, controlled by local state */}
        <SettingsDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
        
        {/* Our HelpModal component, controlled by local state */}
        <HelpModal open={isHelpOpen} onOpenChange={setIsHelpOpen} />

        {/* Our ProfileModal component, controlled by local state */}
        <ProfileModal open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen} />
      </div>
    </TooltipProvider>
  );
}