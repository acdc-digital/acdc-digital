'use client';

import React from 'react';

export default function UnifiedScoringArticle() {
  return (
    <div className="h-full overflow-y-auto p-8 bg-[#1a1a1a]">
      <article className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="mb-12 border-b border-white/20 pb-6">
          <h1 className="text-4xl font-bold text-white mb-4">
            SMNB Unified Scoring System
          </h1>
          <p className="text-xl text-gray-400">
            Executive Summary
          </p>
        </header>

        {/* Executive Summary */}
        <section className="mb-12">
          <p className="text-gray-300 text-lg leading-relaxed mb-6">
            The SMNB Unified Scoring System is a real-time, event-driven intelligence engine that transforms raw Reddit data into actionable insights for content generation. Built on an append-only event log architecture, the system processes enrichment events through a sophisticated pipeline that tracks four core Engine metrics across multiple time windows and dimensions.
          </p>

          <div className="bg-black/40 border border-white/10 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-semibold text-white mb-4">System Architecture Overview</h3>
            <ol className="space-y-3 text-gray-300">
              <li><strong className="text-white">1. Data Enrichment Pipeline:</strong> Reddit posts → NLP processing → Enrichment events → Event log</li>
              <li><strong className="text-white">2. Engine Metrics:</strong> Real-time computation of RC, NI, TP, CM across 1m/5m/15m/60m windows</li>
              <li><strong className="text-white">3. Story Generation:</strong> Host AI converts enriched posts into narrative content</li>
              <li><strong className="text-white">4. Sentiment Analysis:</strong> Nasdaq-100 stock sentiment tracking from Reddit discussions</li>
            </ol>
          </div>

          <p className="text-gray-300 leading-relaxed mb-6">
            This document explains the complete data flow, metric calculations, and how everything integrates to power SMNB&apos;s content generation system.
          </p>
        </section>

        <hr className="my-12 border-white/20" />

        {/* Part 1: Data Enrichment Pipeline */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">Part 1: Data Enrichment Pipeline</h2>
          
          <h3 className="text-2xl font-semibold text-white mb-4">Overview</h3>
          <p className="text-gray-300 leading-relaxed mb-6">
            Before any metrics can be calculated, raw Reddit posts must be enriched with semantic metadata. The enrichment pipeline is the foundation of the entire system, transforming unstructured social media content into structured, analyzable data.
          </p>

          <h3 className="text-2xl font-semibold text-white mb-4 mt-8">The Enrichment Process</h3>
          
          {/* Step 1 */}
          <div className="mb-8">
            <h4 className="text-xl font-semibold text-white mb-3">Step 1: Reddit Data Collection</h4>
            <p className="text-gray-300 leading-relaxed mb-4">
              Posts are collected from curated subreddit sources relevant to productivity, mental health, technology, and personal development. Each post contains:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 text-gray-300">
              <li><strong className="text-white">Post ID:</strong> Unique Reddit identifier</li>
              <li><strong className="text-white">Session ID:</strong> Tracking ID for the collection session</li>
              <li><strong className="text-white">Subreddit:</strong> Source community (e.g., r/Productivity, r/MentalHealth)</li>
              <li><strong className="text-white">Content:</strong> Post title, body, and metadata</li>
              <li><strong className="text-white">Engagement:</strong> Upvotes, comments, shares</li>
              <li><strong className="text-white">Thread ID:</strong> Parent discussion thread (for comment chains)</li>
            </ul>
          </div>

          {/* Step 2 */}
          <div className="mb-8">
            <h4 className="text-xl font-semibold text-white mb-3">Step 2: NLP & Semantic Enrichment</h4>
            <p className="text-gray-300 leading-relaxed mb-4">
              Each post is processed through natural language processing to extract semantic metadata:
            </p>
            
            <div className="overflow-x-auto mb-6">
              <table className="w-full border-collapse border border-white/20 rounded-lg">
                <thead>
                  <tr className="bg-white/5">
                    <th className="border border-white/10 px-4 py-3 text-left font-semibold text-white">Component</th>
                    <th className="border border-white/10 px-4 py-3 text-left font-semibold text-white">Description</th>
                    <th className="border border-white/10 px-4 py-3 text-left font-semibold text-white">Example Output</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-white/5">
                    <td className="border border-white/10 px-4 py-3 text-white font-semibold">Entities</td>
                    <td className="border border-white/10 px-4 py-3 text-gray-300">Named entities (people, tools, concepts)</td>
                    <td className="border border-white/10 px-4 py-3 text-gray-300">[&quot;Notion&quot;, &quot;GTD&quot;, &quot;David Allen&quot;]</td>
                  </tr>
                  <tr className="hover:bg-white/5">
                    <td className="border border-white/10 px-4 py-3 text-white font-semibold">Sentiment</td>
                    <td className="border border-white/10 px-4 py-3 text-gray-300">Emotional tone (0.0 = negative, 1.0 = positive)</td>
                    <td className="border border-white/10 px-4 py-3 text-gray-300">0.78 (positive)</td>
                  </tr>
                  <tr className="hover:bg-white/5">
                    <td className="border border-white/10 px-4 py-3 text-white font-semibold">Quality</td>
                    <td className="border border-white/10 px-4 py-3 text-gray-300">Content quality score (0-100)</td>
                    <td className="border border-white/10 px-4 py-3 text-gray-300">85</td>
                  </tr>
                  <tr className="hover:bg-white/5">
                    <td className="border border-white/10 px-4 py-3 text-white font-semibold">Categories</td>
                    <td className="border border-white/10 px-4 py-3 text-gray-300">Topical classifications</td>
                    <td className="border border-white/10 px-4 py-3 text-gray-300">[&quot;productivity&quot;, &quot;time-management&quot;]</td>
                  </tr>
                  <tr className="hover:bg-white/5">
                    <td className="border border-white/10 px-4 py-3 text-white font-semibold">Thread Context</td>
                    <td className="border border-white/10 px-4 py-3 text-gray-300">Related discussion chains</td>
                    <td className="border border-white/10 px-4 py-3 text-gray-300">&quot;thread_123abc&quot;</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-black/40 border border-white/10 rounded-lg p-4">
              <p className="font-semibold text-white mb-2">Quality Scoring Factors:</p>
              <ul className="list-disc list-inside space-y-1 ml-4 text-gray-300">
                <li>Content depth and substance</li>
                <li>Writing clarity and coherence</li>
                <li>Community engagement signals</li>
                <li>Factual accuracy indicators</li>
                <li>Originality and insight value</li>
              </ul>
            </div>
          </div>

          {/* Step 3 */}
          <div className="mb-8">
            <h4 className="text-xl font-semibold text-white mb-3">Step 3: Event Emission</h4>
            <p className="text-gray-300 leading-relaxed mb-4">
              Once enrichment is complete, the system emits a <strong className="text-white">post_enriched</strong> event to the append-only event log:
            </p>
            
            <pre className="bg-black/50 border border-white/10 p-4 rounded-lg mb-4 overflow-x-auto text-sm">
              <code className="text-green-400 font-mono">{`{
  kind: "post_enriched",
  at: 1729872000000,                    // Timestamp (ms)
  post_id: "abc123",
  session_id: "session_456",
  subreddit: "Productivity",
  entities: ["Notion", "GTD"],
  sentiment: 0.78,
  quality: 85,
  categories: ["productivity", "time-management"],
  engagement: { upvotes: 42, comments: 8 },
  thread_id: "thread_123abc",
  processed: false                      // Not yet applied to metrics
}`}</code>
            </pre>

            <div className="bg-black/40 border border-white/10 rounded-lg p-4">
              <p className="font-semibold text-white mb-2">Event Log Properties:</p>
              <ul className="list-disc list-inside space-y-1 ml-4 text-gray-300">
                <li><strong className="text-white">Append-only:</strong> Events are never modified or deleted</li>
                <li><strong className="text-white">Ordered by timestamp:</strong> Chronological processing</li>
                <li><strong className="text-white">Idempotent processing:</strong> Events can be replayed safely</li>
                <li><strong className="text-white">Dimension-aware:</strong> Events generate metrics for global, subreddit, session, entity, and thread dimensions</li>
              </ul>
            </div>
          </div>

          {/* Step 4 */}
          <div className="mb-8">
            <h4 className="text-xl font-semibold text-white mb-3">Step 4: Story Creation</h4>
            <p className="text-gray-300 leading-relaxed mb-4">
              After enrichment, selected posts are transformed into narrative stories by the Host AI system. This generates a <strong className="text-white">story_created</strong> event:
            </p>
            
            <pre className="bg-black/50 border border-white/10 p-4 rounded-lg mb-4 overflow-x-auto text-sm">
              <code className="text-green-400 font-mono">{`{
  kind: "story_created",
  at: 1729872060000,
  post_id: "abc123",
  story_id: "story_789",
  session_id: "session_456",
  subreddit: "Productivity",
  entities: ["Notion", "GTD"],
  sentiment: 0.78,
  quality: 85,
  categories: ["productivity"],
  story_themes: ["productivity-systems", "digital-tools"],
  story_concepts: ["knowledge management", "workflow optimization"],
  is_cross_post: false,
  processed: false
}`}</code>
            </pre>

            <div className="bg-black/40 border border-white/10 rounded-lg p-4">
              <p className="font-semibold text-white mb-2">Story-Specific Metadata:</p>
              <ul className="list-disc list-inside space-y-1 ml-4 text-gray-300">
                <li><strong className="text-white">story_themes:</strong> High-level thematic categories (used for RC calculation)</li>
                <li><strong className="text-white">story_concepts:</strong> Unique ideas/concepts (used for NI calculation)</li>
                <li><strong className="text-white">is_cross_post:</strong> Whether story appeared in multiple subreddits (used for TP calculation)</li>
              </ul>
            </div>
          </div>
        </section>

        <hr className="my-12 border-white/20" />

        {/* Part 2: Engine Metrics */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">Part 2: Engine Metrics (RC, NI, TP, CM)</h2>
          
          <h3 className="text-2xl font-semibold text-white mb-4">Overview</h3>
          <p className="text-gray-300 leading-relaxed mb-6">
            The Engine tracks <strong className="text-white">four core metrics</strong> that measure content quality, novelty, reach, and growth. These metrics are computed in real-time from enrichment events and stored in time-windowed buckets for each dimension.
          </p>

          <div className="overflow-x-auto mb-8">
            <table className="w-full border-collapse border border-white/20 rounded-lg">
              <thead>
                <tr className="bg-white/5">
                  <th className="border border-white/10 px-4 py-3 text-left font-semibold text-white">Symbol</th>
                  <th className="border border-white/10 px-4 py-3 text-left font-semibold text-white">Metric Name</th>
                  <th className="border border-white/10 px-4 py-3 text-left font-semibold text-white">Type</th>
                  <th className="border border-white/10 px-4 py-3 text-left font-semibold text-white">Range</th>
                  <th className="border border-white/10 px-4 py-3 text-left font-semibold text-white">Purpose</th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-white/5">
                  <td className="border border-white/10 px-4 py-3 text-white font-bold">RC</td>
                  <td className="border border-white/10 px-4 py-3 text-gray-300">Relevance Consistency</td>
                  <td className="border border-white/10 px-4 py-3 text-gray-300">Percentage</td>
                  <td className="border border-white/10 px-4 py-3 text-gray-300">0-100%</td>
                  <td className="border border-white/10 px-4 py-3 text-gray-300">Measures theme alignment</td>
                </tr>
                <tr className="hover:bg-white/5">
                  <td className="border border-white/10 px-4 py-3 text-white font-bold">NI</td>
                  <td className="border border-white/10 px-4 py-3 text-gray-300">Novelty Index</td>
                  <td className="border border-white/10 px-4 py-3 text-gray-300">Count</td>
                  <td className="border border-white/10 px-4 py-3 text-gray-300">0-∞</td>
                  <td className="border border-white/10 px-4 py-3 text-gray-300">Tracks unique concepts</td>
                </tr>
                <tr className="hover:bg-white/5">
                  <td className="border border-white/10 px-4 py-3 text-white font-bold">TP</td>
                  <td className="border border-white/10 px-4 py-3 text-gray-300">Trend Propagation</td>
                  <td className="border border-white/10 px-4 py-3 text-gray-300">Percentage</td>
                  <td className="border border-white/10 px-4 py-3 text-gray-300">0-100%</td>
                  <td className="border border-white/10 px-4 py-3 text-gray-300">Monitors viral potential</td>
                </tr>
                <tr className="hover:bg-white/5">
                  <td className="border border-white/10 px-4 py-3 text-white font-bold">CM</td>
                  <td className="border border-white/10 px-4 py-3 text-gray-300">Conversion Momentum</td>
                  <td className="border border-white/10 px-4 py-3 text-gray-300">Percentage</td>
                  <td className="border border-white/10 px-4 py-3 text-gray-300">-100% to +100%</td>
                  <td className="border border-white/10 px-4 py-3 text-gray-300">Tracks story yield change</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Metric 1: RC */}
          <div className="mb-10">
            <h3 className="text-2xl font-semibold text-white mb-4 mt-8">Metric 1: RC (Relevance Consistency)</h3>
            
            <div className="bg-gradient-to-r from-blue-900/30 to-blue-800/20 border border-blue-500/30 rounded-lg p-6 mb-6">
              <h4 className="text-lg font-semibold text-white mb-3">Definition</h4>
              <p className="text-gray-300 leading-relaxed">
                <strong className="text-white">Relevance Consistency</strong> measures the percentage of stories that align with SMNB&apos;s core thematic categories. It answers the question: <em className="text-blue-300">&quot;Are we generating content that matches our brand identity?&quot;</em>
              </p>
            </div>

            <div className="bg-black/40 border border-white/10 rounded-lg p-6 mb-6">
              <h4 className="text-lg font-semibold text-white mb-3">Calculation Formula</h4>
              <pre className="bg-black/50 p-4 rounded text-green-400 font-mono text-sm">
                RC = (stories_aligned / stories_total) × 100
              </pre>
              <p className="text-gray-400 text-sm mt-2">
                Where <strong className="text-white">stories_aligned</strong> = stories with at least one story_theme tag
              </p>
            </div>

            <div className="overflow-x-auto mb-6">
              <p className="text-gray-300 mb-3">A story is considered &quot;aligned&quot; if the <code className="bg-black/50 px-2 py-1 rounded text-gray-400 text-sm font-mono">story_themes</code> array contains at least one theme tag:</p>
              <table className="w-full border-collapse border border-white/20 rounded-lg">
                <thead>
                  <tr className="bg-white/5">
                    <th className="border border-white/10 px-4 py-3 text-left font-semibold text-white">RC Value</th>
                    <th className="border border-white/10 px-4 py-3 text-left font-semibold text-white">Performance</th>
                    <th className="border border-white/10 px-4 py-3 text-left font-semibold text-white">Meaning</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-white/5">
                    <td className="border border-white/10 px-4 py-3 text-white font-bold">80-100%</td>
                    <td className="border border-white/10 px-4 py-3"><span className="text-green-400">🟢 Excellent</span></td>
                    <td className="border border-white/10 px-4 py-3 text-gray-300">Highly consistent brand alignment</td>
                  </tr>
                  <tr className="hover:bg-white/5">
                    <td className="border border-white/10 px-4 py-3 text-white font-bold">60-79%</td>
                    <td className="border border-white/10 px-4 py-3"><span className="text-yellow-400">🟡 Good</span></td>
                    <td className="border border-white/10 px-4 py-3 text-gray-300">Solid thematic consistency</td>
                  </tr>
                  <tr className="hover:bg-white/5">
                    <td className="border border-white/10 px-4 py-3 text-white font-bold">40-59%</td>
                    <td className="border border-white/10 px-4 py-3"><span className="text-orange-400">🟠 Fair</span></td>
                    <td className="border border-white/10 px-4 py-3 text-gray-300">Mixed relevance, needs tuning</td>
                  </tr>
                  <tr className="hover:bg-white/5">
                    <td className="border border-white/10 px-4 py-3 text-white font-bold">0-39%</td>
                    <td className="border border-white/10 px-4 py-3"><span className="text-red-400">🔴 Poor</span></td>
                    <td className="border border-white/10 px-4 py-3 text-gray-300">Off-topic content, review sources</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Metric 2: NI */}
          <div className="mb-10">
            <h3 className="text-2xl font-semibold text-white mb-4 mt-8">Metric 2: NI (Novelty Index)</h3>
            
            <div className="bg-gradient-to-r from-purple-900/30 to-purple-800/20 border border-purple-500/30 rounded-lg p-6 mb-6">
              <h4 className="text-lg font-semibold text-white mb-3">Definition</h4>
              <p className="text-gray-300 leading-relaxed">
                <strong className="text-white">Novelty Index</strong> counts the number of unique concepts identified across all stories in a time window. It measures content diversity and innovation, answering: <em className="text-purple-300">&quot;Are we discovering fresh ideas or repeating ourselves?&quot;</em>
              </p>
            </div>

            <div className="bg-black/40 border border-white/10 rounded-lg p-6 mb-6">
              <h4 className="text-lg font-semibold text-white mb-3">Calculation Formula</h4>
              <pre className="bg-black/50 p-4 rounded text-green-400 font-mono text-sm">
                NI = count(unique_concepts)
              </pre>
              <p className="text-gray-400 text-sm mt-2">
                Concepts are extracted from <code className="bg-black/50 px-1 rounded text-gray-400">story_concepts</code> array - duplicates counted only once per window
              </p>
            </div>

            <div className="overflow-x-auto mb-6">
              <table className="w-full border-collapse border border-white/20 rounded-lg">
                <thead>
                  <tr className="bg-white/5">
                    <th className="border border-white/10 px-4 py-3 text-left font-semibold text-white">NI Value</th>
                    <th className="border border-white/10 px-4 py-3 text-left font-semibold text-white">Performance</th>
                    <th className="border border-white/10 px-4 py-3 text-left font-semibold text-white">Meaning</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-white/5">
                    <td className="border border-white/10 px-4 py-3 text-white font-bold">40+</td>
                    <td className="border border-white/10 px-4 py-3"><span className="text-green-400">🟢 Excellent</span></td>
                    <td className="border border-white/10 px-4 py-3 text-gray-300">High diversity, many unique ideas</td>
                  </tr>
                  <tr className="hover:bg-white/5">
                    <td className="border border-white/10 px-4 py-3 text-white font-bold">20-39</td>
                    <td className="border border-white/10 px-4 py-3"><span className="text-yellow-400">🟡 Good</span></td>
                    <td className="border border-white/10 px-4 py-3 text-gray-300">Healthy variety of concepts</td>
                  </tr>
                  <tr className="hover:bg-white/5">
                    <td className="border border-white/10 px-4 py-3 text-white font-bold">10-19</td>
                    <td className="border border-white/10 px-4 py-3"><span className="text-orange-400">🟠 Fair</span></td>
                    <td className="border border-white/10 px-4 py-3 text-gray-300">Some repetition, limited novelty</td>
                  </tr>
                  <tr className="hover:bg-white/5">
                    <td className="border border-white/10 px-4 py-3 text-white font-bold">0-9</td>
                    <td className="border border-white/10 px-4 py-3"><span className="text-red-400">🔴 Poor</span></td>
                    <td className="border border-white/10 px-4 py-3 text-gray-300">Highly repetitive content</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Metric 3: TP */}
          <div className="mb-10">
            <h3 className="text-2xl font-semibold text-white mb-4 mt-8">Metric 3: TP (Trend Propagation)</h3>
            
            <div className="bg-gradient-to-r from-orange-900/30 to-orange-800/20 border border-orange-500/30 rounded-lg p-6 mb-6">
              <h4 className="text-lg font-semibold text-white mb-3">Definition</h4>
              <p className="text-gray-300 leading-relaxed">
                <strong className="text-white">Trend Propagation</strong> measures the percentage of stories that originated as cross-posts (posts appearing in multiple subreddits). It indicates viral potential and cross-community reach, answering: <em className="text-orange-300">&quot;Are we capturing trending conversations?&quot;</em>
              </p>
            </div>

            <div className="bg-black/40 border border-white/10 rounded-lg p-6 mb-6">
              <h4 className="text-lg font-semibold text-white mb-3">Calculation Formula</h4>
              <pre className="bg-black/50 p-4 rounded text-green-400 font-mono text-sm">
                TP = (stories_cross_post / stories_total) × 100
              </pre>
              <p className="text-gray-400 text-sm mt-2">
                Where <strong className="text-white">stories_cross_post</strong> = stories where is_cross_post = true
              </p>
            </div>

            <div className="overflow-x-auto mb-6">
              <table className="w-full border-collapse border border-white/20 rounded-lg">
                <thead>
                  <tr className="bg-white/5">
                    <th className="border border-white/10 px-4 py-3 text-left font-semibold text-white">TP Value</th>
                    <th className="border border-white/10 px-4 py-3 text-left font-semibold text-white">Performance</th>
                    <th className="border border-white/10 px-4 py-3 text-left font-semibold text-white">Meaning</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-white/5">
                    <td className="border border-white/10 px-4 py-3 text-white font-bold">30%+</td>
                    <td className="border border-white/10 px-4 py-3"><span className="text-green-400">🟢 Excellent</span></td>
                    <td className="border border-white/10 px-4 py-3 text-gray-300">High viral potential, trending content</td>
                  </tr>
                  <tr className="hover:bg-white/5">
                    <td className="border border-white/10 px-4 py-3 text-white font-bold">15-29%</td>
                    <td className="border border-white/10 px-4 py-3"><span className="text-yellow-400">🟡 Good</span></td>
                    <td className="border border-white/10 px-4 py-3 text-gray-300">Moderate cross-community reach</td>
                  </tr>
                  <tr className="hover:bg-white/5">
                    <td className="border border-white/10 px-4 py-3 text-white font-bold">5-14%</td>
                    <td className="border border-white/10 px-4 py-3"><span className="text-orange-400">🟠 Fair</span></td>
                    <td className="border border-white/10 px-4 py-3 text-gray-300">Limited propagation</td>
                  </tr>
                  <tr className="hover:bg-white/5">
                    <td className="border border-white/10 px-4 py-3 text-white font-bold">0-4%</td>
                    <td className="border border-white/10 px-4 py-3"><span className="text-red-400">🔴 Low</span></td>
                    <td className="border border-white/10 px-4 py-3 text-gray-300">Isolated content, low viral reach</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Metric 4: CM */}
          <div className="mb-10">
            <h3 className="text-2xl font-semibold text-white mb-4 mt-8">Metric 4: CM (Conversion Momentum)</h3>
            
            <div className="bg-gradient-to-r from-green-900/30 to-green-800/20 border border-green-500/30 rounded-lg p-6 mb-6">
              <h4 className="text-lg font-semibold text-white mb-3">Definition</h4>
              <p className="text-gray-300 leading-relaxed">
                <strong className="text-white">Conversion Momentum</strong> tracks the rate of change in story yield (stories per post) compared to the previous bucket. It measures efficiency trends, answering: <em className="text-green-300">&quot;Is our content generation improving or declining?&quot;</em>
              </p>
            </div>

            <div className="bg-black/40 border border-white/10 rounded-lg p-6 mb-6">
              <h4 className="text-lg font-semibold text-white mb-3">Calculation Formula</h4>
              <pre className="bg-black/50 p-4 rounded text-green-400 font-mono text-sm whitespace-pre-wrap">
{`Story Yield = stories_total / posts_total

CM = ((Story Yield_current - Story Yield_previous) / Story Yield_previous) × 100`}
              </pre>
              <p className="text-gray-400 text-sm mt-2">
                Positive CM = improving efficiency | Negative CM = declining efficiency
              </p>
            </div>

            <div className="overflow-x-auto mb-6">
              <table className="w-full border-collapse border border-white/20 rounded-lg">
                <thead>
                  <tr className="bg-white/5">
                    <th className="border border-white/10 px-4 py-3 text-left font-semibold text-white">CM Value</th>
                    <th className="border border-white/10 px-4 py-3 text-left font-semibold text-white">Performance</th>
                    <th className="border border-white/10 px-4 py-3 text-left font-semibold text-white">Meaning</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-white/5">
                    <td className="border border-white/10 px-4 py-3 text-white font-bold">+20% or more</td>
                    <td className="border border-white/10 px-4 py-3"><span className="text-green-400">🟢 Excellent</span></td>
                    <td className="border border-white/10 px-4 py-3 text-gray-300">Rapidly improving efficiency</td>
                  </tr>
                  <tr className="hover:bg-white/5">
                    <td className="border border-white/10 px-4 py-3 text-white font-bold">+5% to +19%</td>
                    <td className="border border-white/10 px-4 py-3"><span className="text-yellow-400">🟡 Good</span></td>
                    <td className="border border-white/10 px-4 py-3 text-gray-300">Steady improvement</td>
                  </tr>
                  <tr className="hover:bg-white/5">
                    <td className="border border-white/10 px-4 py-3 text-white font-bold">-5% to +5%</td>
                    <td className="border border-white/10 px-4 py-3"><span className="text-gray-400">⚪ Stable</span></td>
                    <td className="border border-white/10 px-4 py-3 text-gray-300">Consistent performance</td>
                  </tr>
                  <tr className="hover:bg-white/5">
                    <td className="border border-white/10 px-4 py-3 text-white font-bold">-6% to -19%</td>
                    <td className="border border-white/10 px-4 py-3"><span className="text-orange-400">🟠 Declining</span></td>
                    <td className="border border-white/10 px-4 py-3 text-gray-300">Efficiency dropping</td>
                  </tr>
                  <tr className="hover:bg-white/5">
                    <td className="border border-white/10 px-4 py-3 text-white font-bold">-20% or worse</td>
                    <td className="border border-white/10 px-4 py-3"><span className="text-red-400">🔴 Poor</span></td>
                    <td className="border border-white/10 px-4 py-3 text-gray-300">Significant degradation</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <hr className="my-12 border-white/20" />

        {/* Footer Note */}
        <section className="mb-8">
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-3">📊 Real-Time Dashboard</h3>
            <p className="text-gray-300 leading-relaxed">
              All metrics are computed in real-time and displayed across multiple dimensions (global, subreddit, session, entity, thread) with time-windowed views (1m, 5m, 15m, 60m). The system processes enrichment events every 10 seconds to maintain up-to-date intelligence for content generation.
            </p>
          </div>
        </section>
      </article>
    </div>
  );
}
