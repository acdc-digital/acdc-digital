// Simple test for LeadResearcherAgent
import { LeadResearcherAgent } from './lib/research/leadAgent.js';

console.log('🧪 Testing LeadResearcherAgent initialization...');

async function testAgent() {
  try {
    // Mock API key for testing
    const apiKey = process.env.ANTHROPIC_API_KEY || 'test-key';
    console.log('🔑 API Key available:', apiKey ? 'Yes' : 'No');
    
    // Test initialization
    console.log('🤖 Creating LeadResearcherAgent...');
    const agent = new LeadResearcherAgent(apiKey, "claude-3-5-sonnet-20241022", true);
    console.log('✅ Agent created successfully');
    
    // Test method existence
    console.log('🔍 Checking agent methods...');
    console.log('- generateTitle method exists:', typeof agent.generateTitle === 'function');
    console.log('- conductResearch method exists:', typeof agent.conductResearch === 'function');
    
    // Test simple title generation (should work without external APIs)
    console.log('📝 Testing title generation...');
    try {
      const title = await agent.generateTitle('test query');
      console.log('✅ Title generated:', title);
    } catch (err) {
      console.error('❌ Title generation failed:', err.message);
    }
    
    console.log('✅ Agent test completed');
    
  } catch (error) {
    console.error('❌ Agent test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testAgent();
