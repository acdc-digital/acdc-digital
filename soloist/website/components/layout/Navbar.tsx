// NAVBAR
// /Users/matthewsimon/Documents/Github/solopro/website/components/Navbar.tsx

'use client'

import { useQuery } from "convex/react";
import Link from "next/link";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useState, useCallback, useEffect, useMemo } from "react";
import { SignInModal } from "@/modals/SignInModal";
import { Loader2, Menu, X, Shield, ShieldUserIcon, User, FileDown, LogOut } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { BouncingLogoCompact } from "@/components/features/BouncingLogoCompact";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useConvexUser } from "@/lib/hooks/useConvexUser";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { ProfileModal } from "@/modals/ProfileModal";
import { ExportDataModal } from "@/components/modals/ExportDataModal";

export function Navbar() {
  const { isAuthenticated, isLoading, userId } = useConvexUser();
  const { signOut } = useAuthActions();
  const router = useRouter();
  const pathname = usePathname();
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [signInFlow, setSignInFlow] = useState<"signIn" | "signUp" | "forgotPassword">("signIn");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [detectedOS, setDetectedOS] = useState<'Windows' | 'macOS' | 'Other'>('Other');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Check if current user is admin
  const isAdmin = useQuery(api.admin.isCurrentUserAdmin);

  // Get user details
  const user = useQuery(
    api.users.viewer,
    isAuthenticated && userId ? {} : "skip"
  );

  // Get user initials for avatar fallback
  const userInitials = useMemo(() => {
    if (!user?.name) return "U";
    const names = user.name.split(' ');
    if (names.length === 1) return names[0].substring(0, 1).toUpperCase();
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  }, [user?.name]);

  // Detect user's operating system
  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (userAgent.includes('win')) {
      setDetectedOS('Windows');
    } else if (userAgent.includes('mac')) {
      setDetectedOS('macOS');
    } else {
      setDetectedOS('Other');
    }
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Handle scroll to change navbar text color
  useEffect(() => {
    const handleScroll = () => {
      const navbarHeight = 80; // Approximate navbar height
      let shouldBeWhite = false;

      // Check if navbar is over the iframe container
      const iframeContainer = document.getElementById('demo-iframe-container');
      if (iframeContainer) {
        const rect = iframeContainer.getBoundingClientRect();
        const isOverIframe = rect.top <= navbarHeight && rect.bottom >= 0;
        if (isOverIframe) {
          shouldBeWhite = true;
        }
      }

      // Check if navbar is over the mini-component cards (DailyLogCard, FeedCard, etc.)
      const miniCards = document.querySelectorAll('[data-mini-card="true"]');
      if (miniCards.length > 0) {
        // Check each mini card to see if navbar is over any of them
        // Exclude cards within sections that have data-no-navbar-color-change or "how-it-works" id
        for (const card of miniCards) {
          const howItWorksSection = document.getElementById('how-it-works');
          const isInHowItWorks = howItWorksSection && howItWorksSection.contains(card as Node);
          
          // Check if card is within a section with data-no-navbar-color-change attribute
          const noColorChangeSection = (card as Element).closest('[data-no-navbar-color-change="true"]');
          
          if (!isInHowItWorks && !noColorChangeSection) {
            const rect = card.getBoundingClientRect();
            const isOverMiniCard = rect.top <= navbarHeight && rect.bottom >= 0;
            if (isOverMiniCard) {
              shouldBeWhite = true;
              break;
            }
          }
        }
      }

      setIsScrolled(shouldBeWhite);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial state
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const handleOpenSignUp = () => {
    setSignInFlow("signUp");
    setIsSignInModalOpen(true);
    setIsMobileMenuOpen(false);
  };

  const handleSignOut = () => {
    signOut().then(() => router.refresh());
    setIsMobileMenuOpen(false);
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    // If we're on the home page, smooth scroll to top instead of navigating
    if (pathname === '/') {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
    setIsMobileMenuOpen(false);
  };

  // Callback for after successful auth
  const handleAuthSuccess = useCallback(() => {
    setIsSignInModalOpen(false);
    router.refresh();
  }, [router]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleDirectDownload = () => {
    let downloadUrl = '';

    // Default to the user's OS, but fallback to macOS if unknown
    if (detectedOS === 'Windows') {
      downloadUrl = 'https://github.com/acdc-digital/solopro/releases/download/v1.6.6/Soloist.Pro-Setup-1.6.5.exe';
    } else if (detectedOS === 'macOS') {
      downloadUrl = 'https://github.com/acdc-digital/solopro/releases/download/v1.6.6/Soloist.Pro-1.6.5-x64.dmg';
    } else {
      // Default to macOS x64 for other OS
      downloadUrl = 'https://github.com/acdc-digital/solopro/releases/download/v1.6.6/Soloist.Pro-1.6.5-x64.dmg';
    }

    // Create a temporary link and trigger download
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = '';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <header className="sticky top-0 z-50 backdrop-blur-md supports-[backdrop-filter]:bg-stone-50/35 border-b border-zinc-500">
        <div className="container mx-auto px-responsive-lg flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-4 sm:gap-4">
            <Link
              href="/"
              className="hover:opacity-80 transition-opacity"
              onClick={handleLogoClick}
            >
              <BouncingLogoCompact size={42} className="w-8 sm:w-10 md:w-12 transition-all duration-200" />
            </Link>
            <div className="flex items-start gap-1 relative">
              <span className={`text-4xl transition-colors font-parkinsans-semibold text-foreground ${isScrolled ? 'text-white hover:text-white/80' : 'text-muted-foreground hover:text-foreground'}`}>
                Soloist.
              </span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-500 text-white -mt-1 ml-0.5 shadow-sm">
                v2.0.0
              </span>
            </div>
          </div>

          {/* Desktop Nav links */}
          <nav className="hidden md:flex items-center font-parkinsans-nomral space-x-4 md:space-x-6 lg:space-x-8 xl:space-x-10 mx-4 md:mx-6 lg:mx-8">
            <Link
              href="/"
              className={`text-base lg:text-lg font-medium transition-colors font-inter ${isScrolled ? 'text-white hover:text-white/80' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Home
            </Link>
            {/* Pricing and FAQ - disabled on /wiki and /blog pages (scroll elements) */}
            {pathname === '/wiki' || pathname === '/blog' ? (
              <>
                <span className={`text-base lg:text-lg font-medium font-inter ${isScrolled ? 'text-white/30' : 'text-zinc-400/50'}`}>
                  Pricing
                </span>
                <span className={`text-base lg:text-lg font-medium font-inter ${isScrolled ? 'text-white/30' : 'text-zinc-400/50'}`}>
                  FAQ
                </span>
              </>
            ) : (
              <>
                <Link
                  href="#pricing"
                  className={`text-base lg:text-lg font-medium transition-colors font-inter ${isScrolled ? 'text-white hover:text-white/80' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Pricing
                </Link>
                <Link
                  href="#faq"
                  className={`text-base lg:text-lg font-medium transition-colors font-inter ${isScrolled ? 'text-white hover:text-white/80' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  FAQ
                </Link>
              </>
            )}
            {/* <Link
              href="#roadmap"
              className={`text-lg font-medium transition-colors font-inter ${isScrolled ? 'text-white hover:text-white/80' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Roadmap
            </Link> */}
            <Link
              href="/wiki"
              className={`text-base lg:text-lg font-medium transition-colors font-inter ${isScrolled ? 'text-white hover:text-white/80' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Docs
            </Link>
            <Link
              href="/blog"
              className={`text-base lg:text-lg font-medium transition-colors font-inter ${isScrolled ? 'text-white hover:text-white/80' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Blog
            </Link>
          </nav>

          {/* Desktop Auth buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoading ? (
              <button
                disabled
                className="inline-flex items-center justify-center gap-2 rounded-md bg-muted px-5 py-2.5 text-base font-medium text-muted-foreground cursor-not-allowed"
              >
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading
              </button>
            ) : isAuthenticated ? (
              <>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="inline-flex items-center justify-center rounded-full border border-red-600 bg-red-50 h-10 w-10 text-red-600 hover:bg-red-100 hover:border-red-700 transition-all duration-200"
                    title="Admin Dashboard"
                  >
                    <ShieldUserIcon className="h- w-6" strokeWidth={1.5} />
                  </Link>
                )}
                {/* User Avatar Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user?.image || undefined} alt={user?.name || "User"} />
                        <AvatarFallback className="text-sm bg-white border border-black hover:bg-zinc-200 text-zinc-700">{userInitials}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex flex-col space-y-1 p-2">
                      <p className="text-sm font-medium leading-none">{user?.name || "User"}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email || "user@example.com"}
                      </p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setIsProfileModalOpen(true)}
                      className="cursor-pointer flex items-center gap-2"
                    >
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => signOut()}
                      className="cursor-pointer flex items-center gap-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Link
                  href={process.env.NEXT_PUBLIC_APP_URL || "https://app.acdc.digital"}
                  className="inline-flex items-center justify-center bg-blue-500 border border-blue-900 px-3 lg:px-5 py-1.5 lg:py-2 text-sm lg:text-base text-white hover:bg-blue-700 hover:border-blue-700 transition-all duration-200 font-bold font-inter whitespace-nowrap"
                >
                  Soloist.
                </Link>
                <button
                  onClick={handleSignOut}
                  className="inline-flex items-center justify-center border border-black bg-white px-3 lg:px-5 py-1.5 lg:py-2 text-sm lg:text-base font-medium text-foreground hover:bg-accent hover:text-accent-foreground hover:border-foreground transition-all duration-200 whitespace-nowrap"
                >
                  Sign out
                </button>
              </>
            ) : (
              <button
                onClick={handleOpenSignUp}
                className="inline-flex items-center justify-center border border-black bg-blue-500 px-4 lg:px-7 py-1.5 lg:py-2 text-sm lg:text-base font-medium text-white hover:bg-accent hover:text-accent-foreground transition-colors whitespace-nowrap"
              >
                Get Started
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-md hover:bg-accent transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden fixed inset-x-0 top-16 glass-strong border-b border-border/40 shadow-lg transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'
        }`}>
          <nav className="container mx-auto px-4 py-6">
            {/* Mobile nav links */}
            <div className="space-y-4 mb-6">
              <Link
                href="#features"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
                style={{ fontFamily: '"Nunito", "Quicksand", "Comfortaa", system-ui, sans-serif' }}
              >
                Features
              </Link>
              <Link
                href="#pricing"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
                style={{ fontFamily: '"Nunito", "Quicksand", "Comfortaa", system-ui, sans-serif' }}
              >
                Pricing
              </Link>
              <Link
                href="#faq"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
                style={{ fontFamily: '"Nunito", "Quicksand", "Comfortaa", system-ui, sans-serif' }}
              >
                FAQ
              </Link>
              <Link
                href="#roadmap"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
                style={{ fontFamily: '"Nunito", "Quicksand", "Comfortaa", system-ui, sans-serif' }}
              >
                Roadmap
              </Link>
              <Link
                href="/wiki"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
                style={{ fontFamily: '"Nunito", "Quicksand", "Comfortaa", system-ui, sans-serif' }}
              >
                Docs
              </Link>
              <Link
                href="/blog"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
                style={{ fontFamily: '"Nunito", "Quicksand", "Comfortaa", system-ui, sans-serif' }}
              >
                Blog
              </Link>
            </div>

            {/* Mobile auth buttons */}
            <div className="space-y-3 pt-4 border-t border-border/40">
              {isLoading ? (
                <button
                  disabled
                  className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-muted px-5 py-2.5 text-base font-medium text-muted-foreground cursor-not-allowed"
                >
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Loading
                </button>
              ) : isAuthenticated ? (
                <>
                  {/* User info in mobile */}
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg mb-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user?.image || undefined} alt={user?.name || "User"} />
                      <AvatarFallback className="text-sm bg-zinc-200 text-zinc-700">{userInitials}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{user?.name || "User"}</span>
                      <span className="text-xs text-muted-foreground">{user?.email || ""}</span>
                    </div>
                  </div>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-3xl border border-red-600 bg-red-50 px-5 py-2.5 text-base font-medium text-red-600 hover:bg-red-100 hover:border-red-700 transition-all duration-200"
                    >
                      <Shield className="h-5 w-5" />
                      Admin Dashboard
                    </Link>
                  )}
                  <ExportDataModal>
                    <button
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-3xl border border-input bg-background px-5 py-2.5 text-base font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200"
                    >
                      <FileDown className="h-5 w-5" />
                      Export Data
                    </button>
                  </ExportDataModal>
                  <button
                    onClick={handleDirectDownload}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-3xl border border-input bg-background px-5 py-2.5 text-base font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200"
                  >
                    <Download className="h-5 w-5" />
                    Download Desktop App
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="w-full inline-flex items-center justify-center rounded-3xl border border-black bg-white px-5 py-2.5 text-base font-medium text-foreground hover:bg-accent hover:text-accent-foreground hover:border-foreground transition-all duration-200"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <button
                  onClick={handleOpenSignUp}
                  className="w-full inline-flex items-center justify-center rounded-3xl border border-black bg-white px-7 py-2.5 text-base font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  Get Started
                </button>
              )}
            </div>
          </nav>
        </div>
      </header>

      {/* Sign In Modal */}
      <SignInModal
        isOpen={isSignInModalOpen}
        onClose={() => setIsSignInModalOpen(false)}
        initialFlow={signInFlow}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Profile Modal */}
      <ProfileModal
        open={isProfileModalOpen}
        onOpenChange={setIsProfileModalOpen}
      />
    </>
  );
}