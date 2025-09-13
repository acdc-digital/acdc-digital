/**
 * AI Formatting Controls Component
 * Provides AI-driven formatting capabilities for dynamic blog post styling
 */

'use client';

import React from 'react';
import { Editor } from '@tiptap/react';
import { 
  Type, 
  Sparkles,
  FileText,
  BarChart3,
  MessageSquare,
  Zap,
  Check,
  Home
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useEditorActions, useEditorStatus, useEditorStore } from '../../lib/stores/editorStore';
import { ContentType } from '../../lib/types/editor';
import { convertMarkdownToHTML, isMarkdownContent } from '../../lib/utils/markdownConverter';

interface AIFormattingControlsProps {
  editor: Editor | null;
  storyId?: string; // Story ID for persistence
  className?: string;
}

export default function AIFormattingControls({ editor, storyId, className }: AIFormattingControlsProps) {
  const actions = useEditorActions();
  const status = useEditorStatus();
  const { 
    currentStoryId, 
    checkContentExists, 
    loadContent, 
    setCurrentStory, 
    isAIProcessing,
    setCurrentContentType,
    getContentForType,
    preserveContentForType,
    hasGeneratedContent,
    clearGeneratedContent
  } = useEditorStore();
  const [streamingType, setStreamingType] = React.useState<ContentType | null>(null);

  // Track which content types exist for this story (including in-memory generated content)
  const [contentExists, setContentExists] = React.useState<Record<ContentType, boolean>>({
    home: false,
    blog: false,
    newsletter: false,
    analysis: false,
    social: false,
    context: false
  });

  if (!editor) return null;

  // Set current story if provided
  React.useEffect(() => {
    if (storyId && storyId !== currentStoryId) {
      setCurrentStory(storyId);
    }
  }, [storyId, currentStoryId, setCurrentStory]);

  // Check which content types exist when story changes
  React.useEffect(() => {
    if (storyId) {
      const checkAllContent = async () => {
        const contentTypes: ContentType[] = ['home', 'blog', 'newsletter', 'analysis', 'social', 'context'];
        const results: Record<ContentType, boolean> = {
          home: false,
          blog: false,
          newsletter: false,
          analysis: false,
          social: false,
          context: false
        };

        for (const contentType of contentTypes) {
          try {
            // Use the new content management system that handles both in-memory and database content
            results[contentType] = hasGeneratedContent(contentType) || await checkContentExists(storyId, contentType);
            console.log(`📊 Content check for ${contentType}: ${results[contentType]}`);
          } catch (error) {
            console.error(`Failed to check ${contentType} content:`, error);
            results[contentType] = false;
          }
        }

        console.log(`📊 Setting contentExists state:`, results);
        setContentExists(results);
      };

      checkAllContent();
    }
  }, [storyId, checkContentExists]);

  // Enhanced content handler with proper content type management
  const handleContentGeneration = async (contentType: ContentType, aiRequestType: string, context: string) => {
    const currentState = useEditorStore.getState();
    console.log(`🎯 Starting ${contentType} generation for story: ${currentState.currentStoryId}`);
    
    // Step 1: Preserve current content if it exists and is different from target type
    const currentContent = editor.getHTML();
    const currentContentType = currentState.currentContentType;
    
    if (currentContent && currentContent.trim() !== '<p></p>' && currentContentType && currentContentType !== contentType) {
      console.log(`💾 Preserving current ${currentContentType} content (${currentContent.length} chars) before switching to ${contentType}`);
      preserveContentForType(currentContentType, currentContent, editor.getJSON());
    }

    // Step 2: Check if target content type already exists
    const existingContent = getContentForType(contentType);
    if (existingContent && hasGeneratedContent(contentType)) {
      console.log(`📚 Loading existing ${contentType} content from memory`);
      editor.commands.setContent(existingContent.html);
      setCurrentContentType(contentType);
      
      // Update the contentExists state to reflect current status
      setContentExists(prev => ({ ...prev, [contentType]: true }));
      return;
    }

    // Step 3: Set up for generation
    let effectiveStoryId = storyId || currentStoryId;
    if (!effectiveStoryId) {
      // Generate a temporary story ID
      const editorText = editor.getText();
      if (editorText.trim()) {
        effectiveStoryId = `editor-${Date.now()}-${editorText.substring(0, 20).replace(/\s+/g, '-')}`;
      } else {
        effectiveStoryId = `editor-${Date.now()}`;
      }
      console.log(`📝 Generated temporary story ID: ${effectiveStoryId}`);
      setCurrentStory(effectiveStoryId);
    }

    // Step 4: Get source content for generation
    const editorState = useEditorStore.getState();
    let sourceContent = '';
    
    // Priority 1: Use original producer content (the raw story)
    if (editorState.producerContent && editorState.producerContent.content) {
      sourceContent = editorState.producerContent.content;
      console.log(`📰 Using original source content from producer (${sourceContent.length} chars)`);
      
      // Update story ID if available from producer
      if (editorState.producerContent.storyId) {
        effectiveStoryId = editorState.producerContent.storyId;
        setCurrentStory(effectiveStoryId);
      }
    } else {
      // Priority 2: Fall back to current editor content
      sourceContent = editor.getText();
      console.log(`⚠️ No producer content available - using current editor content (${sourceContent.length} chars)`);
      
      // If editor is empty, use sample content
      if (!sourceContent.trim()) {
        sourceContent = `Breaking News: Technology Innovation Continues\n\nThis is a sample news story that demonstrates the AI formatting capabilities. Replace this with actual content from the live feed or paste your own content to see the AI transformation in action.\n\nKey points:\n- Real-time streaming updates\n- Multiple format options\n- Professional newsletter styling`;
        console.log(`📝 Using sample content for demonstration`);
        editor.commands.setContent(sourceContent);
      }
    }
    
    console.log(`🎯 Final content to be processed (${sourceContent.length} chars): ${sourceContent.substring(0, 200)}...`);

    try {
      // Step 5: Check for existing database content (for non-home types)
      if (contentType !== 'home') {
        const hasExisting = await checkContentExists(effectiveStoryId, contentType);
        
        if (hasExisting) {
          console.log(`📚 Loading existing ${contentType} content from database for story ${effectiveStoryId}`);
          const existingContent = await loadContent(effectiveStoryId, contentType);
          
          if (existingContent && existingContent.trim()) {
            // Convert markdown to HTML if needed
            let contentForEditor = existingContent;
            
            if (isMarkdownContent(existingContent)) {
              console.log(`🔄 Converting existing ${contentType} markdown content to HTML`);
              contentForEditor = convertMarkdownToHTML(existingContent);
            }
            
            // Update editor, preserve in memory, and set content type
            editor.commands.setContent(contentForEditor);
            preserveContentForType(contentType, contentForEditor, editor.getJSON());
            setCurrentContentType(contentType);
            actions.setStatus('editing');
            
            // Update contentExists state
            setContentExists(prev => ({ ...prev, [contentType]: true }));
            
            console.log(`✅ Successfully loaded existing ${contentType} content`);
            return;
          }
        }
      }

      // Step 6: Generate new content
      console.log(`🔄 Generating new ${contentType} content for story ${effectiveStoryId} - streaming enabled`);
      
      // Set streaming indicator
      setStreamingType(contentType);
      
      // Set current content type for the store
      setCurrentContentType(contentType);
      
      // Set current story ID 
      useEditorStore.setState({ 
        currentStoryId: effectiveStoryId 
      });
      
      // Use streaming mode for AI generation
      const { requestAI } = useEditorStore.getState();
      await requestAI({
        type: aiRequestType as any,
        input: sourceContent,
        context
      }, undefined, true); // Enable streaming

      // Clear streaming indicator and mark content as generated
      setTimeout(() => {
        setStreamingType(null);
        
        // Preserve the generated content
        const generatedHTML = editor.getHTML();
        if (generatedHTML && generatedHTML.trim() !== '<p></p>') {
          preserveContentForType(contentType, generatedHTML, editor.getJSON());
          setContentExists(prev => ({ ...prev, [contentType]: true }));
          console.log(`✅ Completed ${contentType} generation and preserved content`);
        }
      }, 2000);

    } catch (error) {
      console.error(`❌ Failed to handle ${contentType} content:`, error);
      
      // Clear streaming indicator on error
      setStreamingType(null);
      
      // Show user-friendly error message
      alert(`Failed to generate ${contentType} content. Please try again.`);
    }
  };

  // AI Content Generation Functions
  const handleBlogPostGeneration = () => {
    handleContentGeneration(
      'blog',
      'blog-post',
      'Transform this story into a comprehensive analytical blog post with proper formatting and structure'
    );
  };

  const handleNewsletterFormat = () => {
    handleContentGeneration(
      'newsletter',
      'newsletter-format',
      'Convert to engaging newsletter format with visual hierarchy and professional styling'
    );
  };

  const handleAddAnalysis = () => {
    handleContentGeneration(
      'analysis',
      'add-analysis',
      'Add analytical depth with expert commentary and data-driven insights'
    );
  };

  const handleSocialInsights = () => {
    handleContentGeneration(
      'social',
      'social-insights',
      'Analyze social media implications and public sentiment around this story'
    );
  };

  const handleAddContext = () => {
    handleContentGeneration(
      'context',
      'add-context',
      'Add crucial background context and historical perspective to this story'
    );
  };

  // Enhanced Home button that preserves other content and loads default content
  const handleLoadDefault = () => {
    // Step 1: Preserve current content if it exists and is not already 'home'
    const currentContent = editor.getHTML();
    const currentContentType = useEditorStore.getState().currentContentType;
    
    if (currentContent && currentContent.trim() !== '<p></p>' && currentContentType && currentContentType !== 'home') {
      console.log(`💾 Preserving current ${currentContentType} content before loading home`);
      preserveContentForType(currentContentType, currentContent, editor.getJSON());
    }

    // Step 2: Check if home content already exists in memory
    const existingHomeContent = getContentForType('home');
    if (existingHomeContent && hasGeneratedContent('home')) {
      console.log(`🏠 Loading existing home content from memory`);
      editor.commands.setContent(existingHomeContent.html);
      setCurrentContentType('home');
      setContentExists(prev => ({ ...prev, home: true }));
      return;
    }

    // Step 3: Load original producer content as home content
    const editorState = useEditorStore.getState();
    
    if (editorState.producerContent && editorState.producerContent.content) {
      const defaultContent = editorState.producerContent.content;
      console.log(`🏠 Loading original story content as home: ${defaultContent.substring(0, 100)}...`);
      
      // Set content in editor
      editor.commands.setContent(defaultContent);
      
      // Update editor store
      actions.setContent({
        html: defaultContent,
        text: defaultContent.replace(/<[^>]*>/g, ''),
        wordCount: defaultContent.replace(/<[^>]*>/g, '').trim().split(/\s+/).length,
        characterCount: defaultContent.replace(/<[^>]*>/g, '').length,
        lastModified: Date.now()
      });
      
      // Set as home content type and preserve it
      setCurrentContentType('home');
      preserveContentForType('home', defaultContent, editor.getJSON());
      
      // Set story context if available
      if (editorState.producerContent.storyId) {
        setCurrentStory(editorState.producerContent.storyId);
      }
      
      // Update contentExists state
      setContentExists(prev => ({ ...prev, home: true }));
      
      console.log(`✅ Loaded and preserved original story content as home`);
    } else {
      console.warn('⚠️ No original story content available in producer');
      
      // Load empty content but still set as home type
      editor.commands.setContent('<p></p>');
      setCurrentContentType('home');
      
      alert('No story content available. Please select a story from the live feed first.');
    }
  };

  // Manual Formatting Functions (for AI use)
  const applyHeading = (level: 1 | 2 | 3 | 4) => {
    editor.chain().focus().toggleHeading({ level }).run();
  };

  const applyAlignment = (alignment: 'left' | 'center' | 'right' | 'justify') => {
    editor.chain().focus().setTextAlign(alignment).run();
  };

  const applyFontFamily = (fontFamily: string) => {
    editor.chain().focus().setFontFamily(fontFamily).run();
  };

  const applyTextColor = (color: string) => {
    editor.chain().focus().setColor(color).run();
  };

  return (
    <div className={cn(className)}>
      {/* AI Content Generation Section */}
      <div className="flex gap-2">
        
        <button
          onClick={handleLoadDefault}
          className={cn(
            "flex items-center justify-center w-8 h-8 rounded border cursor-pointer",
            hasGeneratedContent('home') 
              ? "bg-green-500/20 hover:bg-green-500/30 text-green-400 border-green-500/30"
              : "bg-gray-500/10 hover:bg-gray-500/20 text-gray-400 hover:text-gray-300 border-gray-500/30"
          )}
          title={hasGeneratedContent('home') ? "Load preserved home content" : "Load original story content from live feed"}
        >
          <Home className="w-3 h-3" />
        </button>

        <button
          onClick={handleBlogPostGeneration}
          disabled={status === 'ai-processing' || streamingType === 'blog'}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 text-xs rounded border disabled:opacity-50 cursor-pointer",
            hasGeneratedContent('blog')
              ? "bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border-blue-500/30"
              : status === 'ai-processing' || streamingType === 'blog'
              ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
              : "bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border-blue-500/30"
          )}
          title={hasGeneratedContent('blog') ? "Blog post already generated" : "Generate analytical blog post"}
        >
          {hasGeneratedContent('blog') ? <Check className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
          <span>{streamingType === 'blog' ? 'Generating...' : 'Blog Post'}</span>
        </button>

        <button
          onClick={handleNewsletterFormat}
          disabled={status === 'ai-processing' || streamingType === 'newsletter'}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 text-xs rounded border disabled:opacity-50 cursor-pointer",
            hasGeneratedContent('newsletter')
              ? "bg-green-500/20 hover:bg-green-500/30 text-green-400 border-green-500/30"
              : "bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border-purple-500/30"
          )}
          title={hasGeneratedContent('newsletter') ? "Load generated newsletter (already created)" : "Generate engaging newsletter format"}
        >
          {hasGeneratedContent('newsletter') ? <Check className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
          Newsletter
        </button>

        <button
          onClick={handleAddAnalysis}
          disabled={status === 'ai-processing' || streamingType === 'analysis'}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 text-xs rounded border disabled:opacity-50 cursor-pointer",
            hasGeneratedContent('analysis')
              ? "bg-green-500/20 hover:bg-green-500/30 text-green-400 border-green-500/30"
              : "bg-green-500/20 hover:bg-green-500/30 text-green-400 border-green-500/30"
          )}
          title={hasGeneratedContent('analysis') ? "Load generated analysis (already created)" : "Add analytical insights"}
        >
          {hasGeneratedContent('analysis') ? <Check className="w-3 h-3" /> : <BarChart3 className="w-3 h-3" />}
          Analysis
        </button>

        <button
          onClick={handleSocialInsights}
          disabled={status === 'ai-processing' || streamingType === 'social'}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 text-xs rounded border disabled:opacity-50 cursor-pointer",
            hasGeneratedContent('social')
              ? "bg-green-500/20 hover:bg-green-500/30 text-green-400 border-green-500/30"
              : "bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border-yellow-500/30"
          )}
          title={hasGeneratedContent('social') ? "Load generated social insights (already created)" : "Analyze social media implications"}
        >
          {hasGeneratedContent('social') ? <Check className="w-3 h-3" /> : <MessageSquare className="w-3 h-3" />}
          Social
        </button>

        <button
          onClick={handleAddContext}
          disabled={status === 'ai-processing' || streamingType === 'context'}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 text-xs rounded border disabled:opacity-50 cursor-pointer",
            hasGeneratedContent('context')
              ? "bg-green-500/20 hover:bg-green-500/30 text-green-400 border-green-500/30"
              : "bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border-orange-500/30"
          )}
          title={hasGeneratedContent('context') ? "Load generated context (already created)" : "Add background context"}
        >
          {hasGeneratedContent('context') ? <Check className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
          Context
        </button>
      </div>

      {/* Hidden Backend Formatting Functions - Available to AI but not shown to users */}

      {/* Subtle Streaming Indicator */}
      {(isAIProcessing || streamingType) && (
        <div className="flex items-center gap-2 px-3 py-1 text-xs bg-blue-500/10 border border-blue-500/20 rounded text-blue-400">
          <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          {streamingType ? (
            <span>Streaming {streamingType} content...</span>
          ) : (
            <span>AI processing...</span>
          )}
        </div>
      )}
    </div>
  );
}

console.log('🎨 AI Formatting Controls component loaded');