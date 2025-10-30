// HEATMAP CONTROLS 
// /Users/matthewsimon/Documents/Github/electron-nextjs/renderer/src/app/dashboard/_components/Controls.tsx

"use client";

import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  FilterIcon,
  Tag as TagIcon,
} from "lucide-react";

// Components
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

// Store & Types
import { useFeedStore, RightSidebarTab } from "@/store/feedStore";
import { Tag } from "./Tags";

// Import your new YearSelector
import { YearSelector } from "./YearSelector";

// Define the legend items locally or import from utils
const legendItems = [
  { label: "90-100", color: "bg-indigo-400" },
  { label: "80-89", color: "bg-blue-400" },
  { label: "70-79", color: "bg-sky-400" },
  { label: "60-69", color: "bg-teal-400" },
  { label: "50-59", color: "bg-green-400" },
  { label: "40-49", color: "bg-lime-400" },
  { label: "30-39", color: "bg-yellow-400" },
  { label: "20-29", color: "bg-amber-500" },
  { label: "10-19", color: "bg-orange-500" },
  { label: "0-9", color: "bg-rose-600" },
  { label: "No Log", color: "bg-zinc-800/30 border border-zinc-700/50" },
];

type ControlsProps = {
  selectedYear: string;
  onYearChange: (year: string) => void;
  onLegendFilterChange: (selectedLegend: string | null) => void;
  selectedLegend: string | null;
  // New props for tag filtering
  availableTags?: Tag[];
  selectedTags?: Tag[];
  onTagFilterChange?: (tags: Tag[]) => void;
};

export default function Controls({
  selectedYear,
  onYearChange,
  onLegendFilterChange,
  selectedLegend,
  availableTags = [],
  selectedTags = [],
  onTagFilterChange = () => {},
}: ControlsProps) {
  // --- State from Feed Store ---
  const activeTab = useFeedStore((state) => state.activeTab);
  const setActiveTab = useFeedStore((state) => state.setActiveTab);
  const setSidebarOpen = useFeedStore((state) => state.setSidebarOpen);

  // Define your year range however you like
  const minYear = 1970;
  const maxYear = new Date().getFullYear() + 10;

  // Handlers for arrow buttons
  const handlePrevYear = () => {
    const current = parseInt(selectedYear, 10);
    if (current > minYear) {
      onYearChange(String(current - 1));
    }
  };

  const handleNextYear = () => {
    const current = parseInt(selectedYear, 10);
    if (current < maxYear) {
      onYearChange(String(current + 1));
    }
  };

  const handleTabChange = (value: string) => {
    if (value === "log" || value === "feed") {
      setActiveTab(value as RightSidebarTab);
      // Always open the sidebar when switching tabs
      setSidebarOpen(true);
    }
  };

  // Helper to check if there's any active filter
  const hasLegendFilter = selectedLegend !== null;
  const hasTagFilter = selectedTags.length > 0;
  const hasAnyFilter = hasLegendFilter || hasTagFilter;

  // Toggle a tag in the selected tags list
  const toggleTagFilter = (tag: Tag) => {
    const isSelected = selectedTags.some(t => t.id === tag.id);
    if (isSelected) {
      onTagFilterChange(selectedTags.filter(t => t.id !== tag.id));
    } else {
      onTagFilterChange([...selectedTags, tag]);
    }
  };

  // Get tag color class based on tag color
  const getTagColorClass = (tag: Tag, isSelected: boolean) => {
    if (!isSelected) {
      return "bg-zinc-100 text-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700";
    }
    
    switch (tag.color) {
      case "red": return "bg-red-500 hover:bg-red-600 text-white";
      case "green": return "bg-green-500 hover:bg-green-600 text-white";
      case "blue": return "bg-blue-500 hover:bg-blue-600 text-white";
      case "yellow": return "bg-yellow-500 hover:bg-yellow-600 text-white";
      case "purple": return "bg-purple-500 hover:bg-purple-600 text-white";
      case "pink": return "bg-pink-500 hover:bg-pink-600 text-white";
      case "orange": return "bg-orange-500 hover:bg-orange-600 text-white";
      case "cyan": return "bg-cyan-500 hover:bg-cyan-600 text-white";
      case "indigo": return "bg-indigo-500 hover:bg-indigo-600 text-white";
      default: return "bg-zinc-500 hover:bg-zinc-600 text-white";
    }
  };

  return (
    <div className="flex items-center gap-3 flex-wrap w-full">

      {/* ----- Left Side: Year Navigation ----- */}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrevYear}
          disabled={+selectedYear <= minYear}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <YearSelector
          selectedYear={selectedYear}
          onYearChange={onYearChange}
          minYear={minYear}
          maxYear={maxYear}
          className="w-28 h-8 font-medium"
        />

        <Button
          variant="outline"
          size="icon"
          onClick={handleNextYear}
          disabled={+selectedYear >= maxYear}
          className="h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Spacer div to push the Tabs to the right */}
      <div className="flex-grow"></div>

      {/* ----- Rightmost: Clean Toggle for Right Sidebar View ----- */}
      <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1 gap-1">
        <button
          onClick={() => handleTabChange("log")}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
            activeTab === "log"
              ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700"
          }`}
        >
          Log
        </button>
        <button
          onClick={() => handleTabChange("feed")}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
            activeTab === "feed"
              ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700"
          }`}
        >
          Feed
        </button>
      </div>
    </div>
  );
}