"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Github, 
  Puzzle, 
  Zap, 
  Shield, 
  BarChart3, 
  Palette, 
  Database,
  MessageSquare,
  Play,
  DollarSign,
  Users,
  Cpu,
  Calendar,
  Search,
  Grid3X3,
  Rocket,
  Fingerprint
} from "lucide-react";

export default function AuraHomepage() {
  return (
    <div className="min-h-screen text-white overflow-x-hidden relative">
      {/* Main Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#191919] via-[#1f1f1f] to-[#191919]"></div>
        <div className="absolute inset-0 opacity-15">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gray-500/8 rounded-full blur-3xl animate-float"></div>
          <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-white/8 rounded-full blur-3xl animate-float animate-delay-2"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gray-400/8 rounded-full blur-3xl animate-float animate-delay-4"></div>
          <div className="absolute top-2/3 left-1/3 w-72 h-72 bg-gray-600/8 rounded-full blur-3xl animate-float animate-delay-3"></div>
          <div className="absolute top-1/6 right-1/3 w-88 h-88 bg-gray-300/8 rounded-full blur-3xl animate-float animate-delay-1"></div>
        </div>
      </div>
      
      {/* Content Layer */}
      <div className="relative z-10">
      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        @keyframes code-scroll {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        @keyframes slide-up {
          0% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes light-sweep {
          0% { background-position: -200% center; }
          50% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        .animate-code-scroll {
          animation: code-scroll 30s linear infinite;
        }
        .animate-slide-up {
          animation: slide-up 0.6s ease-out forwards;
        }
        .animate-gradient {
          animation: gradient-shift 6s ease infinite;
        }
        .animate-breathe {
          animation: breathe 4s ease-in-out infinite;
        }
        .animate-light-sweep {
          animation: light-sweep 25s ease-in-out infinite;
          background-size: 200% 100%;
        }
        
        /* Animation Delays */
        .animate-delay-2 {
          animation-delay: 2s;
        }
        .animate-delay-4 {
          animation-delay: 4s;
        }
        
        /* Premium Glass Effects with #191919 Base */
        .glass-subtle {
          backdrop-filter: blur(20px) saturate(180%);
          background: rgba(25, 25, 25, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.06);
        }
        .glass-card {
          backdrop-filter: blur(16px) saturate(160%);
          background: rgba(25, 25, 25, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.04);
        }
        .glass-strong {
          backdrop-filter: blur(24px) saturate(200%);
          background: rgba(25, 25, 25, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        
        /* San Francisco Pro Font System */
        * {
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif;
          font-feature-settings: "kern" 1, "liga" 1, "calt" 1;
          text-rendering: optimizeLegibility;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        
        /* Premium Typography Scale */
        .text-hero {
          font-size: clamp(3rem, 8vw, 6rem);
          line-height: 0.85;
          letter-spacing: -0.04em;
          font-weight: 900;
        }
        .text-display {
          font-size: clamp(2rem, 5vw, 4rem);
          line-height: 0.9;
          letter-spacing: -0.03em;
          font-weight: 800;
        }
        .text-subtitle {
          font-size: clamp(1.25rem, 3vw, 1.5rem);
          line-height: 1.2;
          letter-spacing: -0.01em;
          font-weight: 600;
        }
        .text-body-large {
          font-size: 1.25rem;
          line-height: 1.6;
          font-weight: 400;
        }
        .text-body-elegant {
          font-size: 1.125rem;
          line-height: 1.7;
          font-weight: 400;
        }
        
        /* BMW M-Series Inspired Grayscale Palette */
        .bg-primary { background-color: #191919; }
        .bg-secondary { background-color: #1f1f1f; }
        .bg-tertiary { background-color: #262626; }
        .bg-quaternary { background-color: #2d2d2d; }
        .bg-accent { background-color: #404040; }
        
        .text-primary { color: #ffffff; }
        .text-secondary { color: #d4d4d4; }
        .text-tertiary { color: #a3a3a3; }
        .text-quaternary { color: #737373; }
        .text-muted { color: #525252; }
        
        .border-secondary { border-color: rgba(255, 255, 255, 0.06); }
        .border-tertiary { border-color: rgba(255, 255, 255, 0.04); }
        
        /* Grayscale Accent System */
        .text-accent-primary { color: #ffffff; }
        .text-accent-secondary { color: #e5e5e5; }
        .text-accent-tertiary { color: #b8b8b8; }
        .text-accent-quaternary { color: #9d9d9d; }
        .text-accent-muted { color: #757575; }
        
        .bg-accent-primary { background-color: #ffffff; }
        .bg-accent-secondary { background-color: #e5e5e5; }
        .bg-accent-tertiary { background-color: #b8b8b8; }
        .bg-accent-quaternary { background-color: #9d9d9d; }
        .bg-accent-muted { background-color: #757575; }
        
        /* Professional Grayscale Gradients */
        .gradient-primary {
          background: linear-gradient(135deg, #191919 0%, #262626 100%);
        }
        .gradient-accent {
          background: linear-gradient(135deg, #ffffff 0%, #e5e5e5 25%, #b8b8b8 50%, #9d9d9d 75%, #757575 100%);
          background-size: 300% 300%;
        }
        .gradient-sharp {
          background: linear-gradient(135deg, #ffffff 0%, #000000 100%);
          background-size: 200% 200%;
        }
        
        /* Interactive States */
        .hover-lift:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }
        .hover-glow:hover {
          box-shadow: 0 0 30px rgba(16, 185, 129, 0.2);
        }
        
        /* Custom Shadows */
        .shadow-primary { box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3); }
        .shadow-strong { box-shadow: 0 8px 40px rgba(0, 0, 0, 0.4); }
        .shadow-glow { box-shadow: 0 0 20px rgba(16, 185, 129, 0.1); }
      `}</style>

      {/* Terminal IDE Wireframe Header */}
      <header className="sticky top-0 z-50 bg-[#1f1f1f] backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex justify-between items-center">
            
            {/* Brand - Terminal Style */}
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3 group cursor-pointer">
                <div className="relative">
                  <div className="w-8 h-8 border border-white/40 rounded-md flex items-center justify-center transition-all duration-300 group-hover:border-white group-hover:bg-white/5">
                    <Fingerprint className="w-4 h-4 text-white" />
                  </div>
                  <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-white rounded-full animate-pulse-glow"></div>
                </div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-lg font-mono font-bold text-primary tracking-wider">SMNB</h1>
                  <span className="text-xs font-mono text-white/80 border border-white/30 px-1.5 py-0.5 rounded">v2.1</span>
                </div>
              </div>
              
              {/* Terminal Status Bar */}
              <div className="hidden lg:flex items-center space-x-2 text-sm font-mono">
                <div className="flex items-center space-x-1.5">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                  <span className="text-secondary">live</span>
                </div>
                <div className="text-quaternary">|</div>
                <div className="flex items-center space-x-1">
                  <span className="text-white font-bold">5</span>
                  <span className="text-secondary">agents</span>
                </div>
                <div className="text-quaternary">|</div>
                <div className="flex items-center space-x-1">
                  <span className="text-white font-bold">∞</span>
                  <span className="text-secondary">uptime</span>
                </div>
              </div>
            </div>
            
            {/* Terminal Navigation */}
            <nav className="hidden md:flex items-center space-x-0">
              <a href="#platform" className="px-3 py-1.5 text-sm font-mono text-secondary border border-transparent rounded hover:border-primary/30 hover:text-primary hover:bg-secondary/20 transition-all duration-200">
                platform
              </a>
              <a href="#pricing" className="px-3 py-1.5 text-sm font-mono text-secondary border border-transparent rounded hover:border-primary/30 hover:text-primary hover:bg-secondary/20 transition-all duration-200">
                pricing
              </a>
              <a href="#advertising" className="px-3 py-1.5 text-sm font-mono text-secondary border border-transparent rounded hover:border-primary/30 hover:text-primary hover:bg-secondary/20 transition-all duration-200">
                advertising
              </a>
              <a href="#commitment" className="px-3 py-1.5 text-sm font-mono text-secondary border border-transparent rounded hover:border-primary/30 hover:text-primary hover:bg-secondary/20 transition-all duration-200">
                commitment
              </a>
              <a href="#blog" className="px-3 py-1.5 text-sm font-mono text-secondary border border-transparent rounded hover:border-primary/30 hover:text-primary hover:bg-secondary/20 transition-all duration-200">
                blog
              </a>
              
              {/* Terminal Actions */}
              <div className="flex items-center space-x-2 ml-6 pl-6">
                <Button className="px-4 py-1.5 text-sm font-mono font-bold bg-transparent border border-white text-white rounded hover:bg-white hover:text-black transition-all duration-200">
                  get_started
                </Button>
              </div>
            </nav>

            {/* Mobile Terminal Menu */}
            <div className="md:hidden">
              <Button variant="ghost" size="sm" className="p-2 text-secondary border border-transparent rounded hover:border-primary/30 hover:text-primary hover:bg-secondary/20 transition-all duration-200">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              </Button>
            </div>
          </div>
        </div>

        {/* Terminal Command Line */}
        <div className="bg-[#1f1f1f] px-6 py-0 ml-12 pb-1">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center space-x-2 text-xs font-mono">
              <span className="text-white">$</span>
              <span className="text-gray-300">smnb-platform+ --status</span>
              <span className="text-green-400 font-medium">waitlist</span>
              <span className="text-gray-500 ml-8">join the waitlist for limited public preview...</span>
              <span className="text-white ml-2 animate-pulse">_</span>
            </div>
          </div>
        </div>
      </header>

      {/* Elegant Status Ticker */}
      <div className="bg-secondary border-b border-gray-800/30 py-2 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-[#1f1f1f] from-2% via-transparent via-50% to-[#1f1f1f] to-98% z-10 pointer-events-none"></div>
        <div className="relative z-0">
          <div className="animate-marquee whitespace-nowrap">
            <span className="text-sm font-medium tracking-wide">
              <span className="inline-flex items-center mr-8">
                <span className="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse-glow"></span>
                <span className="text-emerald-400 font-bold">LIVE</span>
              </span>
              <span className="text-purple-400 font-semibold">AURA SOCIAL INTELLIGENCE PLATFORM</span>
              <span className="text-quaternary mx-4">•</span>
              <span className="text-blue-400 font-semibold">5 AGENTS</span>
              <span className="text-secondary"> ACTIVE</span>
              <span className="text-quaternary mx-4">•</span>
              <span className="text-orange-400 font-semibold">EXTENSIONS</span>
              <span className="text-secondary"> FROM </span>
              <span className="text-white font-bold">$0.10</span>
              <span className="text-quaternary mx-4">•</span>
              <span className="text-cyan-400 font-semibold">FREE TIER</span>
              <span className="text-secondary"> UNLIMITED</span>
              <span className="text-quaternary mx-4">•</span>
              <span className="text-purple-400 font-semibold">24/7</span>
              <span className="text-secondary"> AUTOMATION</span>
              <span className="text-quaternary mx-4">•</span>
              <span className="text-blue-400 font-semibold">CONSOLE</span>
              <span className="text-secondary"> READY</span>
              <span className="text-quaternary mx-6">•</span>
              
              {/* Duplicate content for seamless loop */}
              <span className="inline-flex items-center mr-8">
                <span className="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse-glow"></span>
                <span className="text-emerald-400 font-bold">LIVE</span>
              </span>
              <span className="text-purple-400 font-semibold">AURA SOCIAL INTELLIGENCE PLATFORM</span>
              <span className="text-quaternary mx-4">•</span>
              <span className="text-blue-400 font-semibold">5 AGENTS</span>
              <span className="text-secondary"> ACTIVE</span>
              <span className="text-quaternary mx-4">•</span>
              <span className="text-orange-400 font-semibold">EXTENSIONS</span>
              <span className="text-secondary"> FROM </span>
              <span className="text-white font-bold">$0.10</span>
              <span className="text-quaternary mx-4">•</span>
              <span className="text-cyan-400 font-semibold">FREE TIER</span>
              <span className="text-secondary"> UNLIMITED</span>
              <span className="text-quaternary mx-4">•</span>
              <span className="text-purple-400 font-semibold">24/7</span>
              <span className="text-secondary"> AUTOMATION</span>
              <span className="text-quaternary mx-4">•</span>
              <span className="text-blue-400 font-semibold">CONSOLE</span>
              <span className="text-secondary"> READY</span>
              <span className="text-quaternary mx-6">•</span>
            </span>
          </div>
        </div>
      </div>

      {/* Revolutionary Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden" id="platform">
        <div className="relative z-10 max-w-7xl mx-auto px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-start lg:items-start">
            
            {/* Hero Content */}
            <div className="lg:col-span-6 space-y-8">
              <div className="space-y-0">
                <div className="inline-flex items-center space-x-3 glass-card px-6 py-3 mb-4 rounded-full">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse-glow"></div>
                  <span className="text-secondary font-mono text-sm uppercase tracking-wider">Agentic Social Intelligence</span>
                </div>
                
                <div className="space-y-4">
                  <h1 className="text-hero font-black leading-none">
                    <div className="text-primary">Build Your</div>
                    <div className="text-secondary">Social Media</div>
                    <div className="relative inline-block">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-light-sweep"></div>
                      <div className="relative text-white font-black px-2 py-2 pr-32">Empire</div>
                    </div>
                  </h1>
                  
                  <p className="text-body-large text-secondary leading-relaxed max-w-2xl">
                    Build your social media empire without breaking the bank. <span className="text-primary font-bold">No monthly subscriptions, no hidden fees</span> — 
                    just transparent pay-per-use pricing for premium features. Core automation agents are always free.
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-6">
                <Button size="lg" className="bg-blue-400 text-[#191919] font-bold px-10 py-0 rounded-md shadow-strong text-lg">
                  <Rocket className="mr-3 w-5 h-5" />
                  Launch Your Empire
                </Button>
                <Button variant="outline" size="lg" className="border-2 border-tertiary text-white bg-secondary backdrop-blur-sm px-10 py-4 rounded-xl font-bold text-lg">
                  <Users className="mr-3 w-5 h-5" />
                  Meet Your Agents
                </Button>
              </div>
              
              {/* Live Metrics */}
              <div className="grid grid-cols-3 gap-4 pt-0">
                <div className="glass-card rounded-xl p-4 text-center">
                  <div className="text-3xl font-black text-primary">10x</div>
                  <div className="text-quaternary font-mono text-sm uppercase tracking-wide">Faster Growth</div>
                </div>
                <div className="glass-card rounded-xl p-4 text-center">
                  <div className="text-3xl font-black text-white">$0</div>
                  <div className="text-quaternary font-mono text-sm uppercase tracking-wide">Start Free</div>
                </div>
                <div className="glass-card rounded-xl p-4 text-center">
                  <div className="text-3xl font-black text-primary">∞</div>
                  <div className="text-quaternary font-mono text-sm uppercase tracking-wide">Possibilities</div>
                </div>
              </div>
            </div>
            
            {/* Interactive Console Demo */}
            <div className="lg:col-span-6 lg:pt-0 lg:mt-0">
              <div className="glass-strong rounded-2xl overflow-hidden shadow-strong animate-float">
                {/* Terminal Header */}
                <div className="bg-secondary border-b border-primary px-8 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex space-x-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      </div>
                      <span className="text-sm text-secondary font-mono ml-4">aura-social-console</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-white font-semibold text-xs">AGENTS ACTIVE</span>
                    </div>
                  </div>
                </div>
                
                {/* Terminal Content */}
                <div className="p-8 h-96 overflow-hidden relative font-mono text-sm bg-primary">
                  <div className="animate-code-scroll space-y-4">
                    <div className="text-secondary">$ aura agents status</div>
                    <div className="text-white">✓ onboarding.agent - Active (Core/Free)</div>
                    <div className="text-white">✓ content-creator.agent - Active (Core/Free)</div>
                    <div className="text-white">✓ brand-strategist.agent - Active (Core/Free)</div>
                    <div className="text-white">✓ scheduler.agent - Active (Core/Free)</div>
                    <div className="text-secondary">→ analytics.agent - Extension ($0.15/report)</div>
                    
                    <div className="text-secondary mt-6">$ aura onboard --product=&quot;AI SaaS Platform&quot;</div>
                    <div className="text-tertiary">🤖 Onboarding Agent: Analyzing your product...</div>
                    <div className="text-secondary">→ Building brand persona...</div>
                    <div className="text-secondary">→ Researching target audience...</div>
                    <div className="text-white">✓ Brand strategy complete</div>
                    
                    <div className="text-secondary mt-6">$ aura content create --mode=auto</div>
                    <div className="text-tertiary">🎨 Content Creator: Generating post ideas...</div>
                    <div className="text-tertiary">📊 Brand Strategist: Ensuring voice consistency...</div>
                    <div className="text-tertiary">⏰ Scheduler: Optimizing post timing...</div>
                    <div className="text-white">✓ 7 posts scheduled for this week</div>
                    
                    <div className="text-secondary mt-6">$ aura extension install logo-generator</div>
                    <div className="text-secondary">→ Installing Logo Generator Extension...</div>
                    <div className="text-secondary">→ Cost: $3.50 per generation</div>
                    <div className="text-white">✓ Extension ready</div>
                    
                    <div className="text-secondary mt-6">$ aura agents orchestrate --task=&quot;launch_campaign&quot;</div>
                    <div className="text-tertiary">🧠 Orchestrator: Coordinating team...</div>
                    <div className="text-tertiary">→ Content Creator: Preparing assets</div>
                    <div className="text-tertiary">→ Scheduler: Planning distribution</div>
                    <div className="text-tertiary">→ Brand Strategist: Final review</div>
                    <div className="text-white">✓ Campaign launched successfully</div>
                    
                    <div className="text-secondary mt-6">$ aura stats --realtime</div>
                    <div className="text-secondary">📈 Engagement up 247% this week</div>
                    <div className="text-secondary">🎯 Reach: 12.4K users</div>
                    <div className="text-secondary">💬 Comments: 94% positive sentiment</div>
                    <div className="text-white">✓ All systems optimal</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Agent Architecture - Modern Grid */}
      <section className="py-16" id="architecture">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center glass-card px-6 py-3 rounded-full mb-6">
              <div className="w-2 h-2 bg-white rounded-full mr-3 animate-pulse-glow"></div>
              <span className="text-secondary font-mono text-sm uppercase tracking-wider">Agent Ecosystem</span>
            </div>
            <h2 className="text-display font-black text-primary mb-6 leading-tight">
              <span className="text-primary">Intelligent Agent</span>
              <span className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-light-sweep"></div>
                <span className="relative text-white font-black px-6 py-2 pr-20">Architecture</span>
              </span>
            </h2>
            <div className="max-w-4xl mx-auto glass-card rounded-2xl p-6">
              <p className="text-lg text-secondary leading-relaxed">
                <span className="text-primary font-bold">Core Agents:</span> Essential automation workflows (Always Free). 
                <span className="text-primary font-bold"> Extensions:</span> Specialized AI tools and advanced capabilities (Pay-per-use).
              </p>
            </div>
          </div>

          {/* Architecture Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            
            {/* Core Agents */}
            <Card className="glass-card rounded-2xl overflow-hidden group hover:bg-secondary/10 transition-all duration-500 hover-lift">
              <CardHeader className="bg-secondary border-b border-primary p-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-primary font-bold text-2xl flex items-center">
                    <Shield className="mr-4 w-7 h-7 text-white" />
                    Core Agents
                  </CardTitle>
                  <div className="bg-white/20 px-4 py-2 rounded-full">
                    <span className="text-white font-bold">FREE</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <p className="text-secondary leading-relaxed text-body-elegant">
                    Essential social media automation agents built into AURA. Always available, no hidden costs.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center text-sm">
                      <Users className="w-5 h-5 mr-3 text-white" />
                      <span className="text-secondary">Onboarding Agent</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <MessageSquare className="w-5 h-5 mr-3 text-white" />
                      <span className="text-secondary">Content Creator</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Palette className="w-5 h-5 mr-3 text-white" />
                      <span className="text-secondary">Brand Strategist</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Calendar className="w-5 h-5 mr-3 text-white" />
                      <span className="text-secondary">Scheduler Agent</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Extensions */}
            <Card className="glass-card rounded-2xl overflow-hidden group hover:bg-secondary/10 transition-all duration-500 hover-lift">
              <CardHeader className="bg-secondary border-b border-primary p-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-primary font-bold text-2xl flex items-center">
                    <Puzzle className="mr-4 w-7 h-7 text-gray-400" />
                    Extensions
                  </CardTitle>
                  <div className="bg-gray-400/20 px-4 py-2 rounded-full">
                    <span className="text-gray-400 font-bold">PAY-PER-USE</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <p className="text-secondary leading-relaxed text-body-elegant">
                    Specialized AI tools and advanced capabilities for power users and professional teams.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center text-sm">
                      <BarChart3 className="w-5 h-5 mr-3 text-gray-400" />
                      <span className="text-secondary">Analytics Agent</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Palette className="w-5 h-5 mr-3 text-gray-400" />
                      <span className="text-secondary">Logo Generator</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Search className="w-5 h-5 mr-3 text-gray-400" />
                      <span className="text-secondary">Research Assistant</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Grid3X3 className="w-5 h-5 mr-3 text-gray-400" />
                      <span className="text-secondary">Carousel Maker</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Extensions Marketplace - Modern Design */}
      <section className="py-16 bg-secondary/20" id="console">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center glass-card px-6 py-3 rounded-full mb-6">
              <div className="w-2 h-2 bg-gray-500 rounded-full mr-3 animate-pulse-glow"></div>
              <span className="text-secondary font-mono text-sm uppercase tracking-wider">Extensions Marketplace</span>
            </div>
            <h2 className="text-display font-black text-primary mb-6 leading-tight">
              Professional Extensions
            </h2>
            <p className="text-lg text-secondary max-w-4xl mx-auto leading-relaxed">
              Expand your social media capabilities with specialized AI extensions. From advanced analytics to creative tools, 
              pay only for what you use with transparent, cost-effective pricing.
            </p>
          </div>

          {/* Extension Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            
            {/* AI Workflows */}
            <Card className="glass-card rounded-2xl overflow-hidden group hover:bg-secondary/10 transition-all duration-500 hover-lift">
              <CardHeader className="bg-secondary border-b border-primary p-8">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-primary font-bold text-xl flex items-center">
                    <Cpu className="mr-3 w-6 h-6 text-gray-300" />
                    AI Workflows
                  </CardTitle>
                  <div className="w-3 h-3 bg-gray-300 rounded-full animate-pulse-glow"></div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <p className="text-secondary leading-relaxed mb-6 text-body-elegant">
                  Multi-step AI processes with intelligent orchestration for complex analysis and strategic insights.
                </p>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-secondary">Competitor Analysis</span>
                    <span className="text-white font-bold">$1.75</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-secondary">Market Research</span>
                    <span className="text-white font-bold">$2.25</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-secondary">Data Processing</span>
                    <span className="text-white font-bold">$1.50</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Creative Tools */}
            <Card className="glass-card rounded-2xl overflow-hidden group hover:bg-secondary/10 transition-all duration-500 hover-lift">
              <CardHeader className="bg-secondary border-b border-primary p-8">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-primary font-bold text-xl flex items-center">
                    <Zap className="mr-3 w-6 h-6 text-gray-200" />
                    Creative Tools
                  </CardTitle>
                  <div className="w-3 h-3 bg-gray-200 rounded-full animate-pulse-glow"></div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <p className="text-secondary leading-relaxed mb-6 text-body-elegant">
                  Instant creative generation tools for logos, content, and visual assets with professional quality.
                </p>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-secondary">Logo Generator</span>
                    <span className="text-white font-bold">$3.50</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-secondary">Content Writer</span>
                    <span className="text-white font-bold">$0.75</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-secondary">Visual Designer</span>
                    <span className="text-white font-bold">$2.00</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Analytics & Data */}
            <Card className="glass-card rounded-2xl overflow-hidden group hover:bg-secondary/10 transition-all duration-500 hover-lift">
              <CardHeader className="bg-secondary border-b border-primary p-8">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-primary font-bold text-xl flex items-center">
                    <Database className="mr-3 w-6 h-6 text-gray-400" />
                    Analytics & Data
                  </CardTitle>
                  <div className="w-3 h-3 bg-gray-400 rounded-full animate-pulse-glow"></div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <p className="text-secondary leading-relaxed mb-6 text-body-elegant">
                  Advanced data processing, comprehensive analytics, and professional reporting capabilities.
                </p>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-secondary">Data Visualization</span>
                    <span className="text-white font-bold">$1.50</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-secondary">Performance Analytics</span>
                    <span className="text-white font-bold">$2.00</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-secondary">Custom Reports</span>
                    <span className="text-white font-bold">$1.25</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Console Integration Features */}
          <div className="glass-card rounded-2xl p-12">
            <h3 className="text-subtitle font-bold text-primary mb-6 text-center">Seamless Integration</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-12 h-12 bg-gray-300/20 rounded-2xl flex items-center justify-center">
                  <Puzzle className="w-6 h-6 text-gray-300" />
                </div>
                <div>
                  <h4 className="text-primary font-semibold mb-2">One-Click Access</h4>
                  <p className="text-secondary text-sm">Integrated directly in console</p>
                </div>
              </div>
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-primary font-semibold mb-2">Transparent Pricing</h4>
                  <p className="text-secondary text-sm">Clear costs before use</p>
                </div>
              </div>
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-12 h-12 bg-gray-400/20 rounded-2xl flex items-center justify-center">
                  <Play className="w-6 h-6 text-gray-400" />
                </div>
                <div>
                  <h4 className="text-primary font-semibold mb-2">Instant Execution</h4>
                  <p className="text-secondary text-sm">No setup required</p>
                </div>
              </div>
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-12 h-12 bg-gray-200/20 rounded-2xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-gray-200" />
                </div>
                <div>
                  <h4 className="text-primary font-semibold mb-2">Usage Tracking</h4>
                  <p className="text-secondary text-sm">Real-time cost monitoring</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16" id="pricing">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center bg-[#1f1f1f]/50 backdrop-blur-sm border border-[#2d2d2d] px-4 py-2 rounded-lg mb-6">
              <div className="w-2 h-2 bg-white rounded-full mr-3 animate-pulse"></div>
              <span className="text-secondary font-mono text-sm uppercase tracking-wider">Fair Pricing Model</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-primary mb-6 leading-tight">
              <div className="text-primary">No Monthly Fees,</div>
              <div className="relative inline-block mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-light-sweep"></div>
                <span className="relative text-white font-black px-6 py-2 pr-20 whitespace-nowrap">Pay What You Use</span>
              </div>
            </h2>
            <div className="max-w-4xl mx-auto bg-[#1f1f1f]/30 border border-[#2d2d2d] rounded-lg p-6">
              <p className="text-lg text-secondary leading-relaxed">
                Build your social media empire without breaking the bank. <span className="text-primary font-semibold">Core automation agents are completely free</span>, 
                and premium extensions cost only what you actually use — no subscriptions, no commitments.
              </p>
            </div>
          </div>

          {/* Pricing Tiers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12">
            
            {/* Free Tier */}
            <Card className="bg-[#1f1f1f]/50 border border-[#2d2d2d] rounded-lg overflow-hidden group hover:bg-[#1f1f1f] transition-all duration-500">
              <CardHeader className="bg-[#1f1f1f] border-b border-[#2d2d2d] p-6">
                <div className="flex items-center justify-between mb-4">
                  <CardTitle className="text-primary font-bold text-2xl flex items-center">
                    <Zap className="mr-3 w-6 h-6 text-white" />
                    Free
                  </CardTitle>
                  <div className="bg-white/20 px-3 py-1 rounded-full">
                    <span className="text-white font-bold text-sm">$0</span>
                  </div>
                </div>
                <p className="text-secondary">Perfect for getting started with social media automation</p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="text-3xl font-black text-primary">$0<span className="text-lg font-normal text-secondary">/month</span></div>
                  <div className="space-y-4">
                    <div className="flex items-center text-sm">
                      <span className="text-white mr-3">✓</span>
                      <span className="text-secondary">Onboarding Agent</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="text-white mr-3">✓</span>
                      <span className="text-secondary">Content Creator</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="text-white mr-3">✓</span>
                      <span className="text-secondary">Brand Strategist</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="text-white mr-3">✓</span>
                      <span className="text-secondary">Basic Scheduling</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="text-white mr-3">✓</span>
                      <span className="text-secondary">Manual Posts</span>
                    </div>
                  </div>
                  <Button className="w-full bg-white/10 hover:bg-white hover:text-black border border-white/30 text-white font-bold py-3 transition-all duration-300">
                    Get Started Free
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Pro Tier */}
            <Card className="bg-[#1f1f1f]/50 border border-gray-400/30 rounded-lg overflow-hidden group hover:bg-[#1f1f1f] transition-all duration-500 transform scale-105">
              <div className="bg-gradient-to-r from-accent-purple to-accent-cyan h-1"></div>
              <CardHeader className="bg-[#1f1f1f] border-b border-[#2d2d2d] p-6">
                <div className="flex items-center justify-between mb-4">
                  <CardTitle className="text-primary font-bold text-2xl flex items-center">
                    <Puzzle className="mr-3 w-6 h-6 text-gray-400" />
                    Pro
                  </CardTitle>
                  <div className="bg-gray-400/20 px-3 py-1 rounded-full">
                    <span className="text-gray-400 font-bold text-sm">POPULAR</span>
                  </div>
                </div>
                <p className="text-secondary">Everything free + access to extensions ecosystem</p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="text-3xl font-black text-primary">$5<span className="text-lg font-normal text-secondary">/month</span></div>
                  <div className="space-y-4">
                    <div className="flex items-center text-sm">
                      <span className="text-gray-400 mr-3">✓</span>
                      <span className="text-secondary">All Free Tier features</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="text-gray-400 mr-3">✓</span>
                      <span className="text-secondary">Analytics Agent</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="text-gray-400 mr-3">✓</span>
                      <span className="text-secondary">Research Assistant</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="text-gray-400 mr-3">✓</span>
                      <span className="text-secondary">Logo & Carousel Maker</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="text-gray-400 mr-3">✓</span>
                      <span className="text-secondary">Pay-per-use Extensions</span>
                    </div>
                  </div>
                  <Button className="w-full bg-gray-400/10 hover:bg-gray-400 hover:text-black border border-gray-400/30 text-gray-400 font-bold py-3 transition-all duration-300">
                    Upgrade to Pro
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Power User Tier */}
            <Card className="bg-[#1f1f1f]/50 border border-[#2d2d2d] rounded-lg overflow-hidden group hover:bg-[#1f1f1f] transition-all duration-500">
              <CardHeader className="bg-[#1f1f1f] border-b border-[#2d2d2d] p-6">
                <div className="flex items-center justify-between mb-4">
                  <CardTitle className="text-primary font-bold text-2xl flex items-center">
                    <Cpu className="mr-3 w-6 h-6 text-gray-500" />
                    Power User
                  </CardTitle>
                  <div className="bg-gray-500/20 px-3 py-1 rounded-full">
                    <span className="text-gray-500 font-bold text-sm">UNLIMITED</span>
                  </div>
                </div>
                <p className="text-secondary">Everything included with unlimited extensions</p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="text-3xl font-black text-primary">$20<span className="text-lg font-normal text-secondary">/month</span></div>
                  <div className="space-y-4">
                    <div className="flex items-center text-sm">
                      <span className="text-gray-500 mr-3">✓</span>
                      <span className="text-secondary">All Pro Tier features</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="text-gray-500 mr-3">✓</span>
                      <span className="text-secondary">Unlimited Extensions</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="text-gray-500 mr-3">✓</span>
                      <span className="text-secondary">Advanced Analytics</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="text-gray-500 mr-3">✓</span>
                      <span className="text-secondary">Priority Support</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="text-gray-500 mr-3">✓</span>
                      <span className="text-secondary">No Usage Tracking</span>
                    </div>
                  </div>
                  <Button className="w-full bg-gray-500/10 hover:bg-gray-500 hover:text-black border border-gray-500/30 text-gray-500 font-bold py-3 transition-all duration-300">
                    Go Power User
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Extension Pricing */}
          <div className="bg-[#1f1f1f]/30 border border-[#2d2d2d] rounded-lg p-8 text-center">
            <h3 className="text-2xl font-bold text-primary mb-6">Extension Pricing</h3>
            <p className="text-lg text-secondary mb-8">
              Pro tier extensions use transparent, cost-based pricing. Most extensions cost just a few cents per use.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-[#1f1f1f]/50 rounded-lg p-6">
                <div className="text-2xl font-bold text-white">~$0.003</div>
                <div className="text-sm text-secondary">500-token generation</div>
              </div>
              <div className="bg-[#1f1f1f]/50 rounded-lg p-6">
                <div className="text-2xl font-bold text-gray-400">$3.00</div>
                <div className="text-sm text-secondary">Logo generation</div>
              </div>
              <div className="bg-[#1f1f1f]/50 rounded-lg p-6">
                <div className="text-2xl font-bold text-gray-500">$0.10</div>
                <div className="text-sm text-secondary">Analytics report</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16" id="mission">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center bg-[#1f1f1f]/50 backdrop-blur-sm border border-[#2d2d2d] px-4 py-2 rounded-lg mb-6">
              <div className="w-2 h-2 bg-gray-200 rounded-full mr-3 animate-pulse"></div>
              <span className="text-secondary font-mono text-sm uppercase tracking-wider">Democratizing AI Mission</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-primary mb-6 leading-tight">
              <span className="text-primary">AI for</span>
              <div className="relative inline-block max-w-xs mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-light-sweep"></div>
                <span className="relative text-white font-black px-6 py-2 pr-20">Everyone</span>
              </div>
            </h2>
            <div className="max-w-4xl mx-auto bg-[#1f1f1f]/30 border border-[#2d2d2d] rounded-lg p-6">
              <p className="text-lg text-secondary leading-relaxed">
                Our core mission is making AI accessible to everyone through generous free tiers, 
                affordable pay-per-use pricing, and zero subscription lock-in. 
                <span className="text-primary font-bold"> Transparent pricing, immediate access, unlimited potential.</span>
              </p>
            </div>
          </div>

          {/* Mission Values Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <Card className="bg-[#1f1f1f]/50 border border-[#2d2d2d] rounded-lg overflow-hidden group hover:bg-[#1f1f1f] transition-all duration-500">
              <CardHeader className="bg-[#1f1f1f] border-b border-[#2d2d2d] p-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-primary font-bold text-lg">Generous Free Tier</CardTitle>
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-secondary leading-relaxed">
                  Essential workflow agents included at no cost. Orchestrator, onboarding, scheduling, 
                  and core development tools are always free.
                </p>
                <div className="mt-3 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span className="text-white font-mono text-xs uppercase tracking-wide">Always Free</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#1f1f1f]/50 border border-[#2d2d2d] rounded-lg overflow-hidden group hover:bg-[#1f1f1f] transition-all duration-500">
              <CardHeader className="bg-[#1f1f1f] border-b border-[#2d2d2d] p-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-primary font-bold text-lg">Affordable Pay-per-use</CardTitle>
                  <div className="w-3 h-3 bg-gray-400 rounded-full animate-pulse"></div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-secondary leading-relaxed">
                  Premium extensions priced around ~$1 per generation. Pay only when you use 
                  advanced features, no monthly commitments required.
                </p>
                <div className="mt-3 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                  <span className="text-gray-400 font-mono text-xs uppercase tracking-wide">Pay Per Use</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#1f1f1f]/50 border border-[#2d2d2d] rounded-lg overflow-hidden group hover:bg-[#1f1f1f] transition-all duration-500">
              <CardHeader className="bg-[#1f1f1f] border-b border-[#2d2d2d] p-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-primary font-bold text-lg">Transparent Pricing</CardTitle>
                  <div className="w-3 h-3 bg-gray-500 rounded-full animate-pulse"></div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-secondary leading-relaxed">
                  Clear costs displayed before each use. No hidden fees, no subscription tricks, 
                  no enterprise lock-in. See exactly what you pay.
                </p>
                <div className="mt-3 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-500 font-mono text-xs uppercase tracking-wide">Full Transparency</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-16" id="philosophy">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center bg-[#1f1f1f]/50 backdrop-blur-sm border border-[#2d2d2d] px-4 py-2 rounded-lg mb-6">
              <div className="w-2 h-2 bg-white rounded-full mr-3 animate-pulse"></div>
              <span className="text-secondary font-mono text-sm uppercase tracking-wider">Innovation Philosophy</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-primary mb-6 leading-tight">
              <span className="text-primary">Digital Innovation</span>
              <div className="relative inline-block max-w-sm mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-light-sweep"></div>
                <span className="relative text-white font-black px-6 py-2 pr-20">Philosophy</span>
              </div>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Technology with Purpose */}
            <Card className="bg-[#1f1f1f]/50 border border-[#2d2d2d] rounded-lg overflow-hidden group hover:bg-[#1f1f1f] transition-all duration-500">
              <CardHeader className="bg-[#1f1f1f] border-b border-[#2d2d2d] p-6">
                <CardTitle className="text-primary font-bold text-xl flex items-center">
                  <Cpu className="mr-3 w-5 h-5 text-white" />
                  Technology with Purpose
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4 text-secondary leading-relaxed">
                  <p>
                    At ACDC Digital, we believe technology should serve a greater purpose beyond mere functionality. 
                    Our development philosophy centers on creating solutions that genuinely improve business 
                    processes, enhance user experiences, and drive meaningful outcomes.
                  </p>
                  <p>
                    Every project begins with understanding the core business challenge, then applying the most 
                    appropriate technology stack to solve real-world problems efficiently and elegantly.
                  </p>
                </div>
              </CardContent>
            </Card>
            
            {/* Innovation Through Collaboration */}
            <Card className="bg-[#1f1f1f]/50 border border-[#2d2d2d] rounded-lg overflow-hidden group hover:bg-[#1f1f1f] transition-all duration-500">
              <CardHeader className="bg-[#1f1f1f] border-b border-[#2d2d2d] p-6">
                <CardTitle className="text-primary font-bold text-xl flex items-center">
                  <Users className="mr-3 w-5 h-5 text-white" />
                  Innovation Through Collaboration
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4 text-secondary leading-relaxed">
                  <p>
                    Our collaborative approach ensures that client expertise combines seamlessly with our 
                    technical capabilities. We foster partnerships that leverage domain knowledge while 
                    introducing cutting-edge solutions.
                  </p>
                  <p>
                    From initial concept through deployment and maintenance, we maintain transparent 
                    communication and iterative development practices that deliver results on time and within budget.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Philosophy Quote */}
          <div className="mt-12 bg-[#1f1f1f]/30 border border-[#2d2d2d] rounded-lg p-8 text-center">
            <blockquote className="text-lg lg:text-xl font-light text-secondary italic leading-relaxed">
              &ldquo;Excellence in digital solutions requires more than technical proficiency—it demands 
              understanding business context, user needs, and the strategic vision that guides successful implementation.&rdquo;
            </blockquote>
            <div className="mt-4 flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span className="text-white font-mono text-xs uppercase tracking-wide">ACDC Digital Philosophy</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <div className="bg-[#1f1f1f]/30 border border-[#2d2d2d] rounded-lg p-8">
            <h2 className="text-4xl lg:text-5xl font-black text-primary mb-6">
              Ready to Build with <span className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-light-sweep"></div>
                <span className="relative text-white font-black px-6 py-2 pr-20">AURA</span>
              </span>?
            </h2>
            <p className="text-lg text-secondary mb-6 leading-relaxed">
              Transform your social media strategy with AI agents that understand your brand, 
              create compelling content, and engage your audience 24/7.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white/10 border border-white/20 text-white hover:bg-white hover:text-black font-bold px-6 py-3 text-lg transition-all duration-300">
                <Puzzle className="mr-2 w-5 h-5" />
                Start Free Today
              </Button>
              <Button variant="outline" size="lg" className="bg-gray-500/5 border border-gray-500/20 text-gray-500 hover:bg-gray-500 hover:text-black font-bold px-6 py-3 text-lg transition-all duration-300">
                <Users className="mr-2 w-5 h-5" />
                Meet Your Agents
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Terminal Footer */}
      <footer className="border-t border-white/[0.08] py-12">
        <div className="max-w-7xl mx-auto px-8">
          {/* Terminal Header */}
          <div className="border border-primary/30 rounded-lg mb-8">
            <div className="border-b border-primary/20 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 border border-white/40 rounded-md flex items-center justify-center">
                      <Fingerprint className="w-3 h-3 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-primary font-mono">aura</div>
                    <span className="text-secondary font-mono">plugin_system</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <div className="w-2 h-2 bg-accent-red rounded-full"></div>
                </div>
              </div>
            </div>
            <div className="p-4">
              <p className="text-secondary mb-4 font-mono text-sm">
                vibe-code your social media strategy with ai agents that handle everything from brand development to content distribution.
              </p>
              <div className="flex space-x-6">
                <a href="#" className="text-secondary hover:text-white transition-colors font-mono text-sm" aria-label="github">
                  <Github className="w-4 h-4 inline mr-2" />
                  github
                </a>
                <a href="#" className="text-secondary hover:text-gray-500 transition-colors font-mono text-sm" aria-label="chat">
                  <MessageSquare className="w-4 h-4 inline mr-2" />
                  chat
                </a>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            
            {/* AI Agents */}
            <div className="p-4">
              <h3 className="text-primary font-semibold mb-4 font-mono text-sm uppercase tracking-wider">ai_agents</h3>
              <ul className="space-y-3 text-secondary">
                <li><a href="#" className="hover:text-white transition-colors font-mono text-sm flex items-center">
                  <span className="mr-2">&gt;</span> onboarding_agent
                </a></li>
                <li><a href="#" className="hover:text-white transition-colors font-mono text-sm flex items-center">
                  <span className="mr-2">&gt;</span> content_creator
                </a></li>
                <li><a href="#" className="hover:text-white transition-colors font-mono text-sm flex items-center">
                  <span className="mr-2">&gt;</span> brand_strategist
                </a></li>
                <li><a href="#" className="hover:text-white transition-colors font-mono text-sm flex items-center">
                  <span className="mr-2">&gt;</span> scheduler_agent
                </a></li>
              </ul>
            </div>
            
            {/* Development */}
            <div className="p-4">
              <h3 className="text-primary font-semibold mb-4 font-mono text-sm uppercase tracking-wider">development</h3>
              <ul className="space-y-3 text-secondary">
                <li><a href="#" className="hover:text-gray-400 transition-colors font-mono text-sm flex items-center">
                  <span className="mr-2">&gt;</span> documentation
                </a></li>
                <li><a href="#" className="hover:text-gray-400 transition-colors font-mono text-sm flex items-center">
                  <span className="mr-2">&gt;</span> plugin_sdk
                </a></li>
                <li><a href="#" className="hover:text-gray-400 transition-colors font-mono text-sm flex items-center">
                  <span className="mr-2">&gt;</span> api_reference
                </a></li>
                <li><a href="#" className="hover:text-gray-400 transition-colors font-mono text-sm flex items-center">
                  <span className="mr-2">&gt;</span> examples
                </a></li>
              </ul>
            </div>
            
            {/* Company */}
            <div className="p-4">
              <h3 className="text-primary font-semibold mb-4 font-mono text-sm uppercase tracking-wider">company</h3>
              <ul className="space-y-3 text-secondary">
                <li><a href="#" className="hover:text-gray-500 transition-colors font-mono text-sm flex items-center">
                  <span className="mr-2">&gt;</span> about_acdc_digital
                </a></li>
                <li><a href="#" className="hover:text-gray-500 transition-colors font-mono text-sm flex items-center">
                  <span className="mr-2">&gt;</span> mission
                </a></li>
                <li><a href="#" className="hover:text-gray-500 transition-colors font-mono text-sm flex items-center">
                  <span className="mr-2">&gt;</span> blog
                </a></li>
                <li><a href="#" className="hover:text-gray-500 transition-colors font-mono text-sm flex items-center">
                  <span className="mr-2">&gt;</span> contact
                </a></li>
              </ul>
            </div>

            {/* System Status */}
            <div className="p-4">
              <h3 className="text-primary font-semibold mb-4 font-mono text-sm uppercase tracking-wider">system_status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm font-mono">
                  <span className="text-secondary">agents:</span>
                  <span className="text-green-400">online</span>
                </div>
                <div className="flex items-center justify-between text-sm font-mono">
                  <span className="text-secondary">api:</span>
                  <span className="text-blue-400">operational</span>
                </div>
                <div className="flex items-center justify-between text-sm font-mono">
                  <span className="text-secondary">extensions:</span>
                  <span className="text-orange-400">active</span>
                </div>
                <div className="flex items-center justify-between text-sm font-mono">
                  <span className="text-secondary">uptime:</span>
                  <span className="text-cyan-400">99.9%</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Terminal Bottom */}
          <div className="border-t border-primary/20 pt-2">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-secondary text-sm font-mono">
                © 2025 acdc_digital. democratizing_ai_through_extensible_architecture.
              </div>
              <div className="flex space-x-6 text-secondary text-sm mt-4 md:mt-0 font-mono">
                <a href="#" className="hover:text-white transition-colors">privacy_policy</a>
                <a href="#" className="hover:text-gray-400 transition-colors">terms_of_service</a>
                <a href="#" className="hover:text-gray-500 transition-colors">license</a>
              </div>
            </div>
            
            {/* Terminal Prompt */}
            <div className="mt-4 rounded p-0">
              <div className="flex items-center text-sm font-mono">
                <span className="text-white">$</span>
                <span className="text-green-400 ml-2">echo</span>
                <span className="text-secondary ml-1">&quot;thanks for exploring aura - happy coding!&quot;</span>
                <span className="text-white ml-2 animate-pulse">_</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}