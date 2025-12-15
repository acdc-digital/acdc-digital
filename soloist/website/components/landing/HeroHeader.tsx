// HERO HEADER COMPONENT
// /Users/matthewsimon/Projects/acdc-digital/soloist/website/components/landing/HeroHeader.tsx

'use client'

import React, { useState, useEffect } from "react";
import { ArrowRight, Loader2, CheckCircle } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useConvexUser } from "@/lib/hooks/useConvexUser";

export function HeroHeader() {
  const [detectedOS, setDetectedOS] = useState<'Windows' | 'macOS' | 'Other'>('Other');
  const [email, setEmail] = useState("");
  const [emailStatus, setEmailStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  // Authentication and subscription state
  const { isAuthenticated, userId } = useConvexUser();
  const hasActiveSubscription = useQuery(
    api.shared.users.userSubscriptions.hasActiveSubscription,
    isAuthenticated && userId ? {} : "skip"
  );

  // Email submission mutation
  const submitEmail = useMutation(api.website.public.learnMore.submitEmail);

  // Determine if downloads should be enabled
  const downloadsEnabled = isAuthenticated && hasActiveSubscription === true;
  const showSubscriptionMessage = isAuthenticated && hasActiveSubscription === false;

  // Download URLs
  const DOWNLOAD_URLS = {
    macOS: 'https://github.com/acdc-digital/acdc-digital/releases/download/v2.0.0/Soloist.Pro-2.0.0-x64.dmg',
    Windows: 'https://github.com/acdc-digital/acdc-digital/releases/download/v2.0.0/Soloist.Pro-Setup-2.0.0.exe',
  };

  // Handle direct download
  const handleDownload = (os: 'macOS' | 'Windows') => {
    if (!downloadsEnabled) return;
    window.location.href = DOWNLOAD_URLS[os];
  };

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

  // Handle email submission
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || emailStatus === "submitting") return;

    setEmailStatus("submitting");

    try {
      await submitEmail({ email });
      setEmailStatus("success");
      setEmail("");

      // Reset success message after 3 seconds
      setTimeout(() => {
        setEmailStatus("idle");
      }, 3000);
    } catch (error) {
      console.error("Failed to submit email:", error);
      setEmailStatus("error");

      // Reset error message after 3 seconds
      setTimeout(() => {
        setEmailStatus("idle");
      }, 3000);
    }
  };

  return (
    <div id="hero" className="text-center px-4 sm:px-6 md:px-8 lg:px-12 pt-8 md:pt-10 lg:pt-12 pb-2 w-full">
      <div className="max-w-7xl mx-auto">
        <div className="hidden md:flex flex-col items-center justify-center mb-6 md:mb-8 gap-4">
          <p className="text-xs md:text-sm text-muted-foreground tracking-wide italic">
            you must be subscribed to download.
          </p>
          <div className="flex gap-3 md:gap-4">
            <button
              disabled={!downloadsEnabled}
              onClick={() => handleDownload('macOS')}
              className={`inline-flex items-center gap-2 px-6 py-2 text-sm font-medium transition-all duration-200 ${
                !downloadsEnabled
                  ? "bg-white border border-border text-muted-foreground cursor-not-allowed"
                  : detectedOS === 'macOS'
                    ? "bg-white glass-strong border-border text-foreground hover:border-primary cursor-pointer shadow-sm hover:shadow-md"
                    : "bg-white border border-border text-muted-foreground cursor-not-allowed opacity-50"
              }`}
              title={
                !downloadsEnabled
                  ? (showSubscriptionMessage ? "Active subscription required" : "")
                  : detectedOS !== 'macOS'
                    ? "Not your operating system"
                    : ""
              }
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              macOS 13+
            </button>

            <button
              disabled={!downloadsEnabled}
              onClick={() => handleDownload('Windows')}
              className={`inline-flex items-center gap-2 px-6 py-2 text-sm font-medium transition-all duration-200 ${
                !downloadsEnabled
                  ? "bg-white border border-border text-muted-foreground cursor-not-allowed"
                  : detectedOS === 'Windows'
                    ? "bg-white glass-strong border-border text-foreground hover:border-primary cursor-pointer shadow-sm hover:shadow-md"
                    : "bg-white border border-border text-muted-foreground cursor-not-allowed opacity-50"
              }`}
              title={
                !downloadsEnabled
                  ? (showSubscriptionMessage ? "Active subscription required" : "")
                  : detectedOS !== 'Windows'
                    ? "Not your operating system"
                    : ""
              }
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75V22.1L0 20.699M10.949 12.6H24V24l-13.051-1.4"/>
              </svg>
              Windows 10+
            </button>
          </div>
        </div>
        <h1 className="text-[clamp(1.75rem,7vw,5.5rem)] sm:text-[clamp(2rem,8vw,5.5rem)] md:text-[clamp(2.5rem,6vw,5.5rem)] lg:text-hero-mobile font-bold tracking-tight mb-4 md:mb-6 lg:mb-8 mt-4 md:mt-6 lg:mt-8 font-parkinsans-bold leading-[0.95] sm:leading-[0.9] lg:whitespace-nowrap">
          Track. Compute. Forecast.
        </h1>
        <div className="flex flex-col items-center justify-center mb-2 md:mb-2 gap-3 md:gap-4">
          <p className="text-base sm:text-lg md:text-xl lg:text-subtitle-mobile text-muted-foreground font-medium font-parkinsans-bold">
            The next evolution in theraputic journaling.
          </p>
          <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 w-full max-w-xs sm:max-w-md px-4 sm:px-0">
            <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap hidden sm:inline">learn more</span>
            <div className="relative w-full sm:flex-1 sm:min-w-[200px] md:min-w-[240px]">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your-email@example.com"
                disabled={emailStatus === "submitting" || emailStatus === "success"}
                className="w-full px-3 py-1.5 pr-10 text-xs border border-border rounded-full bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                required
              />
              <button
                type="submit"
                disabled={emailStatus === "submitting" || emailStatus === "success" || !email}
                className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Submit email"
              >
                {emailStatus === "submitting" ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : emailStatus === "success" ? (
                  <CheckCircle className="w-3 h-3" />
                ) : (
                  <ArrowRight className="w-3 h-3" />
                )}
              </button>
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap sm:hidden">learn more</span>
          </form>
          {emailStatus === "success" && (
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">Thanks! We&apos;ll be in touch soon.</p>
          )}
          {emailStatus === "error" && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">Something went wrong. Please try again.</p>
          )}
        </div>
      </div>
    </div>
  );
}
