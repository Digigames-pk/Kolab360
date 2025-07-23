import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY environment variable is required');
}

const resend = new Resend(process.env.RESEND_API_KEY);

// Email template styles
const emailStyles = {
  container: `
    max-width: 600px;
    margin: 0 auto;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    line-height: 1.6;
    color: #333;
  `,
  header: `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 40px 20px;
    text-align: center;
    border-radius: 8px 8px 0 0;
  `,
  logo: `
    font-size: 28px;
    font-weight: bold;
    color: white;
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  `,
  content: `
    background: white;
    padding: 40px;
    border-radius: 0 0 8px 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  `,
  title: `
    font-size: 24px;
    margin-bottom: 16px;
    color: #1a1a1a;
  `,
  text: `
    font-size: 16px;
    margin-bottom: 20px;
    color: #555;
  `,
  button: `
    display: inline-block;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 14px 28px;
    text-decoration: none;
    border-radius: 6px;
    font-weight: 600;
    margin: 20px 0;
  `,
  footer: `
    text-align: center;
    padding: 30px 20px;
    color: #888;
    font-size: 14px;
  `,
  divider: `
    height: 1px;
    background: #e5e7eb;
    margin: 30px 0;
  `,
  badge: `
    display: inline-block;
    background: #f3f4f6;
    color: #374151;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
    margin: 0 4px;
  `
};

interface EmailTemplate {
  subject: string;
  html: string;
}

