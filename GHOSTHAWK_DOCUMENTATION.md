# GhostHawk Platform Documentation

## Overview

GhostHawk is a transparency platform designed to expose company hiring behavior and help job seekers make informed decisions about where to apply. The platform focuses on identifying "ghost jobs" (fake job postings) and providing insights into company recruitment practices through user-submitted experiences.

**Core Mission**: Transparency in recruitment, not individual job tracking.

## Architecture

### Tech Stack
- **Frontend**: React with TypeScript, Wouter routing, TanStack Query, Tailwind CSS
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Local OAuth implementation
- **UI Components**: Custom shadcn/ui components

### Project Structure
```
ghosthawk/
├── client/           # Frontend React application
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/       # Route pages
│   │   ├── hooks/       # Custom React hooks
│   │   └── lib/         # Utilities and configurations
├── server/          # Backend Express application
├── shared/          # Shared types and schemas
└── db/             # Database schemas and migrations
```

## Core Concepts

### 1. Ghost Job Risk Score
The central metric of the platform - a weighted calculation determining how likely a company is to ghost candidates or post fake jobs.

**Formula**: `(100 - responseRate) * 0.4 + (100 - legitimateJobPercentage) * 0.4 + (100 - goodInterviewOutcomeRatio) * 0.2`

**Components**:
- Response Rate (40% weight): Percentage of applications that receive responses
- Legitimate Job Percentage (40% weight): Percentage of jobs marked as non-ghost by users
- Good Interview Outcome Ratio (20% weight): Success rate of interviews leading to job offers

**Risk Levels**:
- 0-20%: Very Low Ghost Risk (Green)
- 21-40%: Low Ghost Risk (Green)
- 41-60%: Medium Ghost Risk (Yellow)
- 61-80%: High Ghost Risk (Orange)
- 81-100%: Very High Ghost Risk (Red)

### 2. Company Types
- **Company**: Direct employers posting their own positions
- **Recruiter**: Third-party recruitment agencies

### 3. Response Time Categories
User-selected time ranges converted to numerical values for calculations:
- `same_day`: 0.5 days
- `1_3_days`: 2 days
- `1_week`: 7 days
- `2_weeks`: 14 days
- `1_month`: 30 days
- `longer`: 45 days

## Database Schema

### Core Tables
1. **companies**: Company information and calculated metrics
2. **experiences**: User-submitted recruitment experiences
3. **users**: User authentication and profile data

### Key Fields

**Companies Table**:
- `name`: Company name
- `type`: 'company' | 'recruiter'
- `industry`: Industry classification
- `avgRating`: Calculated ghost risk score (0-100)

**Experiences Table**:
- `userId`: User who submitted (always stored for ownership)
- `companyId`: Associated company
- `receivedResponse`: Boolean - did company respond
- `responseTime`: Category of response time
- `communicationQuality`: 'poor' | 'fair' | 'good' | 'excellent'
- `interviewOffered`: Boolean - was interview offered
- `interviewStages`: Comma-separated interview types
- `jobOffered`: Boolean - was job offer made
- `ghostJob`: Boolean - user believes job was fake
- `rejectionFeedback`: Boolean - feedback provided on rejection
- `isAnonymous`: Boolean - hide user identity in public views

## Pages & Components

### 1. Landing Page (`/`)
**Purpose**: Homepage with platform overview and quick access to key features
**Components**:
- Hero section with value proposition
- Platform statistics overview
- Search functionality
- Call-to-action for reporting experiences

### 2. Companies Page (`/companies`)
**Purpose**: Searchable directory of companies with filtering and sorting
**Features**:
- Search by company name
- Filter by industry, location, company type
- Filter by response rate ranges
- Sort by ghost risk score, response rate, or recent activity
**Components**: CompanyCard components in grid layout

### 3. Company Detail Page (`/company/:id`)
**Purpose**: Detailed view of individual company metrics and experiences
**Sections**:
- Company profile and key metrics
- Ghost risk score and breakdown
- Response rate and communication quality
- "Your Experience" section (if user has reported)
- Public experiences list (anonymized)
- Actions sidebar (report experience, etc.)

### 4. Report Experience Page (`/report`)
**Purpose**: Form for users to submit their recruitment experiences
**Form Fields**:
- Company selection/creation
- Position details
- Application and response information
- Interview tracking (offered, stages, outcome)
- Communication quality rating
- Ghost job assessment
- Additional comments
**Dynamic Behavior**: 
- Shows response-specific fields only if user received response
- Creates new company if not found in database

### 5. My Experiences Page (`/my-experiences`)
**Purpose**: User's personal experience history
**Features**:
- List of all user's submitted experiences
- Detailed view of each experience
- Edit/update functionality
- Privacy controls (anonymous reporting)

### 6. Platform Stats Page (`/stats`)
**Purpose**: Transparency insights and platform-wide analytics
**Sections**:
- Community Impact: Total experiences and companies tracked
- Company Behavior Trends: Key metrics across platform
- Response Time Insights: Distribution of company response times
- Market Insights: Industry ghost risk analysis, recruiter vs company performance
- Most Reported Companies: Leaderboard with ghost risk scores

### 7. Profile Page (`/profile`) 
**Purpose**: User account management and settings
**Features**: Profile information, privacy settings, experience management

## Key Components

