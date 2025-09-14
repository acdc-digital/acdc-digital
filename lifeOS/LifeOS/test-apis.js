// TEST LIVE APIS - Quick test script for debugging research APIs
// /Users/matthewsimon/Projects/LifeOS/LifeOS/test-apis.js

console.log('🔍 Testing live research APIs...');

async function testWikipediaAPI() {
  console.log('\n📚 Testing Wikipedia API...');
  try {
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=artificial%20intelligence&format=json&srlimit=2&origin=*`;
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'LifeOS/1.0 (https://lifeos.ai; research@lifeos.ai)',
        'Accept': 'application/json'
      }
    });

    console.log('✅ Wikipedia API Status:', response.status);
    const data = await response.json();
    console.log('✅ Wikipedia API Results:', data.query?.search?.length || 0, 'articles found');
    console.log('Sample title:', data.query?.search?.[0]?.title);
    
    return true;
  } catch (error) {
    console.error('❌ Wikipedia API failed:', error.message);
    return false;
  }
}

async function testDuckDuckGoAPI() {
  console.log('\n🦆 Testing DuckDuckGo HTML API...');
  try {
    const searchUrl = `https://html.duckduckgo.com/html/?q=artificial%20intelligence`;
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      }
    });

    console.log('✅ DuckDuckGo API Status:', response.status);
    const html = await response.text();
    console.log('✅ DuckDuckGo Response Length:', html.length, 'characters');
    
    // Test simple link extraction
    const linkMatches = html.match(/<a[^>]*href="https?:\/\/[^"]*"[^>]*>[^<]+<\/a>/g) || [];
    console.log('✅ DuckDuckGo Links found:', linkMatches.length);
    
    return true;
  } catch (error) {
    console.error('❌ DuckDuckGo API failed:', error.message);
    return false;
  }
}

async function testResearchAPI() {
  console.log('\n🤖 Testing Research API endpoint...');
  try {
    const response = await fetch('http://localhost:4444/api/research', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: 'What is artificial intelligence?',
        complexity: 'simple',
        userId: 'test_user'
      }),
    });

    console.log('✅ Research API Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Research API Success:', data.success);
      console.log('✅ Research Summary Length:', data.data?.summary?.length || 0);
      console.log('✅ Citations Count:', data.data?.citations?.length || 0);
    } else {
      const errorData = await response.json();
      console.error('❌ Research API Error:', errorData);
    }
    
    return response.ok;
  } catch (error) {
    console.error('❌ Research API failed:', error.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('🧪 Starting API tests...\n');
  
  const wikiResult = await testWikipediaAPI();
  const ddgResult = await testDuckDuckGoAPI();
  const apiResult = await testResearchAPI();
  
  console.log('\n📊 Test Results:');
  console.log('Wikipedia API:', wikiResult ? '✅ PASS' : '❌ FAIL');
  console.log('DuckDuckGo API:', ddgResult ? '✅ PASS' : '❌ FAIL');
  console.log('Research API:', apiResult ? '✅ PASS' : '❌ FAIL');
  
  if (wikiResult && ddgResult && apiResult) {
    console.log('\n🎉 All APIs working correctly!');
  } else {
    console.log('\n⚠️  Some APIs need attention.');
  }
}

runTests().catch(console.error);
