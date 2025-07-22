import { storage } from './storage';
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function createSuperAdmin() {
  try {
    console.log('🔍 Creating super admin user...');
    
    // Check if super admin already exists
    const existingUser = await storage.getUserByEmail('marty@onlinechannel.tv');
    if (existingUser) {
      console.log('✅ Super admin already exists:', {
        id: existingUser.id,
        email: existingUser.email,
        role: existingUser.role,
        isActive: existingUser.isActive
      });
      return;
    }
    
    // Hash the password
    const hashedPassword = await hashPassword('123456');
    console.log('🔑 Password hashed successfully');
    
    // Create super admin user
    const superAdmin = await storage.createUser({
      email: 'marty@onlinechannel.tv',
      firstName: 'Marty',
      lastName: 'Super Admin',
      password: hashedPassword,
      role: 'super_admin',
      isActive: true,
      profileImageUrl: null
    });
    
    console.log('✅ Super admin created successfully:', {
      id: superAdmin.id,
      email: superAdmin.email,
      role: superAdmin.role,
      name: `${superAdmin.firstName} ${superAdmin.lastName}`
    });
    
    console.log('🎉 Super admin credentials:');
    console.log('   Email: marty@onlinechannel.tv');
    console.log('   Password: 123456');
    
  } catch (error) {
    console.error('❌ Error creating super admin:', error);
  }
}

createSuperAdmin();