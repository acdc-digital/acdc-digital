// SIMPLE LIVE FEED STORE FOR MARKETING RESEARCH
// Simplified from SMNB - no session management, indefinite persistence

import { create } from 'zustand';

export interface LiveFeedPost {
  id: string;
  title: string;
  author: string;
  subreddit: string;
  url: string;
  permalink: string;
  score: number;
  num_comments: number;
  created_utc: number;
  thumbnail: string;
  selftext: string;
  is_video: boolean;
  domain: string;
  upvote_ratio: number;
  over_18: boolean;
  source: 'reddit';
  addedAt: number;
  batchId: string;
  isNew?: boolean;
}

export interface MarketingInsight {
  id: string;
  narrative: string;
  title?: string;
  insight_type: 'pain_point' | 'competitor_mention' | 'feature_request' | 'sentiment';
  priority: 'high' | 'medium' | 'low';
  timestamp: Date;
  originalItem?: {
    title: string;
    author: string;
    subreddit?: string;
    url?: string;
    score?: number;
    num_comments?: number;
  };
  sentiment?: 'positive' | 'negative' | 'neutral';
  topics?: string[];
  summary?: string;
}

interface SimpleLiveFeedStore {
  // State
  posts: LiveFeedPost[];
  isLive: boolean;
  selectedSubreddits: string[];
  refreshInterval: number;
  
  // Insights history (no session filtering)
  insightHistory: MarketingInsight[];
  
  // Status
  isLoading: boolean;
  error: string | null;
  lastFetch: number | null;
  totalPostsFetched: number;
  
  // Actions
  setPosts: (posts: LiveFeedPost[]) => void;
  addPost: (post: LiveFeedPost) => void;
  clearPosts: () => void;
  
  // Insights actions
  addInsight: (insight: MarketingInsight) => void;
  clearInsights: () => void;
  
  // Convex integration
  loadInsightsFromConvex: () => Promise<void>;
  saveInsightToConvex: (insight: MarketingInsight) => Promise<void>;
  
  // Controls
  setIsLive: (isLive: boolean) => void;
  setSelectedSubreddits: (subreddits: string[]) => void;
  setRefreshInterval: (interval: number) => void;
  
  // Status actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useSimpleLiveFeedStore = create<SimpleLiveFeedStore>((set, get) => ({
  // Initial state
  posts: [],
  isLive: false,
  selectedSubreddits: [
    'Journaling',
    'bulletjournal',
    'mentalhealth',
    'selflove',
    'DecidingToBeBetter',
    'selfimprovement',
    'GetDisciplined',
    'productivity',
    'ProductivityApps',
    'habits',
    'Mindfulness',
    'meditation',
    'Anxiety',
    'depression',
    'ADHD',
    'adhdwomen',
    'TwoXADHD',
    'BPD',
    'CPTSD',
    'ptsd',
    'traumatoolbox',
    'EmotionRegulation',
    'NoSurf',
    'moodjournal',
    'stoic',
    'stoicism',
    'ZenHabits',
    'Minimalism',
    'simpleliving',
    'GetMotivated',
    'LifeProTips',
    'therapy',
    'AskTherapists',
    'OffMyChest',
    'TrueOffMyChest',
    'selfcare',
    'HealthAnxiety',
    'socialskills',
    'StoicMeditations',
    'AnxiousAttachment',
    'attachment_theory',
    'relationship_advice',
    'mentalhealthUK',
    'mentalillness',
    'PeacefulParents',
    'Parenting',
    'confidentlyincorrect',
    'Ultralightstartups',
    'Entrepreneur',
    'startups',
    'SaaS',
    'lifehacks',
    'BetterEveryLoop',
    'dayoneapp',
    'Daylio',
    'thefabulous',
    'digitaljournaling',
    'Notion',
    'notioncreations',
    'ObsidianMD',
    'RoamResearch',
    'logseq',
    'BearApp',
    'CalmApp',
    'Headspace',
    'habitica',
    'forestapp',
    'replika',
    'ReplikaOfficial',
    'woebot',
    'Wysa'
  ],
  refreshInterval: 30,
  
  // Insights history
  insightHistory: [],
  
  // Status
  isLoading: false,
  error: null,
  lastFetch: null,
  totalPostsFetched: 0,
  
