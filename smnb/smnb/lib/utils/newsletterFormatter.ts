/**
 * Newsletter Restoration Utility
 * Provides utilities to verify and restore newsletter formatting functionality
 */

export class NewsletterFormatter {
  
  /**
   * Generate complete newsletter with title, date and formatted content
   */
  static generateNewsletter(options: {
    title: string;
    date?: string;
    content: string;
    metadata?: {
      title?: string;
      tags?: string[];
      priority?: number;
      [key: string]: unknown;
    };
  }) {
    const { title, date, content, metadata } = options;
    
    // Clean the content first
    const cleanContent = this.cleanHTML(content);
    
    return `
      <div class="newsletter-container">
        <h1 class="newsletter-title">${title}</h1>
        ${date ? `<p class="newsletter-date">${date}</p>` : ''}
        <hr class="newsletter-divider" />
        <div class="newsletter-body">
          ${this.formatContent(cleanContent, metadata)}
        </div>
      </div>
    `;
  }

  /**
   * Apply newsletter classes to existing HTML content
   */
  static formatExistingContent(html: string): string {
    // If already formatted as newsletter, return as is
    if (html.includes('newsletter-container')) {
      return html;
    }
    
    // Extract title if present (first h1 or h2)
    const titleMatch = html.match(/<h[12][^>]*>(.*?)<\/h[12]>/);
    const title = titleMatch ? titleMatch[1] : 'SMNB Newsletter';
    
    // Remove the title from content if found
    const contentWithoutTitle = titleMatch
      ? html.replace(titleMatch[0], '')
      : html;
    
    return this.generateNewsletter({
      title,
      date: new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      content: contentWithoutTitle
    });
  }

  /**
   * Format content with newsletter classes and metadata enhancements
   */
  static formatContent(content: string, metadata?: {
    tags?: string[];
    [key: string]: unknown;
  }): string {
    // Process paragraphs
    let formatted = content.replace(/<p>/g, '<p class="newsletter-body">');
    
    // Process headings
    formatted = formatted.replace(/<h2>/g, '<h2 class="newsletter-subtitle">');
    formatted = formatted.replace(/<h3>/g, '<h3 class="newsletter-subtitle" style="font-size: 1.25rem !important;">');
    
    // Add sections if metadata suggests categories
    if (metadata?.tags?.includes('breaking')) {
      formatted = `<div class="newsletter-section"><strong>BREAKING NEWS</strong></div>${formatted}`;
    }
    
    return formatted;
  }

  /**
   * Clean HTML content
   */
  static cleanHTML(html: string): string {
    // Remove empty paragraphs
    return html
      .replace(/<p>\s*<\/p>/g, '')
      .replace(/<p>&nbsp;<\/p>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
  
  /**
   * Generate sample newsletter content with proper formatting
   */
  static generateSampleNewsletter(title: string = '🗞️ SMNB Daily Newsletter'): string {
    return this.generateNewsletter({
      title,
      date: new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      content: `
        <h2>Today's Top Stories</h2>
        <p>Welcome to today's edition of the SMNB Newsletter. We've curated the most important stories and insights to keep you informed.</p>
        
        <h3>Breaking News</h3>
        <p>Major developments in the tech sector as companies announce groundbreaking innovations that promise to reshape how we interact with technology.</p>
        
        <h3>Market Analysis</h3>
        <p>Financial markets showed strong performance today, with key indicators suggesting continued growth momentum across multiple sectors.</p>
        
        <h3>Featured Story</h3>
        <p>An in-depth look at emerging trends that are defining the future of digital communication and social interaction in our increasingly connected world.</p>
        
        <p>Thank you for reading today's newsletter. Stay tuned for more updates tomorrow!</p>
      `,
      metadata: {
        tags: ['daily', 'news', 'tech', 'markets'],
        priority: 1.0
      }
    });
  }
  
  /**
   * Validate that newsletter CSS classes are properly applied
   */
  static validateNewsletterFormatting(html: string): {
    isValid: boolean;
    missing: string[];
    recommendations: string[];
  } {
    const missing: string[] = [];
    const recommendations: string[] = [];
    
    // Check for essential newsletter classes
    if (!html.includes('newsletter-h1') && !html.includes('newsletter-h2')) {
      missing.push('Header classes (newsletter-h1, newsletter-h2)');
      recommendations.push('Add newsletter header classes to your headings');
    }
    
    if (!html.includes('newsletter-body')) {
      missing.push('Body paragraph classes (newsletter-body)');
      recommendations.push('Apply newsletter-body class to paragraphs');
    }
    
    if (html.includes('<ul>') && !html.includes('newsletter-list')) {
      missing.push('List formatting (newsletter-list)');
      recommendations.push('Add newsletter-list class to lists');
    }
    
    if (html.includes('<blockquote>') && !html.includes('newsletter-blockquote')) {
      missing.push('Blockquote formatting (newsletter-blockquote)');
      recommendations.push('Add newsletter-blockquote class to quotes');
    }
    
    return {
      isValid: missing.length === 0,
      missing,
      recommendations
    };
  }
  
  /**
   * Convert plain text to newsletter-formatted HTML
   */
  static convertTextToNewsletter(text: string): string {
    const lines = text.split('\n').filter(line => line.trim());
    let html = '';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (i === 0) {
        // First line becomes newsletter display title
        html += `<div class="newsletter-display">${line}</div>\n\n`;
      } else if (i === 1 && line.length > 100) {
        // Second long line becomes lead paragraph
        html += `<p class="newsletter-lead">${line}</p>\n\n`;
      } else if (line.match(/^[\d\w\s]{1,80}$/)) {
        // Short lines become headers
        const level = i < 3 ? 1 : 2;
        html += `<h${level} class="newsletter-h${level}">${line}</h${level}>\n\n`;
      } else if (line.startsWith('- ') || line.startsWith('• ')) {
        // Convert bullet points to newsletter list
        if (!html.includes('<ul class="newsletter-list">')) {
          html += '<ul class="newsletter-list">\n';
        }
        html += `  <li>${line.replace(/^[-•]\s*/, '')}</li>\n`;
        
        // Close list if this is the last line or next line isn't a bullet
        if (i === lines.length - 1 || (!lines[i + 1]?.startsWith('- ') && !lines[i + 1]?.startsWith('• '))) {
          html += '</ul>\n\n';
        }
      } else {
        // Everything else becomes body paragraphs
        html += `<p class="newsletter-body">${line}</p>\n\n`;
      }
    }
    
    return html;
  }
}