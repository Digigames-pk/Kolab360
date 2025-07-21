import { storage } from './storage';
import { notificationService } from './services/NotificationService';

export async function seedTestData() {
  try {
    console.log('🌱 Seeding test data...');

    // Create test notifications for user 3 (the authenticated test user)
    const testUserId = '3';

    // Clear existing notifications first
    notificationService.clearAllNotifications(testUserId);

    // Create realistic test notifications
    const notifications = [
      {
        userId: testUserId,
        type: 'mention' as const,
        title: 'Mentioned in #general',
        message: 'Sarah Wilson mentioned you: "Can you review the latest project updates?"',
        priority: 'high' as const,
        channel: 'general',
        sender: 'Sarah Wilson'
      },
      {
        userId: testUserId,
        type: 'task' as const,
        title: 'New task assigned: Database Migration',
        message: 'Alex Johnson assigned you a high-priority task for the Q1 database migration project.',
        priority: 'high' as const,
        sender: 'Alex Johnson'
      },
      {
        userId: testUserId,
        type: 'calendar' as const,
        title: 'Meeting in 30 minutes',
        message: 'Team standup meeting starts at 2:00 PM in Conference Room A.',
        priority: 'medium' as const
      },
      {
        userId: testUserId,
        type: 'mention' as const,
        title: 'Mentioned in #dev-team',
        message: 'Mike Chen mentioned you: "The API integration looks great! Ship it 🚀"',
        priority: 'medium' as const,
        channel: 'dev-team',
        sender: 'Mike Chen'
      },
      {
        userId: testUserId,
        type: 'task' as const,
        title: 'Task completed: Code Review',
        message: 'Your code review for PR #247 has been approved and merged.',
        priority: 'low' as const,
        sender: 'System'
      }
    ];

    // Create notifications directly using the private method
    for (const notification of notifications) {
      // Call the private method directly
      (notificationService as any).createInAppNotification({
        userId: testUserId,
        userEmail: 'test@example.com',
        userName: 'Test User',
        type: notification.type,
        title: notification.title,
        message: notification.message,
        priority: notification.priority,
        channel: notification.channel,
        sender: notification.sender
      });
    }

    console.log(`✅ Created ${notifications.length} test notifications`);

    // Seed realistic channel and DM data for testing unread counts
    const channelUnreadData = {
      'general': Math.floor(Math.random() * 5) + 1, // 1-5 unread
      'random': Math.floor(Math.random() * 3), // 0-2 unread
      'dev-team': Math.floor(Math.random() * 8) + 1, // 1-8 unread
      'design': Math.floor(Math.random() * 2), // 0-1 unread
    };

    const dmUnreadData = {
      'Sarah Wilson': Math.floor(Math.random() * 3) + 1, // 1-3 unread
      'Alex Johnson': Math.floor(Math.random() * 2), // 0-1 unread
      'Mike Chen': Math.floor(Math.random() * 4) + 1, // 1-4 unread
      'Lisa Rodriguez': Math.floor(Math.random() * 2), // 0-1 unread
      'John Doe': Math.floor(Math.random() * 6) + 1, // 1-6 unread
    };

    console.log('✅ Generated realistic unread count data');
    console.log('📊 Channel unread counts:', channelUnreadData);
    console.log('📊 DM unread counts:', dmUnreadData);

    console.log('🎉 Test data seeding completed successfully!');
    return { channelUnreadData, dmUnreadData };

  } catch (error) {
    console.error('❌ Failed to seed test data:', error);
    throw error;
  }
}

// Real-time data for testing
export const mockChannelUnreadCounts = {
  'general': 4,
  'random': 2, 
  'dev-team': 7,
  'design': 1,
  'marketing': 0,
  'support': 3
};

export const mockDMUnreadCounts = {
  'Sarah Wilson': 3,
  'Alex Johnson': 1,
  'Mike Chen': 5,
  'Lisa Rodriguez': 0,
  'John Doe': 2,
  'Emma Davis': 1,
  'Tom Anderson': 0
};

// Generate realistic test files
export const mockFiles = [
  {
    id: "1",
    filename: "project-requirements.pdf",
    originalName: "Q1_Project_Requirements_Final.pdf",
    mimetype: "application/pdf",
    size: 2847293,
    uploadDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    uploader: { name: "Sarah Wilson" },
    category: "documents"
  },
  {
    id: "2", 
    filename: "team-meeting-recording.mp4",
    originalName: "Daily_Standup_2025-01-20.mp4",
    mimetype: "video/mp4",
    size: 45892847,
    uploadDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    uploader: { name: "Alex Johnson" },
    category: "videos"
  },
  {
    id: "3",
    filename: "wireframes-v3.fig",
    originalName: "Mobile_App_Wireframes_v3.fig",
    mimetype: "application/figma",
    size: 8394728,
    uploadDate: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    uploader: { name: "Lisa Rodriguez" },
    category: "documents"
  },
  {
    id: "4",
    filename: "api-documentation.docx",
    originalName: "REST_API_Documentation_v2.docx",
    mimetype: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    size: 1594823,
    uploadDate: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    uploader: { name: "Mike Chen" },
    category: "documents"
  },
  {
    id: "5",
    filename: "user-feedback-analysis.xlsx",
    originalName: "User_Feedback_Q4_2024_Analysis.xlsx",
    mimetype: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    size: 734829,
    uploadDate: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    uploader: { name: "Emma Davis" },
    category: "documents"
  },
  {
    id: "6",
    filename: "logo-variations.zip",
    originalName: "Brand_Logo_Variations_2025.zip",
    mimetype: "application/zip",
    size: 12847392,
    uploadDate: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
    uploader: { name: "Tom Anderson" },
    category: "documents"
  }
];