"use client";

import React, { useState } from "react";
import {
  Info,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  FileText,
  Calendar,
  TrendingUp,
  Search,
  BarChart3,
  PlusCircle,
  Sparkles,
  Folder,
  Eye,
  Brain,
  User,
  Wand,
  MessageSquare,
  Settings,
  Edit,
  Layers,
  Rocket,
  Grid3X3,
  Repeat,
  Heart,
  Compass,
  Target,
  Mail,
  Users,
  HelpCircle,
  LucideIcon,
} from "lucide-react";

// Icon mapping
const iconMap: Record<string, LucideIcon> = {
  calendar: Calendar,
  "trending-up": TrendingUp,
  search: Search,
  "bar-chart-3": BarChart3,
  "plus-circle": PlusCircle,
  sparkles: Sparkles,
  folder: Folder,
  eye: Eye,
  brain: Brain,
  user: User,
  wand: Wand,
  "message-square": MessageSquare,
  settings: Settings,
  edit: Edit,
  layers: Layers,
  rocket: Rocket,
  "grid-3x3": Grid3X3,
  lightbulb: Lightbulb,
  repeat: Repeat,
  heart: Heart,
  compass: Compass,
  target: Target,
  mail: Mail,
  users: Users,
  "help-circle": HelpCircle,
};

function getIcon(iconName: string): LucideIcon {
  return iconMap[iconName] || FileText;
}

// ============================================
// Callout Component
// ============================================
interface CalloutProps {
  variant?: "info" | "warning" | "success" | "tip" | "note";
  title?: string;
  children: React.ReactNode;
}

const calloutStyles = {
  info: {
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    icon: Info,
    iconColor: "text-blue-400",
  },
  warning: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    icon: AlertTriangle,
    iconColor: "text-amber-400",
  },
  success: {
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    icon: CheckCircle,
    iconColor: "text-emerald-400",
  },
  tip: {
    bg: "bg-purple-500/10",
    border: "border-purple-500/30",
    icon: Lightbulb,
    iconColor: "text-purple-400",
  },
  note: {
    bg: "bg-zinc-500/10",
    border: "border-zinc-500/30",
    icon: FileText,
    iconColor: "text-zinc-400",
  },
};

export function Callout({ variant = "info", title, children }: CalloutProps) {
  const style = calloutStyles[variant];
  const Icon = style.icon;

  return (
    <div className={`${style.bg} ${style.border} border rounded-lg p-4 my-4`}>
      <div className="flex gap-3">
        <Icon className={`${style.iconColor} h-5 w-5 flex-shrink-0 mt-0.5`} />
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className="text-sm font-semibold text-zinc-100 mb-1">{title}</h4>
          )}
          <div className="text-sm text-zinc-300">{children}</div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Section Component
// ============================================
interface SectionProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Section({ title, children, className = "" }: SectionProps) {
  return (
    <section className={`mb-8 ${className}`}>
      {title && (
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">{title}</h2>
      )}
      {children}
    </section>
  );
}

// ============================================
// Subtitle Component
// ============================================
interface SubtitleProps {
  children: React.ReactNode;
}

export function Subtitle({ children }: SubtitleProps) {
  return (
    <p className="text-lg text-zinc-400 mb-6">{children}</p>
  );
}

// ============================================
// Cards Component
// ============================================
interface CardsProps {
  columns?: 1 | 2 | 3 | 4;
  children: React.ReactNode;
}

export function Cards({ columns = 2, children }: CardsProps) {
  const colClass = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={`grid ${colClass[columns]} gap-4 my-4`}>
      {children}
    </div>
  );
}

interface CardProps {
  title: string;
  icon?: string;
  horizontal?: boolean;
  children: React.ReactNode;
}

export function Card({ title, icon, horizontal, children }: CardProps) {
  const Icon = icon ? getIcon(icon) : null;

  return (
    <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 hover:bg-zinc-800/70 transition-colors">
      <div className={horizontal ? "flex items-start gap-3" : ""}>
        {Icon && (
          <Icon className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
        )}
        <div>
          <h4 className="text-sm font-semibold text-zinc-100 mb-1">{title}</h4>
          <p className="text-sm text-zinc-400">{children}</p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Steps Component
// ============================================
interface StepsProps {
  children: React.ReactNode;
}

export function Steps({ children }: StepsProps) {
  return (
    <div className="space-y-4 my-4">
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<StepProps & { stepNumber: number }>, {
            stepNumber: index + 1,
          });
        }
        return child;
      })}
    </div>
  );
}

interface StepProps {
  title: string;
  icon?: string;
  stepNumber?: number;
  children: React.ReactNode;
}

