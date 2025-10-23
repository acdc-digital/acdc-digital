/**
 * Newsletter Display Component
 * Renders newsletter HTML content with proper newsletter CSS classes
 * Newsletter display component for rendering HTML content with newsletter CSS classes
 */

'use client'

import React from 'react'

interface NewsletterDisplayProps {
  content: string
  className?: string
  isLoading?: boolean
}

export default function NewsletterDisplay({ content, className = '', isLoading = false }: NewsletterDisplayProps) {
  // If loading, show fun loading message
  if (isLoading && (!content || content.trim() === '')) {
    return (
      <div className={`newsletter-display-container min-h-[400px] flex items-center justify-center text-white bg-neutral-800 ${className}`}>
        <div className="text-center max-w-md">
          <div className="text-4xl mb-4 animate-bounce">✍️</div>
          <h3 className="text-xl font-semibold mb-2">We&apos;re busy writing the next big story!</h3>
          <p className="text-sm text-gray-300 mb-4">Our AI is crafting something amazing for you...</p>
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-purple-300 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }
  
  // If no content and not loading, show placeholder
  if (!content || content.trim() === '') {
    return (
      <div className={`newsletter-display-container min-h-[200px] flex items-center justify-center text-white bg-neutral-800 ${className}`}>
        <div className="text-center">
          <div className="text-lg mb-2">📰</div>
          <p className="text-sm text-gray-300">Newsletter content will appear here...</p>
        </div>
      </div>
    )
  }

  return (
    <div 
      className={`newsletter-display-container max-w-4xl mx-auto p-6 bg-neutral-800 h-auto ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}