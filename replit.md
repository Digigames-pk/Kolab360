# Replit Configuration

## Overview

This is a modern collaboration platform similar to Slack, featuring AI-powered capabilities through OpenAI integration. The application is built with a full-stack TypeScript architecture using React for the frontend and Express.js for the backend, with PostgreSQL as the database and WebSocket support for real-time communication.

## User Preferences

Preferred communication style: Simple, everyday language.
UI Design preference: Slack-style interface with sidebar navigation, channel lists, and workspace-focused layout instead of card-based dashboards.
Task Board Requirements: Sophisticated visual UI with enhanced features, drag-and-drop, priority indicators, and per-channel task management.
Calendar Requirements: Advanced calendar with enhanced features, multiple view modes, sophisticated event management, and per-channel calendar capabilities.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing
- **UI Components**: Radix UI primitives with custom styling
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Real-time**: WebSocket (ws) for live messaging and notifications
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: PostgreSQL-backed sessions with connect-pg-simple
- **API Integration**: OpenAI API for AI features

### Database Architecture
- **ORM**: Drizzle with PostgreSQL dialect
- **Schema**: Shared schema definitions between client and server
- **Migration**: Drizzle Kit for database migrations
- **Provider**: Neon serverless PostgreSQL

## Key Components

### Core Features
1. **User Management**: Replit Auth integration with user profiles
2. **Workspace System**: Multi-tenant workspace architecture with invite codes
3. **Channel Communication**: Public and private channels with real-time messaging
4. **Direct Messaging**: One-on-one conversations between users
5. **File Sharing**: Multer-based file upload system
6. **Task Management**: Kanban-style task boards integrated with channels

### AI-Powered Features
1. **Smart Assistant**: OpenAI GPT-4o integration for contextual responses
2. **Auto-Complete**: Predictive text completion for messages
3. **Sentiment Analysis**: Real-time mood detection with suggestions
4. **Message Summarization**: AI-powered conversation summaries
5. **Task Generation**: Automatic task creation from conversations
6. **Content Analysis**: AI-driven insights and recommendations

### Visual Enhancement Features
1. **Multiple Theme Options**: 5 beautiful color themes (Dark Purple, Ocean Blue, Forest Green, Sunset Orange, Midnight Blue) with dynamic CSS variable system and localStorage persistence
2. **Sophisticated Task Management**: Enhanced Kanban-style task board with visual cards, drag-and-drop capability, priority indicators, subtask progress, assignee avatars, tags, attachments count, comments tracking, and per-channel task management
3. **Advanced Calendar Integration**: Feature-rich calendar with month/week/day views, event creation dialogs, priority levels, recurring events, virtual meeting links, reminder settings, attendee management, and sophisticated filtering/search capabilities
4. **Enhanced UI Components**: Modern gradient backgrounds, glassmorphism effects, improved spacing, professional styling, hover animations, and visual feedback throughout

### Email Integration Features
1. **Resend.com Integration**: Modern email service with professional templates
2. **Welcome Emails**: Automated onboarding emails for new users
3. **Workspace Invitations**: Beautiful invitation emails with invite codes
4. **AI Summary Emails**: Daily team activity summaries powered by AI
5. **Mention Notifications**: Real-time email alerts for @mentions
6. **Password Reset**: Secure password reset email functionality
7. **Email Testing Suite**: Beautiful non-card admin interface for testing all email templates with Kolab360 branding

### Real-time Features
1. **WebSocket Integration**: Live messaging and typing indicators
2. **Presence System**: User online/offline status tracking
3. **Live Notifications**: Real-time alerts for mentions and messages
4. **Activity Feeds**: Live updates for workspace and channel activity

### Enhanced Slack-Style Features
1. **Advanced File Sharing**: Drag-and-drop file uploads with live previews, file type detection, and comprehensive file management with recent files gallery
2. **Sophisticated Search**: Multi-modal search with filters by type, date, author, channel, and advanced search modifiers like "from:", "in:", "has:files", with saved searches and recent history
3. **Enhanced Notification Center**: Customizable notification preferences, Do Not Disturb mode with scheduling, real-time notification badges, and comprehensive settings for different notification types
4. **Improved Channel Management**: Enhanced sidebar with channel descriptions, private/public indicators, unread counters, and better visual hierarchy
5. **Direct Messaging**: Enhanced DM interface with status indicators, last message previews, and integrated voice/video call buttons
6. **Message Input Enhancements**: Rich text input with @mentions, #channel links, emoji support, file attachment, AI assistant integration, and formatting helpers

