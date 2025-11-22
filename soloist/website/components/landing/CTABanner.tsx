// CTABANNER COMPONENT
// /Users/matthewsimon/Documents/Github/soloist_pro/website/src/components/CTABanner.tsx

"use client";

import React from "react";
import { Sparkles, Users, TrendingUp, Github } from "lucide-react";

export function CTABanner() {
  // Social proof numbers
  const stats = [
    { number: "10K+", label: "Active Users", icon: Users },
    { number: "92%", label: "Accuracy Rate", icon: TrendingUp },
    { number: "4.9/5", label: "User Rating", icon: Sparkles },
  ];

  return (
    <section 
      id="cta-banner"
      className="pt-6 pb-4"
    >
      <div className="container px-2 pt-12">
        <div className="max-w-7xl px-4 text-left">
          {/* Main headline */}
          <h1 className="mt-8 text-4xl font-parkinsans-semibold tracking-tight text-foreground mb-0">
            Soloist.   |   Take control of tomorrow, today.
          </h1>
        </div>
      </div>
    </section>
  );
}
