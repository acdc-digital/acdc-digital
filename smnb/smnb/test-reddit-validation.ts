// Quick test script for Reddit API validation
// Run with: npx tsx test-reddit-validation.ts

async function validateRedditSource(name: string, type: "subreddit" | "user") {
  const url = type === "subreddit"
    ? `https://www.reddit.com/${name}/about.json`
    : `https://www.reddit.com/user/${name.replace(/^u\//, '')}/about.json`;
  
  console.log(`\n🔍 Testing: ${name} (${type})`);
  console.log(`   URL: ${url}`);
  
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "SMNB-MNQ1-Scanner/1.0" }
    });
    
    console.log(`   Status: ${res.status} ${res.statusText}`);
    
    if (!res.ok) {
      console.log(`   ❌ Failed: HTTP ${res.status}`);
      return null;
    }
    
    const json = await res.json();
    const data = json?.data;
    if (!data) {
      console.log(`   ❌ Failed: No data in response`);
      return null;
    }
    
    // Filter out quarantined/NSFW by default
    if (data.quarantine) {
      console.log(`   ⚠️  Filtered: Quarantined`);
      return null;
    }
    if (data.over18) {
      console.log(`   ⚠️  Filtered: NSFW`);
      return null;
    }
    
    // Minimum activity threshold
    const subscribers = data.subscribers ?? data.total_karma ?? 0;
    if (subscribers < 100) {
      console.log(`   ⚠️  Filtered: Too few subscribers (${subscribers})`);
      return null;
    }
    
    console.log(`   ✅ Valid!`);
    console.log(`      Subscribers: ${subscribers.toLocaleString()}`);
    console.log(`      Active: ${(data.active_user_count ?? 0).toLocaleString()}`);
    console.log(`      Description: ${(data.public_description ?? data.description ?? '').slice(0, 80)}...`);
    
    return {
      subscribers,
      active_users: data.active_user_count ?? 0,
      created_utc: data.created_utc ?? 0,
      description: data.public_description ?? "",
      is_nsfw: data.over18 ?? false,
      is_quarantined: data.quarantine ?? false,
    };
  } catch (error) {
    console.log(`   ❌ Error: ${(error as Error).message}`);
    return null;
  }
}

async function main() {
  console.log("🚀 Testing Reddit API Validation");
  console.log("================================\n");
  
  const testCases: Array<[string, "subreddit" | "user"]> = [
    ["r/stocks", "subreddit"],
    ["r/wallstreetbets", "subreddit"],
    ["r/NVIDIA", "subreddit"],
    ["r/ThisSubDoesNotExist123456", "subreddit"],
    ["u/Nasdaq", "user"],
  ];
  
  for (const [name, type] of testCases) {
    await validateRedditSource(name, type);
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log("\n✅ Test complete!");
}

main().catch(console.error);
