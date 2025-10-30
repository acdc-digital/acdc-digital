// PRICING COMPONENT
// Modern pricing design with shadcn/ui styling

"use client";

import { Check, Sparkles, Zap, Users, TrendingUp } from "lucide-react";
import { useState } from "react";
import { useConvexAuth, useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { StripeCheckoutModal } from "@/modals/StripeCheckoutModal";
import { StripeSetupInstructions } from "./StripeSetupInstructions";
import { SignInModal } from "@/modals/SignInModal";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PricingTier {
  name: string;
  description: string;
  price: string;
  priceSubtext?: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
  productId?: string;
  priceId?: string;
  paymentMode?: "payment" | "subscription";
  icon?: any;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
}

export default function Pricing() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const hasActiveSubscription = useQuery(api.userSubscriptions.hasActiveSubscription);
  const isOnTeamsWaitlist = useQuery(api.waitlist.isOnWaitlist, { feature: "teams" });
  const joinWaitlist = useMutation(api.waitlist.joinWaitlist);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [signInFlow, setSignInFlow] = useState<"signIn" | "signUp">("signIn");
  const [selectedTier, setSelectedTier] = useState<PricingTier | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [waitlistLoading, setWaitlistLoading] = useState(false);

  const tiers: PricingTier[] = [
    {
      name: "Free",
      description: "Perfect for getting started with mood tracking",
      price: "$0",
      priceSubtext: "Forever free",
      features: [
        "Full browser experience",
        "Daily Feedback & Mood Forecasting",
        "Auto-generate Daily entries",
        "7-day History",
        "Basic insights & patterns",
        "Heatmap visualization",
      ],
      cta: "Start Free Today",
      productId: "prod_SM2rv1Y1tRAaKo",
      icon: Zap,
      badge: "Get Started",
      badgeVariant: "secondary",
    },
    {
      name: "Pro",
      description: "Unlock your full emotional potential with advanced features",
      price: "$3",
      priceSubtext: "per month after 14-day free trial",
      features: [
        "Everything in Free, plus:",
        "Native desktop application",
        "Unlimited mood history & forecasting",
        "Advanced analytics & trends",
        "Interactive playground",
        "Data export & backup",
        "Priority support",
      ],
      cta: "Start Free Trial",
      highlighted: true,
      productId: "prod_STXc0xIWjnn1R6",
      priceId: "price_1RYaXeD4wGLfhDePZlRBINbJ",
      paymentMode: "subscription",
      icon: TrendingUp,
      badge: "Most Popular",
      badgeVariant: "default",
    },
    {
      name: "Teams",
      description: "Share insights and support each other's wellbeing",
      price: "Coming 2026",
      priceSubtext: "Early access waitlist",
      features: [
        "Share mood insights with trusted friends",
        "Group wellbeing challenges",
        "Collaborative mood tracking",
        "Team wellness dashboards",
        "Supportive community features",
        "Shared goal setting & progress",
        "Privacy-first group insights",
      ],
      cta: "Join Waitlist",
      productId: "prod_SM2stqz0a2vhGb",
      icon: Users,
      badge: "Coming Soon",
      badgeVariant: "outline",
    },
  ];

  const handlePriceSelection = async (tier: PricingTier) => {
    if (tier.name === "Free") {
      if (window.innerWidth < 640) return;
      
      if (isLoading) {
        setTimeout(() => handlePriceSelection(tier), 500);
        return;
      }

      if (!isAuthenticated) {
        setSelectedTier(tier);
        setSignInFlow("signIn");
        setIsSignInModalOpen(true);
        return;
      }
      
      window.location.href = process.env.NEXT_PUBLIC_APP_URL || "https://app.acdc.digital" + "/dashboard";
      return;
    }

    if (tier.name === "Teams") {
      if (isLoading) {
        setTimeout(() => handlePriceSelection(tier), 500);
        return;
      }

      if (!isAuthenticated) {
        setSelectedTier(tier);
        setSignInFlow("signIn");
        setIsSignInModalOpen(true);
        return;
      }

      handleTeamsWaitlist();
      return;
    }

    if (tier.priceId) {
      setSelectedTier(tier);

      if (isLoading) {
        setTimeout(() => handlePriceSelection(tier), 500);
        return;
      }

      if (!isAuthenticated) {
        setSignInFlow("signIn");
        setIsSignInModalOpen(true);
        return;
      }

      if (hasActiveSubscription === undefined) {
        setTimeout(() => handlePriceSelection(tier), 500);
        return;
      }

      if (hasActiveSubscription === true) {
        alert("You already have an active subscription! No need to purchase again.");
        return;
      }

      setIsCheckoutModalOpen(true);

      if (!process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY) {
        setShowInstructions(true);
      }
    }
  };

  const handleCloseCheckoutModal = () => {
    setIsCheckoutModalOpen(false);
    setSelectedTier(null);
  };

  const handleSignInModalClose = () => {
    setIsSignInModalOpen(false);
  };

  const handleAuthSuccess = () => {
    setIsSignInModalOpen(false);

    if (selectedTier && selectedTier.name === "Free") {
      window.location.href = process.env.NEXT_PUBLIC_APP_URL || "https://app.acdc.digital" + "/dashboard";
      return;
    }

    if (selectedTier && selectedTier.name === "Teams") {
      handleTeamsWaitlist();
      return;
    }

    if (selectedTier && selectedTier.priceId) {
      setTimeout(() => {
        setIsCheckoutModalOpen(true);
      }, 100);
    }
  };

  const handleTeamsWaitlist = async () => {
    setWaitlistLoading(true);
    try {
      await joinWaitlist({ feature: "teams" });
      alert("🎉 You've successfully joined the Teams waitlist! We'll notify you when it's available.");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to join waitlist";
      alert(`❌ ${errorMessage}`);
    } finally {
      setWaitlistLoading(false);
    }
  };

  return (
    <section id="pricing" className="py-24 sm:py-32">
      <div className="container mx-auto px-4 md:px-6">
        {showInstructions && <StripeSetupInstructions />}
        
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <Badge className="mb-4" variant="outline">
            <Sparkles className="w-3 h-3 mr-2" />
            Pricing
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-muted-foreground">
            Choose the perfect plan for your journey. Start with 14 days free, cancel anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 lg:grid-cols-3 lg:gap-6">
            {tiers.map((tier) => {
              const Icon = tier.icon;
              const isActive = hasActiveSubscription === true && tier.priceId;
              const isOnWaitlist = tier.name === "Teams" && isOnTeamsWaitlist;
              
              return (
                <Card
                  key={tier.name}
                  className={`relative flex flex-col ${
                    tier.highlighted
                      ? "border-primary shadow-lg scale-105 lg:scale-110"
                      : ""
                  }`}
                >
                  {tier.badge && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge variant={tier.badgeVariant || "default"}>
                        {tier.badge}
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="pb-8 pt-6">
                    {Icon && (
                      <div className={`inline-flex w-12 h-12 items-center justify-center rounded-lg mb-4 ${
                        tier.highlighted ? "bg-primary/10" : "bg-muted"
                      }`}>
                        <Icon className={`w-6 h-6 ${tier.highlighted ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                    )}
                    <CardTitle className="text-2xl">{tier.name}</CardTitle>
                    <CardDescription className="text-base mt-2">
                      {tier.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex-1">
                    <div className="mb-8">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold tracking-tight">
                          {tier.price}
                        </span>
                      </div>
                      {tier.priceSubtext && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {tier.priceSubtext}
                        </p>
                      )}
                    </div>

                    <ul className="space-y-3">
                      {tier.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <Check className={`h-5 w-5 shrink-0 mt-0.5 ${
                            tier.highlighted ? "text-primary" : "text-muted-foreground"
                          }`} />
                          <span className="text-sm leading-relaxed">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>

                  <CardFooter className="pt-6">
                    <Button
                      onClick={() => handlePriceSelection(tier)}
                      disabled={
                        isActive ||
                        isOnWaitlist ||
                        (tier.name === "Teams" && waitlistLoading) ||
                        (tier.name === "Free" && window.innerWidth < 640)
                      }
                      className={`w-full ${
                        tier.highlighted
                          ? "bg-primary hover:bg-primary/90"
                          : ""
                      }`}
                      variant={tier.highlighted ? "default" : "outline"}
                      size="lg"
                    >
                      {isActive
                        ? "✓ Active Plan"
                        : isOnWaitlist
                        ? "✓ On Waitlist"
                        : tier.name === "Teams" && waitlistLoading
                        ? "Joining..."
                        : tier.name === "Free" && window.innerWidth < 640
                        ? "Desktop Only"
                        : tier.cta}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mx-auto max-w-2xl text-center mt-16">
          <p className="text-muted-foreground">
            All plans include secure payments powered by Stripe. Questions?{" "}
            <a href="#" className="text-primary hover:underline">
              Contact support
            </a>
          </p>
        </div>
      </div>

      {/* Modals */}
      <StripeCheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={handleCloseCheckoutModal}
        priceId={selectedTier?.priceId}
        productName={selectedTier?.name || "SoloPro Subscription"}
        paymentMode={selectedTier?.paymentMode || "payment"}
      />

      <SignInModal
        isOpen={isSignInModalOpen}
        onClose={handleSignInModalClose}
        onAuthSuccess={handleAuthSuccess}
        initialFlow={signInFlow}
      />
    </section>
  );
}