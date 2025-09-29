/**
 * Test script for NLP-MCP Parser
 * 
 * Quick test to verify pattern matching and query parsing
 */

import { nlpMcpParser } from './nlpMcpParser';

// Test the specific user query
async function testUserQuery() {
  const query = "How are my data metrics for the week?";
  
  console.log(`🧪 Testing query: "${query}"`);
  console.log('=====================================');
  
  // Test pattern matching
  const patterns = nlpMcpParser.testPatternMatching(query);
  console.log('\n📊 Pattern Matching Results:');
  patterns.forEach(result => {
    console.log(`  ${result.intent}: ${result.matches ? '✅' : '❌'} (confidence: ${(result.confidence * 100).toFixed(1)}%)`);
  });
  
  // Test full query parsing
  console.log('\n🔍 Full Query Parsing:');
  const parsed = await nlpMcpParser.parseQuery(query);
  console.log('  Intent:', parsed.intent);
  console.log('  Confidence:', (parsed.confidence * 100).toFixed(1) + '%');
  console.log('  MCP Tool:', parsed.mcpTool);
  console.log('  Parameters:', parsed.parameters);
  console.log('  Suggested Command:', parsed.suggestedCommand);
  console.log('  Fallback to Chat:', parsed.fallbackToChat);
  console.log('  Explanation:', parsed.explanation);
  
  // Test execution (without actually calling MCP since we don't have real data)
  console.log('\n🚀 Execution Test:');
  try {
    const result = await nlpMcpParser.executeQuery(query);
    console.log('  Success:', result.success);
    console.log('  Response:', result.formattedResponse?.substring(0, 100) + '...');
    if (result.error) {
      console.log('  Error:', result.error);
    }
  } catch (error) {
    console.log('  Execution Error:', error);
  }
  
  console.log('\n✅ Test completed!');
}

// Run the test
testUserQuery().catch(console.error);