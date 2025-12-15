// ROADMAP COMPONENT
// Visual product roadmap with clear phase separation

"use client";

import React, { useState } from "react";
import { CheckCircle2, Circle, Clock, ArrowRight, Sparkles, Brain, Smartphone, Users, Shield, TrendingUp, Download } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuthActions } from "@convex-dev/auth/react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

type RoadmapPhase = "shipped" | "in-progress" | "planned";

type RoadmapItem = {
  title: string;
  description: string;
  phase: RoadmapPhase;
  quarter: string;
  features: string[];
  icon: React.ElementType;
  waitlist?: boolean;
};

export function Roadmap() {
  const [isMounted, setIsMounted] = useState(false);
  const [activePhase, setActivePhase] = useState<RoadmapPhase>("shipped");
  const [waitlistStates, setWaitlistStates] = useState<Record<string, boolean>>({});
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  // Prevent hydration mismatch by only rendering interactive content after mount
  React.useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const { signIn } = useAuthActions();
  const joinWaitlist = useMutation(api.website.public.waitlist.joinWaitlist);

  const handleWaitlistJoin = async (feature: string) => {
    try {
      setLoadingStates(prev => ({ ...prev, [feature]: true }));
      const result = await joinWaitlist({ feature });
      if (result.success) {
        setWaitlistStates(prev => ({ ...prev, [feature]: true }));
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.message?.includes("authentication")) {
        signIn("github");
      } else {
        alert("Failed to join waitlist. Please try again.");
      }
    } finally {
      setLoadingStates(prev => ({ ...prev, [feature]: false }));
    }
  };

  const roadmapData: RoadmapItem[] = [
    {
      title: "Core Foundation",
      description: "Complete mood tracking platform with intelligent insights",
      phase: "shipped",
      quarter: "Q4 2024",
      icon: Sparkles,
      features: [
        "Daily mood logging with intelligent scoring",
        "Interactive heatmap visualization",
        "Native desktop application (Windows/macOS)",
        "Auto-generate feature for quick entries",
        "Comprehensive data export"
      ]
    },
    {
      title: "Predictive Intelligence",
      description: "Advanced pattern recognition and mood forecasting",
      phase: "shipped",
      quarter: "Q1 2025",
      icon: Brain,
      features: [
        "7-day mood forecasting engine",
        "Weekly pattern insights & trigger identification",
        "Personal trend analysis",
        "Research-backed predictions",
        "Actionable recommendations"
      ]
    },
    {
      title: "Desktop Application",
      description: "Native desktop apps for Windows & macOS - Download now!",
      phase: "shipped",
      quarter: "Q1 2025",
      icon: Download,
      features: [
        "Native Windows application (x64)",
        "Native macOS application (Intel & Apple Silicon)",
        "Offline-capable local storage",
        "One-click download & install",
        "Automatic updates & sync"
      ]
    },
    {
      title: "Social Context Integration",
      description: "Connect your social feeds to enrich your mood tracking",
      phase: "in-progress",
      quarter: "Q4 2025",
      icon: TrendingUp,
      features: [
        "Social feed integration (FB, IG, X, LinkedIn)",
        "Social context insights & correlation",
        "Guided journaling starter kit (7-day course)",
        "Progressive prompts & automated reflections",
        "Personalized template evolution"
      ]
    },
    {
      title: "Advanced Analytics",
      description: "Deeper insights with custom metrics and yearly trends",
      phase: "in-progress",
      quarter: "Q1 2026",
      icon: TrendingUp,
      features: [
        "Multi-factor correlation analysis",
        "Custom metric creation & tracking",
        "Yearly trend visualization",
        "Advanced filtering & segmentation",
        "Historical pattern comparison"
      ]
    },
    {
      title: "Enhanced Personalization",
      description: "AI-powered customization that learns from your patterns",
      phase: "in-progress",
      quarter: "Q1 2026",
      icon: Sparkles,
      features: [
        "Adaptive question recommendations",
        "Smart reminder scheduling",
        "Personalized insight generation",
        "Custom goal tracking",
        "AI-suggested journaling prompts"
      ]
    },
    {
      title: "Mobile Experience",
      description: "Native iOS and Android apps with seamless sync",
      phase: "planned",
      quarter: "Q2 2026",
      icon: Smartphone,
      features: [
        "Native iOS application",
        "Native Android application",
        "Push notification system",
        "Home screen widgets",
        "Cross-platform synchronization"
      ]
    },
    {
      title: "Offline-First Architecture",
      description: "Complete local processing with private predictive models",
      phase: "planned",
      quarter: "Q4 2026",
      icon: Shield,
      features: [
        "100% local data processing",
        "Offline-capable predictive models",
        "Zero cloud dependency mode",
        "End-to-end encrypted sync",
        "Export to personal servers"
      ]
    },
    {
      title: "Enterprise & API",
      description: "Integrate Soloist into your wellness ecosystem",
      phase: "planned",
      quarter: "TBD",
      icon: TrendingUp,
      features: [
        "REST API access",
        "Team & organizational plans",
        "HIPAA compliance certification",
        "White-label solutions",
        "Custom integrations"
      ],
      waitlist: true
    }
  ];

  const phaseConfig = {
    shipped: {
      label: "Shipped",
      color: "text-green-700 dark:text-green-400",
      bg: "bg-green-50 dark:bg-green-950/20",
      badgeVariant: "default" as const,
      icon: CheckCircle2
    },
    "in-progress": {
      label: "In Progress",
      color: "text-blue-700 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950/20",
      badgeVariant: "default" as const,
      icon: Clock
    },
    planned: {
      label: "Planned",
      color: "text-muted-foreground",
      bg: "bg-muted/50",
      badgeVariant: "outline" as const,
      icon: Circle
    }
  };

  const filteredItems = roadmapData.filter(item => item.phase === activePhase);

  return (
    <section id="roadmap" className="py-2 md:py-8 bg-background">
      <div className="container mx-auto px-4 md:px-16">
        {/* Header */}
        <div className="text-center mb-6 md:mb-4">
          <h2 className="text-[clamp(3rem,8vw,4rem)] font-parkinsans-semibold tracking-tight mb-2 md:mb-4">
            Roadmap
          </h2>
          <p className="text-base md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Building tomorrow's emotional intelligence, one release at a time.
          </p>
        </div>

        {/* Phase Filter */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-8 md:mb-12">
          {(["shipped", "in-progress", "planned"] as const).map((phase) => {
            const config = phaseConfig[phase];
            const itemCount = roadmapData.filter(item => item.phase === phase).length;
            
            return (
              <button
                key={phase}
                onClick={() => setActivePhase(phase)}
                className={`inline-flex items-center gap-1.5 md:gap-2 px-3 md:px-6 py-2 md:py-3 rounded-t-none rounded-b-lg text-xs md:text-sm font-semibold transition-all duration-200 border ${
                  activePhase === phase
                    ? "bg-primary text-primary-foreground border-primary scale-105"
                    : "bg-card text-card-foreground border-border hover:bg-accent hover:text-accent-foreground hover:shadow-sm"
                }`}
              >
                {isMounted && phase === "shipped" && <CheckCircle2 className="h-3.5 w-3.5 md:h-4 md:w-4" />}
                {isMounted && phase === "in-progress" && <Clock className="h-3.5 w-3.5 md:h-4 md:w-4" />}
                {isMounted && phase === "planned" && <Circle className="h-3.5 w-3.5 md:h-4 md:w-4" />}
                {config.label}
                <span className={`text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 rounded-full ${
                  activePhase === phase
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {itemCount}
                </span>
              </button>
            );
          })}
        </div>

        {/* Roadmap Items Grid */}
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredItems.map((item, index) => {
              const config = phaseConfig[item.phase];
              const ItemIcon = item.icon;

              return (
                <Card
                  key={index}
                  className="bg-yellow-50/10 border-border rounded-tl-none rounded-tr-xl rounded-b-xl group flex flex-col"
                >
                  <CardHeader className="pb-2 md:pb-4">
                    <div className="flex items-start justify-between mb-2 md:mb-3">
                      <div className={`p-2 md:p-3 rounded-t-none rounded-b-lg ${config.bg} transition-transform duration-300 group-hover:scale-110`}>
                        {isMounted && <ItemIcon className={`h-5 w-5 md:h-6 md:w-6 ${config.color}`} />}
                      </div>
                      <Badge
                        variant={config.badgeVariant}
                        className="rounded-tl-none rounded-tr-lg rounded-b-lg"
                      >
                        {item.quarter}
                      </Badge>
                    </div>
                    
                    <CardTitle className="text-lg md:text-xl font-parkinsans-semibold mb-1 md:mb-2">
                      {item.title}
                    </CardTitle>
                    <CardDescription className="text-xs md:text-sm text-muted-foreground">
                      {item.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex-1 flex flex-col">
                    <ul className="space-y-1.5 md:space-y-2 mb-3 md:mb-4 flex-1">
                      {item.features.map((feature, fIndex) => (
                        <li key={fIndex} className="flex items-start gap-2 text-[11px] md:text-sm">
                          {isMounted && <CheckCircle2 className={`h-3.5 w-3.5 md:h-4 md:w-4 shrink-0 mt-0.5 ${
                            item.phase === "shipped"
                              ? "text-green-600 dark:text-green-400"
                              : item.phase === "in-progress"
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-muted-foreground"
                          }`} />}
                          <span className={`leading-relaxed ${feature === "Personalized template evolution" ? "line-through" : ""}`}>
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* Waitlist Button */}
                    {item.waitlist && (
                      <Button
                        onClick={() => handleWaitlistJoin("enterprise-api")}
                        disabled={loadingStates["enterprise-api"]}
                        variant={waitlistStates["enterprise-api"] ? "outline" : "default"}
                        className="w-full mt-auto rounded-t-none rounded-b-lg"
                      >
                        {loadingStates["enterprise-api"]
                          ? "Joining..."
                          : waitlistStates["enterprise-api"]
                          ? "✓ On Waitlist"
                          : (
                            <>
                              <span>Join Waitlist</span>
                              {isMounted && <ArrowRight className="h-4 w-4 ml-2" />}
                            </>
                          )
                        }
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-10 md:mt-10">
          <p className="text-base md:text-xl text-foreground max-w-3xl mx-auto">
            Our path forward blends science, reflection, and design.
          </p>
        </div>
      </div>
    </section>
  );
}