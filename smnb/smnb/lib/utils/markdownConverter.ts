/**
 * Markdown to HTML Converter - Simplified for TipTap
 */

export function convertMarkdownToHTML(markdownContent: string): string {
  console.log(`🔄 Converting markdown to HTML: ${markdownContent.length} chars`);
  console.log(`🔍 Markdown preview: "${markdownContent.substring(0, 100)}..."`);
  
  let html = markdownContent;
  
  // CRITICAL: Process markdown line by line for better accuracy
  const lines = markdownContent.split('\n');
  const processedLines = lines.map(line => {
    const trimmed = line.trim();
    
    // Skip empty lines
    if (!trimmed) return line;
    
    // Standard markdown headers with newsletter classes (PRIORITY: Process first)
    if (trimmed.match(/^#{6}\s+(.+)$/)) {
      const content = trimmed.replace(/^#{6}\s+/, '');
      console.log(`🏷️ Converting H6: ${content}`);
      return `<h6 class="newsletter-h6">${content}</h6>`;
    }
    if (trimmed.match(/^#{5}\s+(.+)$/)) {
      const content = trimmed.replace(/^#{5}\s+/, '');
      console.log(`🏷️ Converting H5: ${content}`);
      return `<h5 class="newsletter-h5">${content}</h5>`;
    }
    if (trimmed.match(/^#{4}\s+(.+)$/)) {
      const content = trimmed.replace(/^#{4}\s+/, '');
      console.log(`🏷️ Converting H4: ${content}`);
      return `<h4 class="newsletter-h4">${content}</h4>`;
    }
    if (trimmed.match(/^#{3}\s+(.+)$/)) {
      const content = trimmed.replace(/^#{3}\s+/, '');
      console.log(`🏷️ Converting H3: ${content}`);
      return `<h3 class="newsletter-h3">${content}</h3>`;
    }
    if (trimmed.match(/^#{2}\s+(.+)$/)) {
      const content = trimmed.replace(/^#{2}\s+/, '');
      console.log(`🏷️ Converting H2: ${content}`);
      return `<h2 class="newsletter-h2">${content}</h2>`;
    }
    if (trimmed.match(/^#{1}\s+(.+)$/)) {
      const content = trimmed.replace(/^#{1}\s+/, '');
      console.log(`🏷️ Converting H1 (Main Newsletter Title): ${content}`);
      return `<h1 class="newsletter-display">${content}</h1>`;
    }
    
    // Emoji-prefixed lines to H3 headers with newsletter classes (common in newsletters)
    if (trimmed.match(/^(🌟|🚨|⚠️|🔍|📊|📈|🎯|💡|🚀|📰|🔥|📋|💰|🏆|🎉|⭐|🔔|🎈|🏅|🎊|🌈)\s+(.+)$/)) {
      const match = trimmed.match(/^([🌟🚨⚠️🔍📊📈🎯💡🚀📰🔥📋💰🏆🎉⭐🔔🎈🏅🎊🌈]+)\s+(.+)$/);
      if (match) {
        console.log(`🎨 Converting emoji header H3: ${match[1]} ${match[2]}`);
        return `<h3 class="newsletter-h3">${match[1]} ${match[2]}</h3>`;
      }
    }
    
    // Blockquotes with newsletter classes
    if (trimmed.match(/^>\s*(.+)$/)) {
      const content = trimmed.replace(/^>\s*/, '');
      console.log(`💬 Converting blockquote: ${content}`);
      return `<blockquote class="newsletter-blockquote">${content}</blockquote>`;
    }
    
    // Horizontal rules
    if (trimmed.match(/^---+$/)) {
      console.log(`➖ Converting horizontal rule`);
      return '<hr>';
    }
    
    // List items with newsletter classes (will be wrapped in ul/ol later)
    if (trimmed.match(/^[-•]\s*(.+)$/)) {
      const content = trimmed.replace(/^[-•]\s*/, '');
      console.log(`📝 Converting bullet item: ${content}`);
      return `<li class="newsletter-list-item">${content}</li>`;
    }
    if (trimmed.match(/^\d+\.\s*(.+)$/)) {
      const content = trimmed.replace(/^\d+\.\s*/, '');
      console.log(`📝 Converting numbered item: ${content}`);
      return `<li class="newsletter-list-item">${content}</li>`;
    }
    
    return line;
  });
  
  html = processedLines.join('\n');
  
  // Process inline formatting (bold, italic, links, code)
  // Bold (must come before italic to avoid conflicts)
  html = html.replace(/\*\*((?:[^*]|\*(?!\*))+)\*\*/g, (match, content) => {
    console.log(`💪 Converting bold: ${content}`);
    return `<strong>${content}</strong>`;
  });
  
  // Italic (avoid matching ** patterns)
  html = html.replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, (match, content) => {
    console.log(`🔤 Converting italic: ${content}`);
    return `<em>${content}</em>`;
  });
  
  // Code (inline) with newsletter classes
  html = html.replace(/`([^`]+)`/g, (match, content) => {
    console.log(`💻 Converting code: ${content}`);
    return `<code class="newsletter-code">${content}</code>`;
  });
  
  // Links
  html = html.replace(/\[([^\]]*)\]\(([^)]*)\)/g, (match, text, url) => {
    console.log(`🔗 Converting link: ${text} -> ${url}`);
    return `<a href="${url}">${text}</a>`;
  });
  
  // Wrap consecutive <li> elements in <ul> tags with newsletter classes
  html = html.replace(/(<li[^>]*>[\s\S]*?<\/li>(?:\n<li[^>]*>[\s\S]*?<\/li>)*)/g, '<ul class="newsletter-list">$1</ul>');
  
  // Split content by double newlines and process each block for paragraphs
  const blocks = html.split(/\n\s*\n/);
  let titleProcessed = false;
  let subtitleProcessed = false;
  const processedBlocks = blocks.map((block, index) => {
    const trimmed = block.trim();
    if (!trimmed) return '';
    
    // If block starts with a block element, return as-is
    if (trimmed.match(/^<(h[1-6]|div|ul|ol|blockquote|hr|li)/i)) {
      return trimmed;
    }
    
    // Check if it contains only inline elements or plain text
    const hasBlockElements = trimmed.match(/<(h[1-6]|div|ul|ol|blockquote|hr|li)/i);
    if (!hasBlockElements && trimmed.length > 0) {
      let paragraphClass = 'newsletter-body';
      
      // Special handling for newsletter titles and subtitles without markdown headers
      // First substantial block is likely the newsletter title
      if (!titleProcessed && index === 0 && (
        trimmed.length > 20 || // Substantial first line
        trimmed.match(/[🚨🔥💥⚡🎯📢📰🗞️⭐🌟]/u) || // Contains alert/news emojis
        trimmed.toLowerCase().includes('alert') ||
        trimmed.toLowerCase().includes('breaking') ||
        trimmed.toLowerCase().includes('newsletter')
      )) {
        console.log(`🏆 Auto-detecting newsletter title: "${trimmed.substring(0, 50)}..."`);
        titleProcessed = true;
        return `<div class="newsletter-display">${trimmed}</div>`;
      }
      
      // Second block is likely subtitle if it's descriptive
      if (titleProcessed && !subtitleProcessed && index === 1 && (
        trimmed.includes('<em>') || // Has italic content (likely subtitle)
        trimmed.length > 25 && trimmed.length < 120 || // Medium length, descriptive
        trimmed.toLowerCase().includes('news') ||
        trimmed.toLowerCase().includes('update') ||
        trimmed.toLowerCase().includes('investigation') ||
        trimmed.toLowerCase().includes('breaking')
      )) {
        console.log(`📖 Auto-detecting newsletter subtitle: "${trimmed.substring(0, 50)}..."`);
        subtitleProcessed = true;
        paragraphClass = 'newsletter-lead';
      }
      
      // Regular lead paragraph detection for other cases
      else if (!subtitleProcessed && (
        trimmed.includes('<em>') || // Has italic content (likely subtitle)
        trimmed.length > 60 || // Substantial content
        trimmed.match(/^\*.*\*/) // Starts with italic markdown pattern
      )) {
        paragraphClass = 'newsletter-lead';
        subtitleProcessed = true;
        console.log(`📖 Applying newsletter-lead class to: "${trimmed.substring(0, 50)}..."`);
      }
      
      // Wrap in paragraph with appropriate newsletter class, converting single line breaks to <br>
      return `<p class="${paragraphClass}">` + trimmed.replace(/\n/g, '<br>') + '</p>';
    }
    
    return trimmed;
  });
  
  html = processedBlocks.filter(block => block).join('\n\n');
  
  // Clean up empty paragraphs and duplicate elements
  html = html.replace(/<p>\s*<\/p>/g, '');
  html = html.replace(/<p><br>\s*<\/p>/g, '');
  html = html.replace(/\n{3,}/g, '\n\n');
  
  console.log(`✅ Converted newsletter markdown to HTML: ${html.length} chars`);
  console.log(`📄 HTML preview: "${html.substring(0, 200)}..."`);
  
  // DEBUG: Show complete HTML for debugging
  console.log(`🔍 FULL HTML OUTPUT:`, html);
  
  return html;
}

export function isMarkdownContent(content: string): boolean {
  const patterns = [
    /^#{1,6}\s/m,        // Headers: # ## ### etc.
    /\*\*.*?\*\*/,       // Bold: **text**
    /(?<!\*)\*(?!\*).*?(?<!\*)\*(?!\*)/,  // Italic: *text* (not **text**)
    /\[.*?\]\(.*?\)/,    // Links: [text](url)
    /^>\s/m,             // Blockquotes: > text
    /^[-•]\s/m,          // Bullet lists: - item or • item
    /^\d+\.\s/m,         // Numbered lists: 1. item
    /^---+$/m,           // Horizontal rules: ---
    /`.*?`/,             // Code: `code`
  ];
  return patterns.some(pattern => pattern.test(content));
}

console.log('📝 Markdown converter initialized');
