/**
 * Test Newsletter Markdown to HTML Conversion
 * This test validates that our markdown converter properly handles newsletter formatting
 */

import { convertMarkdownToHTML, isMarkdownContent } from './lib/utils/markdownConverter';

console.log('🧪 Testing Newsletter Markdown Conversion...\n');

// Sample newsletter content that AI would generate
const testNewsletterMarkdown = `# 🌟 TECH INDUSTRY WEEKLY

## *Your Essential Guide to Technology Trends*

**Issue #42** | January 15, 2024

---

### 📊 Market Performance Update

This week delivered significant developments across major tech platforms:

- **Platform A: 2.3M users ⬆️** (15% increase from last quarter)
- **Platform B: $1.2B revenue 📈** (beating analyst expectations)  
- **Platform C: 45% market share** (maintaining leadership position)

> **Key Insight:** The convergence of AI and cloud computing continues to drive unprecedented growth across the sector.

### 💡 Innovation Spotlight

*Emerging technologies are reshaping how we work and connect:*

#### 🤖 Artificial Intelligence

New breakthroughs in \`machine learning algorithms\` are enabling more sophisticated automation across industries. **Key metrics:**

- Processing speed increased by **40%**
- Energy efficiency improved **25%**  
- Error rates reduced to **0.03%**

#### 🔮 Future Outlook

*Industry analysts predict continued expansion through 2024, with particular strength in:*

- Edge computing solutions
- Quantum processing applications
- Sustainable tech initiatives

---

### ⚠️ Market Alerts

> **Regulatory Update:** New privacy legislation expected to impact \`data processing workflows\` starting Q2 2024.

**Action Items for Teams:**
- Review current *data handling procedures*
- Update **compliance frameworks**  
- Schedule training sessions by \`March 15, 2024\``;

console.log('📝 Input Markdown:');
console.log('================');
console.log(testNewsletterMarkdown);
console.log('\n');

// Test markdown detection
console.log('🔍 Testing Markdown Detection...');
const isMarkdown = isMarkdownContent(testNewsletterMarkdown);
console.log(`✅ Markdown detected: ${isMarkdown}\n`);

// Test conversion
console.log('🔄 Converting to HTML...');
const htmlOutput = convertMarkdownToHTML(testNewsletterMarkdown);

console.log('\n📄 Output HTML:');
console.log('===============');
console.log(htmlOutput);

// Verify specific conversions
console.log('\n🧪 Testing Specific Conversions:');
console.log('==============================');

// Test headers
const hasH1 = htmlOutput.includes('<h1>🌟 TECH INDUSTRY WEEKLY</h1>');
const hasH2 = htmlOutput.includes('<h2>*Your Essential Guide to Technology Trends*</h2>');
const hasH3 = htmlOutput.includes('<h3>📊 Market Performance Update</h3>');
const hasH4 = htmlOutput.includes('<h4>🤖 Artificial Intelligence</h4>');

console.log(`H1 Headers: ${hasH1 ? '✅' : '❌'}`);
console.log(`H2 Headers: ${hasH2 ? '✅' : '❌'}`);
console.log(`H3 Headers: ${hasH3 ? '✅' : '❌'}`);
console.log(`H4 Headers: ${hasH4 ? '✅' : '❌'}`);

// Test formatting
const hasBold = htmlOutput.includes('<strong>Platform A: 2.3M users ⬆️</strong>');
const hasItalic = htmlOutput.includes('<em>Emerging technologies are reshaping how we work and connect:</em>');
const hasBlockquote = htmlOutput.includes('<blockquote><strong>Key Insight:</strong>');
const hasCode = htmlOutput.includes('<code>machine learning algorithms</code>');
const hasLists = htmlOutput.includes('<ul>') && htmlOutput.includes('<li>');
const hasHR = htmlOutput.includes('<hr>');

console.log(`Bold Text: ${hasBold ? '✅' : '❌'}`);
console.log(`Italic Text: ${hasItalic ? '✅' : '❌'}`);
console.log(`Blockquotes: ${hasBlockquote ? '✅' : '❌'}`);
console.log(`Code Formatting: ${hasCode ? '✅' : '❌'}`);
console.log(`Lists: ${hasLists ? '✅' : '❌'}`);
console.log(`Horizontal Rules: ${hasHR ? '✅' : '❌'}`);

// Count elements
const h1Count = (htmlOutput.match(/<h1>/g) || []).length;
const h2Count = (htmlOutput.match(/<h2>/g) || []).length;
const h3Count = (htmlOutput.match(/<h3>/g) || []).length;
const h4Count = (htmlOutput.match(/<h4>/g) || []).length;
const strongCount = (htmlOutput.match(/<strong>/g) || []).length;
const emCount = (htmlOutput.match(/<em>/g) || []).length;

console.log('\n📊 Element Counts:');
console.log(`H1: ${h1Count}, H2: ${h2Count}, H3: ${h3Count}, H4: ${h4Count}`);
console.log(`Strong: ${strongCount}, Em: ${emCount}`);

// Overall test result
const allTestsPassed = hasH1 && hasH2 && hasH3 && hasH4 && hasBold && hasItalic && 
                      hasBlockquote && hasCode && hasLists && hasHR;

console.log(`\n🎯 Overall Test Result: ${allTestsPassed ? '✅ PASSED' : '❌ FAILED'}`);

if (allTestsPassed) {
  console.log('\n🎉 Newsletter markdown conversion is working properly!');
  console.log('The TipTap editor should now display:');
  console.log('• Large blue H1 headers for main titles');
  console.log('• Medium blue H2 headers for subtitles');  
  console.log('• Red H3 headers for sections');
  console.log('• Green H4 headers for subsections');
  console.log('• Bold text for metrics and key information');
  console.log('• Italic text for context and emphasis');
  console.log('• Styled blockquotes for insights');
  console.log('• Proper list formatting');
} else {
  console.log('\n❌ Some conversions failed. Check the output above for details.');
}