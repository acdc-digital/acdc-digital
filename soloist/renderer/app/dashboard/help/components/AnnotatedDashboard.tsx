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
  { id: 2, label: "Base View", targetX: "8%", targetY: "18%", side: "left", anchor: "feature-year-nav" },
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
  { id: 11, label: "Mood Sliders", targetX: "62%", targetY: "40%", side: "overlay", anchor: "feature-sliders" },
];

function MarginAnnotation({ annotation, index }: { annotation: Annotation; index: number }) {
  // Use the targetY directly for vertical positioning (left/right) or targetX for horizontal (top)
  const topPosition = annotation.targetY;

  return (
    <div
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
      {/* Circle with number */}
      <span className="flex items-center justify-center w-7 h-7 rounded-full bg-transparent text-white text-sm font-bold border-2 border-white/70">
        {annotation.id}
      </span>
    </div>
  );
}

function TopAnnotation({ annotation, onImageSwitch }: { annotation: Annotation; onImageSwitch?: () => void }) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (annotation.switchesImage && onImageSwitch) {
      onImageSwitch();
    }
  };

  return (
    <button
      onClick={handleClick}
      className="absolute group z-10 flex flex-col items-center"
      style={{
        left: annotation.targetX,
        top: "0",
        transform: "translateX(-50%)",
      }}
      aria-label={`Learn about ${annotation.label}`}
      title={annotation.label}
    >
      {/* Circle with number */}
      <span className="flex items-center justify-center w-7 h-7 rounded-full bg-transparent text-white text-sm font-bold border-2 border-white/70 transition-all group-hover:scale-110 group-hover:border-white group-hover:bg-white/10">
        {annotation.id}
      </span>
      {/* Arrow pointing down */}
      <span className="text-white/70 text-xs mt-0.5 group-hover:text-white transition-colors">↓</span>
    </button>
  );
}

function OverlayAnnotation({ annotation }: { annotation: Annotation }) {
  return (
    <div
      className="absolute z-20 flex items-center"
      style={{
        left: annotation.targetX,
        top: annotation.targetY,
        transform: "translate(-50%, -50%)",
      }}
      title={annotation.label}
    >
      {/* Circle with number */}
      <span 
        className="flex items-center justify-center w-7 h-7 rounded-full text-white text-sm font-bold border-2 border-white/70"
        style={{ backgroundColor: '#2B2B2B' }}
      >
        {annotation.id}
      </span>
      {/* Arrow pointing right */}
      <span className="text-white/70 text-xs ml-0.5">→</span>
    </div>
  );
}

export function AnnotatedDashboard() {
  const [showNotesImage, setShowNotesImage] = useState(false);
  
  const leftAnnotations = annotations.filter(a => a.side === "left");
  const rightAnnotations = annotations.filter(a => a.side === "right");
  const topAnnotations = annotations.filter(a => a.side === "top");
  const overlayAnnotations = annotations.filter(a => a.side === "overlay");

  const toggleImage = () => setShowNotesImage(prev => !prev);

  return (
    <div className="my-4">
      {/* Top margin for annotations */}
      <div className="hidden sm:block relative h-10 w-full">
        {topAnnotations.map((annotation) => (
          <TopAnnotation 
            key={annotation.id} 
            annotation={annotation} 
            onImageSwitch={annotation.switchesImage ? toggleImage : undefined}
          />
        ))}
      </div>

      {/* Container with margins for annotations */}
      <div className="relative flex items-stretch">
        {/* Left margin annotations */}
        <div className="hidden sm:block relative w-9 flex-shrink-0">
          {leftAnnotations.map((annotation, index) => (
            <MarginAnnotation key={annotation.id} annotation={annotation} index={index} />
          ))}
        </div>

        {/* Image container */}
        <div className="relative flex-1 rounded-lg overflow-hidden shadow-xl" style={{ backgroundColor: '#2B2B2B' }}>
          <Image
            src={showNotesImage ? "/soloist-notes_v2.svg" : "/soloist-main_v2.svg"}
            alt={showNotesImage ? "Soloist Notes View" : "Soloist Dashboard Overview"}
            width={1200}
            height={750}
            className="w-full h-auto"
            priority
          />
          {/* Overlay annotations on the image */}
          {overlayAnnotations.map((annotation) => (
            <OverlayAnnotation key={annotation.id} annotation={annotation} />
          ))}
        </div>

        {/* Right margin annotations */}
        <div className="hidden sm:block relative w-12 flex-shrink-0">
          {rightAnnotations.map((annotation, index) => (
            <MarginAnnotation key={annotation.id} annotation={annotation} index={index} />
          ))}
        </div>
      </div>

      {/* Mobile: show numbers in a row below */}
      <div className="flex sm:hidden flex-wrap justify-center gap-2 mt-4">
        {annotations.sort((a, b) => a.id - b.id).map((annotation) => (
          annotation.switchesImage ? (
            <button
              key={annotation.id}
              onClick={toggleImage}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-transparent text-white text-sm font-bold border-2 border-white/70 hover:border-white hover:bg-white/10 transition-all"
              title={annotation.label}
            >
              {annotation.id}
            </button>
          ) : (
            <div
              key={annotation.id}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-transparent text-white text-sm font-bold border-2 border-white/70"
              title={annotation.label}
            >
              {annotation.id}
            </div>
          )
        ))}
      </div>

      {/* Caption */}
      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 mt-3">
        Click any numbered circle to jump to its explanation below
      </p>
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
