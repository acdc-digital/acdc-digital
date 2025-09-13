/**
 * Newsletter Restoration Utility
 * Provides utilities to verify and restore newsletter formatting functionality
 */

export class NewsletterFormatter {
  
  /**
   * Apply newsletter classes to existing HTML content
   */
  static formatExistingContent(html: string): string {
    // Parse and enhance existing HTML with newsletter classes
    let formattedHTML = html;
    
    // Transform headings to newsletter classes
    formattedHTML = formattedHTML.replace(
      /<h1(?:\s[^>]*)?>([^<]*)<\/h1>/gi, 
      '<h1 class="newsletter-h1">$1</h1>'
    );
    
    formattedHTML = formattedHTML.replace(
      /<h2(?:\s[^>]*)?>([^<]*)<\/h2>/gi, 
      '<h2 class="newsletter-h2">$1</h2>'
    );
    
    formattedHTML = formattedHTML.replace(
      /<h3(?:\s[^>]*)?>([^<]*)<\/h3>/gi, 
      '<h3 class="newsletter-h3">$1</h3>'
    );
    
    // Transform paragraphs to newsletter body class
    formattedHTML = formattedHTML.replace(
      /<p(?:\s[^>]*)?>([^<]*)<\/p>/gi, 
      '<p class="newsletter-body">$1</p>'
    );
    
    // Transform blockquotes
    formattedHTML = formattedHTML.replace(
      /<blockquote(?:\s[^>]*)?>([^<]*)<\/blockquote>/gi, 
      '<blockquote class="newsletter-blockquote">$1</blockquote>'
    );
    
    // Transform lists
    formattedHTML = formattedHTML.replace(
      /<ul(?:\s[^>]*)?>([^<]*)<\/ul>/gi, 
      '<ul class="newsletter-list">$1</ul>'
    );
    
    formattedHTML = formattedHTML.replace(
      /<ol(?:\s[^>]*)?>([^<]*)<\/ol>/gi, 
      '<ol class="newsletter-list newsletter-list-ordered">$1</ol>'
    );
    
    return formattedHTML;
  }
  
  /**
   * Generate sample newsletter content with proper formatting
   */
  static generateSampleNewsletter(title: string = "SMNB News Alert"): string {
    return `
      <div class="newsletter-display">${title}</div>
      
      <p class="newsletter-lead">
        Your comprehensive source for breaking news, analysis, and insights from across the digital landscape.
      </p>
      
      <h1 class="newsletter-h1">Today's Top Story</h1>
      
      <p class="newsletter-body">
        In today's rapidly evolving news environment, artificial intelligence continues to reshape how we consume and understand information. This transformation is creating new opportunities for both content creators and audiences.
      </p>
      
      <h2 class="newsletter-h2">Key Developments</h2>
      
      <ul class="newsletter-list">
        <li>Advanced content curation systems now process millions of sources simultaneously</li>
        <li>Real-time sentiment analysis provides deeper understanding of public opinion</li>
        <li>Automated summarization helps readers stay informed without information overload</li>
      </ul>
      
      <div class="newsletter-blockquote">
        "The future of news consumption is not just about speed—it's about intelligent filtering and personalized delivery that respects the reader's time and attention."
      </div>
      
      <h3 class="newsletter-h3">Market Analysis</h3>
      
      <p class="newsletter-body">
        Industry analysts predict continued growth in AI-powered news platforms, with user engagement metrics showing sustained improvement over traditional formats.
      </p>
      
      <div class="newsletter-pullquote">
        Innovation in news delivery is accelerating at an unprecedented pace.
      </div>
      
      <div class="newsletter-divider"></div>
      
      <h4 class="newsletter-h4">Looking Forward</h4>
      
      <p class="newsletter-body">
        As these technologies mature, we can expect even more sophisticated approaches to news curation and delivery, ensuring that readers receive the most relevant and timely information.
      </p>
    `;
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