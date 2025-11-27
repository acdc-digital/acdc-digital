'use client';

import { useEffect } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useSimpleLiveFeedStore } from '@/lib/stores/simpleLiveFeedStore';
import { Trash2 } from 'lucide-react';
import InsightCard from './InsightCard';

interface LiveFeedProps {
  className?: string;
}

export default function LiveFeed({ className }: LiveFeedProps) {
  const { clearInsights } = useSimpleLiveFeedStore();

  // Use Convex query hook for real-time updates
  const convexInsights = useQuery(api.insights.getAllInsights, {});

  // Convert Convex insights to store format
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const insightHistory = convexInsights?.map((insight: any) => ({
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
  })) || [];

  useEffect(() => {
    if (convexInsights) {
      console.log(`📚 Live Feed: Loaded ${convexInsights.length} insights from Convex`);
    }
  }, [convexInsights]);

  return (
    <div className={`h-full flex flex-col ${className}`}>
      {/* Fixed Header */}
      <div className="flex-shrink-0 bg-card/50 backdrop-blur-sm border-b border-border flex items-center justify-between px-4 py-2">
        <div className="text-sm font-light text-muted-foreground font-sans">
          {insightHistory.length > 0 ? `${insightHistory.length} Insights` : 'Marketing Insights'}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={clearInsights}
            title="Clear Insights"
            className="p-1 hover:bg-accent/10 rounded transition-colors border border-border text-muted-foreground/70 cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
      
      {/* Scrollable Content Container */}
      <div className="flex-1 overflow-y-auto relative">
        <div className="space-y-4 px-2 pt-2 relative z-10">
          {insightHistory.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              No insights yet. Start the feed to begin collecting data.
            </div>
          ) : (
            <div className="space-y-3">
              {insightHistory.map((insight) => (
                <InsightCard
                  key={insight.id}
                  insight={insight}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
