// KEYWORDS PAGE - LEGACY UI WITH ENHANCED EXTRACTION
// /Users/matthewsimon/Projects/acdc-digital/smnb/smnb/app/dashboard/studio/keywords/Keywords.tsx

"use client";

import { useState, useCallback, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, Hash, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface KeywordItem {
  keyword: string;
  count: number;
  category: string;
  sentiment: string;
  confidence: number;
  trending: boolean;
  sources?: string[];
  relatedTickers?: string[];
}

interface Column {
  id: string;
  title: string;
  items: KeywordItem[];
}

export default function KeywordsPage() {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [hasAutoExtracted, setHasAutoExtracted] = useState(false);
  const [draggedItem, setDraggedItem] = useState<KeywordItem | null>(null);
  const [draggedOverColumn, setDraggedOverColumn] = useState<string | null>(null);
  const [columns, setColumns] = useState<Column[]>([
    { id: 'col1', title: 'Query 1', items: [] },
    { id: 'col2', title: 'Query 2', items: [] },
    { id: 'col3', title: 'Query 3', items: [] },
    { id: 'col4', title: 'Query 4', items: [] },
  ]);
  
  const extractKeywords = useMutation(api.keywords.extraction.extractKeywordsFromStats);
  const cachedKeywords = useQuery(api.keywords.extraction.getCachedKeywords);
  
  const handleRegenerate = useCallback(async () => {
    setIsRegenerating(true);
    try {
      console.log('🔄 Starting keyword extraction...');
      const result = await extractKeywords({ forceRefresh: true });
      console.log(`✅ Extracted ${result.keywords.length} keywords in ${result.extractionTime}ms`);
    } catch (error) {
      console.error('❌ Failed to extract keywords:', error);
      setHasAutoExtracted(false); // Allow retry
    } finally {
      setIsRegenerating(false);
    }
  }, [extractKeywords]);
  
  // Auto-extract on mount if no cache exists
  useEffect(() => {
    if (cachedKeywords === null && !hasAutoExtracted && !isRegenerating) {
      console.log('📊 No cached keywords found, auto-extracting...');
      setHasAutoExtracted(true);
      handleRegenerate();
    }
  }, [cachedKeywords, hasAutoExtracted, isRegenerating, handleRegenerate]);
  
  // Drag handlers
  const handleDragStart = (e: React.DragEvent, item: KeywordItem) => {
    setDraggedItem(item);
    e.dataTransfer.setData('application/json', JSON.stringify({ type: 'keyword', ...item }));
    e.dataTransfer.effectAllowed = 'copy';
  };
  
  const handleDragEnd = () => {
    setDraggedItem(null);
    setDraggedOverColumn(null);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  const handleColumnDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggedOverColumn(columnId);
    e.dataTransfer.dropEffect = 'copy';
  };
  
  const handleColumnDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedOverColumn(null);
  };
  
  const handleColumnDrop = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (draggedItem) {
      setColumns(prevColumns =>
        prevColumns.map(col => {
          if (col.id === columnId) {
            const exists = col.items.some(item => item.keyword === draggedItem.keyword);
            if (!exists) {
              return { ...col, items: [...col.items, draggedItem] };
            }
          }
          return col;
        })
      );
    }
    
    setDraggedOverColumn(null);
    setDraggedItem(null);
  };
  
  const removeKeywordFromColumn = useCallback((columnId: string, keyword: string) => {
    setColumns(prevColumns =>
      prevColumns.map(col => {
        if (col.id === columnId) {
          return { ...col, items: col.items.filter(item => item.keyword !== keyword) };
        }
        return col;
      })
    );
  }, []);
  
  const getFrequencyTier = (count: number) => {
    if (count >= 10) return { level: 'hot', style: 'border-red-500 bg-red-500/10 text-red-400' };
    if (count >= 5) return { level: 'trending', style: 'border-orange-500 bg-orange-500/10 text-orange-400' };
    if (count >= 3) return { level: 'rising', style: 'border-yellow-500 bg-yellow-500/10 text-yellow-400' };
    return { level: 'normal', style: 'border-blue-500 bg-blue-500/10 text-blue-400' };
  };
  
  // Convert cached keywords to KeywordItem format (exclude ticker category)
  const keywords: KeywordItem[] = cachedKeywords?.keywords
    .filter(kw => kw.category !== 'ticker')
    .map(kw => ({
      keyword: kw.term,
      count: kw.count,
      category: kw.category,
      sentiment: kw.sentiment || 'neutral',
      confidence: 0.8,
      trending: kw.count >= 5,
      sources: kw.sources,
      relatedTickers: kw.relatedTickers,
    })) || [];
  
  // Loading state
  if (cachedKeywords === undefined || isRegenerating) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#1a1a1a]">
        <div className="text-center space-y-4">
          <Sparkles className="w-12 h-12 mx-auto animate-pulse text-purple-400" />
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              {isRegenerating ? 'Extracting Keywords...' : 'Loading Keywords...'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {isRegenerating 
                ? 'Analyzing NASDAQ-100 trading data from Reddit' 
                : 'Extracting trading intelligence from NASDAQ-100 data'
              }
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex-1 flex flex-col bg-[#1a1a1a] overflow-hidden p-6">
      <div className="space-y-6 flex-1 flex flex-col">
        {/* Keywords Badge Cloud */}
        <Card >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-yellow-400" />
                  Available Keywords
                </CardTitle>
                <CardDescription className="text-xs mt-1">
                  {keywords.length} keywords extracted • Drag to query boxes below
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {cachedKeywords?.fromCache && (
                  <Badge variant="secondary" className="text-xs">
                    From Cache
                  </Badge>
                )}
                <Button
                  onClick={handleRegenerate}
                  disabled={isRegenerating}
                  variant="outline"
                  size="sm"
                  className="flex-shrink-0"
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${isRegenerating ? 'animate-spin' : ''}`} />
                  {isRegenerating ? 'Extracting...' : 'Regenerate'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent p-1">
              {keywords.length > 0 ? (
                keywords.map((item) => {
                  const tierInfo = getFrequencyTier(item.count);
                  
                  // Build detailed tooltip
                  const tooltipParts = [
                    `${item.keyword} (${item.count} mentions)`,
                    `Category: ${item.category}`,
                  ];
                  if (item.sources && item.sources.length > 0) {
                    tooltipParts.push(`Sources: ${item.sources.slice(0, 3).join(', ')}${item.sources.length > 3 ? '...' : ''}`);
                  }
                  if (item.relatedTickers && item.relatedTickers.length > 0) {
                    tooltipParts.push(`Tickers: ${item.relatedTickers.slice(0, 5).join(', ')}${item.relatedTickers.length > 5 ? '...' : ''}`);
                  }
                  if (item.sentiment && item.sentiment !== 'neutral') {
                    tooltipParts.push(`Sentiment: ${item.sentiment}`);
                  }
                  
                  return (
                    <Badge
                      key={item.keyword}
                      variant="outline"
                      draggable
                      onDragStart={(e) => handleDragStart(e, item)}
                      onDragEnd={handleDragEnd}
                      onDragOver={handleDragOver}
                      className={cn(
                        "px-3 py-1.5 text-sm font-medium transition-all select-none",
                        "cursor-grab active:cursor-grabbing",
                        "hover:scale-105 hover:shadow-md hover:shadow-primary/20",
                        draggedItem?.keyword === item.keyword && "opacity-50 scale-95",
                        tierInfo.style
                      )}
                      title={tooltipParts.join(' • ')}
                    >
                      <Hash className="h-3 w-3 mr-1" />
                      {item.keyword}
                      <span className="ml-2 opacity-90">({item.count})</span>
                      {item.category === 'sector' && ' 🏢'}
                      {item.category === 'topic' && ' 💬'}
                    </Badge>
                  );
                })
              ) : (
                <p className="text-sm text-muted-foreground">No keywords found. Click &ldquo;Regenerate Keywords&rdquo; to extract from your data.</p>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Four Column Layout */}
        <div className="grid grid-cols-4 gap-4 flex-1 min-h-[400px]">
          {columns.map((column) => (
            <Card
              key={column.id}
              className={cn(
                "bg-[#1a1a1a] border-border flex flex-col transition-all",
                draggedOverColumn === column.id && "border-primary shadow-lg shadow-primary/20 scale-[1.02]"
              )}
              onDragOver={(e) => handleColumnDragOver(e, column.id)}
              onDragLeave={handleColumnDragLeave}
              onDrop={(e) => handleColumnDrop(e, column.id)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{column.title}</CardTitle>
                <CardDescription className="text-sm">
                  {column.items.length > 0
                    ? `${column.items.length} keyword${column.items.length > 1 ? 's' : ''}`
                    : 'Drop keywords here'
                  }
                </CardDescription>
              </CardHeader>
              
              <CardContent className="flex-1 overflow-y-auto">
                {column.items.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {column.items.map((item) => {
                      const tierInfo = getFrequencyTier(item.count);
                      
                      // Build tooltip for dropped keywords
                      const tooltipParts = [
                        `${item.keyword} (${item.count})`,
                      ];
                      if (item.sources && item.sources.length > 0) {
                        tooltipParts.push(`from ${item.sources.length} source${item.sources.length > 1 ? 's' : ''}`);
                      }
                      if (item.relatedTickers && item.relatedTickers.length > 0) {
                        tooltipParts.push(`${item.relatedTickers.length} ticker${item.relatedTickers.length > 1 ? 's' : ''}`);
                      }
                      
                      return (
                        <Badge
                          key={`${column.id}-${item.keyword}`}
                          variant="outline"
                          className={cn(
                            "px-2.5 py-1 text-sm font-medium transition-all group relative",
                            tierInfo.style
                          )}
                          title={tooltipParts.join(' • ')}
                        >
                          <Hash className="h-2.5 w-2.5 mr-1" />
                          {item.keyword}
                          <span className="ml-1.5 opacity-75">({item.count})</span>
                          <button
                            onClick={() => removeKeywordFromColumn(column.id, item.keyword)}
                            className="ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-400"
                            aria-label="Remove keyword"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                    Drag keywords here
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
