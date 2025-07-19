import { Resend } from 'resend';

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
    this.resend = new Resend(process.env.RESEND_API_KEY);
    this.defaultFrom = 'Kolab360 <noreply@kolab360.com>';
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
}

export const emailService = new EmailService();