// Debug script to check posts data structure
// Run this in browser console

async function debugPostsData() {
  console.log('🔍 Debugging Posts Data Structure...');

  try {
    const response = await fetch('http://localhost:3000/api/community/posts');
    const result = await response.json();

    console.log('📋 Full API Response:');
    console.log(result);

    console.log('\n📊 Response Structure:');
    console.log('- success:', result.success);
    console.log('- data type:', typeof result.data);
    console.log('- data is array:', Array.isArray(result.data));

    if (Array.isArray(result.data)) {
      console.log('- posts count:', result.data.length);
      if (result.data.length > 0) {
        console.log('- first post structure:', result.data[0]);
      }
    }

  } catch (error) {
    console.log('❌ Error:', error);
  }
}

// Export for browser console
if (typeof window !== 'undefined') {
  window.debugPostsData = debugPostsData;
  console.log('💡 Run "debugPostsData()" to check posts data structure');
}
