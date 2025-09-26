"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Sparkles, Hash } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

// Frequency-based tier styles following brand guidelines
const getFrequencyTier = (count: number) => {
  if (count >= 10) return { tier: "high", style: "bg-[#8b5cf6] text-white border-[#8b5cf6]" }; // AI Purple
  if (count >= 5) return { tier: "medium", style: "bg-[#007acc] text-white border-[#007acc]" }; // Brand Primary
  if (count >= 3) return { tier: "emerging", style: "bg-[#10b981] text-white border-[#10b981]" }; // Success Green
  return { tier: "low", style: "bg-[#6c757d] text-white border-[#6c757d]" }; // Neutral
};

export default function Generator() {
  // Drag state management
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // For now, let's create better keyword extraction client-side from the posts we have
  const postsData = useQuery(api.stats.subredditStats.getSubredditStats, {});
  
  // Also get some recent posts to analyze
  const recentPosts = useQuery(api.stats.subredditStats.getRecentPosts, { limit: 100 });
  
  console.log("Posts data:", postsData);
  console.log("Recent posts:", recentPosts);
  
  // Extract better keywords client-side
  const extractKeywordsFromPosts = (posts: any[]) => {
    if (!posts || posts.length === 0) return [];
    
    const keywordMap = new Map<string, { count: number, category: string, posts: any[] }>();
    
    posts.forEach((post: any) => {
      const title = post.title || '';
      const content = post.selftext || '';
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
  const handleDragStart = (e: React.DragEvent, item: any) => {
    setDraggedItem(item.keyword);
    setIsDragging(true);
    
    // Set drag data for potential drop zones
    e.dataTransfer.setData('application/json', JSON.stringify({
      type: 'trending-keyword',
      keyword: item.keyword,
      count: item.count,
      category: item.category,
      sentiment: item.sentiment,
      confidence: item.confidence,
      trending: item.trending
    }));
    
    // Set drag effect
    e.dataTransfer.effectAllowed = 'copy';
    
    // Add some visual feedback by making the dragged element slightly transparent
    setTimeout(() => {
      if (e.target instanceof HTMLElement) {
        e.target.style.opacity = '0.5';
      }
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedItem(null);
    setIsDragging(false);
    
    // Reset opacity
    if (e.target instanceof HTMLElement) {
      e.target.style.opacity = '1';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Allow drop
  };
  
  // Use extracted keywords if we have posts, otherwise fall back to subreddit names
  const trends = recentPosts && recentPosts.length > 0 ? {
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

  return (
    <div className="flex-1 flex flex-col bg-[#1a1a1a] overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6">
        {/* Trending Keywords Section */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#f59e0b]" />
              Trending Topics
            </CardTitle>
            <CardDescription>
              Most active subreddits from your Reddit feed
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!trends ? (
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="h-8 w-24 bg-muted animate-pulse rounded" />
                ))}
              </div>
            ) : trends.keywords && trends.keywords.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {trends.keywords.map((item) => {
                  const tierInfo = getFrequencyTier(item.count);
                  const isSubreddit = item.category === 'subreddit';
                  
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
                        "drag:opacity-50",
                        draggedItem === item.keyword && "opacity-50 scale-95",
                        tierInfo.style
                      )}
                      title={`Category: ${item.category} | Sentiment: ${item.sentiment} | Confidence: ${(item.confidence * 100).toFixed(0)}% | Drag to use elsewhere`}
                    >
                      <Hash className="h-3 w-3 mr-1" />
                      {isSubreddit ? `r/${item.keyword}` : item.keyword}
                      <span className="ml-2 opacity-90">({item.count})</span>
                      {item.trending && (
                        <TrendingUp className="h-3 w-3 ml-1" />
                      )}
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
            ) : (
              <div className="text-muted-foreground">
                No trending topics found. Make sure you have Reddit feed data in your database.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Four Column Layout */}
        <div className="grid grid-cols-4 gap-4 flex-1 mt-6">
          {/* Column 1 */}
          <Card className="bg-card border-border h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Column 1</CardTitle>
              <CardDescription className="text-sm">
                Drop content here
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <Hash className="h-6 w-6" />
                  </div>
                  <p className="text-sm">Ready for content</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Column 2 */}
          <Card className="bg-card border-border h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Column 2</CardTitle>
              <CardDescription className="text-sm">
                Drop content here
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <Hash className="h-6 w-6" />
                  </div>
                  <p className="text-sm">Ready for content</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Column 3 */}
          <Card className="bg-card border-border h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Column 3</CardTitle>
              <CardDescription className="text-sm">
                Drop content here
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <Hash className="h-6 w-6" />
                  </div>
                  <p className="text-sm">Ready for content</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Column 4 */}
          <Card className="bg-card border-border h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Column 4</CardTitle>
              <CardDescription className="text-sm">
                Drop content here
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <Hash className="h-6 w-6" />
                  </div>
                  <p className="text-sm">Ready for content</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
