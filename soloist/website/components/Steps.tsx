// STEPS COMPONENT
// Simple process steps with icons

"use client";

import React from "react";
import Image from "next/image";
import { FileText, Zap, TrendingUp, Trophy } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ParticleAnimation } from "@/components/ParticleAnimation";
import { DailyLogCard } from "@/components/DailyLogCard";
import { FeedCard } from "@/components/FeedCard";
import { MoodForecastCard } from "@/components/MoodForecastCard";
import { RecommendationCard } from "@/components/RecommendationCard";

export function Steps() {
  const steps = [
    {
      number: "01",
      icon: <FileText className="h-6 w-6 text-primary" />,
      title: "Speed Journal",
      description:
        "Quick, intuitive daily logging with customizable templates that make Daily Logs quick and efficient.",
    },
    {
      number: "02",
      icon: <Zap className="h-6 w-6 text-primary" />,
      title: "Daily Summary",
      description: "Advanced algorithms analyze your patterns, moods, and behaviors to generate personalized insights which are generated instantly in your feed. Continue to add photos, notes, and more to make each day as meaningful as possible.",
    },
    {
      number: "03",
      icon: <TrendingUp className="h-6 w-6 text-primary" />,
      title: "Mood Forecasting",
      description:
        "Stay ahead with data-driven mood predictions. Receive research-backed predictions of your emotional state up to 3 days in advance, complete personalized recommendations to prepare for challenges.",
    },
    {
      number: "04",
      icon: <Trophy className="h-6 w-6 text-primary" />,
      title: "Take Control",
      description:
        "Make informed decisions with actionable recommendations tailored to your unique patterns.",
    },
  ];

  return (
    <section className="mt-12 w-full py-20 bg-muted/30">
      <div className="mx-auto max-w-[83rem] px-6">
        <div className="text-center mb-12">
          <h2 className="text-6xl md:text-6xl font-bold tracking-tight mb-4 font-parkinsans-semibold">
            How it works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Four simple steps to transform your daily routine into powerful predictions
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 items-start">
          {steps.map((step, index) => (
            <Card
              key={step.title}
              className="border-border bg-background hover:shadow-lg transition-all duration-300 relative overflow-hidden group flex-1"
            >
              {/* Step Number Badge */}
              <div className="absolute top-4 right-4 text-6xl font-bold text-muted/10 group-hover:text-primary/10 transition-colors">
                {step.number}
              </div>
              
              <CardHeader className="relative z-10 flex flex-col items-start space-y-4 p-8">
                <div className="rounded-lg bg-primary/10 p-4 group-hover:bg-primary/20 transition-colors">
                  {step.icon}
                </div>
                <CardTitle className="text-xl font-parkinsans-semibold">
                  {step.title}
                </CardTitle>
                {index === 0 && (
                  <p className="text-[13px] text-black leading-relaxed">
                    1. Designed to make daily reflection quick, consistent, and effortless. Powerful predictions after just 4 days.
                  </p>
                )}
                {index === 1 && (
                  <p className="text-[13px] text-black leading-relaxed -mt-2">
                    2. Instant feedback. Understand what shaped your day, make connections with past events, and discover things about yourself.
                  </p>
                )}
                {index === 2 && (
                  <p className="text-[13px] text-black leading-relaxed -mt-2">
                    3. Data models translate your recent patterns into forward-looking mood projections. Take control of your tomorrow, today.
                  </p>
                )}
                {index === 3 && (
                  <p className="text-[13px] text-black leading-relaxed -mt-2">
                    4. Discover yourself, and learn things you may not have known otherwise. Turn self-awareness into Action.
                  </p>
                )}
                <CardDescription className="text-base text-muted-foreground leading-relaxed">
                  {step.description}
                </CardDescription>
                
                {/* Images for cards */}
                {index === 0 && (
                  <div className="w-full mt-4">
                    <DailyLogCard />
                  </div>
                )}
                {index === 1 && (
                  <div className="w-full mt-4">
                    <FeedCard />
                  </div>
                )}
                {index === 2 && (
                  <div className="w-full mt-4">
                    <MoodForecastCard />
                  </div>
                )}
                {index === 3 && (
                  <div className="w-full mt-4">
                    <RecommendationCard />
                  </div>
                )}
              </CardHeader>

              {/* Optional connector line for desktop */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-border z-0" />
              )}
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-xl text-foreground max-w-3xl mx-auto">
            <span className="font-semibold">The Result:</span> Stop wondering why you feel the way you do and start predicting and preparing for it. Like having a weather forecast, but for your mental health.
          </p>
        </div>
      </div>
    </section>
  );
}
