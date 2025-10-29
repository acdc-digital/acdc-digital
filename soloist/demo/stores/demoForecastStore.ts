/**
 * Demo Forecast Store
 * Browser-based state management for AI-generated forecasts
 * Replaces Convex queries in demo mode
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEMO_USER_ID } from './demoLogsStore';

export interface DemoForecast {
  _id: string;
  _creationTime: number;
  userId: string;
  date: string; // YYYY-MM-DD format
  content: string;
  model: string;
  tokensUsed?: number;
  mood?: string;
  status: 'generating' | 'completed' | 'error';
}

interface DemoForecastState {
  forecasts: DemoForecast[];
  
  // Core operations
  getForecastByDate: (date: string) => DemoForecast | undefined;
  getAllForecasts: () => DemoForecast[];
  getLatestForecast: () => DemoForecast | undefined;
  createForecast: (date: string, content: string, model?: string) => DemoForecast;
  updateForecast: (forecastId: string, updates: Partial<DemoForecast>) => void;
  deleteForecast: (forecastId: string) => void;
  
  // Bulk operations
  clearAllForecasts: () => void;
  seedDemoData: () => void;
}

// Helper to generate ID
const generateId = () => `forecast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useDemoForecastStore = create<DemoForecastState>()(
  persist(
    (set, get) => ({
      forecasts: [],

      getForecastByDate: (date: string) => {
        return get().forecasts.find(forecast => forecast.date === date);
      },

      getAllForecasts: () => {
        return get().forecasts.sort((a, b) => b._creationTime - a._creationTime);
      },

      getLatestForecast: () => {
        const forecasts = get().getAllForecasts();
        return forecasts[0];
      },

      createForecast: (date: string, content: string, model = 'claude-3-5-sonnet-20241022') => {
        const newForecast: DemoForecast = {
          _id: generateId(),
          _creationTime: Date.now(),
          userId: DEMO_USER_ID,
          date,
          content,
          model,
          tokensUsed: Math.floor(Math.random() * 5000) + 1000,
          mood: ['optimistic', 'focused', 'energetic', 'contemplative', 'determined'][Math.floor(Math.random() * 5)],
          status: 'completed',
        };

        set(state => ({
          forecasts: [...state.forecasts, newForecast],
        }));

        return newForecast;
      },

      updateForecast: (forecastId: string, updates: Partial<DemoForecast>) => {
        set(state => ({
          forecasts: state.forecasts.map(f =>
            f._id === forecastId ? { ...f, ...updates } : f
          ),
        }));
      },

      deleteForecast: (forecastId: string) => {
        set(state => ({
          forecasts: state.forecasts.filter(f => f._id !== forecastId),
        }));
      },

      clearAllForecasts: () => {
        set({ forecasts: [] });
      },

      seedDemoData: () => {
        const today = new Date();
        const demoForecasts: DemoForecast[] = [];

        const sampleForecasts = [
          {
            content: `# Today's Forecast

**Energy Level:** High (8/10)  
**Primary Focus:** Deep work and creative projects

## Morning Outlook
Based on your recent patterns, this morning looks ideal for tackling complex problems. Your energy typically peaks between 9-11 AM, making it perfect for:
- Writing that project proposal
- Refactoring the authentication flow
- Planning next week's sprint

## Afternoon Strategy
Expect a slight dip around 2 PM. Schedule your:
- Team meetings (you're more collaborative when energy is medium)
- Code reviews (structured, less demanding)
- Documentation updates

## Evening Potential
Your evening sessions have been productive lately. Consider:
- Side project work (you've shown great focus 7-9 PM)
- Learning new frameworks
- Personal reflection and planning

## Key Recommendations
1. **Start with your hardest task** - Your morning clarity is your superpower
2. **Take a real lunch break** - You skip this 60% of the time, but data shows you're 30% more productive when you don't
3. **Block 30 min for exercise** - You've hit your goals 80% of the time when you exercise before 5 PM

---
*Forecast generated from 30 days of activity patterns*`,
            mood: 'optimistic',
          },
          {
            content: `# Today's Forecast

**Energy Level:** Medium-High (7/10)  
**Primary Focus:** Collaboration and communication

## Morning Outlook
Good morning! Your calendar shows back-to-back meetings until 11 AM. Pro tip: You've historically performed best in meetings when you review notes 10 minutes before. Block those buffers!

## Afternoon Strategy
You'll have a solid 3-hour block after lunch. This is gold for:
- Finishing the API integration (you're 80% done)
- Testing the new feature (QA finds fewer bugs when you test in afternoon)
- Updating project documentation

## Evening Potential
Light evening ahead. Perfect for:
- Catching up on reading (you've been meaning to finish that architecture book)
- Planning tomorrow (takes 15 min, saves 2 hours of decision fatigue)
- Quick workout (your weekly goal needs 2 more sessions)

## Key Recommendations
1. **Prep for meetings now** - 10 min prep = 40% better outcomes
2. **Protect afternoon deep work** - Decline any non-urgent meeting requests
3. **Close laptop by 7 PM** - You sleep better and have more creative mornings

---
*Forecast generated from 30 days of activity patterns*`,
            mood: 'focused',
          },
          {
            content: `# Today's Forecast

**Energy Level:** Medium (6/10)  
**Primary Focus:** Recovery and strategic planning

## Morning Outlook
You've had an intense week. This morning, your brain might feel a bit foggy - that's normal. Consider:
- Lighter tasks (email, scheduling, organizing)
- Planning next week (strategy over execution)
- 1-on-1s with team (connection work when energy is medium)

## Afternoon Strategy
Don't push too hard today. Your best afternoon activities:
- Code review (systematic, not creative)
- Documentation (you've been putting this off)
- System maintenance (migrations, updates, cleanup)

## Evening Potential
Take the evening off if possible. Data shows:
- You're more productive next week when you rest on Fridays
- Your weekend projects are better when you don't burn out
- Sleep quality improves 40% with early shutdown

## Key Recommendations
1. **Don't start new projects** - Finish what's in progress
2. **Say no to Friday afternoon meetings** - Protect your wind-down time
3. **Plan your week Sunday evening** - You're 60% more likely to hit your goals

---
*Forecast generated from 30 days of activity patterns*`,
            mood: 'contemplative',
          },
        ];

        // Generate forecasts for past 7 days
        for (let i = 0; i < 7; i++) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];

          const sampleContent = sampleForecasts[i % sampleForecasts.length];

          demoForecasts.push({
            _id: generateId(),
            _creationTime: date.getTime(),
            userId: DEMO_USER_ID,
            date: dateStr,
            content: sampleContent.content,
            model: 'claude-3-5-sonnet-20241022',
            tokensUsed: Math.floor(Math.random() * 5000) + 2000,
            mood: sampleContent.mood,
            status: 'completed',
          });
        }

        set({ forecasts: demoForecasts });
      },
    }),
    {
      name: 'demo-forecast-storage',
      version: 1,
    }
  )
);
