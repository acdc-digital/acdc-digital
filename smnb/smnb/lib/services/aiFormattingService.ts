/**
 * AI Formatting Service
 * Backend formatting capabilities for AI agents to apply text styling programmatically
 * These functions are not exposed to users but available for AI content generation
 */

import { Editor } from '@tiptap/react';

export class AIFormattingService {
  private editor: Editor;

  constructor(editor: Editor) {
    this.editor = editor;
  }

  /**
   * Apply heading levels programmatically
   */
  applyHeading(level: 1 | 2 | 3 | 4 | 5 | 6, text?: string) {
    if (text) {
      this.editor.commands.insertContent(`<h${level}>${text}</h${level}>`);
    } else {
      this.editor.chain().focus().toggleHeading({ level }).run();
    }
  }

  /**
   * Apply text styling (bold, italic, underline)
   */
  applyBold(text?: string) {
    if (text) {
      this.editor.commands.insertContent(`<strong>${text}</strong>`);
    } else {
      this.editor.chain().focus().toggleBold().run();
    }
  }

  applyItalic(text?: string) {
    if (text) {
      this.editor.commands.insertContent(`<em>${text}</em>`);
    } else {
      this.editor.chain().focus().toggleItalic().run();
    }
  }

  applyUnderline(text?: string) {
    if (text) {
      this.editor.commands.insertContent(`<u>${text}</u>`);
    } else {
      this.editor.chain().focus().toggleUnderline().run();
    }
  }

  /**
   * Apply text alignment
   */
  applyAlignment(alignment: 'left' | 'center' | 'right' | 'justify') {
    this.editor.chain().focus().setTextAlign(alignment).run();
  }

  /**
   * Apply font family
   */
  applyFontFamily(fontFamily: string) {
    this.editor.chain().focus().setFontFamily(fontFamily).run();
  }

  /**
   * Apply text color
   */
  applyTextColor(color: string) {
    this.editor.chain().focus().setColor(color).run();
  }

  /**
   * Create structured content blocks
   */
  createSummaryBlock(title: string, content: string) {
    const summaryHtml = `
      <div class="summary-block bg-blue-50 border-l-4 border-blue-500 p-4 my-4">
        <h3 class="text-lg font-semibold text-blue-900 mb-2">${title}</h3>
        <p class="text-blue-800">${content}</p>
      </div>
    `;
    this.editor.commands.insertContent(summaryHtml);
  }

  createCalloutBox(type: 'info' | 'warning' | 'success' | 'error', content: string) {
    const colorMap = {
      info: 'blue',
      warning: 'yellow', 
      success: 'green',
      error: 'red'
    };
    const color = colorMap[type];
    
    const calloutHtml = `
      <div class="callout-${type} bg-${color}-50 border border-${color}-200 rounded-lg p-4 my-4">
        <p class="text-${color}-800">${content}</p>
      </div>
    `;
    this.editor.commands.insertContent(calloutHtml);
  }

  createQuoteBlock(quote: string, author?: string) {
    const quoteHtml = `
      <blockquote class="border-l-4 border-gray-400 pl-4 py-2 my-4 italic text-gray-700">
        <p>"${quote}"</p>
        ${author ? `<footer class="text-sm text-gray-600 mt-2">— ${author}</footer>` : ''}
      </blockquote>
    `;
    this.editor.commands.insertContent(quoteHtml);
  }

  createAnalysisSection(title: string, content: string) {
    const analysisHtml = `
      <div class="analysis-section my-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-3 border-b-2 border-blue-500 pb-2">${title}</h2>
        <div class="prose prose-lg">${content}</div>
      </div>
    `;
    this.editor.commands.insertContent(analysisHtml);
  }

  createKeyTakeaways(items: string[]) {
    const listItems = items.map(item => `<li class="mb-2">${item}</li>`).join('');
    const takeawaysHtml = `
      <div class="key-takeaways bg-green-50 border border-green-200 rounded-lg p-4 my-4">
        <h3 class="text-lg font-semibold text-green-900 mb-3">🔑 Key Takeaways</h3>
        <ul class="text-green-800 space-y-1">${listItems}</ul>
      </div>
    `;
    this.editor.commands.insertContent(takeawaysHtml);
  }

  createDataInsight(statistic: string, context: string) {
    const dataHtml = `
      <div class="data-insight bg-purple-50 border-l-4 border-purple-500 p-4 my-4">
        <div class="text-2xl font-bold text-purple-900">${statistic}</div>
        <div class="text-purple-800 mt-1">${context}</div>
      </div>
    `;
    this.editor.commands.insertContent(dataHtml);
  }