export class EmailService {
  private createTemplate(content: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>CollabSpace</title>
        </head>
        <body style="margin: 0; padding: 20px; background: #f9fafb;">
          <div style="${emailStyles.container}">
            ${content}
          </div>
        </body>
      </html>
    `;
  }

  // Welcome email template
  welcomeEmail(userName: string, userEmail: string, role: string): EmailTemplate {
    const roleDisplay = role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    const content = `
      <div style="${emailStyles.header}">
        <h1 style="${emailStyles.logo}">
          🚀 Kolab360
        </h1>
        <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Modern collaboration platform</p>
      </div>
      
      <div style="${emailStyles.content}">
        <h2 style="${emailStyles.title}">Welcome to Kolab360, ${userName}! 🎉</h2>
        
        <p style="${emailStyles.text}">
          Your account has been successfully created with <span style="${emailStyles.badge}">${roleDisplay}</span> access level.
        </p>
        
        <p style="${emailStyles.text}">
          Kolab360 brings modern collaboration to your team with AI-powered features, real-time messaging, 
          and intuitive workspace management. Here's what you can do:
        </p>
        
        <ul style="color: #555; margin-bottom: 30px;">
          <li style="margin-bottom: 8px;">🏢 Create and manage workspaces</li>
          <li style="margin-bottom: 8px;">💬 Join channels and start conversations</li>
          <li style="margin-bottom: 8px;">🤖 Use AI assistant for smart responses</li>
          <li style="margin-bottom: 8px;">📋 Generate tasks from conversations</li>
          <li style="margin-bottom: 8px;">📊 ${role === 'super_admin' || role === 'admin' ? 'Access admin analytics and user management' : 'Collaborate with your team seamlessly'}</li>
        </ul>
        
        <div style="text-align: center;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}" style="${emailStyles.button}">
            Start Collaborating
          </a>
        </div>
        
        <div style="${emailStyles.divider}"></div>
        
        <p style="font-size: 14px; color: #888;">
          <strong>Your Login Details:</strong><br>
          Email: ${userEmail}<br>
          Role: ${roleDisplay}
        </p>
      </div>
      
      <div style="${emailStyles.footer}">
        <p>Need help? Reply to this email or contact our support team.</p>
        <p style="margin-top: 20px;">
          <a href="#" style="color: #667eea; text-decoration: none;">Privacy Policy</a> | 
          <a href="#" style="color: #667eea; text-decoration: none;">Terms of Service</a>
        </p>
      </div>
    `;

    return {
      subject: `Welcome to Kolab360, ${userName}! 🚀`,
      html: this.createTemplate(content)
    };
  }

  // Workspace invitation email
  workspaceInviteEmail(inviterName: string, workspaceName: string, inviteCode: string, recipientName?: string): EmailTemplate {
    const greeting = recipientName ? `Hi ${recipientName}` : 'Hello';
    
    const content = `
      <div style="${emailStyles.header}">
        <h1 style="${emailStyles.logo}">
          🚀 Kolab360
        </h1>
        <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Workspace Invitation</p>
      </div>
      
      <div style="${emailStyles.content}">
        <h2 style="${emailStyles.title}">${greeting}, you're invited! 📨</h2>
        
        <p style="${emailStyles.text}">
          <strong>${inviterName}</strong> has invited you to join the <strong>${workspaceName}</strong> workspace on Kolab360.
        </p>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #667eea;">
          <p style="margin: 0; color: #374151;">
            <strong>Workspace:</strong> ${workspaceName}<br>
            <strong>Invite Code:</strong> <code style="background: #e5e7eb; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${inviteCode}</code>
          </p>
        </div>
        
        <p style="${emailStyles.text}">
          Join your team to start collaborating with modern tools including:
        </p>
        
        <ul style="color: #555; margin-bottom: 30px;">
          <li style="margin-bottom: 8px;">🔥 Real-time messaging and file sharing</li>
          <li style="margin-bottom: 8px;">🤖 AI-powered smart responses and task generation</li>
          <li style="margin-bottom: 8px;">📊 Team analytics and productivity insights</li>
          <li style="margin-bottom: 8px;">🎯 Organized channels and direct messaging</li>
        </ul>
        
        <div style="text-align: center;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}/join/${inviteCode}" style="${emailStyles.button}">
            Join Workspace
          </a>
        </div>
        
        <p style="font-size: 14px; color: #888; text-align: center; margin-top: 20px;">
          Or copy and paste this invite code when signing up: <strong>${inviteCode}</strong>
        </p>
      </div>
      
      <div style="${emailStyles.footer}">
        <p>Don't want to receive invitations? You can update your preferences in your account settings.</p>
      </div>
    `;

    return {
      subject: `You're invited to join ${workspaceName} on Kolab360`,
      html: this.createTemplate(content)
    };
  }

  // Password reset email
  passwordResetEmail(userName: string, resetToken: string): EmailTemplate {
    const content = `
      <div style="${emailStyles.header}">
        <h1 style="${emailStyles.logo}">
          🚀 Kolab360
        </h1>
        <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Password Reset Request</p>
      </div>
      
      <div style="${emailStyles.content}">
        <h2 style="${emailStyles.title}">Reset Your Password 🔐</h2>
        
        <p style="${emailStyles.text}">
          Hi ${userName}, we received a request to reset your Kolab360 password.
        </p>
        
        <p style="${emailStyles.text}">
          Click the button below to create a new password. This link will expire in 1 hour for security.
        </p>
        
        <div style="text-align: center;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}/reset-password/${resetToken}" style="${emailStyles.button}">
            Reset Password
          </a>
        </div>
        
        <div style="${emailStyles.divider}"></div>
        
        <p style="font-size: 14px; color: #888;">
          <strong>Security Notice:</strong><br>
          If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
        </p>
        
        <p style="font-size: 14px; color: #888;">
          For security reasons, this link will expire in 1 hour.
        </p>
      </div>
      
      <div style="${emailStyles.footer}">
        <p>Having trouble? Contact our support team for assistance.</p>
      </div>
    `;

    return {
      subject: 'Reset your Kolab360 password',
      html: this.createTemplate(content)
    };
  }

  // AI Summary email
  aiSummaryEmail(userName: string, workspaceName: string, summary: string, dateRange: string): EmailTemplate {
    const content = `
      <div style="${emailStyles.header}">
        <h1 style="${emailStyles.logo}">
          🤖 Kolab360 AI
        </h1>
        <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Daily Team Summary</p>
      </div>
      
      <div style="${emailStyles.content}">
        <h2 style="${emailStyles.title}">Your Team Summary for ${dateRange} 📊</h2>
        
        <p style="${emailStyles.text}">
          Hi ${userName}, here's what happened in <strong>${workspaceName}</strong> while you were away.
        </p>
        
        <div style="background: #f8fafc; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #10b981;">
          <h3 style="margin-top: 0; color: #065f46; font-size: 18px;">📋 AI-Generated Summary</h3>
          <div style="color: #374151; line-height: 1.6;">
            ${summary.split('\n').map(line => line.trim() ? `<p style="margin: 12px 0;">${line}</p>` : '').join('')}
          </div>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}/workspace/${workspaceName}" style="${emailStyles.button}">
            View Full Workspace
          </a>
        </div>
        
        <div style="${emailStyles.divider}"></div>
        
        <p style="font-size: 14px; color: #888;">
          💡 <strong>Tip:</strong> This summary was generated by our AI assistant to help you stay up-to-date with your team's progress.
        </p>
      </div>
      
      <div style="${emailStyles.footer}">
        <p>Want to adjust your summary frequency? Update your notification preferences in settings.</p>
      </div>
    `;

    return {
      subject: `Daily Summary: ${workspaceName} (${dateRange})`,
      html: this.createTemplate(content)
    };
  }

  // Mention notification email
  mentionNotificationEmail(userName: string, mentionedBy: string, channelName: string, messagePreview: string, workspaceName: string): EmailTemplate {
    const content = `
      <div style="${emailStyles.header}">
        <h1 style="${emailStyles.logo}">
          🚀 Kolab360
        </h1>
        <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">You were mentioned</p>
      </div>
      
      <div style="${emailStyles.content}">
        <h2 style="${emailStyles.title}">You were mentioned! 👋</h2>
        
        <p style="${emailStyles.text}">
          <strong>${mentionedBy}</strong> mentioned you in <strong>#${channelName}</strong> (${workspaceName})
        </p>
        
        <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #f59e0b;">
          <p style="margin: 0; color: #92400e; font-style: italic;">
            "${messagePreview}"
          </p>
        </div>
        
        <div style="text-align: center;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}/workspace/${workspaceName}/channel/${channelName}" style="${emailStyles.button}">
            View Message
          </a>
        </div>
        
        <p style="font-size: 14px; color: #888; text-align: center; margin-top: 20px;">
          Reply directly in the app to continue the conversation.
        </p>
      </div>
      
      <div style="${emailStyles.footer}">
        <p>Too many notifications? Adjust your mention settings in your preferences.</p>
      </div>
    `;

    return {
      subject: `${mentionedBy} mentioned you in #${channelName}`,
      html: this.createTemplate(content)
    };
  }

  // Welcome email with credentials for admin-created users
  welcomeEmailWithCredentials(name: string, username: string, temporaryPassword: string, role: string): EmailTemplate {
    const content = `
      <div style="${emailStyles.header}">
        <h1 style="${emailStyles.logo}">
          🚀 Kolab360
        </h1>
        <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Welcome to your organization</p>
      </div>
      
      <div style="${emailStyles.content}">
        <h2 style="${emailStyles.title}">Welcome to KOLAB360! 🎉</h2>
        
        <p style="${emailStyles.text}">
          Hi ${name}, an administrator has created an account for you on KOLAB360.
        </p>
        
        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #0ea5e9;">
          <h3 style="margin: 0 0 15px 0; color: #0369a1;">Your Login Credentials</h3>
          <p style="margin: 0; color: #0c4a6e;">
            <strong>Email:</strong> ${username}<br>
            <strong>Temporary Password:</strong> <code style="background: #e0e7ff; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-weight: bold;">${temporaryPassword}</code><br>
            <strong>Role:</strong> ${role}
          </p>
        </div>
        
        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 25px 0;">
          <p style="margin: 0; color: #92400e; font-size: 14px;">
            <strong>⚠️ Security Notice:</strong> Please change your password after your first login. This temporary password should only be used once.
          </p>
        </div>
        
        <p style="${emailStyles.text}">
          Your KOLAB360 workspace includes:
        </p>
        
        <ul style="color: #555; margin-bottom: 30px;">
          <li style="margin-bottom: 8px;">🔥 Real-time messaging and collaboration</li>
          <li style="margin-bottom: 8px;">🤖 AI-powered assistance and automation</li>
          <li style="margin-bottom: 8px;">📊 Advanced task and project management</li>
          <li style="margin-bottom: 8px;">📁 Secure cloud file storage</li>
          <li style="margin-bottom: 8px;">📅 Integrated calendar and scheduling</li>
        </ul>
        
        <div style="text-align: center;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}/auth" style="${emailStyles.button}">
            Login to KOLAB360
          </a>
        </div>
        
        <p style="font-size: 14px; color: #888; text-align: center; margin-top: 20px;">
          Need help getting started? Contact your system administrator or our support team.
        </p>
      </div>
      
      <div style="${emailStyles.footer}">
        <p>Keep your login credentials secure and change your password after first login.</p>
      </div>
    `;

    return {
      subject: `Welcome to KOLAB360 - Your account is ready!`,
      html: this.createTemplate(content)
    };
  }

  // Send email function
  async sendEmail(to: string, template: EmailTemplate, from: string = 'Kolab360 <onboarding@resend.dev>') {
    try {
      const result = await resend.emails.send({
        from,
        to,
        subject: template.subject,
        html: template.html,
      });

      console.log('Email sent successfully:', result);
      return result;
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }

  // Convenience methods
  async sendWelcomeEmail(to: string, userName: string, userEmail: string, role: string) {
    const template = this.welcomeEmail(userName, userEmail, role);
    return this.sendEmail(to, template);
  }

  async sendWorkspaceInvite(to: string, inviterName: string, workspaceName: string, inviteCode: string, recipientName?: string) {
    const template = this.workspaceInviteEmail(inviterName, workspaceName, inviteCode, recipientName);
    return this.sendEmail(to, template);
  }

  async sendPasswordReset(to: string, userName: string, resetToken: string) {
    const template = this.passwordResetEmail(userName, resetToken);
    return this.sendEmail(to, template);
  }

  async sendAISummary(to: string, userName: string, workspaceName: string, summary: string, dateRange: string) {
    const template = this.aiSummaryEmail(userName, workspaceName, summary, dateRange);
    return this.sendEmail(to, template);
  }

  async sendMentionNotification(to: string, userName: string, mentionedBy: string, channelName: string, messagePreview: string, workspaceName: string) {
    const template = this.mentionNotificationEmail(userName, mentionedBy, channelName, messagePreview, workspaceName);
    return this.sendEmail(to, template);
  }

  async sendWelcomeEmailWithCredentials(to: string, name: string, username: string, temporaryPassword: string, role: string) {
    const template = this.welcomeEmailWithCredentials(name, username, temporaryPassword, role);
    return this.sendEmail(to, template);
  }
}

export const emailService = new EmailService();