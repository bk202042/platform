// Authenticated Community Feature Test Script
// Run this in browser console after logging in

const BASE_URL = 'https://vinahome.cc';

// Test 1: Check authentication status
async function testAuthenticationStatus() {
  console.log('🔐 Testing Authentication Status...');
  try {
    const response = await fetch(`${BASE_URL}/api/auth/check`);
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Authentication check:', data.authenticated ? 'Logged in' : 'Not logged in');
      return data.authenticated;
    } else {
      console.log('❌ Auth check failed:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Error checking auth:', error);
    return false;
  }
}

// Test 2: Test post creation
async function testPostCreation() {
  console.log('📝 Testing Post Creation...');
  try {
    // First get apartments to use for the post
    const apartmentsResponse = await fetch(`${BASE_URL}/api/community/apartments`);
    const apartmentsData = await apartmentsResponse.json();
    const apartments = apartmentsData.data || apartmentsData;

    if (!apartments || apartments.length === 0) {
      console.log('❌ No apartments available for post creation');
      return false;
    }

    const testPost = {
      apartment_id: apartments[0].id,
      category: 'FREE', // 자유글
      title: '테스트 게시글',
      body: '이것은 테스트 게시글입니다. 커뮤니티 기능을 테스트하기 위해 작성되었습니다.',
      images: []
    };

    const response = await fetch(`${BASE_URL}/api/community/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPost)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Post created successfully:', result.data?.id);
      return result.data?.id;
    } else {
      const error = await response.json();
      console.log('❌ Post creation failed:', response.status, error.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Error creating post:', error);
    return false;
  }
}

// Test 3: Test like functionality
async function testLikeFunctionality(postId) {
  console.log('👍 Testing Like Functionality...');
  if (!postId) {
    console.log('⚠️  No post ID provided for like test');
    return false;
  }

  try {
    // Test adding like
    const likeResponse = await fetch(`${BASE_URL}/api/community/posts/${postId}/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (likeResponse.ok) {
      console.log('✅ Like added successfully');

      // Test removing like (toggle)
      const unlikeResponse = await fetch(`${BASE_URL}/api/community/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (unlikeResponse.ok) {
        console.log('✅ Like removed successfully (toggle works)');
        return true;
      } else {
        console.log('❌ Like removal failed');
        return false;
      }
    } else {
      const error = await likeResponse.json();
      console.log('❌ Like addition failed:', likeResponse.status, error.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Error testing like functionality:', error);
    return false;
  }
}

// Test 4: Test comment functionality
async function testCommentFunctionality(postId) {
  console.log('💬 Testing Comment Functionality...');
  if (!postId) {
    console.log('⚠️  No post ID provided for comment test');
    return false;
  }

  try {
    const testComment = {
      body: '테스트 댓글입니다. 댓글 기능이 잘 작동하는지 확인합니다.'
    };

    const response = await fetch(`${BASE_URL}/api/community/posts/${postId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testComment)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Comment created successfully:', result.data?.id);
      return result.data?.id;
    } else {
      const error = await response.json();
      console.log('❌ Comment creation failed:', response.status, error.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Error creating comment:', error);
    return false;
  }
}

// Test 5: Test comment deletion
async function testCommentDeletion(commentId) {
  console.log('🗑️ Testing Comment Deletion...');
  if (!commentId) {
    console.log('⚠️  No comment ID provided for deletion test');
    return false;
  }

  try {
    const response = await fetch(`${BASE_URL}/api/community/comments/${commentId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (response.ok) {
      console.log('✅ Comment deleted successfully');
      return true;
    } else {
      const error = await response.json();
      console.log('❌ Comment deletion failed:', response.status, error.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Error deleting comment:', error);
    return false;
  }
}

// Test 6: Test post deletion
async function testPostDeletion(postId) {
  console.log('🗑️ Testing Post Deletion...');
  if (!postId) {
    console.log('⚠️  No post ID provided for deletion test');
    return false;
  }

  try {
    const response = await fetch(`${BASE_URL}/api/community/posts/${postId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (response.ok) {
      console.log('✅ Post deleted successfully');
      return true;
    } else {
      const error = await response.json();
      console.log('❌ Post deletion failed:', response.status, error.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Error deleting post:', error);
    return false;
  }
}

// Run all authenticated tests
async function runAuthenticatedTests() {
  console.log('🚀 Starting Authenticated Community Feature Tests...\n');

  // Check if user is authenticated
  const isAuthenticated = await testAuthenticationStatus();
  if (!isAuthenticated) {
    console.log('❌ User is not authenticated. Please log in first.');
    console.log('💡 Go to http://localhost:3000/auth/sign-in to log in');
    return;
  }

  console.log('✅ User is authenticated, proceeding with tests...\n');

  // Create a test post
  const postId = await testPostCreation();

  // Test like functionality
  const likeSuccess = await testLikeFunctionality(postId);

  // Test comment functionality
  const commentId = await testCommentFunctionality(postId);

  // Test comment deletion
  const commentDeletionSuccess = await testCommentDeletion(commentId);

  // Test post deletion (cleanup)
  const postDeletionSuccess = await testPostDeletion(postId);

  // Summary
  console.log('\n📊 Authenticated Test Results Summary:');
  console.log('Authentication:', isAuthenticated ? '✅ PASS' : '❌ FAIL');
  console.log('Post Creation:', postId ? '✅ PASS' : '❌ FAIL');
  console.log('Like Functionality:', likeSuccess ? '✅ PASS' : '❌ FAIL');
  console.log('Comment Creation:', commentId ? '✅ PASS' : '❌ FAIL');
  console.log('Comment Deletion:', commentDeletionSuccess ? '✅ PASS' : '❌ FAIL');
  console.log('Post Deletion:', postDeletionSuccess ? '✅ PASS' : '❌ FAIL');

  const passedTests = [isAuthenticated, postId, likeSuccess, commentId, commentDeletionSuccess, postDeletionSuccess].filter(Boolean).length;
  const totalTests = 6;

  console.log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed`);

  if (passedTests === totalTests) {
    console.log('🎉 All authenticated tests passed! Community features are working perfectly.');
  } else {
    console.log('⚠️  Some authenticated tests failed. Check the logs above for details.');
  }
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.runAuthenticatedTests = runAuthenticatedTests;
  console.log('💡 Run "runAuthenticatedTests()" in console to test authenticated community features');
}

// Run tests if this is executed directly
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runAuthenticatedTests };
}
