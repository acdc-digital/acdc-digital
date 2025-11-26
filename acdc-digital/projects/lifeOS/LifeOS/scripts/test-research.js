// RESEARCH SYSTEM TEST - Simple test for the research API
// /Users/matthewsimon/Projects/LifeOS/LifeOS/scripts/test-research.js

const testResearchAPI = async () => {
  try {
    console.log('🧪 Testing Research API...\n');

    // Test health check
    console.log('1. Testing health check...');
    const healthResponse = await fetch('http://localhost:4444/api/research?health=true');
    const healthData = await healthResponse.json();
    console.log('Health check result:', JSON.stringify(healthData, null, 2));
    
    // Test API documentation
    console.log('\n2. Testing API documentation...');
    const docsResponse = await fetch('http://localhost:4444/api/research');
    const docsData = await docsResponse.json();
    console.log('API docs:', JSON.stringify(docsData.endpoints, null, 2));
    
    // Test research request (this will use fallback/mock mode)
    console.log('\n3. Testing research request...');
    const researchResponse = await fetch('http://localhost:4444/api/research', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: 'What are the benefits of AI agents?',
        complexity: 'simple',
        userId: 'test_user'
      }),
    });
    
    const researchData = await researchResponse.json();
    
    if (researchData.success) {
      console.log('✅ Research request successful!');
      console.log('Result summary:', researchData.data.summary);
      console.log('Key points:', researchData.data.keyPoints?.length || 0);
      console.log('Citations:', researchData.data.citations?.length || 0);
      console.log('Confidence:', Math.round((researchData.data.confidence || 0) * 100) + '%');
    } else {
      console.log('❌ Research request failed:', researchData.error);
      console.log('Details:', researchData.details);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure the Next.js dev server is running on port 4444');
    console.log('Run: cd /Users/matthewsimon/Projects/LifeOS/LifeOS && npm run dev');
  }
};

testResearchAPI();
