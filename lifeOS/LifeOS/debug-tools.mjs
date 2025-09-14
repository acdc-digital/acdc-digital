// DEBUG TOOLS - Test individual research tools
// /Users/matthewsimon/Projects/LifeOS/LifeOS/debug-tools.js

import { duckDuckGoSearchTool, wikipediaSearchTool } from './lib/research/realTools.ts';

async function testDuckDuckGoTool() {
  console.log('🦆 Testing DuckDuckGo Search Tool...');
  try {
    const result = await duckDuckGoSearchTool.handler({ query: "Tesla news 2024", numResults: 3 });
    console.log('✅ DuckDuckGo Success:', result);
    return result;
  } catch (error) {
    console.error('❌ DuckDuckGo Failed:', error);
    return null;
  }
}

async function testWikipediaTool() {
  console.log('📚 Testing Wikipedia Search Tool...');
  try {
    const result = await wikipediaSearchTool.handler({ query: "Tesla Inc", numResults: 2 });
    console.log('✅ Wikipedia Success:', result);
    return result;
  } catch (error) {
    console.error('❌ Wikipedia Failed:', error);
    return null;
  }
}

async function runTests() {
  console.log('🧪 Testing Individual Research Tools...\n');
  
  const ddgResult = await testDuckDuckGoTool();
  console.log('\n');
  const wikiResult = await testWikipediaTool();
  
  console.log('\n📊 Results Summary:');
  console.log('DuckDuckGo results:', ddgResult?.results?.length || 0);
  console.log('Wikipedia results:', wikiResult?.results?.length || 0);
}

runTests().catch(console.error);
