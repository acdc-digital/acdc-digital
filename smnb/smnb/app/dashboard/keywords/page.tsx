"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, TrendingUp, Hash, Building2, MessageSquare, Sparkles } from "lucide-react";

export default function KeywordsPage() {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const extractKeywords = useMutation(api.keywords.extraction.extractKeywordsFromStats);
  const cachedKeywords = useQuery(api.keywords.extraction.getCachedKeywords);
  
  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const result = await extractKeywords({ forceRefresh: true });
      console.log(`✅ Extracted ${result.keywords.length} keywords in ${result.extractionTime}ms`);
    } catch (error) {
      console.error('Failed to extract keywords:', error);
    } finally {
      setIsRegenerating(false);
    }
  };
  
  // Group keywords by category
  const keywordsByCategory = cachedKeywords?.keywords.reduce((acc, keyword) => {
    if (!acc[keyword.category]) acc[keyword.category] = [];
    acc[keyword.category].push(keyword);
    return acc;
  }, {} as Record<string, typeof cachedKeywords.keywords>) || {};
  
  return (
    <main className="relative flex-1 flex flex-col bg-[#1a1a1a] overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          {/* Header with Regenerate Button */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-purple-400" />
                Keyword Intelligence
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                {cachedKeywords ? (
                  <>
                    Extracted from {cachedKeywords.fromCache ? 'cache' : 'live data'}
                    {' • '}
                    {new Date(cachedKeywords.extractionTime).toLocaleString()}
                  </>
                ) : (
                  'No keywords extracted yet. Click "Generate Keywords" to start.'
                )}
              </p>
            </div>
            
            <Button
              onClick={handleRegenerate}
              disabled={isRegenerating}
              size="lg"
              className="bg-purple-600 hover:bg-purple-700"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isRegenerating ? 'animate-spin' : ''}`} />
              {isRegenerating ? 'Extracting...' : cachedKeywords ? 'Regenerate Keywords' : 'Generate Keywords'}
            </Button>
          </div>
          
          {/* Keywords by Category */}
          {cachedKeywords && cachedKeywords.keywords.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
              {/* Tickers */}
              <Card className="bg-card border border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm font-medium">
                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                    Tickers
                    <Badge variant="secondary" className="ml-auto">
                      {keywordsByCategory.ticker?.length || 0}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {keywordsByCategory.ticker?.slice(0, 15).map(keyword => (
                    <div key={keyword.term} className="flex justify-between items-center py-1">
                      <span className="text-sm font-mono font-medium">${keyword.term}</span>
                      <div className="flex gap-1">
                        <Badge variant="outline" className="text-xs">
                          {keyword.count}
                        </Badge>
                        {keyword.sentiment && (
                          <Badge 
                            variant={keyword.sentiment === 'bullish' ? 'default' : 'destructive'}
                            className="text-xs"
                          >
                            {keyword.sentiment}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                  {(keywordsByCategory.ticker?.length || 0) === 0 && (
                    <p className="text-xs text-muted-foreground italic">No tickers found</p>
                  )}
                </CardContent>
              </Card>
              
              {/* Sectors */}
              <Card className="bg-card border border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm font-medium">
                    <Building2 className="h-4 w-4 text-blue-400" />
                    Sectors
                    <Badge variant="secondary" className="ml-auto">
                      {keywordsByCategory.sector?.length || 0}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {keywordsByCategory.sector?.slice(0, 15).map(keyword => (
                    <div key={keyword.term} className="flex justify-between items-center py-1">
                      <span className="text-sm capitalize">{keyword.term}</span>
                      <div className="flex gap-1">
                        <Badge variant="outline" className="text-xs">
                          {keyword.count}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {keyword.relatedTickers.length} stocks
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {(keywordsByCategory.sector?.length || 0) === 0 && (
                    <p className="text-xs text-muted-foreground italic">No sectors found</p>
                  )}
                </CardContent>
              </Card>
              
              {/* Topics */}
              <Card className="bg-card border border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm font-medium">
                    <MessageSquare className="h-4 w-4 text-orange-400" />
                    Topics
                    <Badge variant="secondary" className="ml-auto">
                      {keywordsByCategory.topic?.length || 0}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {keywordsByCategory.topic?.slice(0, 15).map(keyword => (
                    <div key={keyword.term} className="flex justify-between items-center py-1">
                      <span className="text-sm truncate" title={keyword.term}>
                        {keyword.term}
                      </span>
                      <div className="flex gap-1 flex-shrink-0">
                        <Badge variant="outline" className="text-xs">
                          {keyword.count}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {keyword.sources.length} subs
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {(keywordsByCategory.topic?.length || 0) === 0 && (
                    <p className="text-xs text-muted-foreground italic">No topics found</p>
                  )}
                </CardContent>
              </Card>
              
              {/* Trending Terms */}
              <Card className="bg-card border border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm font-medium">
                    <Hash className="h-4 w-4 text-purple-400" />
                    Top Trending
                    <Badge variant="secondary" className="ml-auto">
                      {Math.min(15, cachedKeywords.keywords.length)}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {cachedKeywords.keywords
                    .slice(0, 15)
                    .map(keyword => (
                      <div key={keyword.term} className="flex justify-between items-center py-1">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className="text-sm truncate" title={keyword.term}>
                            {keyword.category === 'ticker' ? `$${keyword.term}` : keyword.term}
                          </span>
                          <Badge variant="outline" className="text-[9px] px-1 py-0 flex-shrink-0">
                            {keyword.category}
                          </Badge>
                        </div>
                        <Badge variant="outline" className="text-xs flex-shrink-0">
                          {keyword.count}
                        </Badge>
                      </div>
                    ))}
                </CardContent>
              </Card>
            </div>
          ) : !cachedKeywords ? (
            <Card className="bg-card border border-border">
              <CardContent className="p-12 text-center">
                <Sparkles className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Start Extracting Keywords</h3>
                <p className="text-muted-foreground mb-4">
                  Generate intelligent keywords from your NASDAQ-100 trading data including tickers, sectors, and trending topics.
                </p>
                <Button
                  onClick={handleRegenerate}
                  disabled={isRegenerating}
                  size="lg"
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${isRegenerating ? 'animate-spin' : ''}`} />
                  {isRegenerating ? 'Extracting...' : 'Generate Keywords'}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-card border border-border">
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">No keywords found. Try regenerating with fresh data.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}
