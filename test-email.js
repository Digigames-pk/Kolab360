// Test email sending directly 
const testEmail = async () => {
  try {
    console.log('Testing direct email...');
    const { emailService } = require('./server/email');
    
    const result = await emailService.sendWelcomeEmail(
      'marty@24flix.com',
      'Test User',
      'User', 
      'marty@24flix.com',
      'test123'
    );
    
    console.log('Direct email test result:', result);
  } catch (error) {
    console.error('Direct email test failed:', error.message);
  }
};

testEmail();