export function Step({ title, icon, stepNumber, children }: StepProps) {
  const Icon = icon ? getIcon(icon) : null;

  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold">
        {stepNumber}
      </div>
      <div className="flex-1 min-w-0 pb-4">
        <div className="flex items-center gap-2 mb-1">
          {Icon && <Icon className="h-4 w-4 text-blue-400" />}
          <h4 className="text-base font-semibold text-zinc-100">{title}</h4>
        </div>
        <p className="text-sm text-zinc-400 leading-relaxed">{children}</p>
      </div>
    </div>
  );
}

// ============================================
// Tabs Component
// ============================================
interface TabsProps {
  children: React.ReactNode;
}

export function Tabs({ children }: TabsProps) {
  const tabs = React.Children.toArray(children).filter(
    (child): child is React.ReactElement<TabProps> =>
      React.isValidElement(child)
  );

  const [activeTab, setActiveTab] = useState(tabs[0]?.props.value || "");

  return (
    <div className="my-4">
      {/* Tab headers */}
      <div className="flex border-b border-zinc-700 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.props.value}
            onClick={() => setActiveTab(tab.props.value)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.props.value
                ? "text-blue-400 border-b-2 border-blue-400 -mb-px"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {tab.props.value}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tabs.map((tab) => (
        <div
          key={tab.props.value}
          className={activeTab === tab.props.value ? "block" : "hidden"}
        >
          {tab.props.children}
        </div>
      ))}
    </div>
  );
}

interface TabProps {
  value: string;
  children: React.ReactNode;
}

export function Tab({ children }: TabProps) {
  return <>{children}</>;
}

// ============================================
// Divider Component
// ============================================
export function Divider() {
  return <hr className="border-zinc-700 my-8" />;
}

// ============================================
// Score Table Component
// ============================================
interface ScoreRowProps {
  range: string;
  emoji: string;
  color: string;
  meaning: string;
}

function ScoreRow({ range, emoji, color, meaning }: ScoreRowProps) {
  return (
    <tr className="border-b border-zinc-700 last:border-0">
      <td className="py-2 px-3 text-sm text-zinc-300">{range}</td>
      <td className="py-2 px-3 text-center">
        <span className="text-lg">{emoji}</span>
        <span className="ml-1 text-xs text-zinc-500">{color}</span>
      </td>
      <td className="py-2 px-3 text-sm text-zinc-400">{meaning}</td>
    </tr>
  );
}

export function ScoreTable() {
  const scores = [
    { range: "90-100", emoji: "🟣", color: "Indigo", meaning: "Exceptional day with strong positive emotions" },
    { range: "80-89", emoji: "🔵", color: "Blue", meaning: "Very good day, predominantly positive experiences" },
    { range: "70-79", emoji: "🩵", color: "Sky", meaning: "Good day, more positive than negative" },
    { range: "60-69", emoji: "🩶", color: "Teal", meaning: "Fairly positive, some moderate challenges" },
    { range: "50-59", emoji: "🟢", color: "Green", meaning: "Balanced day, mix of ups and downs" },
    { range: "40-49", emoji: "🟡", color: "Lime", meaning: "Slightly below average" },
    { range: "30-39", emoji: "🟠", color: "Yellow", meaning: "Difficult day with noticeable setbacks" },
    { range: "20-29", emoji: "🟠", color: "Amber", meaning: "Very challenging day" },
    { range: "10-19", emoji: "🌸", color: "Rose", meaning: "Extremely difficult day with severe distress" },
    { range: "0-9", emoji: "🔴", color: "Red", meaning: "Crisis level, severe distress" },
  ];

  return (
    <div className="my-4 overflow-x-auto">
      <table className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg overflow-hidden">
        <thead className="bg-zinc-800">
          <tr className="border-b border-zinc-700">
            <th className="py-2 px-3 text-left text-xs font-semibold text-zinc-400 uppercase">Score Range</th>
            <th className="py-2 px-3 text-center text-xs font-semibold text-zinc-400 uppercase">Color</th>
            <th className="py-2 px-3 text-left text-xs font-semibold text-zinc-400 uppercase">Meaning</th>
          </tr>
        </thead>
        <tbody>
          {scores.map((score) => (
            <ScoreRow key={score.range} {...score} />
          ))}
        </tbody>
      </table>
      <p className="text-center text-xs text-zinc-500 mt-2">Mood score categories and their meanings</p>
    </div>
  );
}

// ============================================
// List Component
// ============================================
interface ListProps {
  children: React.ReactNode;
}

export function List({ children }: ListProps) {
  return (
    <ul className="space-y-2 my-4">
      {children}
    </ul>
  );
}

interface ListItemProps {
  children: React.ReactNode;
}

export function ListItem({ children }: ListItemProps) {
  return (
    <li className="flex items-start gap-2 text-sm text-zinc-300">
      <span className="text-blue-400 mt-1">•</span>
      <span>{children}</span>
    </li>
  );
}