  // Actions
  setPosts: (posts) => {
    set((state) => {
      console.log(`📋 Setting ${posts.length} posts`);
      return {
        posts,
        lastFetch: Date.now(),
      };
    });
  },
  
  addPost: (post) => {
    set((state) => {
      // Check for duplicates
      const exists = state.posts.some(p => p.id === post.id);
      if (exists) {
        console.log(`🚫 Duplicate post: ${post.title.substring(0, 30)}...`);
        return state;
      }
      
      // Add to beginning (newest first)
      const newPosts = [
        { 
          ...post, 
          addedAt: Date.now(), 
          isNew: true,
        },
        ...state.posts
      ];
      
      console.log(`✅ Added post: ${post.title.substring(0, 30)}...`);
      console.log(`📊 Total posts: ${newPosts.length}`);
      
      return {
        posts: newPosts,
        totalPostsFetched: state.totalPostsFetched + 1,
      };
    });
    
    // Remove new flag after animation
    setTimeout(() => {
      set((state) => ({
        posts: state.posts.map(p => p.isNew ? { ...p, isNew: false } : p)
      }));
    }, 2000);
  },

  clearPosts: () => {
    set({ posts: [], totalPostsFetched: 0, lastFetch: null });
    console.log('🗑️ Posts cleared');
  },
  
  // Insights actions
  addInsight: (insight) => {
    set((state) => {
      const newHistory = [insight, ...state.insightHistory];
      console.log(`📚 Added marketing insight: "${insight.narrative.substring(0, 50)}..." (${newHistory.length} total)`);
      return { insightHistory: newHistory };
    });
    
    // Save to Convex asynchronously
    get().saveInsightToConvex(insight);
  },

  clearInsights: () => {
    set({ insightHistory: [] });
    console.log('🗑️ Cleared insight history');
  },

  // Convex integration
  loadInsightsFromConvex: async () => {
    try {
      const { ConvexHttpClient } = await import('convex/browser');
      const { api } = await import('@/convex/_generated/api');
      
      const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
      
      console.log('📚 Loading all insights from Convex (no session filtering)');
      
      const convexInsights = await convex.query(api.insights.getAllInsights, {});
      
      // Convert to MarketingInsight format
      const insights: MarketingInsight[] = convexInsights.map((insight: any) => ({
        id: insight.insight_id,
        narrative: insight.narrative,
        title: insight.title,
        insight_type: insight.insight_type,
        priority: insight.priority,
        timestamp: new Date(insight.completed_at),
        originalItem: insight.original_item,
        sentiment: insight.sentiment,
        topics: insight.topics,
        summary: insight.summary,
      }));
      
      set({ insightHistory: insights });
      console.log(`✅ Loaded ${insights.length} insights`);
    } catch (error: any) {
      console.error('❌ Failed to load insights from Convex:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to load insights' });
    }
  },

  saveInsightToConvex: async (insight: MarketingInsight) => {
    try {
      const { ConvexHttpClient } = await import('convex/browser');
      const { api } = await import('@/convex/_generated/api');
      
      const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
      
      await convex.mutation(api.insights.addInsight, {
        insight_id: insight.id,
        narrative: insight.narrative,
        title: insight.title,
        insight_type: insight.insight_type,
        priority: insight.priority,
        sentiment: insight.sentiment,
        topics: insight.topics,
        summary: insight.summary,
        created_at: Date.now(),
        completed_at: insight.timestamp.getTime(),
        original_item: insight.originalItem,
      });
      
      console.log(`💾 Saved insight to Convex: ${insight.id}`);
    } catch (error) {
      console.error('❌ Failed to save insight to Convex:', error);
    }
  },
  
  // Controls
  setIsLive: (isLive) => {
    set({ isLive });
    console.log(isLive ? '▶️ Live feed started' : '⏸️ Live feed paused');
  },
  
  setSelectedSubreddits: (selectedSubreddits) => {
    set({ selectedSubreddits });
    console.log(`🔄 Subreddits updated: ${selectedSubreddits.join(', ')}`);
  },
  
  setRefreshInterval: (refreshInterval) => {
    set({ refreshInterval });
    console.log(`⏱️ Refresh interval set to ${refreshInterval}s`);
  },
  
  // Status actions
  setLoading: (isLoading) => {
    set({ isLoading });
  },
  
  setError: (error) => {
    set({ error });
  },
}));
