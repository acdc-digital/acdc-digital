// DEBUG CLAUDE API - Simple test to identify 400 error cause
// /Users/matthewsimon/Projects/LifeOS/LifeOS/scripts/debug-claude-simple.js

const testClaudeAPI = async () => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    console.error('❌ ANTHROPIC_API_KEY environment variable is not set');
    console.log('Please set your API key: export ANTHROPIC_API_KEY=your_key_here');
    process.exit(1);
  }
  
  const requestBody = {
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1000,
    messages: [
      {"role": "user", "content": "Hello, say hi back"}
    ]
  };

  console.log('Testing Claude API with request body:');
  console.log(JSON.stringify(requestBody, null, 2));

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers));
    
    const responseText = await response.text();
    console.log('Response body:', responseText);

    if (!response.ok) {
      console.error('API Error - Status:', response.status);
      console.error('API Error - Body:', responseText);
    } else {
      const data = JSON.parse(responseText);
      console.log('Success! Content:', data.content?.[0]?.text || 'No text content');
    }
  } catch (error) {
    console.error('Request failed:', error);
  }
};

testClaudeAPI();
