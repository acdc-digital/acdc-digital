import React, { useState } from 'react';
import { MarketingInsight } from '@/lib/stores/simpleLiveFeedStore';
import { 
  AlertCircle, 
  Users, 
  Lightbulb, 
  TrendingUp, 
  Flag,
  Signal,
  Bookmark,
  ExternalLink,
  ArrowUp,
  MessageCircle
} from 'lucide-react';

interface InsightCardProps {
  insight: MarketingInsight;
}

// Helper functions
const getInsightIcon = (type: MarketingInsight['insight_type']) => {
  switch (type) {
    case 'pain_point': return AlertCircle;
    case 'competitor_mention': return Users;
    case 'feature_request': return Lightbulb;
    case 'sentiment': return TrendingUp;
  }
};

const getInsightColor = (type: MarketingInsight['insight_type']) => {
  switch (type) {
    case 'pain_point': return 'text-red-400';
    case 'competitor_mention': return 'text-blue-400';
    case 'feature_request': return 'text-yellow-400';
    case 'sentiment': return 'text-green-400';
  }
};

const getPriorityIcon = (priority: MarketingInsight['priority']) => {
  return Flag;
};

const getPriorityColor = (priority: MarketingInsight['priority']) => {
  switch (priority) {
    case 'high': return 'text-red-500';
    case 'medium': return 'text-yellow-500';
    case 'low': return 'text-blue-500';
  }
};

const getSentimentColor = (sentiment: MarketingInsight['sentiment']) => {
  switch (sentiment) {
    case 'positive': return 'bg-green-500/20 text-green-400';
    case 'negative': return 'bg-red-500/20 text-red-400';
    case 'neutral': return 'bg-gray-500/20 text-gray-400';
    default: return 'bg-gray-500/20 text-gray-400';
  }
};

const formatTime = (timestamp: Date) => {
  const now = new Date();
  const diff = now.getTime() - timestamp.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'just now';
};

export default function InsightCard({ insight }: InsightCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  const InsightIcon = getInsightIcon(insight.insight_type);
  const PriorityIcon = getPriorityIcon(insight.priority);

  return (
    <div 
      className="bg-card/30 backdrop-blur-sm border border-border rounded-lg p-4 hover:border-accent/20 transition-all duration-200 group"
      role="article"
      aria-label={`Marketing insight: ${insight.insight_type}`}
    >
      {/* Header: Type + Priority */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span 
            title={insight.insight_type.replace('_', ' ')}
            className="flex items-center"
          >
            <InsightIcon size={14} className={getInsightColor(insight.insight_type)} />
          </span>
          <span 
            title={`Priority: ${insight.priority}`}
            className="flex items-center"
          >
            <PriorityIcon size={14} className={getPriorityColor(insight.priority)} />
          </span>
          <span className={`text-xs uppercase tracking-wider ${getInsightColor(insight.insight_type)}`}>
            {insight.insight_type.replace('_', ' ')}
          </span>
        </div>
        
        {/* Bookmark icon */}
        {insight.originalItem?.subreddit && (
          <span 
            className="flex items-center cursor-pointer p-1 rounded transition-all duration-200 hover:bg-accent/10"
            title={`Source: r/${insight.originalItem.subreddit}`}
            onClick={() => setIsBookmarked(!isBookmarked)}
          >
            <Bookmark 
              size={16} 
              className="text-muted-foreground"
              fill={isBookmarked ? "currentColor" : "none"}
            />
          </span>
        )}
      </div>

      {/* Title (if available) */}
      {insight.title && (
        <div className="text-lg font-semibold text-white mb-3 leading-tight line-clamp-2">
          {insight.title}
        </div>
      )}

      {/* Narrative */}
      <div className="text-sm text-foreground line-clamp-3 leading-relaxed mb-3">
        {insight.narrative}
      </div>

      {/* Thread Link (if available) */}
      {insight.originalItem?.url && (
        <div className="mb-3">
          <a 
            href={insight.originalItem.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-all duration-200 group/link"
            title="View original Reddit thread"
          >
            <ExternalLink size={12} className="shrink-0 group-hover/link:translate-x-0.5 transition-transform" />
            <span className="underline underline-offset-2">View Thread</span>
          </a>
          {/* Post Stats */}
          {(insight.originalItem.score !== undefined || insight.originalItem.num_comments !== undefined) && (
            <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
              {insight.originalItem.score !== undefined && (
                <span className="flex items-center gap-1" title="Upvotes">
                  <ArrowUp size={12} />
                  {insight.originalItem.score.toLocaleString()}
                </span>
              )}
              {insight.originalItem.num_comments !== undefined && (
                <span className="flex items-center gap-1" title="Comments">
                  <MessageCircle size={12} />
                  {insight.originalItem.num_comments.toLocaleString()}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Topics */}
      {insight.topics && insight.topics.length > 0 && (
        <div className="flex gap-1.5 items-center flex-wrap mb-2">
          {insight.topics.slice(0, 3).map((topic, index) => (
            <span 
              key={index} 
              className="px-2 py-0.5 bg-muted/20 rounded text-xs text-muted-foreground border border-border"
              title={`Topic: ${topic}`}
            >
              {topic}
            </span>
          ))}
        </div>
      )}

      {/* Sentiment */}
      {insight.sentiment && (
        <div className="flex items-center mb-2">
          <span 
            className={`px-1.5 py-0.5 rounded-full text-xs ${getSentimentColor(insight.sentiment)}`}
            title={`Sentiment: ${insight.sentiment}`}
          >
            {insight.sentiment}
          </span>
        </div>
      )}

      {/* Metadata Row */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>{formatTime(insight.timestamp)}</span>
        {insight.originalItem?.subreddit && (
          <>
            <span>•</span>
            <a 
              href={`https://www.reddit.com/r/${insight.originalItem.subreddit}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-all duration-200 underline underline-offset-2"
            >
              r/{insight.originalItem.subreddit}
            </a>
          </>
        )}
      </div>
    </div>
  );
}
