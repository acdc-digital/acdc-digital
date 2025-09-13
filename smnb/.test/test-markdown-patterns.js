/**
 * Simple test of markdown conversion without ES module complexity
 */

// Simple markdown converter test  
function testMarkdownConversion() {
  const testMarkdown = `# 🚨 Public Safety Alert: NYC

## Critical Law Enforcement Bulletin

### 📍 Situation Overview

**URGENT:** Active manhunt underway.

- **Status**: Active investigation
- **Location**: NYC area

> **Key Insight:** Multi-borough response.

### 🚔 Current Actions

*Enhanced security measures*`;

  console.log('🧪 Testing Markdown Patterns...');
  console.log('Input:\n', testMarkdown);
  console.log('\n' + '='.repeat(50));
  
  // Test regex patterns from our converter
  const patterns = {
    'H1 headers': /^#{1}\s+(.+)$/gm,
    'H2 headers': /^#{2}\s+(.+)$/gm, 
    'H3 headers': /^#{3}\s+(.+)$/gm,
    'Bold text': /\*\*((?:[^*]|\*(?!\*))+)\*\*/g,
    'Italic text': /(?<!\*)\*([^*\n]+)\*(?!\*)/g,
    'List items': /^[-•]\s*(.+)$/gm,
    'Blockquotes': /^>\s*(.+)$/gm
  };
  
  console.log('\n🔍 Pattern Matches:');
  Object.entries(patterns).forEach(([name, regex]) => {
    const matches = [...testMarkdown.matchAll(regex)];
    console.log(`${matches.length > 0 ? '✅' : '❌'} ${name}: ${matches.length} matches`);
    if (matches.length > 0) {
      matches.forEach((match, i) => {
        console.log(`   ${i + 1}. "${match[1] || match[0]}"`);
      });
    }
  });
  
  // Manual conversion simulation
  console.log('\n🔄 Expected HTML Output:');
  const expectedHTML = `<h1>🚨 Public Safety Alert: NYC</h1>

<h2>Critical Law Enforcement Bulletin</h2>

<h3>📍 Situation Overview</h3>

<p><strong>URGENT:</strong> Active manhunt underway.</p>

<ul>
<li><strong>Status</strong>: Active investigation</li>
<li><strong>Location</strong>: NYC area</li>
</ul>

<blockquote><strong>Key Insight:</strong> Multi-borough response.</blockquote>

<h3>🚔 Current Actions</h3>

<p><em>Enhanced security measures</em></p>`;

  console.log(expectedHTML);
  
  console.log('\n🎯 This is what TipTap should receive for proper rendering:');
  console.log('• H1 headers will be large (4xl) and blue');
  console.log('• H2 headers will be medium (2xl) and blue');  
  console.log('• H3 headers will be smaller (xl) and red');
  console.log('• Strong text will be bold and dark');
  console.log('• Blockquotes will have blue background');
}

testMarkdownConversion();