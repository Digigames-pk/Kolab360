// Test script to verify Nerlyne's authentication and messaging
const fetch = require('node-fetch');

async function testNerlyneAuth() {
  console.log('🧪 Testing Nerlyne authentication and messaging...');
  
  try {
    // Test message creation with Nerlyne's User ID 23
    const response = await fetch('http://localhost:5000/api/channels/general/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: 'Test message from Nerlyne via auth fix',
        authorId: 23
      })
    });
    
    const result = await response.json();
    console.log('📨 Message creation result:', response.status);
    console.log('📨 Response:', result);
    
    if (response.ok) {
      console.log('✅ Nerlyne can now send messages successfully!');
    } else {
      console.log('❌ Still having issues:', result);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testNerlyneAuth();