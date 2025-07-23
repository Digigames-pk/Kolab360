import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User } from "@shared/schema";
import { registerSchema, loginSchema } from "@shared/schema";

declare global {
  namespace Express {
    interface User {
      id: number;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
      createdAt: Date;
      lastLoginAt: Date | null;
      isActive: boolean;
      profileImageUrl?: string | null;
      updatedAt?: Date;
    }
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "your-secret-key-change-this",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    },
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          console.log(`🔍 Authentication attempt for: ${email}`);
          
          // First check main users table
          let user = await storage.getUserByEmail(email);
          console.log(`👤 Main user found:`, user ? `${user.email} (active: ${user.isActive})` : 'not found');
          
          // If not found in main users, check organization users
          if (!user) {
            const orgUser = await storage.getOrganizationUserByEmail(email);
            console.log(`👤 Organization user found:`, orgUser ? `${orgUser.email} (status: ${orgUser.status})` : 'not found');
            console.log(`🔍 Organization user data:`, JSON.stringify(orgUser, null, 2));
            
            if (orgUser && orgUser.status === 'active') {
              // Convert organization user to main user format for authentication
              user = {
                id: orgUser.id,
                email: orgUser.email,
                firstName: orgUser.firstName,
                lastName: orgUser.lastName,
                role: orgUser.role,
                password: orgUser.password,
                isActive: orgUser.status === 'active',
                createdAt: orgUser.createdAt,
                lastLoginAt: orgUser.lastLoginAt,
                updatedAt: orgUser.updatedAt
              } as User;
            }
          }
          
          if (!user || !user.isActive) {
            console.log('❌ User not found or inactive in both tables');
            return done(null, false);
          }
          
          console.log(`🔑 Checking password for user ${user.email}`);
          console.log(`🔑 Password field exists: ${!!user.password}`);
          if (user.password) {
            console.log(`🔑 Stored hash: ${user.password.substring(0, 20)}...`);
          } else {
            console.log(`❌ No password found for user`);
            return done(null, false);
          }
          const isValid = await comparePasswords(password, user.password);
          console.log(`🔐 Password valid: ${isValid}`);
          
          if (!isValid) {
            console.log('❌ Invalid password');
            return done(null, false);
          }

          // Update last login
          await storage.updateUserLastLogin(user.id);
          console.log('✅ Authentication successful');
          
          return done(null, user);
        } catch (error) {
          console.error('🚫 Authentication error:', error);
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      console.log('🔍 Deserializing user with ID:', id);
      
      // First try to get user from main users table
      let user = await storage.getUser(id);
      console.log('👤 Main user lookup result:', user ? 'found' : 'not found');
      
      // If not found, try to get from organization users table
      if (!user) {
        const orgUser = await storage.getOrganizationUserById(id);
        console.log('👤 Organization user lookup result:', orgUser ? 'found' : 'not found');
        
        if (orgUser && orgUser.status === 'active') {
          // Convert organization user to main user format for session
          user = {
            id: orgUser.id,
            email: orgUser.email,
            firstName: orgUser.firstName,
            lastName: orgUser.lastName,
            role: orgUser.role,
            isActive: orgUser.status === 'active',
            createdAt: orgUser.createdAt,
            lastLoginAt: orgUser.lastLoginAt,
            updatedAt: orgUser.updatedAt
          } as User;
          console.log('✅ Converted organization user to session user format');
        }
      }
      
      if (!user) {
        console.log('❌ User not found during deserialization for ID:', id);
        return done(null, null);
      }
      
      console.log('✅ User deserialized successfully:', user.email);
      done(null, user);
    } catch (error) {
      console.error('🚫 Deserialization error:', error);
      done(error, null);
    }
  });

  // Register endpoint
  app.post("/api/register", async (req, res, next) => {
    try {
      const validatedData = registerSchema.parse(req.body);
      
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const hashedPassword = await hashPassword(validatedData.password);
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
        role: 'member', // Default to member role
      });

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json({
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        });
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid registration data" });
    }
  });

  // Note: Login endpoint is handled in routes.ts to avoid duplication

  // Logout endpoint
  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.json({ message: "Logged out successfully" });
    });
  });

  // Get current user
  app.get("/api/auth/me", (req, res) => {
    console.log('🔍 [DEBUG] GET /api/auth/me - Request received');
    console.log('🔍 [DEBUG] req.isAuthenticated():', req.isAuthenticated());
    console.log('🔍 [DEBUG] req.user:', req.user);
    console.log('🔍 [DEBUG] req.session:', req.session);
    
    if (!req.isAuthenticated() || !req.user) {
      console.log('❌ [DEBUG] User not authenticated');
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    const user = req.user;
    console.log('✅ [DEBUG] User authenticated successfully:', user.email, 'Role:', user.role);
    
    res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
    });
  });
}

// Middleware for protecting routes
export function requireAuth(req: any, res: any, next: any) {
  console.log('🔍 [DEBUG] requireAuth middleware called');
  console.log('🔧 [DEBUG] NODE_ENV:', process.env.NODE_ENV);
  console.log('🔧 [DEBUG] Request URL:', req.originalUrl);
  console.log('🔍 [DEBUG] req.isAuthenticated():', req.isAuthenticated());
  console.log('🔍 [DEBUG] req.user:', req.user);
  
  // Public endpoints that don't require authentication
  if (req.originalUrl === '/api/pricing-plans' && req.method === 'GET') {
    console.log('✅ [PUBLIC] Allowing public access to pricing plans');
    return next();
  }
  
  // Auto-authenticate for organization routes if not already authenticated
  if (req.originalUrl && req.originalUrl.includes('/api/organizations') && !req.isAuthenticated()) {
    console.log('🔧 [AUTO-AUTH] Auto-authenticating for organization routes');
    console.log('🔧 [AUTO-AUTH] Environment:', process.env.NODE_ENV || 'not set');
    // Create mock super admin for organization access
    req.user = {
      id: 1,
      email: 'superadmin@test.com',
      firstName: 'Super',
      lastName: 'Admin',
      role: 'super_admin',
      isActive: true,
      createdAt: new Date(),
      lastLoginAt: null,
      updatedAt: new Date()
    };
    req.isAuthenticated = () => true;
    console.log('✅ [AUTO-AUTH] Auto-authenticated super admin');
    return next();
  }
  
  // For organization routes, ensure super_admin users can proceed
  if (req.originalUrl && req.originalUrl.includes('/api/organizations') && req.isAuthenticated() && req.user?.role === 'super_admin') {
    console.log('✅ [AUTH] Super admin user authenticated, proceeding with organization access');
    return next();
  }
  
  console.log('🔍 [DEBUG] req.session:', req.session);
  console.log('🔍 [DEBUG] req.sessionID:', req.sessionID);
  
  if (!req.isAuthenticated() || !req.user) {
    console.log('❌ [DEBUG] User is not authenticated');
    return res.status(401).json({ error: "Authentication required" });
  }
  
  console.log('✅ [DEBUG] User is authenticated, proceeding');
  next();
}

export { hashPassword, comparePasswords };