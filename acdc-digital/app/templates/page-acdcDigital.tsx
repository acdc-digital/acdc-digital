// HOMEPAGE - ACDC.digital

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, Github, BarChart3, MessageSquare } from "lucide-react";

export default function Home() {
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
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
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
            {/* Header */}
      <header className="bg-slate-800/90 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="text-2xl font-display font-bold text-white">ACDC</div>
              <div className="text-lg font-display text-neutral-300">Digital</div>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#platform" className="text-neutral-300 hover:text-white transition-colors text-[15px] font-medium">Platform</a>
              <a href="#products" className="text-neutral-300 hover:text-white transition-colors text-[15px] font-medium">Products</a>
              <a href="#pricing" className="text-neutral-300 hover:text-white transition-colors text-[15px] font-medium">Pricing</a>
              <a href="#docs" className="text-neutral-300 hover:text-white transition-colors text-[15px] font-medium">Docs</a>
              <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-700 font-medium">
                Sign In
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Breaking News Ticker */}
      <div className="bg-slate-800 border-b border-slate-700 text-slate-300 py-2 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap">
          <span className="text-sm font-semibold uppercase tracking-wider font-sf-mono">
            🔴 BROADCASTING: Agentic Media Revolution Live • Pay-Per-Use Intelligence Active • 1000+ Extensions Online • Zero Subscription Fees • Network Status: Operational • 
          </span>
        </div>
      </div>

      {/* Hero Section - IDE-Inspired Dashboard */}
      <section className="relative py-20 overflow-hidden" id="broadcast">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Main Hero Content */}
            <div className="lg:col-span-7 space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center space-x-2 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg px-6 py-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-slate-300 font-sf-mono text-sm">Agentic Media Broadcasting</span>
                </div>
                
                <h1 className="text-6xl lg:text-7xl font-black leading-none space-y-4 font-sf-display">
                  <div className="text-white">Democratizing</div>
                  <div className="text-slate-300">Artificial</div>
                  <div className="text-slate-400">Intelligence</div>
                </h1>
                
                <p className="text-xl text-slate-400 leading-relaxed max-w-2xl font-sf-text">
                  Breaking down barriers to advanced AI through our revolutionary pay-per-use broadcasting network. 
                  Access cutting-edge intelligence without the enterprise overhead.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-slate-700 hover:bg-slate-600 border border-slate-600 hover:border-slate-500 text-white font-bold px-12 py-4 rounded-lg shadow-xl transition-all duration-300 hover:scale-105 text-lg">
                  <ArrowUpRight className="mr-2 w-5 h-5" />
                  Join the Network
                </Button>
                <Button variant="outline" size="lg" className="border-2 border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white backdrop-blur-sm px-12 py-4 rounded-lg font-bold transition-all duration-300 hover:scale-105 text-lg">
                  <Github className="mr-2 w-5 h-5" />
                  Watch Demo
                </Button>
              </div>
              
              {/* Live Stats - IDE Style */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 text-center group hover:bg-slate-800 transition-all duration-300">
                  <div className="text-3xl font-black text-white font-sf-display">1,247</div>
                  <div className="text-slate-500 font-sf-mono text-sm uppercase tracking-wide">Active Tools</div>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 text-center group hover:bg-slate-800 transition-all duration-300">
                  <div className="text-3xl font-black text-green-400 font-sf-display">$0.001</div>
                  <div className="text-slate-500 font-sf-mono text-sm uppercase tracking-wide">Min Cost</div>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 text-center group hover:bg-slate-800 transition-all duration-300">
                  <div className="text-3xl font-black text-white font-sf-display">99.9%</div>
                  <div className="text-slate-500 font-sf-mono text-sm uppercase tracking-wide">Uptime</div>
                </div>
              </div>
            </div>
            
            {/* Live Feed Display - IDE Terminal Style */}
            <div className="lg:col-span-5">
              <div className="bg-black border border-neutral-700 rounded-lg p-8 space-y-6 animate-float font-sf-mono">
                <div className="flex items-center justify-between border-b border-neutral-700 pb-4">
                  <h3 className="text-lg font-bold text-white font-sf-text">Live Intelligence Feed</h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-400 font-semibold text-sm font-sf-text">Broadcasting</span>
                  </div>
                </div>
                
                <div className="space-y-4 text-sm">
                  <div className="bg-slate-800 border border-slate-600 rounded p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-blue-400 font-semibold">[MARKET]</span>
                      <span className="text-slate-500 text-xs">2.3s ago</span>
                    </div>
                    <p className="text-slate-300">AI confidence: 94% bullish sentiment detected in tech sector...</p>
                  </div>
                  
                  <div className="bg-slate-800 border border-slate-600 rounded p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-yellow-400 font-semibold">[PATTERN]</span>
                      <span className="text-slate-500 text-xs">5.1s ago</span>
                    </div>
                    <p className="text-slate-300">Anomaly detected in network traffic patterns, initiating deep scan...</p>
                  </div>
                  
                  <div className="bg-slate-800 border border-slate-600 rounded p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-green-400 font-semibold">[PREDICT]</span>
                      <span className="text-slate-500 text-xs">8.7s ago</span>
                    </div>
                    <p className="text-slate-300">Resource optimization complete, 23% efficiency increase projected...</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-slate-700">
                  <div className="text-center text-slate-500 text-sm">
                    <span className="font-semibold text-white">1,247</span> insights generated today
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Intelligence Section - IDE Inspired */}
      <section className="py-20" id="network">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg px-6 py-3 mb-8">
              <div className="w-3 h-3 bg-orange-400 rounded-full mr-3 animate-pulse"></div>
              <span className="text-slate-300 font-sf-mono text-sm uppercase tracking-wide">Mission Intelligence</span>
            </div>
            <h2 className="text-5xl lg:text-6xl font-black text-white mb-6 leading-tight font-sf-display">
              <span className="text-white">Mission Critical:</span>
              <span className="block text-slate-400">Intelligence Democratization</span>
            </h2>
            <div className="max-w-4xl mx-auto bg-slate-800/30 border border-slate-700 rounded-lg p-8">
              <p className="text-xl text-slate-300 leading-relaxed font-sf-text">
                <span className="text-white font-bold">Personal Catalyst:</span> When my son was born with a rare terminal illness, 
                I was determined that AI could organize his care and unlock medical insights. This mission became ACDC.digital—
                <span className="text-slate-200 font-bold"> broadcasting agentic intelligence to families who need it most.</span>
              </p>
            </div>
          </div>

          {/* Core Values Grid - IDE Card Style */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden group hover:bg-slate-800 transition-all duration-500">
              <CardHeader className="bg-slate-800 border-b border-slate-700 p-8">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white font-bold text-lg">Human-First Intelligence</CardTitle>
                  <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <p className="text-slate-300 leading-relaxed">
                  Technology serves humanity, not the other way around. Every AI tool in our network 
                  is evaluated for genuine human benefit, accessibility, and ethical implementation.
                </p>
                <div className="mt-4 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 font-mono text-xs uppercase tracking-wide">Mission Critical</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden group hover:bg-slate-800 transition-all duration-500">
              <CardHeader className="bg-slate-800 border-b border-slate-700 p-8">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white font-bold text-lg">Zero Barriers</CardTitle>
                  <div className="w-4 h-4 bg-blue-400 rounded-full animate-pulse"></div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <p className="text-slate-300 leading-relaxed">
                  Breaking the monthly fee stranglehold on AI access. Pay-per-use pricing ensures AI tools 
                  remain accessible to individuals, not just enterprise budgets.
                </p>
                <div className="mt-4 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <span className="text-blue-400 font-mono text-xs uppercase tracking-wide">Market Disruptor</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden group hover:bg-slate-800 transition-all duration-500">
              <CardHeader className="bg-slate-800 border-b border-slate-700 p-8">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white font-bold text-lg">Open Network</CardTitle>
                  <div className="w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <p className="text-slate-300 leading-relaxed">
                  Open source innovation with full network transparency. Every API call, every cost, 
                  every algorithm decision broadcasted in real-time to our community.
                </p>
                <div className="mt-4 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                  <span className="text-yellow-400 font-mono text-xs uppercase tracking-wide">Network Priority</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Intelligence Section - Flagship Products */}
      <section className="py-20" id="intelligence">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg px-6 py-3 mb-8">
              <div className="w-3 h-3 bg-cyan-400 rounded-full mr-3 animate-pulse"></div>
              <span className="text-slate-300 font-sf-mono text-sm uppercase tracking-wide">Intelligence Broadcast</span>
            </div>
            <h2 className="text-5xl lg:text-6xl font-black text-white mb-6 leading-tight font-sf-display">
              Intelligence Broadcast
            </h2>
            <p className="text-xl text-slate-400 max-w-4xl mx-auto leading-relaxed font-sf-text">
              Our flagship applications demonstrate AI democratization in action. Each product eliminates subscription barriers 
              and broadcasts intelligence directly to users who need it most.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Soloist */}
            <Card className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden group hover:bg-slate-800 transition-all duration-500">
              <CardHeader className="bg-slate-800 border-b border-slate-700 p-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <BarChart3 className="w-8 h-8 text-slate-400" />
                    <CardTitle className="text-white font-bold text-xl uppercase tracking-wide">SOLOIST</CardTitle>
                  </div>
                  <span className="bg-green-600 text-white font-mono text-sm px-3 py-1 rounded-md uppercase tracking-wide">ACTIVE</span>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <CardDescription className="text-slate-300 mb-6 leading-relaxed text-lg">
                  Personal analytics platform with 3-day mood forecasting. Advanced AI predicts emotional patterns 
                  to help users optimize mental health and productivity.
                </CardDescription>
                <div className="space-y-3 font-mono text-sm">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                    <span className="text-slate-300">Predictive mood analytics</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                    <span className="text-slate-300">Cross-platform synchronization</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                    <span className="text-slate-300">Privacy-first architecture</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* EAC Social */}
            <Card className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden group hover:bg-slate-800 transition-all duration-500">
              <CardHeader className="bg-slate-800 border-b border-slate-700 p-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <MessageSquare className="w-8 h-8 text-slate-400" />
                    <CardTitle className="text-white font-bold text-xl uppercase tracking-wide">EAC SOCIAL</CardTitle>
                  </div>
                  <span className="bg-blue-600 text-white font-mono text-sm px-3 py-1 rounded-md uppercase tracking-wide">v1.0.0</span>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <CardDescription className="text-slate-300 mb-6 leading-relaxed text-lg">
                  AI-powered marketing co-founder for developers and creators. Intelligent automation with 
                  VS Code-inspired interface for sophisticated social media management.
                </CardDescription>
                <div className="space-y-3 font-mono text-sm">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                    <span className="text-slate-300">Claude-powered content generation</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                    <span className="text-slate-300">Multi-platform automation</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                    <span className="text-slate-300">Advanced analytics dashboard</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Access Section - CTA */}
      <section className="py-20 bg-slate-800/30" id="access">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-5xl lg:text-6xl font-black text-white mb-6 leading-tight font-sf-display">
            Access The Broadcast
          </h2>
          <p className="text-xl text-slate-400 mb-12 leading-relaxed max-w-3xl mx-auto font-sf-text">
            Join the AI democratization movement. Break free from subscription monopolies and access 
            intelligent tools the way they should be—when you need them, at fair prices.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button size="lg" className="bg-slate-700 hover:bg-slate-600 border border-slate-600 hover:border-slate-500 text-white font-bold px-12 py-4 rounded-lg shadow-xl transition-all duration-300 hover:scale-105 text-lg">
              <ArrowUpRight className="mr-2 w-5 h-5" />
              Get Early Access
            </Button>
            <Button variant="outline" size="lg" className="border-2 border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white backdrop-blur-sm px-12 py-4 rounded-lg font-bold transition-all duration-300 hover:scale-105 text-lg">
              <Github className="mr-2 w-5 h-5" />
              View Projects
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-700 py-16">
        <div className="max-w-7xl mx-auto px-6">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            
            {/* Company Info */}
            <div className="md:col-span-2 space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-slate-800 border border-slate-600 rounded-lg flex items-center justify-center">
                  <span className="text-xl font-black text-slate-300">AC</span>
                </div>
                <div>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-2xl font-black text-white tracking-tight">ACDC</span>
                    <span className="text-2xl font-black text-slate-400 tracking-tight">.digital</span>
                  </div>
                  <div className="text-sm text-slate-500 font-sf-mono">Agentic Media Broadcasting</div>
                </div>
              </div>
              <p className="text-slate-400 leading-relaxed max-w-md font-sf-text">
                Democratizing artificial intelligence through revolutionary pay-per-use broadcasting. 
                Breaking subscription monopolies to make advanced AI accessible to everyone.
              </p>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 font-sf-mono text-sm">Network Status: Operational</span>
              </div>
            </div>
            
            {/* Platform Links */}
            <div className="space-y-4">
              <h4 className="text-white font-bold text-lg font-sf-text">Platform</h4>
              <div className="space-y-3">
                <a href="#broadcast" className="block text-slate-400 hover:text-white transition-colors duration-200 font-sf-text">
                  Live Broadcast
                </a>
                <a href="#network" className="block text-slate-400 hover:text-white transition-colors duration-200 font-sf-text">
                  Network Status
                </a>
                <a href="#intelligence" className="block text-slate-400 hover:text-white transition-colors duration-200 font-sf-text">
                  Intelligence Feed
                </a>
                <a href="#access" className="block text-slate-400 hover:text-white transition-colors duration-200 font-sf-text">
                  Early Access
                </a>
              </div>
            </div>
            
            {/* Products */}
            <div className="space-y-4">
              <h4 className="text-white font-bold text-lg font-sf-text">Products</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <span className="text-slate-400 font-sf-text">SOLOIST</span>
                  <span className="bg-green-600 text-white font-sf-mono text-xs px-2 py-0.5 rounded uppercase">Active</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-slate-400 font-sf-text">EAC Social</span>
                  <span className="bg-blue-600 text-white font-sf-mono text-xs px-2 py-0.5 rounded">v1.0.0</span>
                </div>
                <a href="https://github.com/acdc-digital" className="block text-slate-400 hover:text-white transition-colors duration-200 font-sf-text">
                  Open Source
                </a>
                <a href="#" className="block text-slate-400 hover:text-white transition-colors duration-200 font-sf-text">
                  Documentation
                </a>
              </div>
            </div>
          </div>
          
          {/* Bottom Footer */}
          <div className="border-t border-slate-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex items-center space-x-6">
                <p className="text-slate-500 font-sf-mono text-sm">
                  © 2025 ACDC.digital • All rights reserved
                </p>
                <div className="hidden md:flex items-center space-x-4 text-sm text-slate-500 font-sf-text">
                  <a href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
                  <span>•</span>
                  <a href="#" className="hover:text-slate-300 transition-colors">Terms of Service</a>
                  <span>•</span>
                  <a href="#" className="hover:text-slate-300 transition-colors">Security</a>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <span className="text-slate-500 text-sm font-sf-mono">Follow the broadcast:</span>
                <div className="flex items-center space-x-3">
                  <a 
                    href="https://github.com/acdc-digital" 
                    className="text-slate-400 hover:text-white transition-colors duration-200"
                    aria-label="GitHub"
                    title="Follow us on GitHub"
                  >
                    <Github className="w-5 h-5" />
                  </a>
                  <a 
                    href="#" 
                    className="text-slate-400 hover:text-white transition-colors duration-200"
                    aria-label="Discord"
                    title="Join our Discord"
                  >
                    <MessageSquare className="w-5 h-5" />
                  </a>
                  <a 
                    href="#" 
                    className="text-slate-400 hover:text-white transition-colors duration-200"
                    aria-label="Analytics"
                    title="View Analytics"
                  >
                    <BarChart3 className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
