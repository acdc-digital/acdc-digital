"use client";

import React, { useState } from "react";
import Image from "next/image";

interface Annotation {
  id: number;
  label: string;
  targetX: string; // where the line points to (percentage)
  targetY: string; // where the line points to (percentage)
  side: "left" | "right" | "top" | "overlay"; // which margin
  anchor: string; // ID to scroll to
  switchesImage?: boolean; // whether clicking this annotation switches the image
}

const annotations: Annotation[] = [
  // Left side annotations - positioned to align with sidebar icons
  { id: 1, label: "Heatmap View", targetX: "12%", targetY: "10%", side: "left", anchor: "feature-sidebar" },
  { id: 2, label: "Base View", targetX: "8%", targetY: "18%", side: "left", anchor: "feature-year-nav", switchesImage: true },
  { id: 3, label: "Soloist View", targetX: "8%", targetY: "26%", side: "left", anchor: "feature-filters" },
  { id: 4, label: "Canvas View", targetX: "8%", targetY: "35%", side: "left", anchor: "feature-stats" },
  { id: 5, label: "Guide View", targetX: "8%", targetY: "44%", side: "left", anchor: "feature-heatmap" },
  { id: 6, label: "Service View", targetX: "8%", targetY: "53%", side: "left", anchor: "feature-legend" },
  { id: 7, label: "Score Legend", targetX: "35%", targetY: "95%", side: "left", anchor: "feature-score-legend" },

  // Top annotations - above the right panel
  { id: 8, label: "View Toggle", targetX: "15%", targetY: "5%", side: "top", anchor: "feature-view-toggle" },
  { id: 9, label: "Daily Log Form", targetX: "67%", targetY: "5%", side: "top", anchor: "feature-log-form" },
  { id: 10, label: "Template Selector", targetX: "87%", targetY: "5%", side: "top", anchor: "feature-templates", switchesImage: true },

  // Overlay annotation - positioned on the image
  { id: 11, label: "Mood Sliders", targetX: "60%", targetY: "40%", side: "overlay", anchor: "feature-sliders" },

  // Base View specific annotations (only visible when #2 is selected)
  { id: 12, label: "Assessment Form", targetX: "25%", targetY: "5%", side: "top", anchor: "feature-assessment" },
  { id: 13, label: "Waypoint Actions", targetX: "65%", targetY: "5%", side: "top", anchor: "feature-waypoint-actions" },
  { id: 14, label: "Save Progress", targetX: "95%", targetY: "96%", side: "right", anchor: "feature-save-progress" },
];

// Export annotations for use in other components
export { annotations };
export type { Annotation };

interface MarginAnnotationProps {
  annotation: Annotation;
  index: number;
  isSelected?: boolean;
  onSelect?: (id: number) => void;
}

function MarginAnnotation({ annotation, index, isSelected, onSelect }: MarginAnnotationProps) {
  const topPosition = annotation.targetY;
  const isRightSide = annotation.side === "right";

  return (
    <button
      onClick={() => onSelect?.(annotation.id)}
      className="absolute group z-10 flex items-center gap-2"
      style={{
        top: topPosition,
        ...(annotation.side === "left"
          ? { left: "0", transform: "translateY(-50%)" }
          : { right: "0", transform: "translateY(-50%)" }
        ),
      }}
      title={annotation.label}
    >
      {isRightSide && (
        <span className="text-white/70 text-xs group-hover:text-white transition-colors">←</span>
      )}
      <span className={`flex items-center justify-center w-7 h-7 rounded-full text-white text-sm font-bold border-2 transition-all group-hover:scale-110 group-hover:border-white group-hover:bg-white/10 ${isSelected ? 'bg-blue-600 border-blue-400' : 'bg-transparent border-white/70'}`}>
        {annotation.id}
      </span>
    </button>
  );
}

interface TopAnnotationProps {
  annotation: Annotation;
  isSelected?: boolean;
  onSelect?: (id: number) => void;
}

