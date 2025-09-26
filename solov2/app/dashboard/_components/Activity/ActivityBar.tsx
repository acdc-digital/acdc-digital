// ACTIVITY BAR COMPONENT - Left side navigation bar for Soloist dashboard
// /Users/matthewsimon/Projects/acdc-digital/solov2/app/dashboard/_components/Activity/ActivityBar.tsx

"use client";

import React from 'react';
import { 
  CirclePower, 
  Haze, 
  User,
  Settings,
  Puzzle,
  Keyboard,
  SquareCheckBig,
  Torus,
  Bot
} from 'lucide-react';
import { useTabContext } from '../context/TabContext';

interface ActivityBarProps {
  onTerminalToggle?: () => void;
}

interface ActivityItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  tabType: 'welcome' | 'calendar' | 'agent' | 'settings' | 'identity-guidelines' | 'editor' | 'kanban' | 'torus' | 'special';
  tabTitle: string;
}

const topActivityItems: ActivityItem[] = [
  { id: 'welcome', label: 'Welcome', icon: CirclePower, tabType: 'welcome', tabTitle: 'Welcome' },
  { id: 'editor', label: 'Editor', icon: Keyboard, tabType: 'editor', tabTitle: 'Editor' },
  { id: 'kanban', label: 'Tasks', icon: SquareCheckBig, tabType: 'kanban', tabTitle: 'Tasks' },
  { id: 'torus', label: 'Torus', icon: Torus, tabType: 'torus', tabTitle: 'Torus' },
  { id: 'calendar', label: 'Calendar', icon: Haze, tabType: 'calendar', tabTitle: 'Calendar' },
  { id: 'robot', label: 'Robot', icon: Bot, tabType: 'special', tabTitle: 'Robot' },
  { id: 'agent', label: 'Extensions', icon: Puzzle, tabType: 'agent', tabTitle: 'Extensions' },
  { id: 'account', label: 'Account', icon: User, tabType: 'identity-guidelines', tabTitle: 'Profile' },
];

const bottomActivityItems: ActivityItem[] = [
  { id: 'settings', label: 'Settings', icon: Settings, tabType: 'settings', tabTitle: 'Settings' },
];

export function ActivityBar({ onTerminalToggle }: ActivityBarProps) {
  const { tabs, activeTabId, openTab, setActiveTabId } = useTabContext();
  const isAuthenticated = true; // TODO: Replace with actual auth state

  const handleActivityClick = (item: ActivityItem) => {
    // Special handling for robot - toggle terminal instead of opening tab
    if (item.id === 'robot') {
      onTerminalToggle?.();
      return;
    }
    
    // Check if tab already exists
    const existingTab = tabs.find(tab => tab.id === item.id);
    
    if (existingTab) {
      // If tab exists and is active, don't do anything (keep it open)
      // If tab exists but is not active, switch to it
      if (activeTabId !== item.id) {
        setActiveTabId(item.id);
      }
    } else {
      // Skip special items (they don't create tabs)
      if (item.tabType === 'special') return;
      
      // Create and open new tab
      openTab({
        id: item.id,
        title: item.tabTitle,
        type: item.tabType as 'welcome' | 'calendar' | 'agent' | 'settings' | 'identity-guidelines' | 'editor' | 'kanban' | 'torus',
        isPinned: item.id === 'welcome' // Only welcome tab is pinned
      });
    }
  };

  const getUserInitial = () => {
    return 'U'; // TODO: Replace with actual user initial
  };

  const renderActivityButton = (item: ActivityItem) => {
    const Icon = item.icon;
    const isActive = activeTabId === item.id;
    
    // Special styling for user account button
    if (item.id === 'account') {
      return (
        <button
          key={item.id}
          onClick={() => handleActivityClick(item)}
          className={`
            w-full h-11 hover:bg-[#2d2d2d] flex items-center justify-center cursor-pointer
            ${isActive 
              ? 'bg-[#2d2d2d] border-r-1 border-[#007acc]' 
              : ''
            }
          `}
          title={item.label}
        >
          <div className={`
            w-6 h-6 rounded-full border flex items-center justify-center text-xs font-medium
            ${isActive 
              ? 'border-[#cccccc] text-[#cccccc]' 
              : 'border-[#858585] text-[#858585]'
            }
          `}>
            {getUserInitial()}
          </div>
        </button>
      );
    }
    
    return (
      <button
        key={item.id}
        onClick={() => handleActivityClick(item)}
        disabled={!isAuthenticated}
        className={`
          w-full h-11 hover:bg-[#2d2d2d] flex items-center justify-center cursor-pointer
          ${isActive 
            ? 'bg-[#2d2d2d] border-r-1 border-[#007acc]' 
            : ''
          }
          ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        title={isAuthenticated ? item.label : 'Sign in to access'}
      >
        <Icon
          className={`w-5 h-5 ${
            isActive ? 'text-[#cccccc]' : 'text-[#858585]'
          }`}
        />
      </button>
    );
  };

  return (
    <aside className="w-12 bg-[#181818] border-r border-[#2d2d2d] flex flex-col">
      {/* Top Activity Icons */}
      <div className="flex flex-col pt-0">
        {topActivityItems.map(renderActivityButton)}
      </div>

      {/* Bottom Activity Icons - Settings */}
      <div className="mt-auto flex flex-col">
        {bottomActivityItems.map(renderActivityButton)}
      </div>
    </aside>
  );
}