export class EmailTemplates {
  static getWelcomeEmail(userFirstName: string, workspaceName: string = "Kolab360"): { subject: string; html: string; text: string } {
    const subject = `Welcome to ${workspaceName}!`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
            .footer { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; text-align: center; font-size: 14px; color: #666; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .feature { margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 6px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to ${workspaceName}!</h1>
              <p>Hi ${userFirstName}, you're now part of our collaborative workspace</p>
            </div>
            <div class="content">
              <h2>Get Started with Your New Workspace</h2>
              <p>We're excited to have you join our team collaboration platform. Here's what you can do:</p>
              
              <div class="feature">
                <h3>💬 Join Conversations</h3>
                <p>Connect with your team in channels and direct messages</p>
              </div>
              
              <div class="feature">
                <h3>📋 Manage Tasks</h3>
                <p>Create, assign, and track tasks with our Kanban board</p>
              </div>
              
              <div class="feature">
                <h3>📅 Schedule Events</h3>
                <p>Coordinate meetings and deadlines with the integrated calendar</p>
              </div>
              
              <div class="feature">
                <h3>🤖 AI Assistant</h3>
                <p>Get help with content creation and team insights</p>
              </div>
              
              <a href="https://kolab360.com/dashboard" class="button">Start Collaborating</a>
              
              <p>If you have any questions, our support team is here to help at support@kolab360.com</p>
            </div>
            <div class="footer">
              <p>© 2025 Kolab360. Building the future of team collaboration.</p>
            </div>
          </div>
        </body>
      </html>
    `;
    
    const text = `Welcome to ${workspaceName}!

Hi ${userFirstName}, you're now part of our collaborative workspace.

Get Started with Your New Workspace:

💬 Join Conversations - Connect with your team in channels and direct messages
📋 Manage Tasks - Create, assign, and track tasks with our Kanban board  
📅 Schedule Events - Coordinate meetings and deadlines with the integrated calendar
🤖 AI Assistant - Get help with content creation and team insights

Start Collaborating: https://kolab360.com/dashboard

If you have any questions, our support team is here to help at support@kolab360.com

© 2025 Kolab360. Building the future of team collaboration.`;

    return { subject, html, text };
  }

  static getMentionEmail(mentionedUser: string, mentioner: string, channel: string, messagePreview: string): { subject: string; html: string; text: string } {
    const subject = `${mentioner} mentioned you in #${channel}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
            .mention { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0; }
            .button { display: inline-block; background: #f5576c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💬 You've been mentioned!</h1>
            </div>
            <div class="content">
              <p>Hi ${mentionedUser},</p>
              <p><strong>${mentioner}</strong> mentioned you in <strong>#${channel}</strong></p>
              
              <div class="mention">
                <h3>Message Preview:</h3>
                <p>"${messagePreview}"</p>
              </div>
              
              <a href="https://kolab360.com/channels/${channel}" class="button">View Message</a>
              
              <p>Don't want these notifications? <a href="https://kolab360.com/settings/notifications">Update your preferences</a></p>
            </div>
          </div>
        </body>
      </html>
    `;
    
    const text = `You've been mentioned!

Hi ${mentionedUser},

${mentioner} mentioned you in #${channel}

Message Preview:
"${messagePreview}"

View Message: https://kolab360.com/channels/${channel}

Don't want these notifications? Update your preferences: https://kolab360.com/settings/notifications`;

    return { subject, html, text };
  }

  static getTaskAssignedEmail(assigneeName: string, taskTitle: string, assignerName: string, dueDate?: string, priority?: string): { subject: string; html: string; text: string } {
    const subject = `New task assigned: ${taskTitle}`;
    
    const priorityColor = priority === 'high' ? '#dc3545' : priority === 'medium' ? '#ffc107' : '#28a745';
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
            .task-card { background: #f8f9fa; border: 1px solid #dee2e6; padding: 20px; border-radius: 6px; margin: 20px 0; }
            .priority { display: inline-block; background: ${priorityColor}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; text-transform: uppercase; }
            .button { display: inline-block; background: #4facfe; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📋 New Task Assigned</h1>
            </div>
            <div class="content">
              <p>Hi ${assigneeName},</p>
              <p><strong>${assignerName}</strong> has assigned you a new task:</p>
              
              <div class="task-card">
                <h3>${taskTitle}</h3>
                ${priority ? `<span class="priority">${priority} priority</span>` : ''}
                ${dueDate ? `<p><strong>Due:</strong> ${new Date(dueDate).toLocaleDateString()}</p>` : ''}
                <p><strong>Assigned by:</strong> ${assignerName}</p>
              </div>
              
              <a href="https://kolab360.com/tasks" class="button">View Task Details</a>
              
              <p>Stay organized and keep your team updated on your progress!</p>
            </div>
          </div>
        </body>
      </html>
    `;
    
    const text = `New Task Assigned

Hi ${assigneeName},

${assignerName} has assigned you a new task:

Task: ${taskTitle}
${priority ? `Priority: ${priority}` : ''}
${dueDate ? `Due: ${new Date(dueDate).toLocaleDateString()}` : ''}
Assigned by: ${assignerName}

View Task Details: https://kolab360.com/tasks

Stay organized and keep your team updated on your progress!`;

    return { subject, html, text };
  }

  static getCalendarInviteEmail(inviteeName: string, eventTitle: string, startDate: string, endDate: string, location?: string, description?: string): { subject: string; html: string; text: string } {
    const subject = `Calendar Invite: ${eventTitle}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); color: #333; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
            .event-details { background: #f8f9fa; border: 1px solid #dee2e6; padding: 20px; border-radius: 6px; margin: 20px 0; }
            .date-time { background: #e3f2fd; padding: 15px; border-radius: 6px; margin: 10px 0; }
            .button { display: inline-block; background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
            .button.decline { background: #dc3545; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📅 Calendar Invitation</h1>
            </div>
            <div class="content">
              <p>Hi ${inviteeName},</p>
              <p>You've been invited to the following event:</p>
              
              <div class="event-details">
                <h3>${eventTitle}</h3>
                
                <div class="date-time">
                  <strong>📅 When:</strong><br>
                  ${new Date(startDate).toLocaleDateString()} at ${new Date(startDate).toLocaleTimeString()}<br>
                  to ${new Date(endDate).toLocaleDateString()} at ${new Date(endDate).toLocaleTimeString()}
                </div>
                
                ${location ? `<p><strong>📍 Where:</strong> ${location}</p>` : ''}
                ${description ? `<p><strong>📝 Description:</strong><br>${description}</p>` : ''}
              </div>
              
              <div style="text-align: center;">
                <a href="https://kolab360.com/calendar/accept" class="button">✓ Accept</a>
                <a href="https://kolab360.com/calendar/decline" class="button decline">✗ Decline</a>
              </div>
              
              <p>This event will be added to your Kolab360 calendar once you respond.</p>
            </div>
          </div>
        </body>
      </html>
    `;
    
    const text = `Calendar Invitation

Hi ${inviteeName},

You've been invited to the following event:

${eventTitle}

When: ${new Date(startDate).toLocaleDateString()} at ${new Date(startDate).toLocaleTimeString()}
      to ${new Date(endDate).toLocaleDateString()} at ${new Date(endDate).toLocaleTimeString()}

${location ? `Where: ${location}` : ''}
${description ? `Description: ${description}` : ''}

Accept: https://kolab360.com/calendar/accept
Decline: https://kolab360.com/calendar/decline

This event will be added to your Kolab360 calendar once you respond.`;

    return { subject, html, text };
  }

  static getPasswordResetEmail(userFirstName: string, resetToken: string): { subject: string; html: string; text: string } {
    const subject = `Reset your Kolab360 password`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
            .security-notice { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .token { background: #f8f9fa; border: 1px solid #dee2e6; padding: 15px; border-radius: 6px; font-family: monospace; word-break: break-all; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hi ${userFirstName},</p>
              <p>We received a request to reset your Kolab360 password. If you didn't make this request, please ignore this email.</p>
              
              <div class="security-notice">
                <strong>⚠️ Security Notice:</strong> This reset link will expire in 1 hour for your security.
              </div>
              
              <p>Click the button below to reset your password:</p>
              
              <a href="https://kolab360.com/reset-password?token=${resetToken}" class="button">Reset Password</a>
              
              <p>Or copy and paste this link into your browser:</p>
              <div class="token">https://kolab360.com/reset-password?token=${resetToken}</div>
              
              <p>If you continue to have problems, please contact our support team at support@kolab360.com</p>
              
              <p>Best regards,<br>The Kolab360 Team</p>
            </div>
          </div>
        </body>
      </html>
    `;
    
    const text = `Password Reset Request

Hi ${userFirstName},

We received a request to reset your Kolab360 password. If you didn't make this request, please ignore this email.

⚠️ Security Notice: This reset link will expire in 1 hour for your security.

Reset your password: https://kolab360.com/reset-password?token=${resetToken}

If you continue to have problems, please contact our support team at support@kolab360.com

Best regards,
The Kolab360 Team`;

    return { subject, html, text };
  }

  static getWorkspaceInviteEmail(inviteeName: string, inviterName: string, workspaceName: string, inviteCode: string): { subject: string; html: string; text: string } {
    const subject = `${inviterName} invited you to join ${workspaceName}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%); color: #333; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
            .invite-code { background: #e3f2fd; border: 1px solid #90caf9; padding: 15px; border-radius: 6px; margin: 20px 0; text-align: center; }
            .button { display: inline-block; background: #ff9a9e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Workspace Invitation</h1>
            </div>
            <div class="content">
              <p>Hi ${inviteeName},</p>
              <p><strong>${inviterName}</strong> has invited you to join the <strong>${workspaceName}</strong> workspace on Kolab360!</p>
              
              <p>Join your team to collaborate on projects, share files, manage tasks, and stay connected.</p>
              
              <div class="invite-code">
                <h3>Your Invite Code:</h3>
                <code style="font-size: 18px; font-weight: bold;">${inviteCode}</code>
              </div>
              
              <a href="https://kolab360.com/join?code=${inviteCode}" class="button">Join Workspace</a>
              
              <p>Or visit kolab360.com and enter the invite code manually.</p>
              
              <p>Welcome to the team!</p>
            </div>
          </div>
        </body>
      </html>
    `;
    
    const text = `Workspace Invitation

Hi ${inviteeName},

${inviterName} has invited you to join the ${workspaceName} workspace on Kolab360!

Join your team to collaborate on projects, share files, manage tasks, and stay connected.

Your Invite Code: ${inviteCode}

Join Workspace: https://kolab360.com/join?code=${inviteCode}

Or visit kolab360.com and enter the invite code manually.

Welcome to the team!`;

    return { subject, html, text };
  }

  static getDailyDigestEmail(userName: string, stats: any): { subject: string; html: string; text: string } {
    const subject = `Your Daily Kolab360 Digest`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
            .stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
            .stat-card { background: #f8f9fa; padding: 15px; border-radius: 6px; text-align: center; }
            .stat-number { font-size: 24px; font-weight: bold; color: #0984e3; }
            .button { display: inline-block; background: #0984e3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📊 Your Daily Digest</h1>
              <p>${new Date().toLocaleDateString()}</p>
            </div>
            <div class="content">
              <p>Hi ${userName},</p>
              <p>Here's what happened in your workspace today:</p>
              
              <div class="stat-grid">
                <div class="stat-card">
                  <div class="stat-number">${stats.newMessages || 12}</div>
                  <div>New Messages</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">${stats.completedTasks || 3}</div>
                  <div>Tasks Completed</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">${stats.upcomingEvents || 2}</div>
                  <div>Upcoming Events</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">${stats.activeUsers || 8}</div>
                  <div>Active Team Members</div>
                </div>
              </div>
              
              <h3>🔥 Top Activity</h3>
              <ul>
                <li>Most active channel: #${stats.topChannel || 'general'}</li>
                <li>Top contributor: ${stats.topContributor || 'John Doe'}</li>
                <li>Files shared: ${stats.filesShared || 5}</li>
              </ul>
              
              <a href="https://kolab360.com/dashboard" class="button">View Dashboard</a>
              
              <p>Stay productive and keep collaborating!</p>
            </div>
          </div>
        </body>
      </html>
    `;
    
    const text = `Your Daily Digest - ${new Date().toLocaleDateString()}

Hi ${userName},

Here's what happened in your workspace today:

📊 Statistics:
- New Messages: ${stats.newMessages || 12}
- Tasks Completed: ${stats.completedTasks || 3}
- Upcoming Events: ${stats.upcomingEvents || 2}
- Active Team Members: ${stats.activeUsers || 8}

🔥 Top Activity:
- Most active channel: #${stats.topChannel || 'general'}
- Top contributor: ${stats.topContributor || 'John Doe'}
- Files shared: ${stats.filesShared || 5}

View Dashboard: https://kolab360.com/dashboard

Stay productive and keep collaborating!`;

    return { subject, html, text };
  }

  static getWelcomeEmailWithCredentials(userFullName: string, email: string, temporaryPassword: string, role: string): { subject: string; html: string; text: string } {
    const subject = `Welcome to Kolab360 - Your Account Credentials`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
            .footer { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; text-align: center; font-size: 14px; color: #666; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .credentials { background: #f8f9fa; padding: 20px; border-radius: 6px; border-left: 4px solid #667eea; margin: 20px 0; }
            .warning { background: #fff3cd; padding: 15px; border-radius: 6px; border-left: 4px solid #ffc107; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to Kolab360!</h1>
              <p>Your account has been created successfully</p>
            </div>
            <div class="content">
              <h2>Hello ${userFullName}</h2>
              <p>Your administrator has created an account for you on Kolab360. You can now access our collaborative workspace platform.</p>
              
              <div class="credentials">
                <h3>🔐 Your Login Credentials</h3>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Temporary Password:</strong> <code>${temporaryPassword}</code></p>
                <p><strong>Role:</strong> ${role.charAt(0).toUpperCase() + role.slice(1)}</p>
              </div>
              
              <div class="warning">
                <h3>🔒 Important Security Notice</h3>
                <p>This is a temporary password. Please change it immediately after your first login for security purposes.</p>
              </div>
              
              <a href="https://kolab360.com/auth" class="button">Login to Your Account</a>
              
              <h3>What you can do in Kolab360:</h3>
              <ul>
                <li>💬 Communicate with your team in channels</li>
                <li>📋 Manage and track tasks</li>
                <li>📅 Schedule meetings and events</li>
                <li>📁 Share and organize files</li>
                <li>🤖 Use AI-powered features</li>
              </ul>
              
              <p>If you have any questions or need help getting started, contact your administrator or our support team.</p>
            </div>
            <div class="footer">
              <p>© 2025 Kolab360. Building the future of team collaboration.</p>
            </div>
          </div>
        </body>
      </html>
    `;
    
    const text = `Welcome to Kolab360!

Hello ${userFullName},

Your administrator has created an account for you on Kolab360. You can now access our collaborative workspace platform.

🔐 Your Login Credentials:
Email: ${email}
Temporary Password: ${temporaryPassword}
Role: ${role.charAt(0).toUpperCase() + role.slice(1)}

🔒 Important Security Notice:
This is a temporary password. Please change it immediately after your first login for security purposes.

Login to Your Account: https://kolab360.com/auth

What you can do in Kolab360:
- 💬 Communicate with your team in channels
- 📋 Manage and track tasks  
- 📅 Schedule meetings and events
- 📁 Share and organize files
- 🤖 Use AI-powered features

If you have any questions or need help getting started, contact your administrator or our support team.

© 2025 Kolab360. Building the future of team collaboration.`;

    return { subject, html, text };
  }
}