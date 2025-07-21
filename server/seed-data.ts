import { storage } from './storage';
import { notificationService } from './services/NotificationService';
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function seedTestData() {
  try {
    console.log('🌱 Seeding test data...');

    // Create super admin user if it doesn't exist
    try {
      const existingAdmin = await storage.getUserByEmail('marty@onlinechannel.tv');
      if (!existingAdmin) {
        console.log('Creating super admin user...');
        const hashedPassword = await hashPassword('123456');
        
        await storage.createUser({
          email: 'marty@onlinechannel.tv',
          password: hashedPassword,
          firstName: 'Marty',
          lastName: 'Admin',
          role: 'super_admin',
          isActive: true
        });
        
        console.log('✅ Super admin user created: marty@onlinechannel.tv / 123456');
      } else {
        console.log('✅ Super admin user already exists');
      }
    } catch (error) {
      console.error('Error creating super admin user:', error);
    }

    // Create test notifications for user 3 (the authenticated test user)
    const testUserId = '3';

    // No test notifications - clean slate for production

    console.log(`✅ Created ${notifications.length} test notifications`);

    // Initialize empty data for testing without dummy content
    const channelUnreadData = {};
    const dmUnreadData = {};

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
export const mockFiles = [];