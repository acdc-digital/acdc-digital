// CLAUDE API TEST - Simple test to verify Claude API connectivity
// /Users/matthewsimon/Projects/LifeOS/LifeOS/scripts/test-claude-api.js

const testClaudeAPI = async () => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    console.error('❌ ANTHROPIC_API_KEY environment variable is not set');
    console.log('Please set your API key: export ANTHROPIC_API_KEY=your_key_here');
    process.exit(1);
  }
  
  console.log('🧪 Testing Claude API connectivity...\n');

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 100,
        messages: [
          {
            role: 'user',
            content: 'Hello! Please respond with just "API working" if you can see this message.',
          },
        ],
      }),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ API Error Response:', errorText);
      return;
    }

    const data = await response.json();
    console.log('✅ Claude API Success!');
    console.log('Response:', JSON.stringify(data, null, 2));

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

testClaudeAPI();
