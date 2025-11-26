// TEST RESEARCH TOOLS - Simple test to verify tool functionality
// /Users/matthewsimon/Projects/LifeOS/LifeOS/scripts/test-research-tools.js

import { duckDuckGoSearchTool, wikipediaSearchTool } from '../lib/research/realTools.js';

async function testTools() {
  console.log('🔍 Testing DuckDuckGo Search Tool...');
  
  try {
    const duckResult = await duckDuckGoSearchTool.handler({
      query: 'adult learning principles',
      numResults: 3
    });
    
    console.log('✅ DuckDuckGo Results:', JSON.stringify(duckResult, null, 2));
  } catch (error) {
    console.error('❌ DuckDuckGo Error:', error);
  }

  console.log('\n📚 Testing Wikipedia Search Tool...');
  
  try {
    const wikiResult = await wikipediaSearchTool.handler({
      query: 'andragogy',
      numResults: 2
    });
    
    console.log('✅ Wikipedia Results:', JSON.stringify(wikiResult, null, 2));
  } catch (error) {
    console.error('❌ Wikipedia Error:', error);
  }
}

testTools().catch(console.error);
