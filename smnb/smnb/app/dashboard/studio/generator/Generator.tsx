"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { TrendingUp, Hash, X, Activity, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useCallback } from "react";
import { useAction } from "convex/react";
import Instructions from "./components/Instructions";

// Performance tier styles matching heatmap design
const TIER_STYLES = {
  elite: "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-600",
  excel: "bg-gradient-to-r from-blue-500 to-purple-500 text-white border-blue-600",
  veryGood: "bg-blue-500 text-white border-blue-600",
  good: "bg-green-500 text-white border-green-600",
  avgPlus: "bg-green-400 text-white border-green-500",
  avg: "bg-yellow-400 text-black border-yellow-500",
  avgMinus: "bg-orange-400 text-white border-orange-500",
  poor: "bg-orange-500 text-white border-orange-600",
  veryPoor: "bg-red-500 text-white border-red-600",
  critical: "bg-red-700 text-white border-red-800"
};

const TREND_ICONS = {
  emerging: "🌱",
  rising: "📈",
  peak: "🔥",
  declining: "📉",
  stable: "➡️",
  dormant: "💤"
};

// Fallback function for client-side extraction (backwards compatibility)
const getFrequencyTier = (count: number) => {
  if (count >= 10) return { tier: "high", style: "bg-[#8b5cf6] text-white border-[#8b5cf6]" }; // AI Purple
  if (count >= 5) return { tier: "medium", style: "bg-[#007acc] text-white border-[#007acc]" }; // Brand Primary
  if (count >= 3) return { tier: "emerging", style: "bg-[#10b981] text-white border-[#10b981]" }; // Success Green
  return { tier: "low", style: "bg-[#6c757d] text-white border-[#6c757d]" }; // Neutral
};

// Type for keyword items
interface KeywordItem {
  keyword: string;
  count: number;
  category: string;
  sentiment: string;
  confidence: number;
  trending: boolean;
}

// Type for generated posts
interface GeneratedPost {
  id: string;
  title: string;
  content: string;
  subreddit: string;
  author: string;
  estimatedScore: number;
  estimatedComments: number;
  keywords: string[];
  generatedAt: number;
  modelCost: number;
}

// Type for column state
interface ColumnState {
  id: string;
  title: string;
  items: KeywordItem[];
  generatedPosts: GeneratedPost[];
  isGenerating?: boolean;
  hasInstructions?: boolean;
}

