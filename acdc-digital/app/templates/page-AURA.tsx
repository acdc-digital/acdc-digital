// HOMEPAGE - AURA Plugin System

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowUpRight, 
  Github, 
  Puzzle, 
  Zap, 
  Shield, 
  Code, 
  BarChart3, 
  Palette, 
  Database,
  MessageSquare,
  Terminal,
  Play,
  DollarSign,
  Users,
  Lock,
  Cpu,
  Calendar,
  Search,
  Grid3X3
} from "lucide-react";

export default function AuraHomepage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white overflow-x-hidden relative">
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
          50% { opacity: 0.5; }
        }
        @keyframes code-scroll {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        .animate-code-scroll {
          animation: code-scroll 20s linear infinite;
        }
        .glass-effect {
          backdrop-filter: blur(12px);
          background: rgba(51, 65, 85, 0.1);
          border: 1px solid rgba(71, 85, 105, 0.3);
        }
        /* IDE Paper Texture Color - Your Favorite #393939 */
        .bg-slate-paper {
          background-color: #393939;
        }
        .border-slate-paper {
          border-color: #393939;
        }
        .text-slate-paper {
          color: #393939;
        }
        /* San Francisco Font System */
        * {
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, sans-serif;
        }
        .font-sf-mono {
          font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', Consolas, 'Courier New', monospace;
        }
        .font-sf-display {
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif;
        }
        .font-sf-text {
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif;
        }
      `}</style>

      {/* Header/Navigation - IDE-Inspired Design */}
      <header className="bg-slate-800/90 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="text-2xl font-display font-bold text-white">AURA</div>
              <div className="text-lg font-display text-neutral-300">Plugin System</div>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#platform" className="text-neutral-300 hover:text-white transition-colors text-[15px] font-medium">Platform</a>
              <a href="#plugins" className="text-neutral-300 hover:text-white transition-colors text-[15px] font-medium">Plugins</a>
              <a href="#console" className="text-neutral-300 hover:text-white transition-colors text-[15px] font-medium">Console</a>
              <a href="#docs" className="text-neutral-300 hover:text-white transition-colors text-[15px] font-medium">Docs</a>
              <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-700 font-medium">
                Launch IDE
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Breaking News Ticker */}
      <div className="bg-slate-800 border-b border-slate-700 text-slate-300 py-2 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap">
          <span className="text-sm font-semibold uppercase tracking-wider font-sf-mono">
            🔴 LIVE: AURA Agent Network Active • 5 Core Agents Available • Extensions from $0.003/use • Free Tier Always Available • Social Media Strategy Automation • Agent Console Live •
          </span>
        </div>
      </div>

      {/* Hero Section - IDE-Inspired Dashboard */}
      <section className="relative py-20 overflow-hidden" id="platform">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Main Hero Content */}
            <div className="lg:col-span-7 space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center space-x-2 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg px-6 py-3">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-slate-300 font-sf-mono text-sm">Agentic Social Media Control Platform</span>
                </div>
                
                <h1 className="text-6xl lg:text-7xl font-black leading-none space-y-4 font-sf-display">
                  <div className="text-white">Vibe-Code</div>
                  <div className="text-slate-300">Your Social</div>
                  <div className="text-slate-400">Media Strategy</div>
                </h1>
                
                <p className="text-xl text-slate-400 leading-relaxed max-w-2xl font-sf-text">
                  AURA connects powerful AI agents with media tools to automate your entire social presence. 
                  From brand identity to content distribution - your AI agency-in-a-box.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-slate-700 hover:bg-slate-600 border border-slate-600 hover:border-slate-500 text-white font-bold px-12 py-4 rounded-lg shadow-xl transition-all duration-300 hover:scale-105 text-lg">
                  <Puzzle className="mr-2 w-5 h-5" />
                  Launch AURA
                </Button>
                <Button variant="outline" size="lg" className="border-2 border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white backdrop-blur-sm px-12 py-4 rounded-lg font-bold transition-all duration-300 hover:scale-105 text-lg">
                  <Github className="mr-2 w-5 h-5" />
                  Meet Your Agents
                </Button>
              </div>
              
              {/* Live Stats - Agency Style */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 text-center group hover:bg-slate-800 transition-all duration-300">
                  <div className="text-3xl font-black text-white font-sf-display">5+</div>
                  <div className="text-slate-500 font-sf-mono text-sm uppercase tracking-wide">AI Agents</div>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 text-center group hover:bg-slate-800 transition-all duration-300">
                  <div className="text-3xl font-black text-emerald-400 font-sf-display">$5</div>
                  <div className="text-slate-500 font-sf-mono text-sm uppercase tracking-wide">Pro Tier</div>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 text-center group hover:bg-slate-800 transition-all duration-300">
                  <div className="text-3xl font-black text-white font-sf-display">24/7</div>
                  <div className="text-slate-500 font-sf-mono text-sm uppercase tracking-wide">Active</div>
                </div>
              </div>
            </div>
            
            {/* Live Plugin System Display - IDE Terminal Style */}
            <div className="lg:col-span-5">
              <div className="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden animate-float">
                {/* Terminal Header */}
                <div className="bg-slate-800 border-b border-slate-700 px-6 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      </div>
                      <span className="text-sm text-slate-300 font-sf-mono ml-4">aura-agent-console</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                      <span className="text-emerald-400 font-semibold text-xs font-sf-text">AGENTS ACTIVE</span>
                    </div>
                  </div>
                </div>
                
                {/* Terminal Content */}
                <div className="p-6 h-80 overflow-hidden relative font-sf-mono text-sm">
                  <div className="animate-code-scroll space-y-3">
                    <div className="text-slate-400">$ aura agents status</div>
                    <div className="text-emerald-400">✓ onboarding.agent - Active (Core/Free)</div>
                    <div className="text-emerald-400">✓ content-creator.agent - Active (Core/Free)</div>
                    <div className="text-emerald-400">✓ brand-strategist.agent - Active (Core/Free)</div>
                    <div className="text-emerald-400">✓ scheduler.agent - Active (Core/Free)</div>
                    <div className="text-cyan-400">→ analytics.agent - Extension ($0.10/report)</div>
                    <div className="text-slate-400 mt-4">$ aura onboard --product="AI SaaS Platform"</div>
                    <div className="text-purple-400">🤖 Onboarding Agent: Tell me about your target audience...</div>
                    <div className="text-blue-400">→ Building brand strategy...</div>
                    <div className="text-blue-400">→ Analyzing competitor landscape...</div>
                    <div className="text-emerald-400">✓ Brand profile complete</div>
                    <div className="text-slate-400 mt-4">$ aura content create --mode=auto</div>
                    <div className="text-purple-400">🎨 Content Creator: Generating post ideas...</div>
                    <div className="text-purple-400">📊 Brand Strategist: Maintaining voice consistency...</div>
                    <div className="text-purple-400">⏰ Scheduler: Optimizing post timing...</div>
                    <div className="text-emerald-400">✓ 5 posts scheduled for this week</div>
                    <div className="text-slate-400 mt-4">$ aura extension install logo-generator</div>
                    <div className="text-cyan-400">→ Installing Logo Generator Extension...</div>
                    <div className="text-cyan-400">→ Cost: $3.00 per generation</div>
                    <div className="text-emerald-400">✓ Extension ready</div>
                    <div className="text-slate-400 mt-4">$ aura agents orchestrate --task="launch_campaign"</div>
                    <div className="text-yellow-400">🧠 Orchestrator: Coordinating agent team...</div>
                    <div className="text-yellow-400">→ Content Creator: Preparing assets</div>
                    <div className="text-yellow-400">→ Scheduler: Planning distribution</div>
                    <div className="text-yellow-400">→ Brand Strategist: Ensuring consistency</div>
                    <div className="text-emerald-400">✓ Campaign ready to launch</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Plugin Architecture Section */}
      <section className="py-20" id="architecture">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg px-6 py-3 mb-8">
              <div className="w-3 h-3 bg-emerald-400 rounded-full mr-3 animate-pulse"></div>
              <span className="text-slate-300 font-sf-mono text-sm uppercase tracking-wide">Agent Ecosystem</span>
            </div>
            <h2 className="text-5xl lg:text-6xl font-black text-white mb-6 leading-tight font-sf-display">
              <span className="text-white">AI Agency</span>
              <span className="block text-slate-400">Architecture</span>
            </h2>
            <div className="max-w-4xl mx-auto bg-slate-800/30 border border-slate-700 rounded-lg p-8">
              <p className="text-xl text-slate-300 leading-relaxed font-sf-text">
                <span className="text-white font-bold">Core Agents:</span> Essential social media workflow agents (Always Free). 
                <span className="text-white font-bold"> Extensions:</span> Specialized tools and advanced AI capabilities (Pay-per-use).
              </p>
            </div>
          </div>

          {/* Agent Tiers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {/* Tier 1: Core Agents */}
            <Card className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden group hover:bg-slate-800 transition-all duration-500">
              <CardHeader className="bg-slate-800 border-b border-slate-700 p-8">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white font-bold text-xl flex items-center">
                    <Shield className="mr-3 w-6 h-6 text-emerald-400" />
                    Core Agents
                  </CardTitle>
                  <div className="bg-emerald-400/20 px-3 py-1 rounded-full">
                    <span className="text-emerald-400 font-bold text-sm">FREE</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-4">
                  <p className="text-slate-300 leading-relaxed">
                    Essential social media workflow agents built into AURA. Always available, no additional charges.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm">
                      <Users className="w-4 h-4 mr-3 text-emerald-400" />
                      <span className="text-slate-300">Onboarding Agent</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <MessageSquare className="w-4 h-4 mr-3 text-emerald-400" />
                      <span className="text-slate-300">Content Creator</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Palette className="w-4 h-4 mr-3 text-emerald-400" />
                      <span className="text-slate-300">Brand Strategist</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Calendar className="w-4 h-4 mr-3 text-emerald-400" />
                      <span className="text-slate-300">Scheduler Agent</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tier 2: Extensions */}
            <Card className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden group hover:bg-slate-800 transition-all duration-500">
              <CardHeader className="bg-slate-800 border-b border-slate-700 p-8">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white font-bold text-xl flex items-center">
                    <Puzzle className="mr-3 w-6 h-6 text-purple-400" />
                    Tier 2: Extensions
                  </CardTitle>
                  <div className="bg-purple-400/20 px-3 py-1 rounded-full">
                    <span className="text-purple-400 font-bold text-sm">PAY-PER-USE</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-4">
                  <p className="text-slate-300 leading-relaxed">
                    Specialized tools and advanced AI capabilities for power users and teams.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm">
                      <BarChart3 className="w-4 h-4 mr-3 text-purple-400" />
                      <span className="text-slate-300">Analytics Agent</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Palette className="w-4 h-4 mr-3 text-purple-400" />
                      <span className="text-slate-300">Logo Generator</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Search className="w-4 h-4 mr-3 text-purple-400" />
                      <span className="text-slate-300">Research Assistant</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Grid3X3 className="w-4 h-4 mr-3 text-purple-400" />
                      <span className="text-slate-300">Carousel Maker</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Extensions Console Section */}
      <section className="py-20" id="console">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg px-6 py-3 mb-8">
              <div className="w-3 h-3 bg-cyan-400 rounded-full mr-3 animate-pulse"></div>
              <span className="text-slate-300 font-sf-mono text-sm uppercase tracking-wide">Extensions Marketplace</span>
            </div>
            <h2 className="text-5xl lg:text-6xl font-black text-white mb-6 leading-tight font-sf-display">
              Power User Extensions
            </h2>
            <p className="text-xl text-slate-400 max-w-4xl mx-auto leading-relaxed font-sf-text">
              Expand your social media arsenal with specialized extensions. From logo generation to advanced analytics, 
              pay only for what you use with transparent, cost-based pricing.
            </p>
          </div>

          {/* Extension Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Agentic Workflows */}
            <Card className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden group hover:bg-slate-800 transition-all duration-500">
              <CardHeader className="bg-slate-800 border-b border-slate-700 p-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white font-bold text-lg flex items-center">
                    <Cpu className="mr-3 w-5 h-5 text-blue-400" />
                    Agentic Workflows
                  </CardTitle>
                  <div className="w-4 h-4 bg-blue-400 rounded-full animate-pulse"></div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-slate-300 leading-relaxed mb-4">
                  Multi-step AI processes with tool orchestration for complex analysis and reporting.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Competitor Analysis</span>
                    <span className="text-green-400">$1.50</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Market Research</span>
                    <span className="text-green-400">$2.00</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Data Processing</span>
                    <span className="text-green-400">$1.00</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Tools */}
            <Card className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden group hover:bg-slate-800 transition-all duration-500">
              <CardHeader className="bg-slate-800 border-b border-slate-700 p-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white font-bold text-lg flex items-center">
                    <Zap className="mr-3 w-5 h-5 text-yellow-400" />
                    Quick Tools
                  </CardTitle>
                  <div className="w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-slate-300 leading-relaxed mb-4">
                  Single-purpose utilities for immediate results and instant generation.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Logo Generator</span>
                    <span className="text-green-400">$1.00</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Content Writer</span>
                    <span className="text-green-400">$0.50</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Code Formatter</span>
                    <span className="text-green-400">$0.25</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data & Analytics */}
            <Card className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden group hover:bg-slate-800 transition-all duration-500">
              <CardHeader className="bg-slate-800 border-b border-slate-700 p-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white font-bold text-lg flex items-center">
                    <Database className="mr-3 w-5 h-5 text-green-400" />
                    Data & Analytics
                  </CardTitle>
                  <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-slate-300 leading-relaxed mb-4">
                  Advanced data processing, visualization, and comprehensive reporting tools.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Data Visualization</span>
                    <span className="text-green-400">$1.25</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Statistical Analysis</span>
                    <span className="text-green-400">$1.75</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Report Generation</span>
                    <span className="text-green-400">$1.00</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Console Features */}
          <div className="mt-16 bg-slate-800/30 border border-slate-700 rounded-lg p-8">
            <h3 className="text-2xl font-bold text-white mb-6 font-sf-display">Console Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-400/20 rounded-lg flex items-center justify-center mt-1">
                  <Puzzle className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-white font-semibold">Integrated Access</h4>
                  <p className="text-slate-400 text-sm">Puzzle piece button in Activity Console</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-400/20 rounded-lg flex items-center justify-center mt-1">
                  <DollarSign className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <h4 className="text-white font-semibold">Live Pricing</h4>
                  <p className="text-slate-400 text-sm">Clear $1/generation cost display</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-purple-400/20 rounded-lg flex items-center justify-center mt-1">
                  <Play className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <h4 className="text-white font-semibold">Instant Purchase</h4>
                  <p className="text-slate-400 text-sm">One-click activation flow</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-yellow-400/20 rounded-lg flex items-center justify-center mt-1">
                  <BarChart3 className="w-4 h-4 text-yellow-400" />
                </div>
                <div>
                  <h4 className="text-white font-semibold">Usage Analytics</h4>
                  <p className="text-slate-400 text-sm">Real-time cost tracking</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20" id="pricing">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg px-6 py-3 mb-8">
              <div className="w-3 h-3 bg-emerald-400 rounded-full mr-3 animate-pulse"></div>
              <span className="text-slate-300 font-sf-mono text-sm uppercase tracking-wide">Pricing Plans</span>
            </div>
            <h2 className="text-5xl lg:text-6xl font-black text-white mb-6 leading-tight font-sf-display">
              <span className="text-white">Start Free,</span>
              <span className="block text-slate-400">Scale When Ready</span>
            </h2>
            <p className="text-xl text-slate-400 max-w-4xl mx-auto leading-relaxed font-sf-text">
              AURA&apos;s pricing grows with your social media ambitions. Core agents are always free, 
              with transparent pay-per-use extensions when you need advanced capabilities.
            </p>
          </div>

          {/* Pricing Tiers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            
            {/* Free Tier */}
            <Card className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden group hover:bg-slate-800 transition-all duration-500">
              <CardHeader className="bg-slate-800 border-b border-slate-700 p-8">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white font-bold text-2xl flex items-center">
                    <Zap className="mr-3 w-6 h-6 text-emerald-400" />
                    Free
                  </CardTitle>
                  <div className="bg-emerald-400/20 px-3 py-1 rounded-full">
                    <span className="text-emerald-400 font-bold text-sm">$0</span>
                  </div>
                </div>
                <p className="text-slate-400 mt-4">Perfect for getting started with social media automation</p>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="text-3xl font-black text-white">$0<span className="text-lg font-normal text-slate-400">/month</span></div>
                  <div className="space-y-4">
                    <div className="flex items-center text-sm">
                      <Users className="w-4 h-4 mr-3 text-emerald-400" />
                      <span className="text-slate-300">Onboarding Agent</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <MessageSquare className="w-4 h-4 mr-3 text-emerald-400" />
                      <span className="text-slate-300">Content Creator</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Palette className="w-4 h-4 mr-3 text-emerald-400" />
                      <span className="text-slate-300">Brand Strategist</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Calendar className="w-4 h-4 mr-3 text-emerald-400" />
                      <span className="text-slate-300">Basic Scheduling</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Terminal className="w-4 h-4 mr-3 text-emerald-400" />
                      <span className="text-slate-300">Manual Posts</span>
                    </div>
                  </div>
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3">
                    Get Started Free
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Pro Tier */}
            <Card className="bg-slate-800/50 border border-purple-400/30 rounded-lg overflow-hidden group hover:bg-slate-800 transition-all duration-500 transform scale-105">
              <div className="bg-gradient-to-r from-purple-400 to-cyan-400 h-1"></div>
              <CardHeader className="bg-slate-800 border-b border-slate-700 p-8">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white font-bold text-2xl flex items-center">
                    <Puzzle className="mr-3 w-6 h-6 text-purple-400" />
                    Pro
                  </CardTitle>
                  <div className="bg-purple-400/20 px-3 py-1 rounded-full">
                    <span className="text-purple-400 font-bold text-sm">POPULAR</span>
                  </div>
                </div>
                <p className="text-slate-400 mt-4">Everything free + access to extensions ecosystem</p>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="text-3xl font-black text-white">$5<span className="text-lg font-normal text-slate-400">/month</span></div>
                  <div className="space-y-4">
                    <div className="flex items-center text-sm">
                      <Shield className="w-4 h-4 mr-3 text-purple-400" />
                      <span className="text-slate-300">All Free Tier features</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <BarChart3 className="w-4 h-4 mr-3 text-purple-400" />
                      <span className="text-slate-300">Analytics Agent</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Search className="w-4 h-4 mr-3 text-purple-400" />
                      <span className="text-slate-300">Research Assistant</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Grid3X3 className="w-4 h-4 mr-3 text-purple-400" />
                      <span className="text-slate-300">Logo & Carousel Maker</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <DollarSign className="w-4 h-4 mr-3 text-purple-400" />
                      <span className="text-slate-300">Pay-per-use Extensions</span>
                    </div>
                  </div>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3">
                    Upgrade to Pro
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Power User Tier */}
            <Card className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden group hover:bg-slate-800 transition-all duration-500">
              <CardHeader className="bg-slate-800 border-b border-slate-700 p-8">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white font-bold text-2xl flex items-center">
                    <Cpu className="mr-3 w-6 h-6 text-cyan-400" />
                    Power User
                  </CardTitle>
                  <div className="bg-cyan-400/20 px-3 py-1 rounded-full">
                    <span className="text-cyan-400 font-bold text-sm">UNLIMITED</span>
                  </div>
                </div>
                <p className="text-slate-400 mt-4">Everything included with unlimited extensions</p>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="text-3xl font-black text-white">$20<span className="text-lg font-normal text-slate-400">/month</span></div>
                  <div className="space-y-4">
                    <div className="flex items-center text-sm">
                      <Shield className="w-4 h-4 mr-3 text-cyan-400" />
                      <span className="text-slate-300">All Pro Tier features</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Zap className="w-4 h-4 mr-3 text-cyan-400" />
                      <span className="text-slate-300">Unlimited Extensions</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <BarChart3 className="w-4 h-4 mr-3 text-cyan-400" />
                      <span className="text-slate-300">Advanced Analytics</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Users className="w-4 h-4 mr-3 text-cyan-400" />
                      <span className="text-slate-300">Priority Support</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Lock className="w-4 h-4 mr-3 text-cyan-400" />
                      <span className="text-slate-300">No Usage Tracking</span>
                    </div>
                  </div>
                  <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3">
                    Go Power User
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Extension Pricing Note */}
          <div className="mt-16 bg-slate-800/30 border border-slate-700 rounded-lg p-8 text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Extension Pricing</h3>
            <p className="text-lg text-slate-300 mb-6">
              Pro tier extensions use transparent, cost-based pricing. Most extensions cost just a few cents per use.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-slate-900/50 rounded-lg p-6">
                <div className="text-2xl font-bold text-emerald-400">~$0.003</div>
                <div className="text-sm text-slate-400">500-token generation</div>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-6">
                <div className="text-2xl font-bold text-purple-400">$3.00</div>
                <div className="text-sm text-slate-400">Logo generation</div>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-6">
                <div className="text-2xl font-bold text-cyan-400">$0.10</div>
                <div className="text-sm text-slate-400">Analytics report</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Values Section */}
      <section className="py-20" id="mission">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg px-6 py-3 mb-8">
              <div className="w-3 h-3 bg-orange-400 rounded-full mr-3 animate-pulse"></div>
              <span className="text-slate-300 font-sf-mono text-sm uppercase tracking-wide">Democratizing AI Mission</span>
            </div>
            <h2 className="text-5xl lg:text-6xl font-black text-white mb-6 leading-tight font-sf-display">
              <span className="text-white">AI for</span>
              <span className="block text-slate-400">Everyone</span>
            </h2>
            <div className="max-w-4xl mx-auto bg-slate-800/30 border border-slate-700 rounded-lg p-8">
              <p className="text-xl text-slate-300 leading-relaxed font-sf-text">
                Our core mission is making AI accessible to everyone through generous free tiers, 
                affordable pay-per-use pricing, and zero subscription lock-in. 
                <span className="text-white font-bold"> Transparent pricing, immediate access, unlimited potential.</span>
              </p>
            </div>
          </div>

          {/* Mission Values Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden group hover:bg-slate-800 transition-all duration-500">
              <CardHeader className="bg-slate-800 border-b border-slate-700 p-8">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white font-bold text-lg">Generous Free Tier</CardTitle>
                  <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <p className="text-slate-300 leading-relaxed">
                  Essential workflow agents included at no cost. Orchestrator, onboarding, scheduling, 
                  and core development tools are always free.
                </p>
                <div className="mt-4 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 font-mono text-xs uppercase tracking-wide">Always Free</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden group hover:bg-slate-800 transition-all duration-500">
              <CardHeader className="bg-slate-800 border-b border-slate-700 p-8">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white font-bold text-lg">Affordable Pay-per-use</CardTitle>
                  <div className="w-4 h-4 bg-blue-400 rounded-full animate-pulse"></div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <p className="text-slate-300 leading-relaxed">
                  Premium extensions priced around ~$1 per generation. Pay only when you use 
                  advanced features, no monthly commitments required.
                </p>
                <div className="mt-4 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <span className="text-blue-400 font-mono text-xs uppercase tracking-wide">Pay Per Use</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden group hover:bg-slate-800 transition-all duration-500">
              <CardHeader className="bg-slate-800 border-b border-slate-700 p-8">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white font-bold text-lg">Transparent Pricing</CardTitle>
                  <div className="w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <p className="text-slate-300 leading-relaxed">
                  Clear costs displayed before each use. No hidden fees, no subscription tricks, 
                  no enterprise lock-in. See exactly what you pay.
                </p>
                <div className="mt-4 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                  <span className="text-yellow-400 font-mono text-xs uppercase tracking-wide">Full Transparency</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Digital Innovation Philosophy Section */}
      <section className="py-20" id="philosophy">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg px-6 py-3 mb-8">
              <div className="w-3 h-3 bg-emerald-400 rounded-full mr-3 animate-pulse"></div>
              <span className="text-slate-300 font-sf-mono text-sm uppercase tracking-wide">Innovation Philosophy</span>
            </div>
            <h2 className="text-5xl lg:text-6xl font-black text-white mb-6 leading-tight font-sf-display">
              <span className="text-white">Digital Innovation</span>
              <span className="block text-slate-400">Philosophy</span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-16">
            {/* Technology with Purpose */}
            <Card className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden group hover:bg-slate-800 transition-all duration-500">
              <CardHeader className="bg-slate-800 border-b border-slate-700 p-8">
                <CardTitle className="text-white font-bold text-2xl flex items-center font-sf-display">
                  <Cpu className="mr-3 w-6 h-6 text-emerald-400" />
                  Technology with Purpose
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-6 text-slate-300 leading-relaxed font-sf-text">
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
            <Card className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden group hover:bg-slate-800 transition-all duration-500">
              <CardHeader className="bg-slate-800 border-b border-slate-700 p-8">
                <CardTitle className="text-white font-bold text-2xl flex items-center font-sf-display">
                  <Users className="mr-3 w-6 h-6 text-emerald-400" />
                  Innovation Through Collaboration
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-6 text-slate-300 leading-relaxed font-sf-text">
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
          <div className="mt-16 bg-slate-800/30 border border-slate-700 rounded-lg p-12 text-center">
            <blockquote className="text-2xl lg:text-3xl font-light text-slate-200 italic leading-relaxed font-sf-text">
              &ldquo;Excellence in digital solutions requires more than technical proficiency—it demands 
              understanding business context, user needs, and the strategic vision that guides successful implementation.&rdquo;
            </blockquote>
            <div className="mt-6 flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-emerald-400 font-sf-mono text-sm uppercase tracking-wide">ACDC Digital Philosophy</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-12">
            <h2 className="text-4xl font-black text-white mb-6 font-sf-display">
              Ready to Build with AURA?
            </h2>
            <p className="text-xl text-slate-300 mb-8 font-sf-text">
              Transform your social media strategy with AI agents that understand your brand, 
              create compelling content, and engage your audience 24/7.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-slate-700 hover:bg-slate-600 border border-slate-600 hover:border-slate-500 text-white font-bold px-8 py-4 text-lg">
                <Puzzle className="mr-2 w-5 h-5" />
                Start Free Today
              </Button>
              <Button variant="outline" size="lg" className="border-2 border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white px-8 py-4 text-lg">
                <Users className="mr-2 w-5 h-5" />
                Meet Your Agents
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Professional & Comprehensive */}
      <footer className="bg-slate-800 border-t border-slate-700 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Company Info */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="text-2xl font-bold text-white font-sf-display">AURA</div>
                <div className="text-slate-400">Plugin System</div>
              </div>
              <p className="text-slate-400 mb-4 font-sf-text">
                Vibe-code your social media strategy with AI agents that handle everything from brand development to content distribution.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-slate-400 hover:text-white transition-colors" aria-label="GitHub">
                  <Github className="w-5 h-5" />
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors" aria-label="Twitter">
                  <MessageSquare className="w-5 h-5" />
                </a>
              </div>
            </div>
            
            {/* Agents */}
            <div>
              <h3 className="text-white font-semibold mb-4 font-sf-display">AI Agents</h3>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Onboarding Agent</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Content Creator</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Brand Strategist</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Scheduler Agent</a></li>
              </ul>
            </div>
            
            {/* Development */}
            <div>
              <h3 className="text-white font-semibold mb-4 font-sf-display">Development</h3>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Plugin SDK</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Examples</a></li>
              </ul>
            </div>
            
            {/* Company */}
            <div>
              <h3 className="text-white font-semibold mb-4 font-sf-display">Company</h3>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">About ACDC Digital</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Mission</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          
          {/* Bottom Bar */}
          <div className="border-t border-slate-700 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-slate-400 text-sm font-sf-text">
                © 2025 ACDC Digital. Democratizing AI through extensible architecture.
              </div>
              <div className="flex space-x-6 text-slate-400 text-sm mt-4 md:mt-0">
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-white transition-colors">License</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}