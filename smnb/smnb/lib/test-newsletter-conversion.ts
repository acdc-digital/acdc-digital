/**
 * Test Newsletter Markdown Conversion
 * Quick test to verify our enhanced converter works with the example content
 */

import { convertMarkdownToHTML } from './utils/markdownConverter';

const testContent = `🌟

ECONOMIC INSIGHT REPORT

Your Essential Guide to Labor Market Updates
Issue 047 | February 2024

📊

BREAKING MARKET NEWS

The Bureau of Labor Statistics has released critical employment data revisions that reshape our understanding of the job market.

[INSIGHT BOX]
Key Revision Highlights

• Previous employment reports overstated by 947,000 jobs
• Data adjustment spans past 12 months  
• Labor market recovery shows slower growth ⬇️
[/INSIGHT BOX]

🔍

IMPACT ANALYSIS

This revision significantly alters our understanding of the post-pandemic labor market recovery

Key implications:

• Employment growth was 23% lower than initial reports
• Labor market strength requires reassessment
• Economic indicators need careful reexamination

⚠️ IMPORTANT CONTEXT

Regular data refinements are standard procedure

Single revision doesn't indicate market downturn

Long-term trends remain key focus

🎯

LOOKING AHEAD

[INSIGHT BOX]
Market Monitoring Points

• Watch for subsequent BLS adjustments
• Monitor broader economic indicators
• Track real-time employment metrics
[/INSIGHT BOX]

📈

MARKET PERSPECTIVE

While this revision presents significant changes, remember:

• Economic data constantly evolves
• Multiple indicators needed for full picture
• Long-term trajectory still positive`;

console.log('🧪 Testing newsletter markdown conversion...');

const converted = convertMarkdownToHTML(testContent);

console.log('📝 Converted HTML:');
console.log(converted);