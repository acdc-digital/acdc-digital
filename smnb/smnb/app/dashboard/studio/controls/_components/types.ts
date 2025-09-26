// SHARED TYPES FOR STUDIO CONTROLS
// /Users/matthewsimon/Projects/acdc-digital/smnb/smnb/app/dashboard/studio/controls/_components/types.ts

import React from 'react';
import { StudioMode } from '../../Studio';
import { LiveFeedPost } from '@/lib/stores/livefeed/simpleLiveFeedStore';
import { EnhancedRedditPost } from '@/lib/types/enhancedRedditPost';

export interface ControlSection {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string; }>;
  status: 'active' | 'inactive' | 'info';
}

export interface ControlsProps {
  mode: StudioMode;
  onModeChange?: (mode: StudioMode) => void;
}

export interface FeedbackState {
  status: 'idle' | 'working' | 'error' | 'success';
  message?: string;
}

export interface ResponsivePreset {
  cols: 3 | 4 | 5;
  hideSecondary: boolean;
  hideFilters: boolean;
  minWidth: number;
}

// Helper function to convert LiveFeedPost to EnhancedRedditPost
export const convertLiveFeedPostToEnhanced = (post: LiveFeedPost): EnhancedRedditPost => {
  return {
    ...post,
    fetch_timestamp: post.fetched_at || post.addedAt,
    engagement_score: post.priority_score || 0,
    processing_status: 'raw' as const
  };
};