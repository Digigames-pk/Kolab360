// Test login for user ID 18 specifically
const testLogin = async () => {
  try {
    // First get user data
    const userData = await fetch('http://localhost:5000/api/organizations/5/users', {
      headers: { 'Content-Type': 'application/json' }
    });
    
    const users = await userData.json();
    const user18 = users.find(u => u.id === 18);
    
    console.log('User 18 data:', JSON.stringify(user18, null, 2));
    
    if (user18) {
      console.log('Testing login for user 18...');
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user18.email,
          password: 'test123'
        })
      });
      
      const result = await response.text();
      console.log('Login response status:', response.status);
      console.log('Login response:', result);
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
};

testLogin();