### 1. CompanyCard
**Purpose**: Display company information in grid layouts
**Variants**: 
- Compact: Minimal info for search results
- Full: Detailed metrics for browsing
**Key Elements**: Company name, type, response rate, ghost risk indicator

### 2. ExperienceForm
**Purpose**: Complex form for reporting recruitment experiences
**Features**:
- Dynamic field visibility based on user responses
- Company autocomplete with creation option
- Validation and error handling
- Cache invalidation on successful submission

### 3. Navigation
**Purpose**: Main site navigation with authentication state
**Dynamic Elements**:
- Different navigation items for authenticated/unauthenticated users
- Context-aware text (e.g., "Report Your First Experience" vs "Report Experience")

## Data Flow & State Management

### 1. Query Management
Uses TanStack Query for:
- Server state management
- Caching and background updates
- Optimistic updates
- Error handling

### 2. Cache Invalidation Strategy
After experience submission, invalidates queries matching:
- `/api/companies*` (updates company metrics)
- `/api/stats*` (updates platform statistics)
- `/api/insights*` (updates industry insights)
- `/api/experiences*` (updates user experiences)

### 3. Authentication Flow
- OAuth-based authentication with local strategy
- User context provided through `useAuth` hook
- Route protection for authenticated-only pages
- Automatic redirection for unauthorized access

## API Endpoints

### Company Routes
- `GET /api/companies/search`: Search and filter companies
- `GET /api/companies/:id`: Get company details with stats and experiences

### Experience Routes
- `POST /api/experiences`: Submit new experience (authenticated)
- `GET /api/experiences/user`: Get user's experiences (authenticated)

### Statistics Routes
- `GET /api/stats`: Basic platform statistics
- `GET /api/stats/detailed`: Comprehensive analytics data
- `GET /api/insights`: Industry insights and trends

### Authentication Routes
- `GET /api/auth/user`: Get current user info
- `GET /api/login`: Initiate OAuth login
- `GET /api/logout`: End user session

## Business Logic

### 1. Company Scoring Algorithm
Located in `storage.ts > searchCompanies()`:
1. Calculates response rate from experiences
2. Determines legitimate job percentage from ghost job reports  
3. Computes interview success ratio
4. Applies weighted formula for ghost risk score
5. Clamps result between 0-100

### 2. Experience Aggregation
Companies aggregate data from all associated experiences:
- Total experience count
- Response statistics
- Communication quality averages
- Interview outcome ratios

### 3. Industry Insights
Calculates industry-level metrics by:
1. Grouping companies by industry
2. Computing ghost risk scores for each company
3. Averaging scores within each industry
4. Providing comparative analysis

## Naming Conventions

### Variables & Functions
- `camelCase` for JavaScript/TypeScript
- Descriptive names (e.g., `ghostJobRisk`, `responseTimeInsights`)
- Boolean fields prefixed appropriately (`isAnonymous`, `receivedResponse`)

### Database Fields
- `snake_case` for database columns
- Clear, unambiguous naming
- Consistent use of `id`, `createdAt`, `updatedAt`

### API Routes
- RESTful conventions
- Plural nouns for collections (`/companies`, `/experiences`)
- Nested routes for relationships (`/companies/:id`)

### Component Names
- `PascalCase` for React components
- Descriptive, action-oriented names
- Consistent file naming with component names

## Security Considerations

### Data Privacy
- User experiences can be marked anonymous
- Personal information filtered from public views
- User ID always stored for ownership, but hidden when anonymous

### Input Validation
- Zod schemas for API request validation
- Frontend form validation
- SQL injection prevention through parameterized queries

### Authentication
- Session-based authentication
- Route protection for sensitive operations
- CSRF protection through same-origin policies

## Performance Optimizations

### Frontend
- React Query for efficient data fetching and caching
- Component memoization where appropriate
- Lazy loading of non-critical components
- Optimized bundle splitting

### Backend
- Database indexing on frequently queried fields
- Efficient SQL queries with proper JOINs
- Response caching for expensive calculations
- Pagination for large datasets

### Database
- Proper indexing strategy
- Efficient aggregation queries
- Denormalized calculated fields (avgRating) for performance

## Development Workflow

### Code Organization
- Separation of concerns between client/server
- Shared type definitions in `/shared`
- Modular component architecture
- Utility functions in dedicated modules

### Error Handling
- Comprehensive error boundaries in React
- Structured error responses from API
- User-friendly error messages
- Logging for debugging

### Testing Strategy
- Unit tests for utility functions
- Integration tests for API endpoints
- Component testing for UI interactions
- End-to-end testing for critical user flows

## Deployment & Infrastructure

### Environment Configuration
- Separate configurations for development/production
- Environment variables for sensitive data
- Database connection management

### Build Process
- TypeScript compilation
- Asset optimization
- Environment-specific builds

## Future Considerations

### Scalability
- Database partitioning strategies
- CDN integration for static assets
- Microservice architecture considerations

### Features
- Advanced analytics and reporting
- Company verification system
- API rate limiting
- Mobile application support

### Monitoring
- Application performance monitoring
- Error tracking and alerting
- User analytics and insights
- Database performance monitoring

---

This documentation serves as a comprehensive guide to understanding the GhostHawk platform's architecture, functionality, and development practices. It should be updated as the platform evolves and new features are added.