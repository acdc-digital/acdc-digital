// MARKETING CONTROLS (REFINED DESIGN)
// /Users/matthewsimon/Projects/acdc-digital/soloist/marketing/app/dashboard/controls/Controls.tsx

'use client';

import React, { useState, useCallback } from 'react';
import { useSimpleLiveFeedStore } from '@/lib/stores/simpleLiveFeedStore';
import { liveFeedService } from '@/lib/stores/simpleLiveFeedService';
import {
  Maximize2,
  Minimize2,
} from "lucide-react";

// Import components
import {
  SubredditManager,
  PlaceholderPanel,
  HealthPanel,
  ControlsProps,
} from './_components';

const DEFAULT_SUBREDDITS = [
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
];

export default function Controls({}: ControlsProps) {
  const {
    isLive,
    selectedSubreddits,
    setSelectedSubreddits,
    setIsLive,
    posts
  } = useSimpleLiveFeedStore();

  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleBroadcastToggle = useCallback(() => {
    if (isLive) {
      liveFeedService.stop();
      setIsLive(false);
    } else {
      setIsLive(true);
      liveFeedService.start();
    }
  }, [isLive, setIsLive]);

  const handleToggleSubreddit = useCallback((subreddit: string) => {
    if (selectedSubreddits.includes(subreddit)) {
      setSelectedSubreddits(selectedSubreddits.filter(s => s !== subreddit));
    } else {
      setSelectedSubreddits([...selectedSubreddits, subreddit]);
    }
  }, [selectedSubreddits, setSelectedSubreddits]);

  // Dynamic grid columns with fixed widths for consistency
  const getGridCols = () => {
    // 4 columns: SubredditManager (2 cols) + Placeholder (1 col) + Placeholder (1 col)
    return 'grid-cols-4';
  };

  // Render collapsed view
  if (isCollapsed) {
    return (
      <div className="bg-card/30 backdrop-blur-sm border border-border rounded-lg shadow-sm">
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-3">
            <span className="text-sm font-light text-muted-foreground tracking-wide">Control Panel</span>
            <div className="flex items-center gap-2 text-xs text-muted-foreground/70 font-mono">
              <span>Feed: {posts.length} | Subreddits: {selectedSubreddits.length}</span>
            </div>
            {/* Live Button in collapsed view */}
            <button
              onClick={handleBroadcastToggle}
              className={`px-2 py-1 text-xs rounded transition-all duration-200 flex items-center gap-1 ${
                isLive
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-card text-muted-foreground border border-border hover:bg-card/80'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-white animate-pulse' : 'bg-gray-400'}`} />
              <span>{isLive ? 'LIVE' : 'Live'}</span>
            </button>
          </div>
          <button
            title="Expand Panel"
            onClick={() => setIsCollapsed(false)}
            className="p-1 hover:bg-accent/10 rounded transition-all duration-200 text-muted-foreground/70 hover:text-muted-foreground"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card/30 backdrop-blur-sm border border-border rounded-lg shadow-sm">
      {/* Header with responsive controls and Live button */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <div className="flex items-center gap-3">
          <span className="text-sm font-light text-muted-foreground font-sans tracking-wide">Control Panel</span>
          
          {/* Live/Stop Button */}
          <button
            onClick={handleBroadcastToggle}
            className={`px-3 py-1 text-xs rounded transition-all duration-200 flex items-center gap-1.5 font-medium ${
              isLive
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-white animate-pulse' : 'bg-green-400'}`} />
            <span>{isLive ? 'Stop Feed' : 'Start Feed'}</span>
          </button>

          {/* Stats Display */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground/70 font-mono">
            <span>Feed: {posts.length}</span>
            <span className="text-muted-foreground/40">•</span>
            <span>Subreddits: {selectedSubreddits.length}/{DEFAULT_SUBREDDITS.length}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            title="Minimize"
            onClick={() => setIsCollapsed(true)}
            className="p-1 hover:bg-accent/10 rounded transition-all duration-200 text-muted-foreground/70 hover:text-muted-foreground"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Responsive Grid Layout */}
      <div className="p-3">
        <div className={`grid ${getGridCols()} gap-2`}>
          {/* Columns 1-2: Subreddit Manager (2 columns) */}
          <SubredditManager
            selectedSubreddits={selectedSubreddits}
            availableSubreddits={DEFAULT_SUBREDDITS}
            onToggleSubreddit={handleToggleSubreddit}
            showHeaders={false}
          />

          {/* Column 3: Placeholder Panel */}
          <PlaceholderPanel
            title="Filters"
            showHeaders={false}
          />

          {/* Column 4: Health Panel */}
          <HealthPanel
            insightsCount={posts.length}
            filterCount={0}
            sourcesCount={0}
            showHeaders={false}
          />
        </div>
      </div>
    </div>
  );
}
