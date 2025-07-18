# Replit Configuration

## Overview

This is a modern collaboration platform similar to Slack, featuring AI-powered capabilities through OpenAI integration. The application is built with a full-stack TypeScript architecture using React for the frontend and Express.js for the backend, with PostgreSQL as the database and WebSocket support for real-time communication.

## User Preferences

Preferred communication style: Simple, everyday language.
UI Design preference: Slack-style interface with sidebar navigation, channel lists, and workspace-focused layout instead of card-based dashboards.

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

### Real-time Features
1. **WebSocket Integration**: Live messaging and typing indicators
2. **Presence System**: User online/offline status tracking
3. **Live Notifications**: Real-time alerts for mentions and messages
4. **Activity Feeds**: Live updates for workspace and channel activity

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