// APP PAGE
// /Users/matthewsimon/Documents/Github/solopro/website/app/page.tsx

"use client";

import React, { useEffect, useState } from "react";
import {
  CheckCircle,
  XCircle,
  X,
  Loader2,
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useConvexUser } from "@/lib/hooks/useConvexUser";
import { Navbar } from "@/components/layout/Navbar";
import { AnnouncementBanner } from "@/components/landing/AnnouncementBanner";
import { Steps } from "@/components/landing/Steps";
import { DemoApp } from "@/components/demo/DemoApp";
import { FeatureSection } from "@/components/features/Reflections";
import { FAQ } from "@/components/landing/FAQ";
import { Roadmap } from "@/components/landing/Roadmap";
import Pricing from "@/components/landing/Pricing";
import CompetitiveComparison from "@/components/landing/CompetitiveComparison";
import { CTABanner } from "@/components/landing/CTABanner";
import { Footer } from "@/components/layout/Footer";
import { DownloadModal } from "@/components/modals/DownloadModal";
import { getCheckoutSession } from "@/lib/services/PaymentService";

export default function LandingPage() {
  const [paymentStatus, setPaymentStatus] = useState<{
    type: "success" | "canceled" | null;
    message: string;
  } | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(false);
  const [detectedOS, setDetectedOS] = useState<'Windows' | 'macOS' | 'Other'>('Other');

  // Authentication and subscription state
  const { isAuthenticated, isLoading: authLoading, userId } = useConvexUser();
  const hasActiveSubscription = useQuery(
    api.userSubscriptions.hasActiveSubscription,
    isAuthenticated && userId ? {} : "skip"
  );

  // Determine if downloads should be enabled
  const downloadsEnabled = isAuthenticated && hasActiveSubscription === true;
  const showAuthMessage = !authLoading && !isAuthenticated;
  const showSubscriptionMessage = isAuthenticated && hasActiveSubscription === false;

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

  // Check for payment status in URL
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const success = queryParams.get("success");
    const canceled = queryParams.get("canceled");
    const sessionId = queryParams.get("session_id");

    if (success === "true") {
      setPaymentStatus({
        type: "success",
        message: "Payment successful! Your subscription is now active.",
      });

      // Clear the query parameters from the URL without page reload
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (canceled === "true") {
      setPaymentStatus({
        type: "canceled",
        message:
          "Payment was canceled. You can try again whenever you&apos;re ready.",
      });

      // Clear the query parameters from the URL without page reload
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (sessionId) {
      // Check the session status from the API
      setIsCheckingSession(true);

      getCheckoutSession(sessionId)
        .then((session) => {
          console.log("Session details:", session);

          if (
            session.paymentStatus === "paid" ||
            session.status === "complete"
          ) {
            setPaymentStatus({
              type: "success",
              message: "Payment successful! Your subscription is now active.",
            });
          } else if (session.status === "open") {
            setPaymentStatus({
              type: "success",
              message:
                "Your payment is processing. Your subscription will be active shortly.",
            });
          } else {
            setPaymentStatus({
              type: "canceled",
              message:
                "The checkout was not completed. You can try again whenever you&apos;re ready.",
            });
          }
        })
        .catch((error) => {
          console.error("Failed to check session status:", error);
          setPaymentStatus({
            type: "canceled",
            message:
              "We couldn&apos;t verify your payment status. Please contact support if you completed a payment.",
          });
        })
        .finally(() => {
          setIsCheckingSession(false);
          // Clear the query parameters from the URL without page reload
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname,
          );
        });
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Add EnvDebug component
      <EnvDebug /> */}

      {/* Navigation Bar with Theme Toggle */}
      <Navbar />
      <AnnouncementBanner />

      {/* Hero Text Section */}
      <div id="hero" className="text-left px-responsive-xl pt-8 md:pt-12 pb-2">
        <div className="hidden md:flex items-end justify-between mb-8">
          <p className="text-xs text-muted-foreground tracking-wide italic mb-0">
            you must be subscribed to download.
          </p>
          <div className="flex gap-4 pb-1">
            <DownloadModal>
              <button 
                disabled={!downloadsEnabled}
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
            </DownloadModal>
            
            <DownloadModal>
              <button 
                disabled={!downloadsEnabled}
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
            </DownloadModal>
          </div>
        </div>
        <h1 className="text-[clamp(2.75rem,10vw,5.5rem)] md:text-hero-mobile font-bold tracking-tight mb-4 md:mb-5 mt-6 md:mt-8 font-parkinsans-bold leading-[0.9]">
          Track. Compute. Forecast.
        </h1>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
          <p className="text-subtitle-mobile text-muted-foreground font-medium font-parkinsans-bold">
            The weather app for your mood.
          </p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-3 max-w-md">
            <span className="text-sm text-muted-foreground whitespace-nowrap hidden sm:inline">learn more</span>
            <input
              type="email"
              placeholder="your-email@example.com"
              className="flex-1 min-w-0 w-1/2 sm:w-48 px-2 py-1.5 text-xs border border-border rounded-full bg-background focus:outline-none focus:border-border"
            />
            <span className="text-xs text-muted-foreground whitespace-nowrap sm:hidden pl-2">learn more</span>
          </div>
        </div>
      </div>

      {/* Payment Status Notification */}
      {isCheckingSession ? (
        <div className="fixed top-20 right-4 z-50 p-4 rounded-lg shadow-lg max-w-md glass-card">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-foreground">
                Verifying your payment status...
              </p>
            </div>
          </div>
        </div>
      ) : (
        paymentStatus && (
          <div
            className={`fixed top-20 right-4 z-50 p-4 rounded-lg shadow-lg max-w-md glass-card ${
              paymentStatus.type === "success"
                ? "border-green-200"
                : "border-amber-200"
            }`}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {paymentStatus.type === "success" ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-amber-600" />
                )}
              </div>
              <div className="ml-3">
                <p
                  className={`text-sm font-medium ${
                    paymentStatus.type === "success"
                      ? "text-green-800"
                      : "text-amber-800"
                  }`}
                >
                  {paymentStatus.message}
                </p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => setPaymentStatus(null)}
                  className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    paymentStatus.type === "success"
                      ? "text-green-600 hover:bg-green-50 focus:ring-green-500"
                      : "text-amber-600 hover:bg-amber-50 focus:ring-amber-500"
                  }`}
                >
                  <span className="sr-only">Dismiss</span>
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )
      )}

      <main className="flex-1">
        {/* Hero Section
        <Hero /> */}

        {/* Interactive Demo */}
        <section id="demo-section" className="py-0 md:py-0">
          <DemoApp />
        </section>

        {/* Steps Section */}
        <Steps />

        {/* Competitive Comparison Section */}
        <CompetitiveComparison />

        {/* Pricing Section */}
        <Pricing />

        {/* Open Source Community Section
        <OpenSource /> */}

        {/* Feature Section */}
        <FeatureSection />

        {/* FAQ Section */}
        <FAQ />

        {/* Roadmap Section */}
        <Roadmap />

        {/* Final CTA */}
        <CTABanner />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
