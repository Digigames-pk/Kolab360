import { EmailService } from './services/EmailService';

const emailService = new EmailService();

async function sendAllTestEmails() {
  const recipientEmail = 'marty@24flix.com';
  
  console.log('🚀 Starting comprehensive email test for marty@24flix.com');
  console.log('='.repeat(60));
  
  const emailTests = [
    {
      name: 'Welcome Email',
      test: async () => {
        console.log('📧 Sending Welcome Email...');
        const result = await emailService.sendWelcomeEmail(recipientEmail, 'Marty', 'Kolab360 Team Workspace');
        console.log('Result:', result);
        return result;
      }
    },
    {
      name: 'Mention Notification',
      test: async () => {
        console.log('📧 Sending Mention Notification...');
        const result = await emailService.sendMentionEmail(
          recipientEmail, 
          'Marty', 
          'John Doe', 
          'general', 
          'Hey @Marty, can you review the latest project update? We need your feedback on the new features we discussed yesterday.'
        );
        console.log('Result:', result);
        return result;
      }
    },
    {
      name: 'Task Assignment',
      test: async () => {
        console.log('📧 Sending Task Assignment...');
        const result = await emailService.sendTaskAssignedEmail(
          recipientEmail,
          'Marty',
          'Review Q4 Financial Reports and Prepare Summary',
          'Sarah Johnson',
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          'high'
        );
        console.log('Result:', result);
        return result;
      }
    },
    {
      name: 'Calendar Invitation',
      test: async () => {
        console.log('📧 Sending Calendar Invitation...');
        const startDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
        const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
        const result = await emailService.sendCalendarInviteEmail(
          recipientEmail,
          'Marty',
          'Quarterly Team Strategy Meeting',
          startDate.toISOString(),
          endDate.toISOString(),
          'Conference Room A (or Zoom link: https://zoom.us/j/123456789)',
          'Important quarterly planning session to discuss goals, roadmap, and resource allocation for Q1 2025.'
        );
        console.log('Result:', result);
        return result;
      }
    },
    {
      name: 'Password Reset',
      test: async () => {
        console.log('📧 Sending Password Reset...');
        const result = await emailService.sendPasswordResetEmail(
          recipientEmail,
          'Marty',
          'reset_token_abc123xyz789_secure'
        );
        console.log('Result:', result);
        return result;
      }
    },
    {
      name: 'Workspace Invitation',
      test: async () => {
        console.log('📧 Sending Workspace Invitation...');
        const result = await emailService.sendWorkspaceInviteEmail(
          recipientEmail,
          'Marty',
          'Sarah Johnson',
          'Kolab360 Development Team',
          'INVITE2025'
        );
        console.log('Result:', result);
        return result;
      }
    },
    {
      name: 'Daily Digest',
      test: async () => {
        console.log('📧 Sending Daily Digest...');
        const result = await emailService.sendDailyDigestEmail(
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
        );
        console.log('Result:', result);
        return result;
      }
    }
  ];
  
  let successCount = 0;
  let failureCount = 0;
  
  for (const emailTest of emailTests) {
    try {
      console.log(`\n${'='.repeat(40)}`);
      const result = await emailTest.test();
      
      if (result.success) {
        console.log(`✅ ${emailTest.name} sent successfully!`);
        console.log(`   Message ID: ${result.messageId}`);
        successCount++;
      } else {
        console.log(`❌ ${emailTest.name} failed: ${result.error}`);
        failureCount++;
      }
    } catch (error) {
      console.log(`💥 ${emailTest.name} crashed: ${error.message}`);
      failureCount++;
    }
    
    // Small delay between emails to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 EMAIL TEST RESULTS SUMMARY');
  console.log(`${'='.repeat(60)}`);
  console.log(`✅ Successful sends: ${successCount}`);
  console.log(`❌ Failed sends: ${failureCount}`);
  console.log(`📧 Total attempted: ${emailTests.length}`);
  console.log(`🎯 Success rate: ${Math.round((successCount / emailTests.length) * 100)}%`);
  
  if (successCount > 0) {
    console.log(`\n🎉 ${successCount} emails have been sent to ${recipientEmail}!`);
    console.log('Check your inbox (including spam folder) for the test emails.');
  } else {
    console.log('\n⚠️  No emails were sent successfully. Please check your Resend API configuration.');
  }
}

sendAllTestEmails().catch(console.error);