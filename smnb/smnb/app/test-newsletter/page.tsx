/**
 * Newsletter Test Page - Quick way to verify newsletter formatting is working
 */

'use client'

import React, { useState } from 'react';
import NewsletterPreview from '@/components/editor/NewsletterPreview';
import { Button } from '@/components/ui/button';

export default function TestNewsletterPage() {
  const [showRaw, setShowRaw] = useState(false);

  const testContent = `
    <div class="newsletter-display">SMNB Breaking News Alert</div>
    <p class="newsletter-lead">
      This is a test of the newsletter formatting system to ensure all styles are properly applied and displaying correctly.
    </p>
    
    <h1 class="newsletter-h1">Major Story Breaking</h1>
    
    <p class="newsletter-body">
      Today's developments mark a significant turning point in how we understand the interconnected nature of modern digital communications and social media platforms.
    </p>

    <h2 class="newsletter-h2">Key Developments</h2>
    
    <ul class="newsletter-list">
      <li>First major development with significant impact</li>
      <li>Secondary development showing broad trends</li>
      <li>Third point highlighting future implications</li>
    </ul>

    <div class="newsletter-blockquote">
      This represents a fundamental shift in how we approach digital content curation and delivery, with implications that will be felt across the industry for years to come.
    </div>

    <h3 class="newsletter-h3">Analysis & Impact</h3>
    
    <p class="newsletter-body">
      The strategic implications of these developments extend far beyond immediate market reactions, suggesting a new paradigm for how audiences consume and interact with news content.
    </p>

    <div class="newsletter-pullquote">
      "The future of news is being written in real-time, and we're all part of the story."
    </div>

    <div class="newsletter-divider"></div>

    <div class="grid grid-cols-3 gap-6 my-8">
      <div class="text-center">
        <div class="newsletter-stat">+15.3%</div>
        <div class="newsletter-stat-label">Engagement</div>
      </div>
      <div class="text-center">
        <div class="newsletter-stat">2.4M</div>
        <div class="newsletter-stat-label">Readers</div>
      </div>
      <div class="text-center">
        <div class="newsletter-stat">98%</div>
        <div class="newsletter-stat-label">Accuracy</div>
      </div>
    </div>

    <h4 class="newsletter-h4">Looking Forward</h4>
    
    <p class="newsletter-body">
      As we move into the next phase of digital journalism, the emphasis on AI-driven content curation and intelligent narrative generation will become increasingly important for maintaining audience engagement and delivering value.
    </p>
  `;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            🧪 Newsletter Formatting Test
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            Verify that your newsletter CSS classes are working properly
          </p>
          
          <div className="flex gap-4 justify-center">
            <Button 
              onClick={() => setShowRaw(!showRaw)}
              variant={showRaw ? "default" : "outline"}
            >
              {showRaw ? "Hide" : "Show"} Raw HTML
            </Button>
            
            <Button 
              onClick={() => window.open('/newsletter-preview', '_blank')}
              variant="outline"
            >
              Open Full Preview
            </Button>
          </div>
        </div>

        {/* Test Results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Rendered Newsletter */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              📖 Rendered Newsletter
            </h2>
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <div 
                className="newsletter-content prose prose-lg dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: testContent }}
              />
            </div>
          </div>

          {/* Official Newsletter Preview */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              ✨ Official Newsletter Preview
            </h2>
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <NewsletterPreview />
            </div>
          </div>
        </div>

        {/* Raw HTML Display */}
        {showRaw && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              🔧 Raw HTML with Classes
            </h2>
            <div className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-6">
              <pre className="text-sm font-mono text-gray-800 dark:text-gray-200 whitespace-pre-wrap overflow-x-auto">
                {testContent.trim()}
              </pre>
            </div>
          </div>
        )}

        {/* Diagnostic Info */}
        <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-4">
            🔍 Diagnostic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Expected Styling:</h4>
              <ul className="text-blue-700 dark:text-blue-300 space-y-1">
                <li>✅ Large display title (5.5rem)</li>
                <li>✅ Serif headlines (Crimson Text)</li>
                <li>✅ Sans-serif body (Inter)</li>
                <li>✅ Proper visual hierarchy</li>
                <li>✅ Newsletter-style blockquotes</li>
                <li>✅ Stats display formatting</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">CSS Files:</h4>
              <ul className="text-blue-700 dark:text-blue-300 space-y-1">
                <li>📄 /styles/newsletter.css</li>
                <li>📄 /app/globals.css (ProseMirror)</li>
                <li>🎨 Font imports (Google Fonts)</li>
                <li>🌙 Dark mode support</li>
                <li>📱 Responsive design</li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}