# GhostHawk - Recruitment Transparency Platform

## Overview

GhostHawk is a comprehensive transparency platform designed to solve recruitment industry problems by tracking hiring practices across companies and recruiters. The platform allows job seekers to research which employers actually respond to candidates and provide meaningful feedback, creating accountability in the hiring process. The system tracks both external recruiters/agencies and internal company HR departments, providing insights into response rates, communication quality, interview conversion rates, and overall candidate experience.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development practices
- **UI Library**: Comprehensive design system using shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and theme system for consistent visual identity
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation for type-safe form management

### Backend Architecture
- **Runtime**: Node.js with Express.js framework for RESTful API endpoints
- **Language**: TypeScript throughout the stack for consistency and type safety
- **Authentication**: Replit Auth integration with session management using connect-pg-simple
- **Database Layer**: Drizzle ORM with PostgreSQL for type-safe database operations
- **Session Storage**: PostgreSQL-backed sessions with automatic cleanup

### Database Design
- **ORM**: Drizzle with PostgreSQL dialect for schema management and migrations
- **Schema Structure**:
  - Users table for authentication and profile management
  - Companies table supporting both direct employers and recruitment agencies
  - Experiences table for candidate feedback and ratings
  - Sessions table for authentication state persistence
- **Data Validation**: Drizzle-Zod integration for runtime schema validation

### API Design
- **Architecture Pattern**: RESTful API with consistent endpoint naming
- **Data Flow**: Request validation → Business logic → Database operations → Response formatting
- **Error Handling**: Centralized error middleware with proper HTTP status codes
- **Search & Filtering**: Advanced search capabilities with sorting, pagination, and filtering options

### Build System
- **Development**: Vite for fast development server and hot module replacement
- **Production**: ESBuild for server bundling, Vite for client optimization
- **TypeScript**: Strict configuration with path mapping for clean imports
- **Asset Handling**: Vite-based asset processing with static file serving

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL with connection pooling
- **Connection Management**: @neondatabase/serverless with WebSocket support

### Authentication System
- **Replit Auth**: OpenID Connect integration for user authentication
- **Session Management**: PostgreSQL-backed sessions with automatic expiration
- **Security**: HTTP-only secure cookies with CSRF protection

### UI Component Libraries
- **Radix UI**: Headless component primitives for accessibility and functionality
- **Lucide React**: Consistent icon system throughout the application
- **Class Variance Authority**: Type-safe component variant management

### Development Tools
- **Replit Integration**: Development environment with live reload and error handling
- **TypeScript**: Strict type checking across frontend, backend, and shared code
- **ESLint/Prettier**: Code quality and formatting consistency