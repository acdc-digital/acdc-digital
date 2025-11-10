// PRICING COMPONENT
// Modern pricing design with shadcn/ui styling

"use client";

import { Check, Sparkles, Zap, Users, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import { useConvexAuth, useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { StripeCheckoutModal } from "@/modals/StripeCheckoutModal";
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
  const [waitlistLoading, setWaitlistLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 640);
  }, []);

  const tiers: PricingTier[] = [
    {
      name: "Monthly",
      description: "Perfect for getting started with mood tracking",
      price: "$3",
      priceSubtext: "per month",
      features: [
        "Full browser experience",
        "Daily Feedback & Mood Forecasting",
        "Auto-generate Daily entries",
        "7-day History",
        "Basic insights & patterns",
        "Heatmap visualization",
      ],
      cta: "Start Monthly",
      productId: "prod_SM2rv1Y1tRAaKo",
      priceId: "price_1RYaXeD4wGLfhDePZlRBINbJ",
      paymentMode: "subscription",
      icon: Zap,
      badge: "Get Started",
      badgeVariant: "secondary",
    },
    {
      name: "Yearly",
      description: "Unlock your full emotional potential with advanced features",
      price: "$30",
      priceSubtext: "per year (save 17%)",
      features: [
        "Everything in Monthly, plus:",
        "Native desktop application",
        "Advanced analytics & trends",
        "Interactive playground",
        "Data export & backup",
        "Pretty cool stuff",
      ],
      cta: "Start Yearly",
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
    if (tier.name === "Monthly" || tier.name === "Yearly") {
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
    <section id="pricing" data-no-navbar-color-change="true" className="w-full mb-4 pt-0 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center mb-14">
          <h2 className="font-parkinsans-semibold font-bold tracking-tight text-[84px] mb-4">
            Pricing
          </h2>
          <div>
            <p className="text-xl">
              Start today. Explore your patterns, and take control of tomorrow.
            </p>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-3 lg:gap-6 lg:items-start">
            {tiers.map((tier) => {
              const Icon = tier.icon;
              const isActive = hasActiveSubscription === true && tier.priceId;
              const isOnWaitlist = tier.name === "Teams" && isOnTeamsWaitlist === true;
              
              return (
                <Card
                  key={tier.name}
                  className={`relative flex flex-col rounded-t-none rounded-b-lg bg-yellow-50/10 ${
                    tier.highlighted
                      ? "border-primary lg:min-h-[850px]"
                      : ""
                  }`}
                >
                  {tier.badge && (
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-10 bg-white">
                      <Badge
                        variant={tier.badgeVariant || "default"}
                        className="border border-black dark:border-white shadow-sm font-parkinsans text-base px-5 py-3 rounded-tl-none rounded-tr-lg rounded-b-lg"
                      >
                        {tier.badge}
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="p-14 pt-14 pb-2">
                    <div className={`bg-zinc-900 text-zinc-200 rounded-t-none rounded-b-lg p-6 -mx-6 -mt-2 font-parkinsans ${
                      tier.highlighted ? "pb-24 -mb-24" : "pb-10 -mb-10"
                    }`}>
                      {Icon && (
                        <div className={`inline-flex w-12 h-12 items-center justify-center rounded-lg mb-4 ${
                          tier.highlighted ? "bg-primary/10" : "bg-muted"
                        }`}>
                          <Icon className={`w-6 h-6 ${tier.highlighted ? "text-primary" : "text-muted-foreground"}`} />
                        </div>
                      )}
                      <CardTitle className="text-2xl">{tier.name}</CardTitle>
                      <CardDescription className="text-base mt-2 text-white/80">
                        {tier.description}
                      </CardDescription>

                      <div className="mt-12 mb-8">
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-bold tracking-tight">
                            {tier.price}
                          </span>
                        </div>
                        {tier.priceSubtext && (
                          <p className="text-sm text-white/70 mt-1">
                            {tier.priceSubtext}
                          </p>
                        )}
                      </div>

                      <ul className={`space-y-3 mb-8 border border-zinc-700 bg-zinc-800/80 rounded-lg p-4 ${
                        tier.highlighted ? "pb-10" : "pb-8"
                      }`}>
                        {tier.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-3 pb-0">
                            <Check className={`h-5 w-5 shrink-0 mt-0.5 ${
                              tier.highlighted ? "text-primary" : "text-white/70"
                            }`} />
                            <span className="text-sm leading-relaxed">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1">
                  </CardContent>

                  <CardFooter className={tier.highlighted ? "pt-16 pb-8" : "pt-12"}>
                    <Button
                      onClick={() => handlePriceSelection(tier)}
                      disabled={
                        isActive ||
                        isOnWaitlist ||
                        (tier.name === "Teams" && waitlistLoading)
                      }
                      className={`w-full border ${
                        tier.highlighted
                          ? "bg-primary hover:bg-white border-primary"
                          : "hover:bg-white"
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
                        : tier.cta}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mx-auto max-w-4xl text-center mt-16">
          <p className="text-muted-foreground text-md italic">
            No options that work for you? We're here to help,{" "}
            <a href="#" className="text-primary hover:underline">
              reach out for an accommodation on us
            </a>
            .
          </p>
          <p className="text-muted-foreground text-xl mt-2">
            We've partnered with Stripe to keep your payments secure.
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
