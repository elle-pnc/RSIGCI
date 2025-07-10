// Simple test to check if BackendService loads
console.log('Testing BackendService...');

// Check if BackendService is defined
if (typeof BackendService !== 'undefined') {
  console.log('✅ BackendService is loaded successfully!');
  console.log('BackendService methods:', Object.getOwnPropertyNames(BackendService));
} else {
  console.log('❌ BackendService is not defined');
}

// Test the service
async function testBackendService() {
  try {
    if (typeof BackendService !== 'undefined') {
      const jobs = await BackendService.getJobs();
      console.log('✅ Jobs loaded:', jobs.length);
    }
  } catch (error) {
    console.error('❌ Error testing BackendService:', error);
  }
}

testBackendService(); 