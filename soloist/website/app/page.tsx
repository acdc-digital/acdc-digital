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
import { Navbar } from "@/components/layout/Navbar";
import { AnnouncementBanner } from "@/components/landing/AnnouncementBanner";
import { HeroHeader } from "@/components/landing/HeroHeader";
import { Steps } from "@/components/landing/Steps";
import { MoreForLess } from "@/components/landing/MoreForLess";
import { DemoApp } from "@/components/demo/DemoApp";
import { FeatureSection } from "@/components/features/Reflections";
import { FAQ } from "@/components/landing/FAQ";
import { Roadmap } from "@/components/landing/Roadmap";
import Pricing from "@/components/landing/Pricing";
import CompetitiveComparison from "@/components/landing/CompetitiveComparison";
import { CTABanner } from "@/components/landing/CTABanner";
import { Footer } from "@/components/layout/Footer";
import { getCheckoutSession } from "@/lib/services/PaymentService";

export default function LandingPage() {
  const [paymentStatus, setPaymentStatus] = useState<{
    type: "success" | "canceled" | null;
    message: string;
  } | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(false);

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
      <HeroHeader />

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

        {/* More For Less Section */}
        <MoreForLess />

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