export default function Generator() {

  
  // Drag state management
  const [draggedItem, setDraggedItem] = useState<KeywordItem | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedOverColumn, setDraggedOverColumn] = useState<string | null>(null);
  
  // Column state management
  const [columns, setColumns] = useState<ColumnState[]>([
    { id: 'column-1', title: 'Content Ideas', items: [], generatedPosts: [], hasInstructions: false },
    { id: 'column-2', title: 'Research Topics', items: [], generatedPosts: [], hasInstructions: false },
    { id: 'column-3', title: 'Trending Now', items: [], generatedPosts: [], hasInstructions: false },
    { id: 'column-4', title: 'Archive', items: [], generatedPosts: [], hasInstructions: false },
  ]);

  // Fetch trending keywords from database
  const trends = useQuery(api.keywords.getTrendingKeywords, {
    limit: 50
  });

  // Add generate post action - TODO: Fix API path
  // const generatePost = useAction(api.generateContent.generateRedditPost);
  

  
  // Fallback to client-side extraction for backwards compatibility
  const postsData = useQuery(api.stats.subredditStats.getSubredditStats, {});
  const recentPosts = useQuery(api.stats.subredditStats.getRecentPosts, { limit: 100 });
  

  
  // Extract better keywords client-side
  const extractKeywordsFromPosts = (posts: Array<{title: string; content?: string; subreddit: string}>) => {
    if (!posts || posts.length === 0) return [];
    
    const keywordMap = new Map<string, { count: number, category: string, posts: Array<{title: string; content?: string; subreddit: string}> }>();
    
    posts.forEach((post: {title: string; content?: string; subreddit: string}) => {
      const title = post.title || '';
      const content = post.content || '';
      const fullText = `${title} ${content}`.toLowerCase();
      
      // Prioritize multi-word phrases and long-tail keywords
      const phrases = [];
      
      // Mental health and therapy patterns
      if (fullText.includes('mental health')) phrases.push('mental health');
      if (fullText.includes('therapy session')) phrases.push('therapy session');
      if (fullText.includes('anxiety disorder')) phrases.push('anxiety disorder');
      if (fullText.includes('panic attack')) phrases.push('panic attack');
      if (fullText.includes('depression treatment')) phrases.push('depression treatment');
      if (fullText.includes('coping mechanism')) phrases.push('coping mechanisms');
      if (fullText.includes('emotional support')) phrases.push('emotional support');
      if (fullText.includes('stress management')) phrases.push('stress management');
      if (fullText.includes('mindfulness practice')) phrases.push('mindfulness practice');
      
      // Productivity and habits
      if (fullText.includes('time management')) phrases.push('time management');
      if (fullText.includes('productivity tips')) phrases.push('productivity tips');
      if (fullText.includes('daily routine')) phrases.push('daily routine');
      if (fullText.includes('habit formation')) phrases.push('habit formation');
      if (fullText.includes('goal setting')) phrases.push('goal setting');
      if (fullText.includes('work life balance')) phrases.push('work-life balance');
      if (fullText.includes('procrastination help')) phrases.push('procrastination help');
      if (fullText.includes('morning routine')) phrases.push('morning routine');
      if (fullText.includes('productivity system')) phrases.push('productivity system');
      
      // Self-improvement and personal development
      if (fullText.includes('self improvement')) phrases.push('self improvement');
      if (fullText.includes('personal growth')) phrases.push('personal growth');
      if (fullText.includes('self discipline')) phrases.push('self discipline');
      if (fullText.includes('confidence building')) phrases.push('confidence building');
      if (fullText.includes('social skills')) phrases.push('social skills');
      if (fullText.includes('communication skills')) phrases.push('communication skills');
      if (fullText.includes('lifestyle change')) phrases.push('lifestyle change');
      
      // Technology and learning
      if (fullText.includes('machine learning')) phrases.push('machine learning');
      if (fullText.includes('artificial intelligence')) phrases.push('artificial intelligence');
      if (fullText.includes('data science')) phrases.push('data science');
      if (fullText.includes('web development')) phrases.push('web development');
      if (fullText.includes('programming language')) phrases.push('programming language');
      if (fullText.includes('career advice')) phrases.push('career advice');
      if (fullText.includes('job interview')) phrases.push('job interview');
      if (fullText.includes('remote work')) phrases.push('remote work');
      
      // Study and learning
      if (fullText.includes('study tips')) phrases.push('study tips');
      if (fullText.includes('exam preparation')) phrases.push('exam preparation');
      if (fullText.includes('learning technique')) phrases.push('learning techniques');
      if (fullText.includes('note taking')) phrases.push('note taking');
      if (fullText.includes('memory improvement')) phrases.push('memory improvement');
      
      // Relationship and social
      if (fullText.includes('relationship advice')) phrases.push('relationship advice');
      if (fullText.includes('dating tips')) phrases.push('dating tips');
      if (fullText.includes('social anxiety')) phrases.push('social anxiety');
      if (fullText.includes('friendship problems')) phrases.push('friendship problems');
      if (fullText.includes('communication issues')) phrases.push('communication issues');
      
      // Health and fitness
      if (fullText.includes('weight loss')) phrases.push('weight loss');
      if (fullText.includes('muscle building')) phrases.push('muscle building');
      if (fullText.includes('exercise routine')) phrases.push('exercise routine');
      if (fullText.includes('healthy eating')) phrases.push('healthy eating');
      if (fullText.includes('sleep schedule')) phrases.push('sleep schedule');
      if (fullText.includes('nutrition advice')) phrases.push('nutrition advice');
      
      // Financial and career
      if (fullText.includes('financial advice')) phrases.push('financial advice');
      if (fullText.includes('budget planning')) phrases.push('budget planning');
      if (fullText.includes('investment strategy')) phrases.push('investment strategy');
      if (fullText.includes('career change')) phrases.push('career change');
      if (fullText.includes('job search')) phrases.push('job search');
      if (fullText.includes('salary negotiation')) phrases.push('salary negotiation');
      
      // Problem-solving patterns (more contextual)
      if (fullText.includes('need help with')) {
        const helpMatch = fullText.match(/need help with ([^.!?]{10,40})/);
        if (helpMatch) phrases.push(`help with ${helpMatch[1].trim()}`);
      }
      if (fullText.includes('struggling with')) {
        const struggleMatch = fullText.match(/struggling with ([^.!?]{10,40})/);
        if (struggleMatch) phrases.push(`struggling with ${struggleMatch[1].trim()}`);
      }
      if (fullText.includes('how to')) {
        const howToMatch = fullText.match(/how to ([^.!?]{10,50})/);
        if (howToMatch) phrases.push(`how to ${howToMatch[1].trim()}`);
      }
      
      // Extract meaningful single words only if no phrases found
      const meaningfulWords = [];
      if (phrases.length < 3) {
        const words = fullText
          .replace(/[^\w\s]/g, ' ')
          .split(/\s+/)
          .filter(word => word.length > 4)
          .filter(word => !['reddit', 'post', 'comment', 'thread', 'subreddit', 'this', 'that', 'with', 'have', 'been', 'what', 'when', 'where', 'they', 'were', 'said', 'each', 'which', 'their', 'time', 'will', 'about', 'would', 'there', 'could', 'other', 'more', 'very', 'what', 'know', 'just', 'first', 'also', 'after', 'back', 'some', 'good', 'work', 'make', 'much', 'life', 'only', 'over', 'such', 'take', 'than', 'them', 'well', 'were', 'people', 'think', 'really', 'things', 'doing', 'trying', 'getting', 'started', 'better', 'right', 'still', 'never', 'maybe', 'always', 'someone'].includes(word));
        
        // Only include domain-specific meaningful words
        const domainWords = words.filter(word => 
          ['productivity', 'meditation', 'therapy', 'discipline', 'anxiety', 'depression', 'motivation', 'habits', 'mindfulness', 'exercise', 'nutrition', 'programming', 'learning', 'studying', 'relationship', 'career', 'finance', 'investment', 'budget', 'health', 'fitness', 'wellness'].includes(word)
        );
        
        meaningfulWords.push(...domainWords.slice(0, 2)); // Max 2 single words
      }
      
      // Combine phrases and meaningful single words
      const allKeywords = [...phrases, ...meaningfulWords];
      
      allKeywords.forEach(keyword => {
        if (!keywordMap.has(keyword)) {
          keywordMap.set(keyword, { 
            count: 0, 
            category: inferCategoryFromSubreddit(post.subreddit),
            posts: []
          });
        }
        const data = keywordMap.get(keyword)!;
        data.count++;
        data.posts.push(post);
      });
    });
    
    return Array.from(keywordMap.entries())
      .filter(([, data]) => data.count >= 2)
      .map(([keyword, data]) => ({
        keyword,
        count: data.count,
        category: data.category,
        sentiment: 'neutral',
        confidence: Math.min(data.count * 0.1, 0.9),
        trending: data.count >= 3
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 25);
  };
  
  const inferCategoryFromSubreddit = (subreddit: string) => {
    const sub = subreddit.toLowerCase();
    if (['productivity', 'getstudy', 'notion', 'selfhelp'].some(s => sub.includes(s))) return 'productivity';
    if (['anxiety', 'adhd', 'mentalhealth', 'getdisciplined'].some(s => sub.includes(s))) return 'mental-health';
    if (['college', 'study', 'student'].some(s => sub.includes(s))) return 'education';
    if (['minimalism', 'simple', 'lifestyle'].some(s => sub.includes(s))) return 'lifestyle';
    if (['technology', 'programming', 'coding'].some(s => sub.includes(s))) return 'technology';
    return 'general';
  };

  // Drag event handlers
  const handleDragStart = (e: React.DragEvent, item: KeywordItem) => {
    setDraggedItem(item);
    setIsDragging(true);
    
    // Set drag data for potential drop zones
    e.dataTransfer.setData('application/json', JSON.stringify({
      type: 'trending-keyword',
      ...item
    }));
    
    // Set drag effect
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setIsDragging(false);
    setDraggedOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Allow drop
  };

  // Column drag handlers
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
    
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      
      if (data.type === 'trending-keyword' && draggedItem) {
        // Add the item to the column
        setColumns(prevColumns =>
          prevColumns.map(col => {
            if (col.id === columnId) {
              // Check if item already exists in this column
              const exists = col.items.some(item => item.keyword === draggedItem.keyword);
              if (!exists) {
                return {
                  ...col,
                  items: [...col.items, draggedItem]
                };
              }
            }
            return col;
          })
        );
      }
    } catch (error) {
      console.error('Error handling drop:', error);
    }
    
    setDraggedOverColumn(null);
    setDraggedItem(null);
    setIsDragging(false);
  };

  const removeKeywordFromColumn = (columnId: string, keyword: string) => {
    setColumns(prevColumns =>
      prevColumns.map(col => {
        if (col.id === columnId) {
          return {
            ...col,
            items: col.items.filter(item => item.keyword !== keyword)
          };
        }
        return col;
      })
    );
  };

  // Handle status change for instructions
  const handleInstructionsStatusChange = useCallback((columnId: string, hasInstructions: boolean) => {
    console.log(`Status change for ${columnId}:`, hasInstructions);
    setColumns(prev => prev.map(col =>
      col.id === columnId ? { ...col, hasInstructions } : col
    ));
  }, []);

  // Handle clearing instructions and generated content
  const handleClearColumn = useCallback((columnId: string) => {
    console.log(`Clearing column ${columnId}`);
    setColumns(prev => prev.map(col =>
      col.id === columnId
        ? { ...col, generatedPosts: [], hasInstructions: false }
        : col
    ));
  }, []);

  // Use real Anthropic-powered generation
  const generateContent = useAction(api.generateContent.generateRedditPost);

  // Handle generate button click
  const handleGeneratePost = async (columnId: string) => {
    console.log('🚀 Generate button clicked for:', columnId);
    
    const column = columns.find(col => col.id === columnId);
    console.log('📦 Found column:', column);
    
    if (!column) {
      console.error("❌ Column not found:", columnId);
      return;
    }
    
    if (column.items.length === 0) {
      console.warn("⚠️ No keywords in column, using test keyword");
      // Add a test keyword temporarily for demo purposes
      column.items = [{
        keyword: "test-keyword",
        count: 1,
        category: "test",
        sentiment: "neutral",
        confidence: 0.8,
        trending: false
      }];
    }
    
    console.log('✅ Column has', column.items.length, 'keywords:', column.items);
    
    // Set generating state
    setColumns(prev => prev.map(col =>
      col.id === columnId ? { ...col, isGenerating: true } : col
    ));
    
    try {
      // Get instructions from localStorage (where they're persisted)
      const instructions = typeof window !== 'undefined'
        ? localStorage.getItem(`instructions-${columnId}`) || ""
        : "";
      
      console.log(`Generating post for ${columnId} with instructions:`, instructions);
      
      // Call the Anthropic-powered generation
      const result = await generateContent({
        keywords: column.items.map(item => ({
          keyword: item.keyword,
          count: item.count,
          category: item.category,
          sentiment: item.sentiment,
          confidence: item.confidence,
          trending: item.trending
        })),
        columnContext: column.title,
        instructions: instructions.trim() || undefined
      });
      
      // Create the generated post object for UI
      const newPost: GeneratedPost = {
        id: result.postId,
        title: result.title,
        content: result.content,
        subreddit: result.subreddit,
        author: result.author,
        estimatedScore: result.estimatedScore,
        estimatedComments: result.estimatedComments,
        keywords: result.keywords,
        generatedAt: result.generatedAt,
        modelCost: result.modelCost
      };
      
      // Add generated post to column
      setColumns(prev => prev.map(col =>
        col.id === columnId
          ? {
              ...col,
              generatedPosts: [newPost, ...col.generatedPosts],
              isGenerating: false
            }
          : col
      ));
      
      console.log(`✅ Generated post for r/${result.subreddit}: "${result.title}"`);
      
    } catch (error) {
      console.error("🚨 Error generating post:", error);
      console.error("🔍 Error details:", {
        columnId,
        column: column?.title,
        keywordCount: column?.items?.length,
        error: error instanceof Error ? error.message : error
      });
      setColumns(prev => prev.map(col =>
        col.id === columnId ? { ...col, isGenerating: false } : col
      ));
    }
  };

  // Reddit post card component - Clean display with only essential parts
  const RedditPostCard = ({ post }: { post: GeneratedPost }) => {
    return (
      <div className="bg-[#0e0e0e] border border-[#343536] rounded-md p-3 mb-3 hover:border-[#818384] transition-colors">
        {/* Subreddit Header Only */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <span className="font-medium text-orange-500">r/{post.subreddit}</span>
        </div>
        
        {/* Post Title */}
        <h3 className="text-base font-medium text-white mb-2 hover:text-blue-400 cursor-pointer">
          {post.title}
        </h3>
        
        {/* Post Content */}
        <div className="text-sm text-gray-300 whitespace-pre-wrap">
          {post.content}
        </div>
      </div>
    );
  };
  
  // Fallback keywords if database is empty
  const fallbackTrends = recentPosts && recentPosts.length > 0 ? {
    keywords: extractKeywordsFromPosts(recentPosts),
    totalPosts: recentPosts.length
  } : (postsData?.subredditStats ? {
    keywords: postsData.subredditStats.slice(0, 10).map(stat => ({
      keyword: stat.subreddit,
      count: stat.postCount,
      category: 'subreddit',
      sentiment: 'neutral',
      confidence: 0.5,
      trending: stat.postCount >= 5
    })),
    totalPosts: postsData.totalPosts
  } : null);

  // Use database trends if available, otherwise fallback
  const displayTrends = trends && trends.length > 0 ? trends : fallbackTrends?.keywords;

  return (
    <div className="flex-1 flex flex-col bg-[#1a1a1a] overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6">

        {/* Trending Keywords Section */}
        {!displayTrends ? (
          <div className="flex flex-wrap gap-2 mb-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-8 w-24 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : displayTrends && displayTrends.length > 0 ? (
          <div className="space-y-4 mb-6">
            {/* Database Keywords */}
            {trends && trends.length > 0 && (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {trends.map((item) => {
                    const tierStyle = TIER_STYLES[item.tier as keyof typeof TIER_STYLES] || TIER_STYLES.avg;
                    const trendIcon = TREND_ICONS[item.trendStatus as keyof typeof TREND_ICONS] || "📊";
                    
                    return (
                      <Badge
                        key={item.keyword}
                        variant="outline"
                        draggable
                        onDragStart={(e) => handleDragStart(e, {
                          keyword: item.keyword,
                          count: item.count,
                          category: item.category,
                          sentiment: item.sentiment,
                          confidence: item.confidence,
                          trending: item.trending
                        })}
                        onDragEnd={handleDragEnd}
                        onDragOver={handleDragOver}
                        className={cn(
                          "px-3 py-1.5 text-sm font-medium transition-all select-none",
                          "cursor-grab active:cursor-grabbing",
                          "hover:scale-105 hover:shadow-md hover:shadow-primary/20",
                          draggedItem?.keyword === item.keyword && "opacity-50 scale-95",
                          tierStyle
                        )}
                        title={`Tier: ${item.tier} | Sentiment: ${item.sentiment} | Engagement: ${Math.round(item.engagement)} | Trend: ${item.trendStatus}`}
                      >
                        <span className="mr-1">{trendIcon}</span>
                        <Hash className="h-3 w-3 mr-1" />
                        {item.keyword}
                        <span className="ml-2 opacity-90">({item.count})</span>
                        {item.trending && (
                          <TrendingUp className="h-3 w-3 ml-1" />
                        )}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Fallback Keywords */}
            {(!trends || trends.length === 0) && fallbackTrends?.keywords && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Activity className="h-4 w-4 text-blue-500" />
                  Live Extraction
                  <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">
                    Fallback mode
                  </span>
                </h3>
                <div className="flex flex-wrap gap-2 ml-1">
                  {fallbackTrends.keywords.map((item: {keyword: string; count: number; category: string}) => {
                    const keywordItem: KeywordItem = {
                      keyword: item.keyword,
                      category: item.category,
                      count: item.count,
                      sentiment: 'neutral' as const,
                      confidence: 0.8,
                      trending: false
                    };
                    const tierInfo = getFrequencyTier(item.count);
                    const isSubreddit = item.category === 'subreddit';
                    
                    return (
                      <Badge
                        key={item.keyword}
                        variant="outline"
                        draggable
                        onDragStart={(e) => handleDragStart(e, keywordItem)}
                        onDragEnd={handleDragEnd}
                        onDragOver={handleDragOver}
                        className={cn(
                          "px-3 py-1.5 text-sm font-medium transition-all select-none",
                          "cursor-grab active:cursor-grabbing",
                          "hover:scale-105 hover:shadow-md hover:shadow-primary/20",
                          draggedItem?.keyword === item.keyword && "opacity-50 scale-95",
                          tierInfo.style
                        )}
                  title={`Category: ${item.category} | Sentiment: neutral | Confidence: 80% | Drag to use elsewhere`}
                >
                  <Hash className="h-3 w-3 mr-1" />
                  {isSubreddit ? `r/${item.keyword}` : item.keyword}
                  <span className="ml-2 opacity-90">({item.count})</span>

                  {!isSubreddit && (
                    <span className="ml-1 text-xs opacity-75">
                      {item.category === 'technology' && '🔧'}
                      {item.category === 'politics' && '🏛️'}
                      {item.category === 'business' && '💼'}
                      {item.category === 'science' && '🔬'}
                      {item.category === 'lifestyle' && '🌱'}
                      {item.category === 'entertainment' && '🎬'}
                    </span>
                  )}
                </Badge>
              );
            })}
          </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-muted-foreground mb-6">
              No trending topics found. Process keywords or check your Reddit feed data.
            </div>
          )}

        {/* Four Column Layout with Footer */}
        <div className="grid grid-cols-4 gap-4 flex-1 mt-6 min-h-[520px]">
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
                  {column.generatedPosts.length > 0 &&
                    ` • ${column.generatedPosts.length} post${column.generatedPosts.length > 1 ? 's' : ''}`
                  }
                </CardDescription>
              </CardHeader>
              
              <CardContent className="flex-1 overflow-y-auto">
                {/* Keywords Section */}
                {column.items.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {column.items.map((item) => {
                      const tierInfo = getFrequencyTier(item.count);
                      const isSubreddit = item.category === 'subreddit';
                      
                      return (
                        <Badge
                          key={`${column.id}-${item.keyword}`}
                          variant="outline"
                          className={cn(
                            "px-2.5 py-1 text-sm font-medium transition-all group relative",
                            tierInfo.style
                          )}
                        >
                          <Hash className="h-2.5 w-2.5 mr-1" />
                          {isSubreddit ? `r/${item.keyword}` : item.keyword}
                          <span className="ml-1.5 opacity-90 text-xs">({item.count})</span>
                          <button
                            onClick={() => removeKeywordFromColumn(column.id, item.keyword)}
                            className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove keyword"
                          >
                            <X className="h-3 w-3 hover:text-red-400" />
                          </button>
                        </Badge>
                      );
                    })}
                  </div>
                )}
                
                {/* Generated Posts Section */}
                {column.generatedPosts.length > 0 && (
                  <div className="space-y-2">
                    {column.generatedPosts.map(post => (
                      <RedditPostCard key={post.id} post={post} />
                    ))}
                  </div>
                )}
                
                {/* Empty State */}
                {column.items.length === 0 && column.generatedPosts.length === 0 && (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <div className={cn(
                        "w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center transition-all",
                        draggedOverColumn === column.id && "bg-primary/20 scale-110"
                      )}>
                        <Hash className={cn(
                          "h-6 w-6 transition-all",
                          draggedOverColumn === column.id && "text-primary scale-125"
                        )} />
                      </div>
                      <p className="text-sm">
                        {isDragging ? "Drop here" : "Ready for keywords"}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
              
              {/* Instructions Section - Bottom Half - ALWAYS VISIBLE FOR TESTING */}
              <div className="border-t border-border p-3">
                <Instructions
                  columnId={column.id}
                  onSubmit={(instructions: string) => {
                    console.log(`Instructions for ${column.title}:`, instructions);
                    // TODO: Wire up to generation logic
                  }}
                  onStatusChange={(hasInstructions: boolean) =>
                    handleInstructionsStatusChange(column.id, hasInstructions)
                  }
                  onClear={() => handleClearColumn(column.id)}
                  placeholder={column.items.length === 0 ? `Add keywords first, then guidance for ${column.title.toLowerCase()}...` : `Add specific guidance for ${column.title.toLowerCase()}...`}
                />
                <div className="flex items-center justify-between mt-2">
                  <div /> {/* Spacer */}
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground">
                      Enter to submit
                    </p>
                    <div
                      className={cn(
                        "w-3 h-3 rounded-full border-2 transition-all duration-200",
                        column.hasInstructions
                          ? "bg-green-500 border-green-500 shadow-sm"
                          : "bg-transparent border-muted-foreground/40"
                      )}
                      title={`Instructions: ${column.hasInstructions ? 'Submitted' : 'None'}`}
                    />
                  </div>
                </div>
              </div>

              {/* Fixed Footer with Generate Button */}
              <CardFooter className="border-t border-border p-3 mt-auto">
                <Button
                  onClick={() => handleGeneratePost(column.id)}
                  disabled={column.isGenerating || column.items.length === 0}
                  className="w-full"
                  size="sm"
                >
                  {column.isGenerating ? (
                    <>
                      <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
