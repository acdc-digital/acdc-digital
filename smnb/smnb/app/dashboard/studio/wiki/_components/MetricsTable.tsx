'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface Metric {
  name: string;
  definition: string;
  formula: string;
  interpretation: string;
  example: string;
  score: number;
}

const metrics: Metric[] = [
  {
    name: "Story Yield (SY)",
    definition: "Efficiency of turning posts into usable stories",
    formula: "SY = Stories Extracted / Posts Collected",
    interpretation: "Core 'signal vs noise' measure. Higher = more efficient content source.",
    example: "r/MentalHealth (11→9, SY = 81.8%) vs r/Notion (4→0, SY = 0%).",
    score: 78
  },
  {
    name: "Feed Contribution (FC)",
    definition: "Proportion of feed items from this source relative to total feed",
    formula: "FC = Feed Items from Source / Total Feed Items",
    interpretation: "How much this source contributes to the overall feed.",
    example: "r/GetDisciplined contributed ~25 feed items out of 377 total feed items → FC ≈ 7%.",
    score: 7
  },
  {
    name: "Engagement Potential (EP)",
    definition: "Average engagement of posts that successfully became stories",
    formula: "EP = Σ(EngagementScore) / N",
    interpretation: "Quality metric: shows whether story posts are resonating (likes, comments, score).",
    example: "r/Entrepreneur had high-scoring story posts (high EP) vs r/Journaling (no stories, EP N/A).",
    score: 95
  },
  {
    name: "Relevance Consistency (RC)",
    definition: "Share of extracted stories aligned with core themes",
    formula: "RC = Relevant Stories / Total Stories",
    interpretation: "Measures thematic alignment with core topics (habit, mood, productivity, therapy).",
    example: "r/Zettelkasten (4 relevant / 5 total → RC = 80%) vs r/AppHookup (1/6 → RC ≈ 16.7%).",
    score: 57
  },
  {
    name: "Novelty Index (NI)",
    definition: "Proportion of unique, non-repeated concepts contributed by a source",
    formula: "NI = Unique Concepts or Stories / Total Stories",
    interpretation: "How often the source introduces new insights vs repeats.",
    example: "r/Therapy produced an 'AI-assisted journaling' story (NI high) vs repetitive habit tips (NI low).",
    score: 42
  },
  {
    name: "Trend Propagation (TP)",
    definition: "Extent to which stories from a source appear across multiple communities",
    formula: "TP = Cross-posted or Shared Stories / Total Stories from Source",
    interpretation: "Detects whether a sub seeds discussions beyond itself.",
    example: "'Small wins journaling' from r/MentalHealth also seen in r/DecidingToBeBetter → TP > 0.",
    score: 16
  },
  {
    name: "Volume Reliability (VR)",
    definition: "Stability of post inflow from this community over time",
    formula: "VR = Posts Collected in Period / Period Length",
    interpretation: "Ensures you're not optimizing around short-lived spikes (posts per time unit).",
    example: "r/Evernote ≈ 8 posts/day (stable) vs r/ZenHabits ≈ 1/week (low VR).",
    score: 71
  },
  {
    name: "Signal Density (SD)",
    definition: "Stories produced per 1k tokens consumed",
    formula: "SD = Stories Extracted / (Tokens Consumed / 1000)",
    interpretation: "Efficiency: how many useful stories per compute/token cost.",
    example: "r/Zettelkasten: 5 stories / 6k tokens → SD ≈ 0.83 vs r/Notion = 0.00.",
    score: 59
  },
  {
    name: "Conversion Momentum (CM)",
    definition: "Change in story yield across time slices (rate of change in SY)",
    formula: "CM = (SY_t - SY_t-1) / Δt",
    interpretation: "Measures whether a sub's usefulness is increasing or declining.",
    example: "r/Therapy improved from SY 40% → 70% over two weeks → positive CM.",
    score: 57
  }
];

export default function MetricsTable() {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-white/20">
            <th className="text-left p-4 text-sm font-semibold text-gray-400">Metric</th>
            <th className="text-left p-4 text-sm font-semibold text-gray-400">Definition</th>
            <th className="text-left p-4 text-sm font-semibold text-gray-400">Formula</th>
            <th className="text-left p-4 text-sm font-semibold text-gray-400">Score</th>
          </tr>
        </thead>
        <tbody>
          {metrics.map((metric, index) => (
            <tr key={index} className="border-b border-white/10 hover:bg-white/5">
              <td className="p-4">
                <div className="font-medium text-white">{metric.name}</div>
              </td>
              <td className="p-4">
                <div className="text-sm text-gray-300">{metric.definition}</div>
              </td>
              <td className="p-4">
                <code className="text-xs bg-black/50 px-2 py-1 rounded text-gray-400">
                  {metric.formula}
                </code>
              </td>
              <td className="p-4">
                <span className={cn("font-bold text-lg", getScoreColor(metric.score))}>
                  {metric.score}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}