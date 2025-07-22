// Test login for marty@24flix.com with new password
const testLogin = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'marty@24flix.com',
        password: 'test123'
      })
    });
    
    const result = await response.text();
    console.log('Login response status:', response.status);
    console.log('Login response:', result);
  } catch (error) {
    console.error('Login test failed:', error);
  }
};

testLogin();