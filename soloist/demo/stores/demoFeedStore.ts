/**
 * Demo Feed Store
 * Browser-based state management for daily summaries and comments
 * Replaces Convex queries in demo mode
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEMO_USER_ID } from './demoLogsStore';

export interface DemoComment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: number;
}

export interface DemoFeedSummary {
  _id: string;
  _creationTime: number;
  userId: string;
  date: string; // YYYY-MM-DD format
  summary: string;
  model: string;
  tokensUsed?: number;
  comments: DemoComment[];
}

interface DemoFeedState {
  summaries: DemoFeedSummary[];
  
  // Core operations
  getSummaryByDate: (date: string) => DemoFeedSummary | undefined;
  getAllSummaries: () => DemoFeedSummary[];
  createSummary: (date: string, summary: string, model?: string) => DemoFeedSummary;
  updateSummary: (summaryId: string, content: string) => void;
  deleteSummary: (summaryId: string) => void;
  
  // Comment operations
  addComment: (summaryId: string, content: string) => void;
  deleteComment: (summaryId: string, commentId: string) => void;
  
  // Bulk operations
  clearAllSummaries: () => void;
  seedDemoData: () => void;
}

// Helper to generate ID
const generateId = () => `summary_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useDemoFeedStore = create<DemoFeedState>()(
  persist(
    (set, get) => ({
      summaries: [],

      getSummaryByDate: (date: string) => {
        return get().summaries.find(s => s.date === date);
      },

      getAllSummaries: () => {
        return get().summaries.sort((a, b) => b._creationTime - a._creationTime);
      },

      createSummary: (date: string, summary: string, model = 'claude-3-5-sonnet-20241022') => {
        const newSummary: DemoFeedSummary = {
          _id: generateId(),
          _creationTime: Date.now(),
          userId: DEMO_USER_ID,
          date,
          summary,
          model,
          tokensUsed: Math.floor(Math.random() * 2000) + 500,
          comments: [],
        };

        set(state => ({
          summaries: [...state.summaries, newSummary],
        }));

        return newSummary;
      },

      updateSummary: (summaryId: string, content: string) => {
        set(state => ({
          summaries: state.summaries.map(s =>
            s._id === summaryId ? { ...s, summary: content } : s
          ),
        }));
      },

      deleteSummary: (summaryId: string) => {
        set(state => ({
          summaries: state.summaries.filter(s => s._id !== summaryId),
        }));
      },

      addComment: (summaryId: string, content: string) => {
        set(state => ({
          summaries: state.summaries.map(s =>
            s._id === summaryId
              ? {
                  ...s,
                  comments: [
                    ...s.comments,
                    {
                      id: generateId(),
                      userId: DEMO_USER_ID,
                      userName: 'Demo User',
                      content,
                      timestamp: Date.now(),
                    },
                  ],
                }
              : s
          ),
        }));
      },

      deleteComment: (summaryId: string, commentId: string) => {
        set(state => ({
          summaries: state.summaries.map(s =>
            s._id === summaryId
              ? { ...s, comments: s.comments.filter(c => c.id !== commentId) }
              : s
          ),
        }));
      },

      clearAllSummaries: () => {
        set({ summaries: [] });
      },

      seedDemoData: () => {
        const today = new Date();
        const demoSummaries: DemoFeedSummary[] = [];

        const sampleSummaries = [
          {
            summary: `**Morning Victory:** Completed the project proposal two days ahead of schedule! The focus session from 9-11 AM really paid off.

**Collaboration Win:** Had an excellent 1-on-1 with Sarah where we mapped out the Q2 roadmap. Her insights on the API redesign were spot-on.

**Side Project Progress:** Pushed 3 commits to the open-source library. The new caching layer is working beautifully.

**Health Check:** Hit the gym before work and maintained focus throughout the day. The early workout really does make a difference.`,
            comments: [
              {
                content: 'Love seeing the consistency with morning exercise! Keep it up 💪',
                userName: 'Future You',
              },
            ],
          },
          {
            summary: `**Deep Work Block:** Spent 4 uninterrupted hours on the authentication refactor. Made significant progress - the new flow is much cleaner.

**Team Support:** Helped junior dev debug a tricky state management issue. Teaching reinforces learning!

**Documentation:** Finally updated the API docs. Future me will thank present me.

**Evening Reflection:** Noticed I was more productive when I took that lunch break. Need to remember this pattern.`,
            comments: [],
          },
          {
            summary: `**Sprint Planning:** Led the team through next week's sprint. Feels good to have clear priorities set.

**Bug Squashing:** Fixed 5 bugs from the backlog. The test coverage improvements from last month made debugging so much easier.

**Learning:** Finished two chapters of the system design book. The section on caching strategies was illuminating.

**Weekend Prep:** Organized tasks for Saturday's side project session. Having a plan makes the execution smoother.`,
            comments: [
              {
                content: 'That system design book is paying off - your architecture decisions are getting better!',
                userName: 'Team Lead',
              },
            ],
          },
        ];

        // Generate summaries for past 14 days
        for (let i = 0; i < 14; i++) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];

          // Skip some days randomly
          if (Math.random() > 0.6) continue;

          const sampleData = sampleSummaries[i % sampleSummaries.length];

          demoSummaries.push({
            _id: generateId(),
            _creationTime: date.getTime(),
            userId: DEMO_USER_ID,
            date: dateStr,
            summary: sampleData.summary,
            model: 'claude-3-5-sonnet-20241022',
            tokensUsed: Math.floor(Math.random() * 2000) + 800,
            comments: sampleData.comments.map(c => ({
              id: generateId(),
              userId: DEMO_USER_ID,
              userName: c.userName,
              content: c.content,
              timestamp: date.getTime() + 3600000,
            })),
          });
        }

        set({ summaries: demoSummaries });
      },
    }),
    {
      name: 'demo-feed-storage',
      version: 1,
    }
  )
);
