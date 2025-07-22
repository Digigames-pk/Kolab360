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

    // Create super admin users if they don't exist
    try {
      // Create marty@onlinechannel.tv
      const existingAdmin = await storage.getUserByEmail('marty@onlinechannel.tv');
      if (!existingAdmin) {
        console.log('Creating super admin user: marty@onlinechannel.tv...');
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
        console.log('✅ Super admin user already exists: marty@onlinechannel.tv');
      }

      // Create superadmin@test.com  
      const existingSuperAdmin = await storage.getUserByEmail('superadmin@test.com');
      if (!existingSuperAdmin) {
        console.log('Creating super admin user: superadmin@test.com...');
        const hashedPassword = await hashPassword('superadmin123');
        
        await storage.createUser({
          email: 'superadmin@test.com',
          password: hashedPassword,
          firstName: 'Super',
          lastName: 'Admin',
          role: 'super_admin',
          isActive: true
        });
        
        console.log('✅ Super admin user created: superadmin@test.com / superadmin123');
      } else {
        console.log('✅ Super admin user already exists: superadmin@test.com');
      }
    } catch (error) {
      console.error('Error creating super admin users:', error);
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
};

export const mockDMUnreadCounts = {
  'Emma Davis': 1,
  'Tom Anderson': 0
};

// Generate realistic test files
export const mockFiles = [];