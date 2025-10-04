// Mock Reddit Data Generator for Testing
// Use this when Reddit API is rate limited

import { RedditPost } from './reddit';

const mockTitles = [
  'Breaking: Major Development in Global Climate Summit',
  'Tech Giant Announces Revolutionary AI Breakthrough',
  'Markets React to Federal Reserve Policy Changes',
  'Scientists Discover New Species in Deep Ocean Trench',
  'Political Tensions Rise Over International Trade Agreement',
  'Historic Space Mission Launches Successfully',
  'Medical Researchers Report Progress on Cancer Treatment',
  'Cybersecurity Alert: Major Vulnerability Discovered',
  'Environmental Groups Celebrate New Conservation Win',
  'Economic Indicators Show Unexpected Growth Trend',
];

let postIdCounter = 1000;

export function generateMockRedditPost(subreddit: string): RedditPost {
  const title = mockTitles[Math.floor(Math.random() * mockTitles.length)];
  const id = `mock_${postIdCounter++}_${Date.now()}`;
  const score = Math.floor(Math.random() * 10000) + 100;
  const numComments = Math.floor(Math.random() * 500) + 10;
  
  return {
    id,
    title,
    subreddit: subreddit || 'news',
    author: `mock_user_${Math.floor(Math.random() * 1000)}`,
    score,
    num_comments: numComments,
    created_utc: Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 3600),
    permalink: `/r/${subreddit}/comments/${id}/mock_post/`,
    url: `https://reddit.com/r/${subreddit}/comments/${id}/`,
    selftext: `This is a mock Reddit post for testing purposes. In production, this would contain actual content from r/${subreddit}.`,
    thumbnail: '',
    is_video: false,
    domain: 'self.' + subreddit,
    upvote_ratio: 0.85 + Math.random() * 0.14, // 0.85 to 0.99
    over_18: false,
  };
}

export function generateMockRedditResponse(
  subreddit: string,
  count: number = 10
): { data: { children: Array<{ data: RedditPost }>; after: string | null; before: string | null } } {
  const posts = Array.from({ length: count }, () => generateMockRedditPost(subreddit));
  
  return {
    data: {
      children: posts.map(post => ({ data: post })),
      after: 'mock_after_token',
      before: null,
    },
  };
}

// Add some variation to make it feel more realistic
export function shouldGenerateMockPost(): boolean {
  // 80% chance of generating a post
  return Math.random() > 0.2;
}
