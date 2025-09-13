// Test Script for Story State Isolation
// This script verifies that content doesn't bleed between different stories

import { useEditorStore } from '../stores/editorStore';

export function testStoryIsolation() {
  console.log('🧪 Testing Story State Isolation...\n');
  
  const store = useEditorStore.getState();
  
  // Test 1: Create first story with blog content
  console.log('📝 Test 1: Creating Story A with blog content...');
  store.setCurrentStory('story-a');
  store.setCurrentContentType('blog');
  store.preserveContentForType('blog', '<h1>Story A Blog Post</h1><p>This is content for story A in blog format.</p>', {});
  
  const storyABlog = store.getContentForType('blog');
  console.log('✅ Story A blog content saved:', storyABlog?.html.substring(0, 50) + '...');
  
  // Test 2: Switch to second story and create newsletter content
  console.log('\n📝 Test 2: Switching to Story B with newsletter content...');
  store.setCurrentStory('story-b');
  store.setCurrentContentType('newsletter');
  store.preserveContentForType('newsletter', '<h1>Story B Newsletter</h1><p>This is content for story B in newsletter format.</p>', {});
  
  const storyBNewsletter = store.getContentForType('newsletter');
  console.log('✅ Story B newsletter content saved:', storyBNewsletter?.html.substring(0, 50) + '...');
  
  // Test 3: Verify Story A content is still isolated
  console.log('\n🔍 Test 3: Checking Story A content isolation...');
  store.setCurrentStory('story-a');
  const storyABlogCheck = store.getContentForType('blog');
  const storyANewsletterCheck = store.getContentForType('newsletter');
  
  console.log('Story A blog content still exists:', !!storyABlogCheck);
  console.log('Story A newsletter content (should be empty):', !!storyANewsletterCheck);
  
  if (storyABlogCheck && !storyANewsletterCheck) {
    console.log('✅ Story A isolation: PASSED');
  } else {
    console.log('❌ Story A isolation: FAILED');
  }
  
  // Test 4: Verify Story B content is still isolated
  console.log('\n🔍 Test 4: Checking Story B content isolation...');
  store.setCurrentStory('story-b');
  const storyBNewsletterCheck = store.getContentForType('newsletter');
  const storyBBlogCheck = store.getContentForType('blog');
  
  console.log('Story B newsletter content still exists:', !!storyBNewsletterCheck);
  console.log('Story B blog content (should be empty):', !!storyBBlogCheck);
  
  if (storyBNewsletterCheck && !storyBBlogCheck) {
    console.log('✅ Story B isolation: PASSED');
  } else {
    console.log('❌ Story B isolation: FAILED');
  }
  
  // Test 5: Cross-contamination check
  console.log('\n🔍 Test 5: Cross-contamination check...');
  store.setCurrentStory('story-a');
  const crossCheckNewsletter = store.getContentForType('newsletter');
  store.setCurrentStory('story-b');
  const crossCheckBlog = store.getContentForType('blog');
  
  if (!crossCheckNewsletter && !crossCheckBlog) {
    console.log('✅ Cross-contamination check: PASSED - No content bleeding detected');
  } else {
    console.log('❌ Cross-contamination check: FAILED - Content bleeding detected!');
    console.log('Story A newsletter leak:', !!crossCheckNewsletter);
    console.log('Story B blog leak:', !!crossCheckBlog);
  }
  
  // Test 6: Cleanup test
  console.log('\n🗑️ Test 6: Cleanup test...');
  store.clearStoryState('story-a');
  store.setCurrentStory('story-a');
  const cleanupCheck = store.getContentForType('blog');
  
  if (!cleanupCheck) {
    console.log('✅ Cleanup test: PASSED - Story A content properly cleared');
  } else {
    console.log('❌ Cleanup test: FAILED - Story A content still exists after cleanup');
  }
  
  console.log('\n🧪 Story isolation tests completed!');
}

// Export for console testing
if (typeof window !== 'undefined') {
  (window as any).testStoryIsolation = testStoryIsolation;
}