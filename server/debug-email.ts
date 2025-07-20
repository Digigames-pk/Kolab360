import { emailService } from './services/EmailService';

async function testAllEmails() {
  const recipientEmail = 'marty@24flix.com';
  
  console.log('🚀 Starting comprehensive email test suite...');
  console.log(`📧 Sending all email types to: ${recipientEmail}`);
  console.log('=' + '='.repeat(60));
  
  const emailTests = [
    {
      type: 'Welcome Email',
      test: () => emailService.sendWelcomeEmail(recipientEmail, 'Marty', 'Kolab360 Team Workspace')
    },
    {
      type: 'Mention Notification',
      test: () => emailService.sendMentionEmail(
        recipientEmail, 
        'Marty', 
        'John Doe', 
        'general', 
        'Hey @Marty, can you review the latest project update? We need your feedback on the new features we discussed yesterday.'
      )
    },
    {
      type: 'Task Assignment',
      test: () => emailService.sendTaskAssignedEmail(
        recipientEmail,
        'Marty',
        'Review Q4 Financial Reports and Prepare Summary',
        'Sarah Johnson',
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        'high'
      )
    },
    {
      type: 'Calendar Invitation',
      test: () => {
        const startDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
        const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
        return emailService.sendCalendarInviteEmail(
          recipientEmail,
          'Marty',
          'Quarterly Team Strategy Meeting',
          startDate.toISOString(),
          endDate.toISOString(),
          'Conference Room A (or Zoom link: https://zoom.us/j/123456789)',
          'Important quarterly planning session to discuss goals, roadmap, and resource allocation for Q1 2025.'
        );
      }
    },
    {
      type: 'Password Reset',
      test: () => emailService.sendPasswordResetEmail(
        recipientEmail,
        'Marty',
        'reset_token_abc123xyz789_secure'
      )
    },
    {
      type: 'Workspace Invitation',
      test: () => emailService.sendWorkspaceInviteEmail(
        recipientEmail,
        'Marty',
        'Sarah Johnson',
        'Kolab360 Development Team',
        'INVITE2025'
      )
    },
    {
      type: 'Daily Digest',
      test: () => emailService.sendDailyDigestEmail(
        recipientEmail,
        'Marty',
        {
          newMessages: 24,
          completedTasks: 5,
          upcomingEvents: 3,
          activeUsers: 12,
          topChannel: 'dev-team',
          topContributor: 'Sarah Johnson',
          filesShared: 8
        }
      )
    }
  ];
  
  let successCount = 0;
  let failureCount = 0;
  const results = [];
  
  for (const emailTest of emailTests) {
    try {
      console.log(`\n📤 Sending ${emailTest.type}...`);
      const result = await emailTest.test();
      
      if (result.success) {
        console.log(`✅ ${emailTest.type} sent successfully!`);
        console.log(`   Message ID: ${result.messageId}`);
        successCount++;
        results.push({ type: emailTest.type, status: 'success', messageId: result.messageId });
      } else {
        console.log(`❌ ${emailTest.type} failed: ${result.error}`);
        failureCount++;
        results.push({ type: emailTest.type, status: 'failed', error: result.error });
      }
    } catch (error) {
      console.log(`💥 ${emailTest.type} crashed: ${error.message}`);
      failureCount++;
      results.push({ type: emailTest.type, status: 'crashed', error: error.message });
    }
    
    // Small delay between emails
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 EMAIL TEST RESULTS SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Successful sends: ${successCount}`);
  console.log(`❌ Failed sends: ${failureCount}`);
  console.log(`📧 Total attempted: ${emailTests.length}`);
  console.log(`🎯 Success rate: ${Math.round((successCount / emailTests.length) * 100)}%`);
  
  if (successCount > 0) {
    console.log(`\n🎉 ${successCount} emails have been sent to ${recipientEmail}!`);
    console.log('Check your inbox (including spam folder) for the test emails.');
  }
  
  if (failureCount > 0) {
    console.log('\n🔍 DEBUGGING INFO:');
    console.log('Failed email details:');
    results.filter(r => r.status !== 'success').forEach(result => {
      console.log(`  - ${result.type}: ${result.error}`);
    });
  }
  
  return results;
}

// Check environment setup
function checkEmailSetup() {
  console.log('🔧 CHECKING EMAIL SYSTEM SETUP');
  console.log('='.repeat(40));
  
  const hasResendKey = !!process.env.RESEND_API_KEY;
  console.log(`RESEND_API_KEY: ${hasResendKey ? '✅ Present' : '❌ Missing'}`);
  
  if (hasResendKey) {
    console.log(`API Key length: ${process.env.RESEND_API_KEY.length} characters`);
    console.log(`API Key prefix: ${process.env.RESEND_API_KEY.substring(0, 10)}...`);
  }
  
  console.log('='.repeat(40));
  
  return hasResendKey;
}

// Run if called directly
if (require.main === module) {
  checkEmailSetup();
  testAllEmails().then(results => {
    console.log('\n🏁 Email testing complete!');
    process.exit(0);
  }).catch(error => {
    console.error('💥 Email testing failed:', error);
    process.exit(1);
  });
}

export { testAllEmails, checkEmailSetup };