"use client";

import { useState } from "react";
import { PanelType } from "./ActivityBar";
import { NotesList } from "./NotesList";
import { NoteEditor } from "./NoteEditor";
import { X } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

interface Tab {
  id: string;
  title: string;
  type: "list" | "note";
  noteId?: Id<"notes">;
}

interface EditorProps {
  activePanel: PanelType;
}

export function Editor({ activePanel }: EditorProps) {
  const [tabs, setTabs] = useState<Tab[]>([
    { id: "notes-list", title: "Notes", type: "list" },
  ]);
  const [activeTabId, setActiveTabId] = useState("notes-list");

  const handleNoteClick = (noteId: Id<"notes">, phoneNumber: string) => {
    // Check if tab already exists
    const existingTab = tabs.find((tab) => tab.noteId === noteId);
    
    if (existingTab) {
      setActiveTabId(existingTab.id);
    } else {
      // Create new tab
      const newTab: Tab = {
        id: `note-${noteId}`,
        title: `Note: ${phoneNumber}`,
        type: "note",
        noteId,
      };
      setTabs([...tabs, newTab]);
      setActiveTabId(newTab.id);
    }
  };

  const handleCloseTab = (tabId: string) => {
    const newTabs = tabs.filter((tab) => tab.id !== tabId);
    setTabs(newTabs);
    
    // If closing active tab, switch to first tab
    if (activeTabId === tabId && newTabs.length > 0) {
      setActiveTabId(newTabs[0].id);
    }
  };

  const activeTab = tabs.find((tab) => tab.id === activeTabId);

  return (
    <div className="flex-1 flex flex-col bg-[#1e1e1e] overflow-hidden">
      {/* Tab Bar */}
      <div className="h-[35px] bg-[#0e0e0e] border-b border-[#2d2d2d] flex items-center overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          
          return (
            <div
              key={tab.id}
              className={`
                h-full flex items-center gap-2 px-4 border-r border-[#2d2d2d]
                cursor-pointer group min-w-[200px] max-w-[200px]
                ${isActive ? "bg-[#1e1e1e]" : "bg-[#0e0e0e] hover:bg-[#1a1a1a]"}
              `}
              onClick={() => setActiveTabId(tab.id)}
            >
              <span className="text-xs text-[#cccccc] flex-1 truncate">
                {tab.title}
              </span>
              {tabs.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCloseTab(tab.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3 text-[#858585] hover:text-[#cccccc]" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto">
        {activeTab?.type === "list" && (
          <NotesList onNoteClick={handleNoteClick} />
        )}
        {activeTab?.type === "note" && activeTab.noteId && (
          <NoteEditor noteId={activeTab.noteId} />
        )}
      </div>
    </div>
  );
}
