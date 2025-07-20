import { Resend } from 'resend';
import { EmailTemplates } from '../templates/EmailTemplates';

interface EmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  from?: string;
}

export class EmailService {
  private resend: Resend;
  private defaultFrom: string;

  constructor() {
    if (!process.env.RESEND_API_KEY) {
      console.error('⚠️ RESEND_API_KEY not found in environment variables');
      throw new Error('RESEND_API_KEY is required for email service');
    }
    
    this.resend = new Resend(process.env.RESEND_API_KEY);
    this.defaultFrom = 'Kolab360 Team <onboarding@resend.dev>'; // Using verified Resend domain
    
    console.log('✅ Email service initialized with Resend API');
  }

  async sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const result = await this.resend.emails.send({
        from: options.from || this.defaultFrom,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text
      });

      console.log('Email sent successfully:', {
        to: options.to,
        subject: options.subject,
        messageId: result.data?.id
      });

      return {
        success: true,
        messageId: result.data?.id
      };
    } catch (error: any) {
      console.error('Email sending failed:', {
        to: options.to,
        subject: options.subject,
        error: error.message
      });

      return {
        success: false,
        error: error.message
      };
    }
  }

  async sendBulkEmails(emails: EmailOptions[]): Promise<{ sent: number; failed: number; errors: string[] }> {
    const results = await Promise.allSettled(
      emails.map(email => this.sendEmail(email))
    );

    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.success) {
        sent++;
      } else {
        failed++;
        const error = result.status === 'rejected' 
          ? result.reason 
          : result.value.error;
        errors.push(`Email ${index + 1}: ${error}`);
      }
    });

    return { sent, failed, errors };
  }

  async testEmailConfiguration(): Promise<{ success: boolean; error?: string }> {
    try {
      await this.sendEmail({
        to: 'test@example.com',
        subject: 'Test Email Configuration',
        text: 'This is a test email to verify email configuration.',
        html: '<p>This is a test email to verify email configuration.</p>'
      });

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Template methods for different email types
  async sendWelcomeEmail(to: string, userFirstName: string, workspaceName?: string) {
    const template = EmailTemplates.getWelcomeEmail(userFirstName, workspaceName);
    return this.sendEmail({
      to,
      subject: template.subject,
      html: template.html,
      text: template.text
    });
  }

  async sendMentionEmail(to: string, mentionedUser: string, mentioner: string, channel: string, messagePreview: string) {
    const template = EmailTemplates.getMentionEmail(mentionedUser, mentioner, channel, messagePreview);
    return this.sendEmail({
      to,
      subject: template.subject,
      html: template.html,
      text: template.text
    });
  }

  async sendTaskAssignedEmail(to: string, assigneeName: string, taskTitle: string, assignerName: string, dueDate?: string, priority?: string) {
    const template = EmailTemplates.getTaskAssignedEmail(assigneeName, taskTitle, assignerName, dueDate, priority);
    return this.sendEmail({
      to,
      subject: template.subject,
      html: template.html,
      text: template.text
    });
  }

  async sendCalendarInviteEmail(to: string, inviteeName: string, eventTitle: string, startDate: string, endDate: string, location?: string, description?: string) {
    const template = EmailTemplates.getCalendarInviteEmail(inviteeName, eventTitle, startDate, endDate, location, description);
    return this.sendEmail({
      to,
      subject: template.subject,
      html: template.html,
      text: template.text
    });
  }

  async sendPasswordResetEmail(to: string, userFirstName: string, resetToken: string) {
    const template = EmailTemplates.getPasswordResetEmail(userFirstName, resetToken);
    return this.sendEmail({
      to,
      subject: template.subject,
      html: template.html,
      text: template.text
    });
  }

  async sendWorkspaceInviteEmail(to: string, inviteeName: string, inviterName: string, workspaceName: string, inviteCode: string) {
    const template = EmailTemplates.getWorkspaceInviteEmail(inviteeName, inviterName, workspaceName, inviteCode);
    return this.sendEmail({
      to,
      subject: template.subject,
      html: template.html,
      text: template.text
    });
  }

  async sendDailyDigestEmail(to: string, userName: string, stats: any) {
    const template = EmailTemplates.getDailyDigestEmail(userName, stats);
    return this.sendEmail({
      to,
      subject: template.subject,
      html: template.html,
      text: template.text
    });
  }
}

export const emailService = new EmailService();