function TopAnnotation({ annotation, isSelected, onSelect }: TopAnnotationProps) {
  return (
    <button
      onClick={() => onSelect?.(annotation.id)}
      className="absolute group z-10 flex flex-col items-center"
      style={{
        left: annotation.targetX,
        top: "0",
        transform: "translateX(-50%)",
      }}
      aria-label={`Learn about ${annotation.label}`}
      title={annotation.label}
    >
      <span className={`flex items-center justify-center w-7 h-7 rounded-full text-white text-sm font-bold border-2 transition-all group-hover:scale-110 group-hover:border-white group-hover:bg-white/10 ${isSelected ? 'bg-blue-600 border-blue-400' : 'bg-transparent border-white/70'}`}>
        {annotation.id}
      </span>
      <span className="text-white/70 text-xs mt-0.5 group-hover:text-white transition-colors">↓</span>
    </button>
  );
}

interface OverlayAnnotationProps {
  annotation: Annotation;
  isSelected?: boolean;
  onSelect?: (id: number) => void;
}

function OverlayAnnotation({ annotation, isSelected, onSelect }: OverlayAnnotationProps) {
  return (
    <button
      onClick={() => onSelect?.(annotation.id)}
      className="absolute group z-20 flex items-center"
      style={{
        left: annotation.targetX,
        top: annotation.targetY,
        transform: "translate(-50%, -50%)",
      }}
      title={annotation.label}
    >
      <span 
        className={`flex items-center justify-center w-7 h-7 rounded-full text-white text-sm font-bold border-2 transition-all group-hover:scale-110 group-hover:border-white ${isSelected ? 'bg-blue-600 border-blue-400' : 'border-white/70'}`}
        style={{ backgroundColor: isSelected ? undefined : '#2B2B2B' }}
      >
        {annotation.id}
      </span>
      <span className="text-white/70 text-xs ml-0.5 group-hover:text-white transition-colors">→</span>
    </button>
  );
}

interface AnnotatedDashboardProps {
  selectedFeature?: number | null;
  onSelectFeature?: (id: number | null) => void;
}

// Map feature IDs to their corresponding images
const featureImageMap: Record<number, string> = {
  1: "/Group-01.svg",  // Heatmap View
  2: "/Group-03.svg",  // Base View
  3: "/Group-04.svg",  // Soloist View
  4: "/Group-05.svg",  // Canvas View
  10: "/Group-02.svg", // Template Selector (Notes view)
  // Base View specific features (12, 13, 14) should keep showing Base View image
  12: "/Group-03.svg", // Assessment Form (Base View)
  13: "/Group-03.svg", // Waypoint Actions (Base View)
  14: "/Group-03.svg", // Save Progress (Base View)
};

// Get the image for a selected feature
function getImageForFeature(selectedFeature: number | null | undefined): string {
  if (selectedFeature && featureImageMap[selectedFeature]) {
    return featureImageMap[selectedFeature];
  }
  return "/Group-01.svg"; // Default to main heatmap
}

// Get alt text for the current image
function getAltForFeature(selectedFeature: number | null | undefined): string {
  if (selectedFeature === 2 || selectedFeature === 12 || selectedFeature === 13 || selectedFeature === 14) return "Soloist Base View";
  if (selectedFeature === 3) return "Soloist Forecast View";
  if (selectedFeature === 4) return "Soloist Canvas View";
  if (selectedFeature === 10) return "Soloist Notes View";
  return "Soloist Dashboard Overview";
}

