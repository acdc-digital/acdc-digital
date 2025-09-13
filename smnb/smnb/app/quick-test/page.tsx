/**
 * Quick Newsletter Generation Test
 * Tests the newsletter button functionality directly
 */

'use client'

import React, { useState, useEffect } from 'react';
import TipTapEditor from '@/components/editor/TipTapEditor';
import { Button } from '@/components/ui/button';
import { useEditorStore, useEditorActions } from '@/lib/stores/editorStore';

export default function QuickNewsletterTest() {
  const [testContent, setTestContent] = useState('');
  const actions = useEditorActions();
  
  // Sample news content for testing
  const sampleContent = `Breaking: Major Technology Advancement Announced

A groundbreaking development in artificial intelligence has been unveiled today, promising to revolutionize how we interact with digital content and automated systems.

Key highlights include:
- Advanced natural language processing capabilities
- Real-time content generation and optimization  
- Seamless integration with existing workflows
- Enhanced user experience across multiple platforms

Industry experts are calling this a "paradigm shift" that could reshape the technological landscape for years to come. The implications extend far beyond immediate applications, suggesting new possibilities for human-AI collaboration.

Early testing shows remarkable improvements in accuracy and user satisfaction, with initial deployments exceeding performance expectations by significant margins.`;

  const loadSampleContent = () => {
    // Load sample content into the editor store
    actions.setContent({
      html: sampleContent,
      text: sampleContent,
      wordCount: sampleContent.split(' ').length,
      characterCount: sampleContent.length,
      lastModified: Date.now()
    });
    
    // Set producer content to simulate receiving from live feed
    useEditorStore.setState({
      producerContent: {
        storyId: 'test-story-' + Date.now() as any, // Temporary ID for testing
        content: sampleContent,
        handoffTimestamp: Date.now(),
        metadata: {
          title: 'Breaking: Major Technology Advancement Announced',
          summary: 'Major AI technology advancement announced with industry-wide implications',
          tags: ['technology', 'ai', 'breaking'],
          sentiment: 'positive',
          priority: 0.9
        }
      }
    });
    
    console.log('📝 Loaded sample content for newsletter testing');
  };

  const clearContent = () => {
    actions.setContent({
      html: '',
      text: '',
      wordCount: 0,
      characterCount: 0,
      lastModified: Date.now()
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            ⚡ Newsletter Generation Test
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            Test the newsletter formatting button and verify AI generation works properly
          </p>
          
          <div className="flex gap-4 justify-center">
            <Button 
              onClick={loadSampleContent}
              variant="default"
            >
              📝 Load Sample Content
            </Button>
            
            <Button 
              onClick={clearContent}
              variant="outline"
            >
              🗑️ Clear Editor
            </Button>
            
            <Button 
              onClick={() => window.open('/newsletter-preview', '_blank')}
              variant="outline"
            >
              📖 View Newsletter Preview
            </Button>
          </div>
        </div>

        {/* Instructions */}
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            📋 Test Instructions:
          </h2>
          <ol className="text-blue-800 dark:text-blue-200 space-y-2">
            <li>1. Click "Load Sample Content" to add test content to the editor</li>
            <li>2. Click the purple "Newsletter" button in the editor toolbar</li>
            <li>3. Watch as AI transforms the content with proper newsletter formatting</li>
            <li>4. Verify that headings, paragraphs, and styling are applied correctly</li>
            <li>5. Check that the formatted content matches the newsletter design system</li>
          </ol>
        </div>

        {/* Editor */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <div className="h-96">
            <TipTapEditor 
              className="h-full"
              autoFocus={false}
            />
          </div>
        </div>

        {/* Status Panel */}
        <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
            🔍 Test Status
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Expected Result:</h4>
              <ul className="text-gray-700 dark:text-gray-300 space-y-1">
                <li>✅ Large newsletter-style headline</li>
                <li>✅ Proper font hierarchy (serif/sans)</li>
                <li>✅ Newsletter body paragraph styling</li>
                <li>✅ Formatted bullet points</li>
                <li>✅ Professional blockquote styling</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">CSS Classes Applied:</h4>
              <ul className="text-gray-700 dark:text-gray-300 space-y-1">
                <li>• newsletter-h1 (headlines)</li>
                <li>• newsletter-h2 (subheads)</li>
                <li>• newsletter-body (paragraphs)</li>
                <li>• newsletter-list (bullets)</li>
                <li>• newsletter-blockquote (quotes)</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Troubleshooting:</h4>
              <ul className="text-gray-700 dark:text-gray-300 space-y-1">
                <li>• Check browser console for errors</li>
                <li>• Verify AI API key is configured</li>
                <li>• Ensure newsletter.css is loaded</li>
                <li>• Check TipTap editor classes</li>
                <li>• Verify streaming is working</li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}