### Advanced Task Management Features
1. **Mobile-First Task Board**: Responsive design with native mobile components, optimized touch interactions, and seamless desktop/mobile switching
2. **Drag-and-Drop Category Management**: Full category reordering with react-beautiful-dnd, visual feedback during drag operations, and automatic persistence
3. **Dual View System**: Kanban view for visual workflow management and List view for detailed task information with mobile-optimized layouts
4. **Enhanced Task Creation**: Streamlined mobile-friendly task creation modal with priority selection, status assignment, and assignee management
5. **Color-Coded Workflow**: Consistent color theming across categories with dark mode support and gradient backgrounds for visual appeal
6. **Smart Persistence**: Per-channel category ordering, automatic save functionality, and workspace-specific customization settings

### Cloud Storage Integration
1. **Wasabi S3-Compatible Storage**: Complete file storage solution with AWS SDK integration for scalable cloud storage
2. **Multi-Format Support**: Documents, images, videos, audio files, PDFs, and all media types with intelligent categorization
3. **Advanced File Management**: Upload, download, delete, category filtering, search functionality, and comprehensive file metadata
4. **Secure Access Control**: Presigned URLs for secure file access with configurable expiration and permission-based access
5. **Smart Organization**: Automatic file categorization, per-channel/workspace organization, and visual file browsing interface
6. **Performance Optimization**: Efficient upload with progress tracking, drag-and-drop support, and mobile-optimized file management

## Data Flow

### Authentication Flow
1. User initiates login through Replit Auth
2. OpenID Connect authentication with session storage
3. JWT-based user identification with PostgreSQL session persistence
4. Role-based access control for workspace and channel permissions

### Messaging Flow
1. Client sends message through WebSocket or HTTP API
2. Server validates user permissions and processes message
3. AI features (sentiment analysis, auto-complete) triggered if enabled
4. Message stored in PostgreSQL with metadata
5. Real-time broadcast to connected clients via WebSocket
6. Offline users receive notifications via email (Resend.com integration)

### AI Processing Flow
1. User input triggers AI analysis (sentiment, auto-complete, etc.)
2. Context gathered from recent conversation history
3. OpenAI API called with appropriate prompts and parameters
4. AI response processed and integrated into user experience
5. AI interactions logged for audit and improvement

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Database ORM and query builder
- **openai**: Official OpenAI API client
- **ws**: WebSocket server implementation
- **express**: Web application framework
- **passport**: Authentication middleware

### Frontend Dependencies
- **@tanstack/react-query**: Server state management
- **@radix-ui/react-***: UI component primitives
- **tailwindcss**: Utility-first CSS framework
- **wouter**: Lightweight routing library
- **react-hook-form**: Form state management

### AI and Integration Dependencies
- **@replit/database**: Replit's database service
- **resend**: Email service for notifications
- **multer**: File upload middleware
- **chart.js**: Data visualization library

## Deployment Strategy

### Development Environment
- **Runtime**: Node.js with ESM modules
- **Development Server**: Vite dev server with HMR
- **Database**: Neon PostgreSQL with connection pooling
- **WebSocket**: Integrated with Express server
- **Asset Handling**: Vite static asset processing

### Production Build
- **Backend**: ESBuild bundling with external packages
- **Frontend**: Vite production build with optimizations
- **Database**: Drizzle migrations for schema management
- **Static Assets**: Served from dist/public directory
- **Environment Variables**: Required for OpenAI, database, and Replit services

### Environment Configuration
Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `OPENAI_API_KEY`: OpenAI API authentication
- `SESSION_SECRET`: Session encryption key
- `REPLIT_DOMAINS`: Authentication domain configuration
- `RESEND_API_KEY`: Email service authentication

### Scaling Considerations
- WebSocket connections managed per server instance
- Database connection pooling for concurrent requests
- AI API rate limiting and caching strategies
- File upload storage optimization
- Session store performance with PostgreSQL indexing