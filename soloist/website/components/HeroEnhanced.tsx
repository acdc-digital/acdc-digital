// ENHANCED HERO COMPONENT - V2 Launch Preparation
// /Users/matthewsimon/Projects/acdc-digital/soloist/website/components/HeroEnhanced.tsx
// Incorporating SMNB design patterns and ACDC Digital brand guidelines

'use client'

import React, { useState } from "react";
import { Download, ChevronRight, Sparkles, Brain, TrendingUp, Activity } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useConvexUser } from "@/lib/hooks/useConvexUser";
import { HeroFeature } from "./HeroFeature";
import { DocsModal } from "./Docs";
import { DownloadModal } from "./DownloadModal";
import { StripeCheckoutModal } from "@/modals/StripeCheckoutModal";
import { SignInModal } from "@/modals/SignInModal";

export const HeroEnhanced = () => {
  // Authentication and subscription state
  const { isAuthenticated, isLoading: authLoading, userId } = useConvexUser();
  const hasActiveSubscription = useQuery(
    api.userSubscriptions.hasActiveSubscription,
    isAuthenticated && userId ? {} : "skip"
  );

  // Modal states
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);

  // Determine button behavior based on auth and subscription status
  const isSignedInAndSubscribed = isAuthenticated && hasActiveSubscription === true;
  const shouldShowStartNow = !isSignedInAndSubscribed;

  // Pro tier configuration (matching Pricing component)
  const proTierConfig = {
    name: "Pro",
    priceId: "price_1RYaXeD4wGLfhDePZlRBINbJ",
    paymentMode: "subscription" as const
  };

  const handleStartNowClick = () => {
    if (!isAuthenticated) {
      // Show sign-in modal for unauthenticated users
      setIsSignInModalOpen(true);
    } else if (hasActiveSubscription === false) {
      // Show checkout modal for authenticated users without subscription
      setIsCheckoutModalOpen(true);
    }
  };

  const handleAuthSuccess = () => {
    // Hide sign-in modal and show checkout modal after successful sign-in
    setIsSignInModalOpen(false);
    // Small delay to ensure UI state is updated
    setTimeout(() => {
      setIsCheckoutModalOpen(true);
    }, 100);
  };

  const handleCloseCheckoutModal = () => {
    setIsCheckoutModalOpen(false);
  };

  const handleCloseSignInModal = () => {
    setIsSignInModalOpen(false);
  };

  return (
    <section className="relative py-12 md:py-20 lg:py-24 container mx-auto px-4 overflow-hidden">
      {/* Premium Background with Floating Orbs - SMNB Inspired */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#f8f9fa] via-white to-[#e9ecef]"></div>
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-blue-500/8 rounded-full blur-3xl animate-float-delayed"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-400/8 rounded-full blur-3xl animate-float-slow"></div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
        {/* Left Side - Text Content */}
        <div className="space-y-8 lg:w-1/2 animate-slide-in-left">
          <div className="space-y-6">
            {/* Status Badge */}
            <div className="inline-flex items-center space-x-3 glass-card px-6 py-3 rounded-full border border-emerald-200/50">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse-glow"></div>
              <span className="text-emerald-700 font-semibold text-sm uppercase tracking-wider">#MoodForecasting</span>
            </div>
            
            {/* Hero Headline - ACDC Typography Scale */}
            <div className="space-y-4">
              <h1 className="text-hero font-black leading-[0.9] tracking-tight">
                <div className="text-[#1e1e1e]">Track.</div>
                <div className="text-[#343a40]">Predict.</div>
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent animate-light-sweep"></div>
                  <div className="relative text-emerald-600 px-2">Forecast.</div>
                </div>
              </h1>
              
              <p className="text-body-large text-[#495057] leading-relaxed max-w-2xl">
                Turn everyday moments into <span className="text-[#1e1e1e] font-bold">powerful predictions</span>. 
                See patterns in your life before they happen and take control of your future.
              </p>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              {shouldShowStartNow ? (
                // Show "Start Now" for non-subscribers
                <button
                  onClick={handleStartNowClick}
                  className="group relative inline-flex items-center justify-center gap-3 bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-emerald-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                >
                  <Sparkles className="w-5 h-5 relative z-10" aria-hidden="true" />
                  <span className="relative z-10">Start Now</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/0 via-white/20 to-emerald-400/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </button>
              ) : (
                // Show "Download App" for subscribed users
                <DownloadModal>
                  <button className="group relative inline-flex items-center justify-center gap-3 bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-emerald-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <Download className="w-5 h-5" aria-hidden="true" />
                    <span>Download App</span>
                  </button>
                </DownloadModal>
              )}
              
              <DocsModal>
                <button className="inline-flex items-center justify-center gap-2 border-2 border-emerald-200 text-emerald-700 bg-emerald-50 px-8 py-4 rounded-xl font-bold text-lg hover:border-emerald-400 hover:bg-emerald-100 transition-all duration-300">
                  <span>Learn More</span>
                  <ChevronRight className="w-5 h-5" aria-hidden="true" />
                </button>
              </DocsModal>
            </div>
            
            {/* Live Metrics Cards - SMNB Style */}
            <div className="grid grid-cols-3 gap-4 pt-6">
              <div className="glass-card rounded-xl p-4 text-center border border-emerald-100/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-default">
                <div className="flex items-center justify-center mb-2">
                  <Brain className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="text-[#6c757d] text-xs font-semibold uppercase tracking-wide">AI Analysis</div>
              </div>
              <div className="glass-card rounded-xl p-4 text-center border border-blue-100/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-default">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-[#6c757d] text-xs font-semibold uppercase tracking-wide">Patterns</div>
              </div>
              <div className="glass-card rounded-xl p-4 text-center border border-purple-100/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-default">
                <div className="flex items-center justify-center mb-2">
                  <Activity className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-[#6c757d] text-xs font-semibold uppercase tracking-wide">Forecasts</div>
              </div>
            </div>
            
            {/* Footer Text */}
            <div className="pt-4 space-y-2">
              <p className="text-sm text-[#343a40] font-medium">
                Emotional heatmaps that <span className="text-emerald-600 font-bold">visualize your mood</span> and predict tomorrow&apos;s.
              </p>
              <p className="text-xs text-[#6c757d] font-mono">
                Powered by <span className="font-bold">ACDC.digital</span>
              </p>
            </div>
          </div>
        </div>
        
        {/* Right Side - Interactive Feature */}
        <div className="lg:w-1/2 w-full animate-slide-in-right">
          <div className="glass-strong rounded-2xl overflow-hidden shadow-strong border border-[#dee2e6]/50 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
            <HeroFeature />
          </div>
        </div>
      </div>

      {/* Stripe Checkout Modal */}
      <StripeCheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={handleCloseCheckoutModal}
        priceId={proTierConfig.priceId}
        productName={proTierConfig.name}
        paymentMode={proTierConfig.paymentMode}
      />

      {/* Sign In Modal */}
      <SignInModal
        isOpen={isSignInModalOpen}
        onClose={handleCloseSignInModal}
        onAuthSuccess={handleAuthSuccess}
        initialFlow="signIn"
      />
    </section>
  );
};
