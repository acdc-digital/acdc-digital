// ENHANCED RESEARCH TEST - Test the real research tools
// /Users/matthewsimon/Projects/LifeOS/LifeOS/scripts/test-enhanced-research.js

const testEnhancedResearch = async () => {
  try {
    console.log('🧪 Testing Enhanced Research API...\n');

    // Test research request with real tools
    console.log('🔍 Testing research with real data sources...');
    const researchResponse = await fetch('http://localhost:4444/api/research', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: 'benefits of learning mathematics',
        complexity: 'medium',
        userId: 'test_user'
      }),
    });
    
    const researchData = await researchResponse.json();
    
    if (researchData.success) {
      console.log('✅ Enhanced research request successful!');
      console.log('\n📊 Results:');
      console.log(`Summary: ${researchData.data.summary.substring(0, 200)}...`);
      console.log(`Key points: ${researchData.data.keyPoints?.length || 0}`);
      console.log(`Citations: ${researchData.data.citations?.length || 0}`);
      console.log(`Confidence: ${Math.round((researchData.data.confidence || 0) * 100)}%`);
      console.log(`Time elapsed: ${researchData.data.timeElapsed}ms`);
      console.log(`Tokens used: ${researchData.data.tokensUsed}`);
      
      // Show actual citations if available
      if (researchData.data.citations && researchData.data.citations.length > 0) {
        console.log('\n📚 Citations found:');
        researchData.data.citations.slice(0, 3).forEach((citation, index) => {
          console.log(`${index + 1}. ${citation.title}`);
          if (citation.url) console.log(`   ${citation.url}`);
          if (citation.snippet) console.log(`   "${citation.snippet.substring(0, 100)}..."`);
        });
      }
    } else {
      console.log('❌ Enhanced research request failed:', researchData.error);
      console.log('Details:', researchData.details);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure the Next.js dev server is running on port 4444');
  }
};

testEnhancedResearch();