  /**
   * Newsletter-specific formatting
   */
  createNewsletterHeader(title: string, subtitle?: string, date?: string) {
    const headerHtml = `
      <header class="newsletter-header text-center py-6 border-b-2 border-gray-200 mb-6">
        <h1 class="text-4xl font-bold text-gray-900 mb-2">${title}</h1>
        ${subtitle ? `<p class="text-xl text-gray-600 mb-2">${subtitle}</p>` : ''}
        ${date ? `<time class="text-sm text-gray-500">${date}</time>` : ''}
      </header>
    `;
    this.editor.commands.insertContent(headerHtml);
  }

  createSectionDivider(title?: string) {
    const dividerHtml = title 
      ? `<div class="section-divider my-8 text-center">
           <h2 class="text-lg font-semibold text-gray-700 px-4 bg-white inline-block relative">
             <span class="bg-white px-2">${title}</span>
           </h2>
           <hr class="border-gray-300 -mt-3">
         </div>`
      : `<hr class="section-break border-gray-300 my-8">`;
    
    this.editor.commands.insertContent(dividerHtml);
  }

  /**
   * Social media specific formatting
   */
  createSocialMetrics(platform: string, metrics: { label: string; value: string }[]) {
    const metricsItems = metrics.map(metric => 
      `<div class="metric">
         <div class="text-lg font-bold text-blue-600">${metric.value}</div>
         <div class="text-sm text-gray-600">${metric.label}</div>
       </div>`
    ).join('');
    
    const metricsHtml = `
      <div class="social-metrics bg-gray-50 border border-gray-200 rounded-lg p-4 my-4">
        <h4 class="font-semibold text-gray-900 mb-3">${platform} Engagement</h4>
        <div class="grid grid-cols-3 gap-4 text-center">${metricsItems}</div>
      </div>
    `;
    this.editor.commands.insertContent(metricsHtml);
  }

  /**
   * Economic/Financial formatting
   */
  createMarketData(title: string, data: { symbol: string; price: string; change: string }[]) {
    const dataRows = data.map(item => 
      `<tr>
         <td class="font-mono font-semibold">${item.symbol}</td>
         <td class="text-right">${item.price}</td>
         <td class="text-right ${item.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}">${item.change}</td>
       </tr>`
    ).join('');
    
    const tableHtml = `
      <div class="market-data my-4">
        <h4 class="font-semibold text-gray-900 mb-2">${title}</h4>
        <table class="w-full bg-white border border-gray-200 rounded">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-3 py-2 text-left">Symbol</th>
              <th class="px-3 py-2 text-right">Price</th>
              <th class="px-3 py-2 text-right">Change</th>
            </tr>
          </thead>
          <tbody>${dataRows}</tbody>
        </table>
      </div>
    `;
    this.editor.commands.insertContent(tableHtml);
  }

  /**
   * Timeline formatting for political/historical context
   */
  createTimeline(events: { date: string; event: string }[]) {
    const timelineItems = events.map(item => 
      `<div class="timeline-item border-l-2 border-blue-500 pl-4 pb-4 ml-2">
         <div class="font-semibold text-blue-600">${item.date}</div>
         <div class="text-gray-700">${item.event}</div>
       </div>`
    ).join('');
    
    const timelineHtml = `
      <div class="timeline my-6">
        <h3 class="font-semibold text-gray-900 mb-4">📅 Timeline</h3>
        <div class="space-y-3">${timelineItems}</div>
      </div>
    `;
    this.editor.commands.insertContent(timelineHtml);
  }
}

/**
 * Create AI formatting service instance
 */
export function createAIFormattingService(editor: Editor): AIFormattingService {
  return new AIFormattingService(editor);
}

/**
 * Format text using AI-driven decisions based on content type and context
 */
export function applyIntelligentFormatting(
  editor: Editor, 
  contentType: string, 
  section: string,
  content: string
) {
  const formatter = new AIFormattingService(editor);
  
  // Apply formatting based on content type and section
  switch (contentType) {
    case 'breaking-news':
      if (section.includes('BREAKING')) {
        formatter.applyHeading(1, content);
        formatter.applyTextColor('#dc2626'); // Red for urgency
      } else if (section.includes('Summary')) {
        formatter.createSummaryBlock('Breaking Summary', content);
      }
      break;
      
    case 'economic-impact':
      if (section.includes('Market')) {
        formatter.createAnalysisSection('Market Analysis', content);
      } else if (section.includes('data') || section.includes('metrics')) {
        formatter.createDataInsight('Key Metric', content);
      }
      break;
      
    case 'social-media-story':
      if (section.includes('Viral') || section.includes('Trending')) {
        formatter.applyHeading(1, content);
        formatter.applyTextColor('#3b82f6'); // Blue for social
      } else if (section.includes('sentiment') || section.includes('reaction')) {
        formatter.createCalloutBox('info', content);
      }
      break;
      
    default:
      // Default newsletter formatting
      if (section.includes('headline') || section.includes('title')) {
        formatter.applyHeading(1, content);
      } else if (section.includes('takeaway') || section.includes('key')) {
        formatter.createKeyTakeaways([content]);
      }
  }
}

console.log('🎨 AI Formatting Service initialized for backend text styling');