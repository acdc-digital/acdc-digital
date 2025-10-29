/**
 * Demo Templates Store
 * Browser-based state management for log entry templates
 * Replaces Convex queries in demo mode
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEMO_USER_ID } from './demoLogsStore';

export interface DemoTemplate {
  _id: string;
  _creationTime: number;
  userId: string;
  name: string;
  description?: string;
  content: string;
  category?: string;
  isDefault: boolean;
  order: number;
}

interface DemoTemplatesState {
  templates: DemoTemplate[];
  
  // Core operations
  getTemplateById: (id: string) => DemoTemplate | undefined;
  getAllTemplates: () => DemoTemplate[];
  getDefaultTemplates: () => DemoTemplate[];
  createTemplate: (name: string, content: string, description?: string, category?: string) => DemoTemplate;
  updateTemplate: (id: string, updates: Partial<DemoTemplate>) => void;
  deleteTemplate: (id: string) => void;
  
  // Bulk operations
  clearAllTemplates: () => void;
  seedDemoData: () => void;
}

// Helper to generate ID
const generateId = () => `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useDemoTemplatesStore = create<DemoTemplatesState>()(
  persist(
    (set, get) => ({
      templates: [],

      getTemplateById: (id: string) => {
        return get().templates.find(t => t._id === id);
      },

      getAllTemplates: () => {
        return get().templates.sort((a, b) => a.order - b.order);
      },

      getDefaultTemplates: () => {
        return get().templates.filter(t => t.isDefault);
      },

      createTemplate: (name: string, content: string, description?: string, category?: string) => {
        const templates = get().templates;
        const maxOrder = templates.length > 0 ? Math.max(...templates.map(t => t.order)) : 0;

        const newTemplate: DemoTemplate = {
          _id: generateId(),
          _creationTime: Date.now(),
          userId: DEMO_USER_ID,
          name,
          description,
          content,
          category,
          isDefault: false,
          order: maxOrder + 1,
        };

        set(state => ({
          templates: [...state.templates, newTemplate],
        }));

        return newTemplate;
      },

      updateTemplate: (id: string, updates: Partial<DemoTemplate>) => {
        set(state => ({
          templates: state.templates.map(t =>
            t._id === id ? { ...t, ...updates } : t
          ),
        }));
      },

      deleteTemplate: (id: string) => {
        set(state => ({
          templates: state.templates.filter(t => t._id !== id),
        }));
      },

      clearAllTemplates: () => {
        set({ templates: [] });
      },

      seedDemoData: () => {
        const defaultTemplates: DemoTemplate[] = [
          {
            _id: 'morning-routine',
            _creationTime: Date.now(),
            userId: DEMO_USER_ID,
            name: 'Morning Routine',
            description: 'Start your day with intention',
            content: `# Morning Routine

## Physical
- [ ] Exercise/Movement
- [ ] Breakfast
- [ ] Hydration

## Mental
- [ ] Meditation/Mindfulness
- [ ] Journal prompt
- [ ] Daily intentions

## Productivity
- [ ] Review calendar
- [ ] Top 3 priorities
- [ ] Time blocks`,
            category: 'Daily',
            isDefault: true,
            order: 1,
          },
          {
            _id: 'work-focus',
            _creationTime: Date.now(),
            userId: DEMO_USER_ID,
            name: 'Work Focus',
            description: 'Plan your work sessions',
            content: `# Work Focus Block

## Current Sprint
**Sprint Goal:**

**Key Tasks:**
1. 
2. 
3. 

## Today's Priorities
- [ ] Most important task
- [ ] Secondary priority
- [ ] If time allows

## Blockers/Notes
`,
            category: 'Work',
            isDefault: true,
            order: 2,
          },
          {
            _id: 'evening-reflection',
            _creationTime: Date.now(),
            userId: DEMO_USER_ID,
            name: 'Evening Reflection',
            description: 'Review and close your day',
            content: `# Evening Reflection

## Today's Wins
- 
- 
- 

## What I Learned
- 

## Challenges Faced
- 

## Tomorrow's Setup
**Top 3 for tomorrow:**
1. 
2. 
3. 

**Prep needed:**
- `,
            category: 'Daily',
            isDefault: true,
            order: 3,
          },
          {
            _id: 'weekly-review',
            _creationTime: Date.now(),
            userId: DEMO_USER_ID,
            name: 'Weekly Review',
            description: 'Reflect on the past week',
            content: `# Weekly Review

## Week of [Date]

### Accomplishments
- 
- 
- 

### Challenges
- 
- 

### Insights/Learnings
- 
- 

### Next Week's Goals
1. 
2. 
3. 

### Habits Tracking
- Exercise: __ / 5 days
- Reading: __ / 5 days
- Deep Work: __ / 5 days`,
            category: 'Weekly',
            isDefault: true,
            order: 4,
          },
          {
            _id: 'quick-note',
            _creationTime: Date.now(),
            userId: DEMO_USER_ID,
            name: 'Quick Note',
            description: 'Capture thoughts on the go',
            content: `# Quick Note

**Time:** ${new Date().toLocaleTimeString()}

`,
            category: 'General',
            isDefault: true,
            order: 5,
          },
          {
            _id: 'meeting-notes',
            _creationTime: Date.now(),
            userId: DEMO_USER_ID,
            name: 'Meeting Notes',
            description: 'Structured meeting capture',
            content: `# Meeting Notes

**Date:** ${new Date().toLocaleDateString()}
**Attendees:** 
**Duration:** 

## Agenda
1. 
2. 
3. 

## Key Discussion Points
- 
- 

## Decisions Made
- 
- 

## Action Items
- [ ] [Person] - Task - Due date
- [ ] [Person] - Task - Due date

## Next Steps
`,
            category: 'Work',
            isDefault: true,
            order: 6,
          },
          {
            _id: 'gratitude',
            _creationTime: Date.now(),
            userId: DEMO_USER_ID,
            name: 'Gratitude',
            description: 'Practice daily gratitude',
            content: `# Gratitude Practice

Today I'm grateful for:

1. 
2. 
3. 

## Why?
Take a moment to reflect on why these things matter to you.

`,
            category: 'Wellness',
            isDefault: true,
            order: 7,
          },
          {
            _id: 'project-brainstorm',
            _creationTime: Date.now(),
            userId: DEMO_USER_ID,
            name: 'Project Brainstorm',
            description: 'Ideate and plan projects',
            content: `# Project Brainstorm

**Project Name:** 

## Vision
What's the big picture goal?

## Key Features/Components
- 
- 
- 

## Technical Approach
**Stack:**
- 
- 

**Architecture:**
- 

## Next Actions
1. 
2. 
3. 

## Resources Needed
- 
- `,
            category: 'Projects',
            isDefault: true,
            order: 8,
          },
        ];

        set({ templates: defaultTemplates });
      },
    }),
    {
      name: 'demo-templates-storage',
      version: 1,
    }
  )
);
