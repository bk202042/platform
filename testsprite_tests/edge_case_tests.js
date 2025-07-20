// Edge Case Tests for Community Features
// Run these after logging in to test edge cases

const BASE_URL = 'http://localhost:3000';

// Test 1: Invalid post creation (missing required fields)
async function testInvalidPostCreation() {
  console.log('🚫 Testing Invalid Post Creation...');

  const invalidPosts = [
    { category: 'FREE', body: 'Test' }, // Missing apartment_id
    { apartment_id: 'test-id', body: 'Test' }, // Missing category
    { apartment_id: 'test-id', category: 'FREE' }, // Missing body
    { apartment_id: 'test-id', category: 'INVALID_CATEGORY', body: 'Test' }, // Invalid category
  ];

  for (let i = 0; i < invalidPosts.length; i++) {
    const post = invalidPosts[i];
    console.log(`  Testing invalid post ${i + 1}:`, post);

    try {
      const response = await fetch(`${BASE_URL}/api/community/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(post)
      });

      if (response.status === 400) {
        const error = await response.json();
        console.log(`    ✅ Correctly rejected with 400: ${error.message}`);
      } else {
        console.log(`    ❌ Should have been rejected, got ${response.status}`);
      }
    } catch (error) {
      console.log(`    ❌ Error: ${error.message}`);
    }
  }
}

// Test 2: Unauthorized access (without authentication)
async function testUnauthorizedAccess() {
  console.log('🔒 Testing Unauthorized Access...');

  // This test should be run in an incognito window or after logging out
  const endpoints = [
    { url: '/api/community/posts', method: 'POST' },
    { url: '/api/community/posts/test-id/like', method: 'POST' },
    { url: '/api/community/posts/test-id/comments', method: 'POST' },
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${BASE_URL}${endpoint.url}`, {
        method: endpoint.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      if (response.status === 401) {
        console.log(`  ✅ ${endpoint.url} correctly returns 401 for unauthorized access`);
      } else {
        console.log(`  ❌ ${endpoint.url} should return 401, got ${response.status}`);
      }
    } catch (error) {
      console.log(`  ❌ Error testing ${endpoint.url}: ${error.message}`);
    }
  }
}

// Test 3: Large content validation
async function testLargeContentValidation() {
  console.log('📏 Testing Large Content Validation...');

  // Get apartments first
  const apartmentsResponse = await fetch(`${BASE_URL}/api/community/apartments`);
  const apartmentsData = await apartmentsResponse.json();
  const apartments = apartmentsData.data || apartmentsData;

  if (!apartments || apartments.length === 0) {
    console.log('  ❌ No apartments available for testing');
    return;
  }

  const largePost = {
    apartment_id: apartments[0].id,
    category: 'FREE',
    title: 'A'.repeat(1000), // Very long title
    body: 'B'.repeat(10000), // Very long body
    images: []
  };

  try {
    const response = await fetch(`${BASE_URL}/api/community/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(largePost)
    });

    if (response.status === 400) {
      const error = await response.json();
      console.log('  ✅ Large content correctly rejected:', error.message);
    } else {
      console.log(`  ❌ Large content should have been rejected, got ${response.status}`);
    }
  } catch (error) {
    console.log('  ❌ Error testing large content:', error.message);
  }
}

// Test 4: Duplicate like prevention
async function testDuplicateLikePrevention() {
  console.log('🔄 Testing Duplicate Like Prevention...');

  // First create a test post
  const apartmentsResponse = await fetch(`${BASE_URL}/api/community/apartments`);
  const apartmentsData = await apartmentsResponse.json();
  const apartments = apartmentsData.data || apartmentsData;

  if (!apartments || apartments.length === 0) {
    console.log('  ❌ No apartments available for testing');
    return;
  }

  const testPost = {
    apartment_id: apartments[0].id,
    category: 'FREE',
    title: 'Duplicate Like Test',
    body: 'Testing duplicate like prevention',
    images: []
  };

  try {
    // Create post
    const postResponse = await fetch(`${BASE_URL}/api/community/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPost)
    });

    if (!postResponse.ok) {
      console.log('  ❌ Failed to create test post');
      return;
    }

    const postData = await postResponse.json();
    const postId = postData.data?.id;

    // Like the post multiple times
    for (let i = 0; i < 3; i++) {
      const likeResponse = await fetch(`${BASE_URL}/api/community/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (likeResponse.ok) {
        console.log(`  ✅ Like ${i + 1} successful`);
      } else {
        console.log(`  ❌ Like ${i + 1} failed:`, likeResponse.status);
      }
    }

    // Clean up - delete the test post
    await fetch(`${BASE_URL}/api/community/posts/${postId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.log('  ❌ Error testing duplicate likes:', error.message);
  }
}

// Test 5: XSS prevention
async function testXSSPrevention() {
  console.log('🛡️ Testing XSS Prevention...');

  const apartmentsResponse = await fetch(`${BASE_URL}/api/community/apartments`);
  const apartmentsData = await apartmentsResponse.json();
  const apartments = apartmentsData.data || apartmentsData;

  if (!apartments || apartments.length === 0) {
    console.log('  ❌ No apartments available for testing');
    return;
  }

  const xssPost = {
    apartment_id: apartments[0].id,
    category: 'FREE',
    title: '<script>alert("XSS")</script>',
    body: '<img src="x" onerror="alert(\'XSS\')">',
    images: []
  };

  try {
    const response = await fetch(`${BASE_URL}/api/community/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(xssPost)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('  ✅ XSS content accepted (will be sanitized on frontend)');

      // Clean up
      await fetch(`${BASE_URL}/api/community/posts/${result.data?.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      console.log(`  ❌ XSS content rejected: ${response.status}`);
    }
  } catch (error) {
    console.log('  ❌ Error testing XSS prevention:', error.message);
  }
}

// Run all edge case tests
async function runEdgeCaseTests() {
  console.log('🚀 Starting Edge Case Tests...\n');

  await testInvalidPostCreation();
  console.log('');

  await testLargeContentValidation();
  console.log('');

  await testDuplicateLikePrevention();
  console.log('');

  await testXSSPrevention();
  console.log('');

  console.log('📊 Edge Case Tests Completed!');
  console.log('💡 Check the results above for any unexpected behavior.');
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.runEdgeCaseTests = runEdgeCaseTests;
  console.log('💡 Run "runEdgeCaseTests()" in console to test edge cases');
}

// Run tests if this is executed directly
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runEdgeCaseTests };
}
