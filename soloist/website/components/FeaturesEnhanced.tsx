// ENHANCED FEATURES COMPONENT - V2 Launch Preparation
// /Users/matthewsimon/Projects/acdc-digital/soloist/website/components/FeaturesEnhanced.tsx
// Incorporating SMNB design patterns and ACDC Digital brand guidelines

"use client";

import { Sparkles, TrendingUp, BarChart3, Brain, Activity, Calendar } from "lucide-react";
import React from "react";
import { LandingHeatmap } from "./LandingHeatmap";
import { PlaygroundDemo } from "./Playground";
import { SplitScreen } from "./SplitScreen";

export function FeaturesEnhanced() {
  return (
    <section id="features" className="relative py-16 md:py-24 overflow-hidden">
      {/* Premium Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-[#f8f9fa] to-[#e9ecef]"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-float-slow"></div>
          <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-blue-500/8 rounded-full blur-3xl animate-float-delayed"></div>
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16 space-y-6">
          <div className="inline-flex items-center space-x-3 glass-card px-6 py-3 rounded-full border border-emerald-200/50">
            <Sparkles className="h-4 w-4 text-emerald-600" />
            <span className="text-emerald-700 font-semibold text-sm uppercase tracking-wider">Core Features</span>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-display font-black leading-tight tracking-tight">
              <span className="text-[#1e1e1e]">Everything you need to</span>
              <div className="relative inline-block mt-2">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent animate-light-sweep"></div>
                <span className="relative text-emerald-600 px-2">understand yourself</span>
              </div>
            </h2>
            
            <p className="text-body-elegant text-[#495057] max-w-3xl mx-auto leading-relaxed">
              Get to know yourself better. <span className="text-[#1e1e1e] font-bold">Stop letting bad days surprise you</span>—see them coming and take control.
            </p>
          </div>
        </div>

        {/* Feature 1 - Interactive Heatmap Demo */}
        <div className="mb-12 md:mb-16 animate-slide-in-left">
          <div className="glass-strong rounded-2xl shadow-strong border border-[#dee2e6]/50 overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
            <div className="grid md:grid-cols-2 gap-0">
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <div className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-2 text-xs font-semibold text-blue-700 mb-6 w-fit border border-blue-200/50">
                  <BarChart3 className="h-4 w-4" />
                  Interactive Heatmap
                </div>
                <h3 className="text-subtitle font-black mb-4 text-[#1e1e1e]">
                  The Map to Your Best Self.
                </h3>
                <p className="text-[#495057] mb-8 leading-relaxed text-body-elegant">
                  Your entire year of moods in one spot. Spot the signs, take control of the rhythm, and see the big picture in order to make the best decisions. 
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 group">
                    <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center mt-1 group-hover:bg-emerald-500/30 transition-colors">
                      <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#1e1e1e] mb-1">Daily Feed Summary</h4>
                      <p className="text-sm text-[#6c757d]">Quick overview of your day at a glance</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 group">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center mt-1 group-hover:bg-blue-500/30 transition-colors">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#1e1e1e] mb-1">Customizable Templates</h4>
                      <p className="text-sm text-[#6c757d]">Tailor your logging experience</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 group">
                    <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center mt-1 group-hover:bg-purple-500/30 transition-colors">
                      <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#1e1e1e] mb-1">Quick Log</h4>
                      <p className="text-sm text-[#6c757d]">1-click entries for busy moments</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-8 md:p-12 flex items-center justify-center bg-gradient-to-br from-[#f8f9fa] to-white">
                <LandingHeatmap />
              </div>
            </div>
          </div>
        </div>

        {/* Features 2 & 3 - Side by Side */}
        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          {/* Feature 2 - Weekly Playground */}
          <div className="animate-slide-in-left">
            <div className="glass-strong rounded-2xl shadow-strong border border-[#dee2e6]/50 p-8 md:p-10 h-full flex flex-col hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
              <div className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-2 text-xs font-semibold text-purple-700 mb-6 w-fit border border-purple-200/50">
                <TrendingUp className="h-4 w-4" />
                Weekly Playground
              </div>
              <h3 className="text-subtitle font-black mb-4 text-[#1e1e1e]">
                Review the Past, Ready the Future
              </h3>
              <p className="text-[#495057] mb-8 flex-grow leading-relaxed">
                Fast daily-logs with customizable Daily templates to help you get the most out of each day.
              </p>
              
              {/* Feature Icons */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="glass-card rounded-xl p-3 text-center border border-purple-100/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <Brain className="w-5 h-5 text-purple-600 mx-auto mb-2" />
                  <div className="text-[#6c757d] text-[10px] font-semibold uppercase tracking-wide">Insights</div>
                </div>
                <div className="glass-card rounded-xl p-3 text-center border border-blue-100/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <Activity className="w-5 h-5 text-blue-600 mx-auto mb-2" />
                  <div className="text-[#6c757d] text-[10px] font-semibold uppercase tracking-wide">Trends</div>
                </div>
                <div className="glass-card rounded-xl p-3 text-center border border-emerald-100/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <Calendar className="w-5 h-5 text-emerald-600 mx-auto mb-2" />
                  <div className="text-[#6c757d] text-[10px] font-semibold uppercase tracking-wide">Weekly</div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-[#f8f9fa] to-white rounded-xl p-6 border border-[#e9ecef]">
                <PlaygroundDemo />
              </div>
            </div>
          </div>

          {/* Feature 3 - Live Dashboards */}
          <div className="animate-slide-in-right">
            <div className="glass-strong rounded-2xl shadow-strong border border-[#dee2e6]/50 p-8 md:p-10 h-full flex flex-col hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
              <div className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-2 text-xs font-semibold text-orange-700 mb-6 w-fit border border-orange-200/50">
                <Sparkles className="h-4 w-4" />
                Live Dashboards
              </div>
              <h3 className="text-subtitle font-black mb-4 text-[#1e1e1e]">
                See the Patterns, Shape the Progress
              </h3>
              <p className="text-[#495057] mb-8 flex-grow leading-relaxed">
                Pinpoint why today felt different, watch real-time charts reveal
                emerging trends, and tag meaningful moments before they fade.
              </p>
              
              {/* Status Indicators */}
              <div className="flex items-center justify-around mb-8 glass-card rounded-xl p-4 border border-orange-100/50">
                <div className="text-center">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full mx-auto mb-2 animate-pulse-glow"></div>
                  <div className="text-[10px] text-[#6c757d] font-semibold uppercase">Live</div>
                </div>
                <div className="text-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mx-auto mb-2 animate-pulse-glow"></div>
                  <div className="text-[10px] text-[#6c757d] font-semibold uppercase">Real-time</div>
                </div>
                <div className="text-center">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mx-auto mb-2 animate-pulse-glow"></div>
                  <div className="text-[10px] text-[#6c757d] font-semibold uppercase">Updated</div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-[#f8f9fa] to-white rounded-xl p-6 border border-[#e9ecef]">
                <SplitScreen />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="glass-card rounded-2xl p-8 md:p-12 border border-emerald-200/50 max-w-4xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-black text-[#1e1e1e] mb-4">
              Ready to transform your daily insights?
            </h3>
            <p className="text-[#495057] mb-6 text-lg">
              Join thousands who are already forecasting their best days ahead.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="inline-flex items-center justify-center gap-2 bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all duration-300 hover:-translate-y-1 shadow-lg">
                <Sparkles className="w-5 h-5" />
                <span>Get Started Free</span>
              </button>
              <button className="inline-flex items-center justify-center gap-2 border-2 border-emerald-200 text-emerald-700 bg-emerald-50 px-8 py-3 rounded-xl font-bold hover:border-emerald-400 hover:bg-emerald-100 transition-all duration-300">
                <span>View All Features</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
