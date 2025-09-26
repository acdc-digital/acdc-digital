"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

interface SubredditData {
  symbol: string;
  name: string;
  change: number;
  marketCap: number;
  sector: string;
  price: number;
  storyYield: number;
  engagementPotential: number;
  relevanceConsistency: number;
  tier: number;
}

export default function Heatmap() {
  const data = useQuery(api.stats.subredditStats.getSubredditHeatmapData);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [hoveredSubreddit, setHoveredSubreddit] = useState<SubredditData | null>(null);
  const [viewMode, setViewMode] = useState<"score" | "change">("score");
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    if (hoveredSubreddit) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [hoveredSubreddit]);

  const getCellColor = (subreddit: SubredditData) => {
    if (viewMode === "change") {
      // Color based on conversion momentum (change)
      const change = subreddit.change;
      if (change > 5) return "bg-green-600 text-white border-green-700";
      if (change > 2) return "bg-green-500 text-white border-green-600";
      if (change > 0) return "bg-green-400 text-white border-green-500";
      if (change > -2) return "bg-orange-400 text-white border-orange-500";
      if (change > -5) return "bg-red-500 text-white border-red-600";
      return "bg-red-600 text-white border-red-700";
    } else {
      // Color based on 10-tier system (gradient from best to worst)
      switch (subreddit.tier) {
        case 1: return "bg-emerald-600 text-white border-emerald-700"; // Elite (90-100)
        case 2: return "bg-emerald-500 text-white border-emerald-600"; // Excellent (80-89)
        case 3: return "bg-green-500 text-white border-green-600";     // Very good (70-79)
        case 4: return "bg-blue-500 text-white border-blue-600";       // Good (60-69)
        case 5: return "bg-cyan-500 text-white border-cyan-600";       // Above average (50-59)
        case 6: return "bg-yellow-500 text-white border-yellow-600";   // Average (40-49)
        case 7: return "bg-orange-500 text-white border-orange-600";   // Below average (30-39)
        case 8: return "bg-red-500 text-white border-red-600";         // Poor (20-29)
        case 9: return "bg-red-600 text-white border-red-700";         // Very poor (10-19)
        case 10: return "bg-gray-600 text-white border-gray-700";      // Needs improvement (0-9)
        default: return "bg-gray-500 text-white border-gray-600";
      }
    }
  };

  const getCellSize = (marketCap: number, maxCap: number) => {
    const ratio = marketCap / maxCap;
    // Responsive sizing classes
    if (ratio > 0.5) return "col-span-2 row-span-2"; // Large cells
    if (ratio > 0.25) return "col-span-1 row-span-2"; // Medium cells
    return "col-span-1 row-span-1"; // Small cells
  };

  const filteredSubreddits = useMemo(() => {
    if (!data) return [];
    
    let filtered = data.subreddits;
    if (selectedCategory !== "all") {
      filtered = filtered.filter(sub => sub.sector === selectedCategory);
    }
    
    // Sort by score (price) or change depending on view mode
    return filtered.sort((a, b) => {
      if (viewMode === "change") {
        return Math.abs(b.change) - Math.abs(a.change);
      }
      return b.price - a.price;
    });
  }, [data, selectedCategory, viewMode]);

  const maxMarketCap = useMemo(() => {
    if (!data) return 0;
    return Math.max(...data.subreddits.map(s => s.marketCap));
  }, [data]);

  if (!data) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading heatmap data...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#1a1a1a] overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Subreddit Performance Heatmap</h2>
              <p className="text-muted-foreground text-sm mt-1">
                Visual analysis of {data.subreddits.length} subreddits • {data.totalContent} total content pieces
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Select value={viewMode} onValueChange={(v: "score" | "change") => setViewMode(v)}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="score">Score View</SelectItem>
                  <SelectItem value="change">Momentum View</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {data.categories.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Legend */}
          <Card className="bg-card border-border">
            <CardContent className="p-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-4">
                  <span className="font-medium text-muted-foreground">
                    {viewMode === "score" ? "Performance Tiers:" : "Momentum:"}
                  </span>
                  {viewMode === "score" ? (
                    <div className="flex items-center gap-1">
                      <div className="flex items-center gap-0.5">
                        <div className="w-2 h-2 bg-emerald-600 rounded-sm" />
                        <span className="text-[10px]">Elite</span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <div className="w-2 h-2 bg-emerald-500 rounded-sm" />
                        <span className="text-[10px]">Excel</span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <div className="w-2 h-2 bg-green-500 rounded-sm" />
                        <span className="text-[10px]">V.Good</span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <div className="w-2 h-2 bg-blue-500 rounded-sm" />
                        <span className="text-[10px]">Good</span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <div className="w-2 h-2 bg-cyan-500 rounded-sm" />
                        <span className="text-[10px]">Avg+</span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <div className="w-2 h-2 bg-yellow-500 rounded-sm" />
                        <span className="text-[10px]">Avg</span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <div className="w-2 h-2 bg-orange-500 rounded-sm" />
                        <span className="text-[10px]">Avg-</span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <div className="w-2 h-2 bg-red-500 rounded-sm" />
                        <span className="text-[10px]">Poor</span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <div className="w-2 h-2 bg-red-600 rounded-sm" />
                        <span className="text-[10px]">V.Poor</span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <div className="w-2 h-2 bg-gray-600 rounded-sm" />
                        <span className="text-[10px]">Critical</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-green-600 rounded-sm" />
                        <span>+5%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-green-400 rounded-sm" />
                        <span>+2%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-orange-400 rounded-sm" />
                        <span>0%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-red-600 rounded-sm" />
                        <span>-5%</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="text-muted-foreground">
                  Cell size = content volume • Color = {viewMode === "score" ? "performance tier" : "momentum"}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Heatmap Grid */}
          <Card className="bg-card border-border relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  {selectedCategory === "all" ? "All Subreddits" : selectedCategory}
                </CardTitle>
                <Badge variant="secondary" className="text-xs">
                  <Activity className="w-3 h-3 mr-1" />
                  Live Analysis
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-8 gap-1 auto-rows-[80px]">
                {filteredSubreddits.map((subreddit) => (
                  <div
                    key={`${subreddit.name}-${subreddit.symbol}`}
                    className={cn(
                      "rounded-md p-2 cursor-pointer transition-all duration-200",
                      "hover:scale-105 hover:shadow-xl hover:z-10 border-2",
                      "flex flex-col justify-between relative",
                      getCellColor(subreddit),
                      getCellSize(subreddit.marketCap, maxMarketCap),
                      hoveredSubreddit?.symbol === subreddit.symbol && "ring-2 ring-white scale-105"
                    )}
                    onMouseEnter={() => setHoveredSubreddit(subreddit)}
                    onMouseLeave={() => setHoveredSubreddit(null)}
                  >
                    <div>
                      <div className="font-bold text-xs sm:text-sm">{subreddit.symbol}</div>
                      <div className="text-[10px] opacity-90 line-clamp-1">r/{subreddit.name}</div>
                    </div>
                    <div>
                      <div className="font-bold text-xs sm:text-sm flex items-center gap-1">
                        {viewMode === "change" ? (
                          <>
                            {subreddit.change > 0 ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : (
                              <TrendingDown className="w-3 h-3" />
                            )}
                            {subreddit.change > 0 ? "+" : ""}{subreddit.change.toFixed(1)}%
                          </>
                        ) : (
                          <>{subreddit.price.toFixed(0)}</>
                        )}
                      </div>
                      <div className="text-[10px] opacity-75">
                        {subreddit.marketCap} pieces
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Hover Details - Now follows cursor */}
          {hoveredSubreddit && (
            <div 
              ref={tooltipRef}
              className="fixed z-50 pointer-events-none"
              style={{
                left: mousePosition.x + 'px',
                top: (mousePosition.y - 280) + 'px',
                transform: 'translateX(-50%)',
              }}
            >
              <Card className="shadow-2xl border-primary/30 bg-background/95 backdrop-blur">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <div className="font-bold text-lg">r/{hoveredSubreddit.name}</div>
                      <Badge variant="outline" className="text-xs mt-1">
                        {hoveredSubreddit.sector}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-muted-foreground text-xs">Overall Score</div>
                        <div className="font-bold text-emerald-400">
                          {hoveredSubreddit.price.toFixed(1)}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground text-xs">Tier</div>
                        <div className="font-medium">
                          Tier {hoveredSubreddit.tier}/10
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground text-xs">Story Yield</div>
                        <div className="font-medium">{(hoveredSubreddit.storyYield * 100).toFixed(0)}%</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground text-xs">Momentum</div>
                        <div className={cn(
                          "font-medium",
                          hoveredSubreddit.change >= 0 ? "text-green-400" : "text-red-400"
                        )}>
                          {hoveredSubreddit.change >= 0 ? "+" : ""}{hoveredSubreddit.change.toFixed(1)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground text-xs">Content Volume</div>
                        <div className="font-medium">{hoveredSubreddit.marketCap} pieces</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground text-xs">Relevance</div>
                        <div className="font-medium">{(hoveredSubreddit.relevanceConsistency * 100).toFixed(0)}%</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Controls */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setViewMode(viewMode === "score" ? "change" : "score")}>
              Toggle View
            </Button>
            <Button variant="outline" size="sm">
              Export Data
            </Button>
            <Button variant="outline" size="sm">
              Full Screen
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}