export function AnnotatedDashboard({ selectedFeature, onSelectFeature }: AnnotatedDashboardProps) {
  const leftAnnotations = annotations.filter(a => a.side === "left");
  const rightAnnotations = annotations.filter(a => a.side === "right");
  const topAnnotations = annotations.filter(a => a.side === "top");
  const overlayAnnotations = annotations.filter(a => a.side === "overlay");

  const handleSelect = (id: number) => {
    // Toggle off if clicking the same one, otherwise select
    onSelectFeature?.(selectedFeature === id ? null : id);
  };

  // Features 12, 13, 14 belong to Base View - show them when any Base View feature is selected
  const isBaseViewActive = selectedFeature === 2 || selectedFeature === 12 || selectedFeature === 13 || selectedFeature === 14;
  const isSoloistViewActive = selectedFeature === 3;
  const isCanvasViewActive = selectedFeature === 4;
  // Hide annotations based on active view:
  // - Base View: hide 8-11, show 12-14
  // - Soloist View: hide 8-14
  // - Canvas View: hide 8-14
  // - Default: hide 12-14
  let hideAnnotations: number[] = [];
  if (isSoloistViewActive || isCanvasViewActive) {
    hideAnnotations = [8, 9, 10, 11, 12, 13, 14];
  } else if (isBaseViewActive) {
    hideAnnotations = [8, 9, 10, 11];
  } else {
    hideAnnotations = [12, 13, 14];
  }
  const shouldHide = (id: number) => hideAnnotations.includes(id);

  return (
    <div className="my-4">
      {/* Top margin for annotations */}
      <div className="hidden sm:block relative h-10 w-full">
        {topAnnotations.filter(a => !shouldHide(a.id)).map((annotation) => (
          <TopAnnotation 
            key={annotation.id} 
            annotation={annotation} 
            isSelected={selectedFeature === annotation.id}
            onSelect={handleSelect}
          />
        ))}
      </div>

      {/* Container with margins for annotations */}
      <div className="relative flex items-stretch">
        {/* Left margin annotations */}
        <div className="hidden sm:block relative w-9 flex-shrink-0">
          {leftAnnotations.map((annotation, index) => (
            <MarginAnnotation 
              key={annotation.id} 
              annotation={annotation} 
              index={index}
              isSelected={selectedFeature === annotation.id}
              onSelect={handleSelect}
            />
          ))}
        </div>

        {/* Image container */}
        <div className="relative flex-1 rounded-lg overflow-hidden shadow-xl" style={{ backgroundColor: '#2B2B2B' }}>
          <Image
            src={getImageForFeature(selectedFeature)}
            alt={getAltForFeature(selectedFeature)}
            width={1200}
            height={750}
            className="w-full h-auto"
            priority
          />
          {/* Overlay annotations on the image */}
          {overlayAnnotations.filter(a => !shouldHide(a.id)).map((annotation) => (
            <OverlayAnnotation 
              key={annotation.id} 
              annotation={annotation}
              isSelected={selectedFeature === annotation.id}
              onSelect={handleSelect}
            />
          ))}
        </div>

        {/* Right margin annotations */}
        <div className="hidden sm:block relative w-12 flex-shrink-0">
          {rightAnnotations.filter(a => !shouldHide(a.id)).map((annotation, index) => (
            <MarginAnnotation 
              key={annotation.id} 
              annotation={annotation} 
              index={index}
              isSelected={selectedFeature === annotation.id}
              onSelect={handleSelect}
            />
          ))}
        </div>
      </div>

      {/* Caption */}
      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 mt-3">
        Click any numbered circle to see its explanation below
      </p>
    </div>
  );
}

// ============================================
// Feature Badges Component
// ============================================
interface FeatureBadgesProps {
  selectedFeature?: number | null;
  onSelectFeature?: (id: number | null) => void;
}

export function FeatureBadges({ selectedFeature, onSelectFeature }: FeatureBadgesProps) {
  const handleSelect = (id: number) => {
    onSelectFeature?.(selectedFeature === id ? null : id);
  };

  return (
    <div className="flex flex-wrap gap-2 mt-4 mb-6">
      {annotations.sort((a, b) => a.id - b.id).map((annotation) => (
        <button
          key={annotation.id}
          onClick={() => handleSelect(annotation.id)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all hover:scale-105 ${
            selectedFeature === annotation.id 
              ? 'bg-blue-600 text-white border border-blue-400' 
              : 'bg-zinc-700/50 text-zinc-300 border border-zinc-600 hover:bg-zinc-600/50 hover:text-white'
          }`}
        >
          <span className={`flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${
            selectedFeature === annotation.id 
              ? 'bg-white/20' 
              : 'bg-zinc-600'
          }`}>
            {annotation.id}
          </span>
          {annotation.label}
        </button>
      ))}
      {selectedFeature && (
        <button
          onClick={() => onSelectFeature?.(null)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700 hover:text-zinc-300 transition-all"
        >
          Show All
        </button>
      )}
    </div>
  );
}

interface FeatureSectionProps {
  id: string;
  number: number;
  title: string;
  children: React.ReactNode;
}

export function FeatureSection({ id, number, title, children }: FeatureSectionProps) {
  return (
    <div id={id} className="scroll-mt-8 py-4 border-b border-zinc-600 last:border-0" style={{ backgroundColor: '#2B2B2B' }}>
      <div className="flex items-start gap-4">
        {/* Number badge */}
        <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold">
          {number}
        </span>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
            {title}
          </h4>
          <div className="text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
