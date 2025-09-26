// TAB CONTENT RENDERER - Renders content based on active tab
// /Users/matthewsimon/Projects/acdc-digital/solov2/app/dashboard/_components/TabContent/TabContentRenderer.tsx

"use client";

import React from 'react';
import { useTabContext } from '../context/TabContext';
import DashboardPage from '../../page';
import { TiptapEditor } from '../Editor/_components/tiptap/tiptap';
import Tasks from '../Editor/_components/tasks/tasks';
import { DonutChart } from '../Editor/_components/donut/DonutChart';

// Placeholder components for different tab types
function EditorTab({ documentId }: { documentId: string }) {
  return <TiptapEditor documentId={documentId} />;
}

function KanbanTab() {
  return <Tasks />;
}

function CalendarTab() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-bold text-[#cccccc] mb-2">Calendar</h2>
        <p className="text-[#858585]">Calendar functionality coming soon...</p>
      </div>
    </div>
  );
}

function SettingsTab() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-bold text-[#cccccc] mb-2">Settings</h2>
        <p className="text-[#858585]">Settings panel coming soon...</p>
      </div>
    </div>
  );
}

function AgentTab() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-bold text-[#cccccc] mb-2">AI Agent</h2>
        <p className="text-[#858585]">AI Agent interface coming soon...</p>
      </div>
    </div>
  );
}

function ProfileTab() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-bold text-[#cccccc] mb-2">Profile</h2>
        <p className="text-[#858585]">User profile coming soon...</p>
      </div>
    </div>
  );
}

function TorusTab() {
  return <DonutChart />;
}

export function TabContentRenderer() {
  const { tabs, activeTabId } = useTabContext();
  
  const activeTab = tabs.find(tab => tab.id === activeTabId);
  
  if (!activeTab) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-[#858585]">No active tab</p>
      </div>
    );
  }

  // Render content based on tab type
  switch (activeTab.type) {
    case 'welcome':
      return <DashboardPage />;
    case 'editor':
      return <EditorTab documentId={activeTab.id} />;
    case 'kanban':
      return <KanbanTab />;
    case 'calendar':
      return <CalendarTab />;
    case 'settings':
      return <SettingsTab />;
    case 'agent':
      return <AgentTab />;
    case 'identity-guidelines':
      return <ProfileTab />;
    case 'torus':
      return <TorusTab />;
    default:
      return (
        <div className="flex h-full items-center justify-center">
          <p className="text-[#858585]">Unknown tab type: {activeTab.type}</p>
        </div>
      );
  }
}