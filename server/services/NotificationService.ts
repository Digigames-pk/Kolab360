import { Resend } from 'resend';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  notificationPreferences?: {
    email: boolean;
    mentions: boolean;
    tasks: boolean;
    calendar: boolean;
    directMessages: boolean;
    workspaceUpdates: boolean;
  };
}

interface NotificationData {
  type: 'welcome' | 'mention' | 'task_assigned' | 'task_completed' | 'calendar_invite' | 'password_reset' | 'direct_message' | 'workspace_invite' | 'file_shared' | 'deadline_reminder' | 'system_update';
  recipient: User;
  data: any;
  channel?: string;
  workspace?: string;
  sender?: User;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

export class NotificationService {
  private resend: Resend;
  private baseUrl: string;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
    this.baseUrl = process.env.FRONTEND_URL || 'http://localhost:5000';
  }

  async sendNotification(notification: NotificationData): Promise<void> {
    const { recipient, type } = notification;
    
    // Check user preferences
    if (!this.shouldSendNotification(recipient, type)) {
      console.log(`Notification skipped for user ${recipient.id} - type: ${type}`);
      return;
    }

    // Send email notification
    await this.sendEmailNotification(notification);
    
    // Store in-app notification
    await this.storeInAppNotification(notification);
    
    // Send real-time notification via WebSocket if user is online
    await this.sendRealTimeNotification(notification);
  }

  private shouldSendNotification(user: User, type: string): boolean {
    const prefs = user.notificationPreferences;
    if (!prefs) return true; // Default to sending all notifications
    
    switch (type) {
      case 'mention':
        return prefs.mentions;
      case 'task_assigned':
      case 'task_completed':
      case 'deadline_reminder':
        return prefs.tasks;
      case 'calendar_invite':
        return prefs.calendar;
      case 'direct_message':
        return prefs.directMessages;
      case 'workspace_invite':
      case 'file_shared':
      case 'system_update':
        return prefs.workspaceUpdates;
      default:
        return prefs.email;
    }
  }

