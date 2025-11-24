// REDDIT API CLIENT FOR MARKETING RESEARCH
// Based on SMNB implementation with circuit breaker rate limiting

export interface RedditPost {
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
}

export interface RedditResponse {
  kind: string;
  data: {
    after: string | null;
    before: string | null;
    children: Array<{
      kind: string;
      data: RedditPost;
    }>;
  };
}

export type SortType = 'hot' | 'new' | 'rising' | 'top';
export type TimeFilter = 'hour' | 'day' | 'week' | 'month' | 'year' | 'all';

// Rate limiting handled server-side in API route

class RedditAPI {
  private apiUrl = '/api/reddit'; // Use Next.js API route proxy

  /**
   * Fetch posts from a specific subreddit or r/all
   */
  async fetchPosts(
    subreddit: string = 'all',
    sort: SortType = 'hot',
    limit: number = 25,
    timeFilter: TimeFilter = 'day',
    after?: string
  ): Promise<RedditResponse> {
    const params = new URLSearchParams({
      subreddit,
      sort,
      limit: Math.min(limit, 100).toString(),
    });

    if (after) {
      params.append('after', after);
    }

    if (sort === 'top') {
      params.append('t', timeFilter);
    }

    const url = `${this.apiUrl}?${params}`;

    try {
      console.log(`🌐 Fetching Reddit via proxy: r/${subreddit}/${sort}`);
      
      const response = await fetch(url, {
        method: 'GET',
      });

      console.log(`📊 Proxy response: ${response.status} ${response.statusText}`);

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          console.warn(`⚠️ Rate limited - returning empty response`);
          return data; // Already formatted as empty response by proxy
        }
        
        if (data.error) {
          console.warn(`⚠️ Proxy error: ${data.error}`);
          return data; // Already formatted as empty response by proxy
        }
        
        throw new Error(`Reddit API error: ${response.status} ${response.statusText}`);
      }

      return data;
    } catch (error) {
      console.error('Error fetching Reddit posts:', error);
      throw error;
    }
  }

  /**
   * Fetch hot posts from multiple subreddits
   */
  async fetchHotPosts(subreddits: string[] = ['all'], limit: number = 10) {
    const results = await Promise.allSettled(
      subreddits.map(sub => this.fetchPosts(sub, 'hot', limit))
    );

    return results
      .filter((result): result is PromiseFulfilledResult<RedditResponse> => 
        result.status === 'fulfilled'
      )
      .map(result => result.value);
  }

  /**
   * Fetch rising posts (trending up)
   */
  async fetchRisingPosts(subreddit: string = 'all', limit: number = 25) {
    return this.fetchPosts(subreddit, 'rising', limit);
  }
}

// Export singleton instance
export const redditAPI = new RedditAPI();
