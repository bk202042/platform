// Quick Community Feature Test Script
// Run this in browser console or as a simple test

const BASE_URL = 'http://localhost:3000';

// Test 1: Check if community page loads
async function testCommunityPageLoad() {
  console.log('🧪 Testing Community Page Load...');
  try {
    const response = await fetch(`${BASE_URL}/community`);
    if (response.ok) {
      console.log('✅ Community page loads successfully');
      return true;
    } else {
      console.log('❌ Community page failed to load:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Error loading community page:', error);
    return false;
  }
}

// Test 2: Check if community API endpoints exist
async function testCommunityAPIEndpoints() {
  console.log('🧪 Testing Community API Endpoints...');
  const endpoints = [
    '/api/community/posts',
    '/api/community/apartments'
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`);
      console.log(`✅ ${endpoint}: ${response.status}`);
    } catch (error) {
      console.log(`❌ ${endpoint}: Error - ${error.message}`);
    }
  }
}

// Test 3: Check if apartments data is available
async function testApartmentsData() {
  console.log('🧪 Testing Apartments Data...');
  try {
    const response = await fetch(`${BASE_URL}/api/community/apartments`);
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Apartments data available:', data.length, 'apartments');
      return true;
    } else {
      console.log('❌ Apartments data not available:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Error fetching apartments:', error);
    return false;
  }
}

// Test 4: Check if posts data is available
async function testPostsData() {
  console.log('🧪 Testing Posts Data...');
  try {
    const response = await fetch(`${BASE_URL}/api/community/posts`);
    if (response.ok) {
      const result = await response.json();
      // Handle the API response structure: { success: true, data: posts }
      const posts = result.data || result;
      const postCount = Array.isArray(posts) ? posts.length : 0;
      console.log('✅ Posts data available:', postCount, 'posts');
      return true;
    } else {
      console.log('❌ Posts data not available:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Error fetching posts:', error);
    return false;
  }
}

// Test 5: Check authentication status
async function testAuthenticationStatus() {
  console.log('🧪 Testing Authentication Status...');
  try {
    const response = await fetch(`${BASE_URL}/api/auth/check`);
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Auth check endpoint works:', data.authenticated ? 'Logged in' : 'Not logged in');
      return true;
    } else {
      console.log('❌ Auth check failed:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Error checking auth:', error);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Community Feature Tests...\n');

  const results = {
    pageLoad: await testCommunityPageLoad(),
    apiEndpoints: await testCommunityAPIEndpoints(),
    apartmentsData: await testApartmentsData(),
    postsData: await testPostsData(),
    authStatus: await testAuthenticationStatus()
  };

  console.log('\n📊 Test Results Summary:');
  console.log('Page Load:', results.pageLoad ? '✅ PASS' : '❌ FAIL');
  console.log('API Endpoints:', results.apiEndpoints ? '✅ PASS' : '❌ FAIL');
  console.log('Apartments Data:', results.apartmentsData ? '✅ PASS' : '❌ FAIL');
  console.log('Posts Data:', results.postsData ? '✅ PASS' : '❌ FAIL');
  console.log('Auth Status:', results.authStatus ? '✅ PASS' : '❌ FAIL');

  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;

  console.log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed`);

  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Community feature is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Check the logs above for details.');
  }
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.runCommunityTests = runAllTests;
  console.log('💡 Run "runCommunityTests()" in console to test community features');
}

// Run tests if this is executed directly
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runAllTests };
}