  private async sendEmailNotification(notification: NotificationData): Promise<void> {
    const template = this.getEmailTemplate(notification);
    
    try {
      await this.resend.emails.send({
        from: 'Kolab360 <noreply@kolab360.com>',
        to: notification.recipient.email,
        subject: template.subject,
        html: template.html,
        text: template.text
      });
      
      console.log(`Email sent successfully to ${notification.recipient.email} - type: ${notification.type}`);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }

  private getEmailTemplate(notification: NotificationData): EmailTemplate {
    const { type, recipient, data, sender, channel, workspace } = notification;
    const baseTemplate = this.getBaseEmailTemplate();

    switch (type) {
      case 'welcome':
        return {
          subject: 'Welcome to Kolab360! 🎉',
          html: baseTemplate.replace('{{CONTENT}}', `
            <h2>Welcome to Kolab360, ${recipient.firstName}!</h2>
            <p>We're excited to have you on board. Kolab360 is your new collaboration hub where teams come together to work smarter, not harder.</p>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">🚀 Get Started:</h3>
              <ul style="margin: 0; padding-left: 20px;">
                <li>Set up your profile and preferences</li>
                <li>Join or create your first workspace</li>
                <li>Invite team members to collaborate</li>
                <li>Explore channels, tasks, and file sharing</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${this.baseUrl}/welcome" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Complete Setup
              </a>
            </div>
            
            <p>If you have any questions, our support team is here to help at <a href="mailto:support@kolab360.com">support@kolab360.com</a></p>
          `)
        };

      case 'mention':
        return {
          subject: `${sender?.firstName} mentioned you in #${channel}`,
          html: baseTemplate.replace('{{CONTENT}}', `
            <h2>You were mentioned in #${channel}</h2>
            <p><strong>${sender?.firstName} ${sender?.lastName}</strong> mentioned you in a message:</p>
            
            <div style="background: #f1f5f9; padding: 15px; border-left: 4px solid #3b82f6; border-radius: 4px; margin: 20px 0; font-style: italic;">
              "${data.message}"
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${this.baseUrl}/channels/${channel}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View Conversation
              </a>
            </div>
          `)
        };

      case 'task_assigned':
        return {
          subject: `New task assigned: ${data.taskTitle}`,
          html: baseTemplate.replace('{{CONTENT}}', `
            <h2>You've been assigned a new task</h2>
            <p><strong>${sender?.firstName} ${sender?.lastName}</strong> assigned you a task in #${channel}:</p>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #1e293b;">${data.taskTitle}</h3>
              ${data.description ? `<p style="color: #64748b; margin: 10px 0;">${data.description}</p>` : ''}
              <div style="display: flex; gap: 15px; margin-top: 15px; flex-wrap: wrap;">
                <span style="background: #fee2e2; color: #dc2626; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                  Priority: ${data.priority}
                </span>
                ${data.dueDate ? `
                  <span style="background: #fef3c7; color: #d97706; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                    Due: ${new Date(data.dueDate).toLocaleDateString()}
                  </span>
                ` : ''}
              </div>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${this.baseUrl}/tasks/${data.taskId}" style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View Task
              </a>
            </div>
          `)
        };

      case 'calendar_invite':
        return {
          subject: `Calendar Invite: ${data.eventTitle}`,
          html: baseTemplate.replace('{{CONTENT}}', `
            <h2>You're invited to an event</h2>
            <p><strong>${sender?.firstName} ${sender?.lastName}</strong> invited you to a calendar event:</p>
            
            <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; border: 1px solid #bae6fd; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #0c4a6e;">${data.eventTitle}</h3>
              ${data.description ? `<p style="color: #0369a1; margin: 10px 0;">${data.description}</p>` : ''}
              
              <div style="margin-top: 15px;">
                <p style="margin: 5px 0;"><strong>📅 Date:</strong> ${new Date(data.startDate).toLocaleDateString()}</p>
                <p style="margin: 5px 0;"><strong>🕐 Time:</strong> ${new Date(data.startDate).toLocaleTimeString()} - ${new Date(data.endDate).toLocaleTimeString()}</p>
                ${data.location ? `<p style="margin: 5px 0;"><strong>📍 Location:</strong> ${data.location}</p>` : ''}
                ${data.meetingLink ? `<p style="margin: 5px 0;"><strong>🔗 Meeting Link:</strong> <a href="${data.meetingLink}">${data.meetingLink}</a></p>` : ''}
              </div>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${this.baseUrl}/calendar/event/${data.eventId}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-right: 10px;">
                Accept Invite
              </a>
              <a href="${this.baseUrl}/calendar/event/${data.eventId}/decline" style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Decline
              </a>
            </div>
          `)
        };

      case 'password_reset':
        return {
          subject: 'Reset Your Kolab360 Password',
          html: baseTemplate.replace('{{CONTENT}}', `
            <h2>Password Reset Request</h2>
            <p>Hi ${recipient.firstName},</p>
            <p>We received a request to reset your password for your Kolab360 account.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${this.baseUrl}/reset-password?token=${data.resetToken}" style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px;">This link will expire in 1 hour for security reasons.</p>
            <p style="color: #6b7280; font-size: 14px;">If you didn't request this password reset, please ignore this email or contact support if you have concerns.</p>
          `)
        };

      case 'deadline_reminder':
        return {
          subject: `⏰ Task deadline approaching: ${data.taskTitle}`,
          html: baseTemplate.replace('{{CONTENT}}', `
            <h2>Task Deadline Reminder</h2>
            <p>Hi ${recipient.firstName},</p>
            <p>Your task <strong>"${data.taskTitle}"</strong> is due ${data.timeUntilDue}.</p>
            
            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; border: 1px solid #fbbf24; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #92400e;">⚠️ Action Required</h3>
              <p style="color: #92400e; margin: 10px 0;">${data.description || 'No description provided'}</p>
              <p style="color: #92400e; margin: 5px 0;"><strong>Due Date:</strong> ${new Date(data.dueDate).toLocaleString()}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${this.baseUrl}/tasks/${data.taskId}" style="background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Complete Task
              </a>
            </div>
          `)
        };

      case 'file_shared':
        return {
          subject: `${sender?.firstName} shared a file with you`,
          html: baseTemplate.replace('{{CONTENT}}', `
            <h2>File Shared</h2>
            <p><strong>${sender?.firstName} ${sender?.lastName}</strong> shared a file with you in #${channel}:</p>
            
            <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; border: 1px solid #bbf7d0; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #15803d;">📎 ${data.fileName}</h3>
              <p style="color: #166534; margin: 10px 0;">Size: ${data.fileSize}</p>
              ${data.message ? `<p style="color: #166534; font-style: italic;">"${data.message}"</p>` : ''}
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${this.baseUrl}/files/${data.fileId}" style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View File
              </a>
            </div>
          `)
        };

      default:
        return {
          subject: 'Kolab360 Notification',
          html: baseTemplate.replace('{{CONTENT}}', `
            <h2>New Notification</h2>
            <p>You have a new notification from Kolab360.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${this.baseUrl}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View Dashboard
              </a>
            </div>
          `)
        };
    }
  }

  private getBaseEmailTemplate(): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Kolab360 Notification</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 40px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">Kolab360</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0; font-size: 16px;">Collaboration Platform</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px;">
            {{CONTENT}}
          </div>
          
          <!-- Footer -->
          <div style="background: #f8fafc; padding: 30px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 14px;">
              This email was sent by Kolab360. Manage your notification preferences in your account settings.
            </p>
            <p style="color: #9ca3af; margin: 0; font-size: 12px;">
              © ${new Date().getFullYear()} Kolab360. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private async storeInAppNotification(notification: NotificationData): Promise<void> {
    // Store notification in database for in-app display
    // This would integrate with your database storage
    console.log(`Storing in-app notification for user ${notification.recipient.id}`);
  }

  private async sendRealTimeNotification(notification: NotificationData): Promise<void> {
    // Send real-time notification via WebSocket if user is online
    // This would integrate with your WebSocket service
    console.log(`Sending real-time notification to user ${notification.recipient.id}`);
  }

  // Convenience methods for common notifications
  async sendWelcomeEmail(user: User): Promise<void> {
    await this.sendNotification({
      type: 'welcome',
      recipient: user,
      data: {}
    });
  }

  async sendMentionNotification(recipient: User, sender: User, message: string, channel: string): Promise<void> {
    await this.sendNotification({
      type: 'mention',
      recipient,
      sender,
      data: { message },
      channel,
      priority: 'medium'
    });
  }

  async sendTaskAssignedNotification(recipient: User, sender: User, task: any, channel: string): Promise<void> {
    await this.sendNotification({
      type: 'task_assigned',
      recipient,
      sender,
      data: {
        taskId: task.id,
        taskTitle: task.title,
        description: task.description,
        priority: task.priority,
        dueDate: task.dueDate
      },
      channel,
      priority: 'high'
    });
  }

  async sendCalendarInvite(recipient: User, sender: User, event: any): Promise<void> {
    await this.sendNotification({
      type: 'calendar_invite',
      recipient,
      sender,
      data: {
        eventId: event.id,
        eventTitle: event.title,
        description: event.description,
        startDate: event.startDate,
        endDate: event.endDate,
        location: event.location,
        meetingLink: event.meetingLink
      },
      priority: 'medium'
    });
  }

  async sendPasswordResetEmail(user: User, resetToken: string): Promise<void> {
    await this.sendNotification({
      type: 'password_reset',
      recipient: user,
      data: { resetToken },
      priority: 'high'
    });
  }

  async sendDeadlineReminder(recipient: User, task: any, timeUntilDue: string): Promise<void> {
    await this.sendNotification({
      type: 'deadline_reminder',
      recipient,
      data: {
        taskId: task.id,
        taskTitle: task.title,
        description: task.description,
        dueDate: task.dueDate,
        timeUntilDue
      },
      priority: 'urgent'
    });
  }

  async sendFileSharedNotification(recipient: User, sender: User, file: any, channel: string, message?: string): Promise<void> {
    await this.sendNotification({
      type: 'file_shared',
      recipient,
      sender,
      data: {
        fileId: file.id,
        fileName: file.name,
        fileSize: file.size,
        message
      },
      channel,
      priority: 'low'
    });
  }
}

export const notificationService = new NotificationService();