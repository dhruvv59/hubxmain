# HubX - Educational Exam Platform

A production-ready platform for managing educational assessments, student progress tracking, and real-time collaboration between students and teachers.

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

HubX is a comprehensive education platform that provides:

- **Assessment Management**: Teachers can create and manage exams with various question types
- **Real-time Exam Taking**: Students take exams with live progress tracking
- **Performance Analytics**: Detailed analytics on student performance and learning trends
- **Achievement System**: Gamified learning with achievement tracking
- **Support Ticketing**: Built-in support system for student issues
- **Payment Integration**: Razorpay integration for premium content
- **Real-time Communication**: Socket.IO powered chat and notifications

---

## 🏗️ Tech Stack

### Backend
- **Framework**: Express.js 4.18
- **Language**: TypeScript 5.3
- **Database**: MySQL with Prisma ORM 5.21
- **Cache**: Redis 6+
- **Real-time**: Socket.IO 4.7
- **File Storage**: AWS S3
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Express Validator
- **Security**: Helmet, CORS, Rate Limiting

### Frontend
- **Framework**: Next.js 16 (React 19)
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI, Lucide Icons
- **State Management**: React Context
- **Testing**: Jest, React Testing Library

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Deployment**: Docker Swarm / Kubernetes ready
- **Database**: MySQL 8+
- **Cache**: Redis 6+

---

## ✨ Features

### ✅ Implemented & Production Ready

#### Student Features
- ✅ User registration and login
- ✅ Profile management
- ✅ Settings (notifications, privacy, preferences)
- ✅ Take exams/assessments
- ✅ View results and performance
- ✅ Achievement tracking (real achievements, not mock)
- ✅ Support ticket system
- ✅ Real-time chat with teachers
- ✅ Paper purchases with Razorpay
- ✅ Analytics dashboard

#### Teacher Features
- ✅ Create exams/assessments
- ✅ Question bank management
- ✅ Student performance analytics
- ✅ Real-time messaging with students
- ✅ Support ticket responses
- ✅ Paper/content publication
- ✅ Student list management
- ✅ Organization management

#### Admin Features
- ✅ User management
- ✅ Organization management
- ✅ Achievement seeding
- ✅ System monitoring

---

## 📁 Project Structure

```
HubX_Project/
├── Hubx_backend/                  # Express.js backend
│   ├── src/
│   │   ├── modules/              # Feature modules
│   │   │   ├── student/          # Student-specific endpoints
│   │   │   │   ├── routes/       # Route definitions
│   │   │   │   ├── services/     # Business logic
│   │   │   │   ├── validators/   # Input validation
│   │   │   │   └── ...
│   │   │   ├── support/          # Support ticketing system
│   │   │   ├── auth/             # Authentication
│   │   │   ├── exam/             # Exam management
│   │   │   ├── payment/          # Payment processing
│   │   │   ├── notification/     # Notifications
│   │   │   └── ...
│   │   ├── middlewares/          # Express middlewares
│   │   ├── config/               # Configuration files
│   │   ├── utils/                # Utility functions
│   │   ├── app.ts                # Express app setup
│   │   └── server.ts             # Server entry point
│   ├── prisma/
│   │   ├── schema.prisma         # Database schema
│   │   └── migrations/           # Database migrations
│   ├── docker-compose.yml        # Docker setup
│   ├── .env.example              # Environment variables template
│   └── package.json
│
├── Hubx_frontend/                 # Next.js frontend
│   ├── src/
│   │   ├── app/                  # Next.js App Router
│   │   │   ├── (auth)/           # Auth pages
│   │   │   ├── (dashboard)/      # Student dashboard
│   │   │   ├── (teacher)/        # Teacher pages
│   │   │   ├── (admin)/          # Admin pages
│   │   │   └── ...
│   │   ├── components/           # Reusable components
│   │   ├── services/             # API client services
│   │   ├── hooks/                # Custom React hooks
│   │   ├── types/                # TypeScript types
│   │   └── lib/                  # Utility functions
│   ├── .env.local                # Frontend env variables
│   └── package.json
│
└── README.md                       # This file
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- MySQL 8+
- Redis 6+
- AWS S3 bucket (for file uploads)
- Razorpay account (for payments)

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd Hubx_backend
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   ```

3. **Edit `.env` with your credentials**
   ```
   DATABASE_URL="mysql://user:password@localhost:3306/hubx_exam"
   JWT_SECRET="your-secret-key-min-32-chars"
   RAZORPAY_KEY_ID="your-key-id"
   AWS_ACCESS_KEY_ID="your-aws-key"
   # ... other variables
   ```

4. **Install dependencies**
   ```bash
   npm install
   ```

5. **Setup database**
   ```bash
   # Generate Prisma client
   npm run prisma:generate

   # Run migrations
   npm run prisma:migrate

   # (Optional) Seed initial data
   # npm run prisma:seed
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```
   Server runs on http://localhost:8000

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd ../Hubx_frontend
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env.local
   ```

3. **Edit `.env.local` with your settings**
   ```
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
   NEXT_PUBLIC_WS_URL=ws://localhost:8000
   ```

4. **Install dependencies**
   ```bash
   npm install
   ```

5. **Start dev server**
   ```bash
   npm run dev
   ```
   Frontend runs on http://localhost:3000

---

## 📡 API Documentation

### Base URL
```
http://localhost:8000/api/v1
```

### Authentication
All protected endpoints require JWT token in header:
```
Authorization: Bearer <token>
```

### Profile Endpoints

#### GET `/student/profile/:studentId`
Fetch student's profile
```json
Response (200):
{
  "success": true,
  "data": {
    "id": "user_123",
    "email": "student@example.com",
    "fullName": "John Doe",
    "phone": "+1234567890",
    "address": "123 Main St",
    "dateOfBirth": "1995-01-15",
    "role": "STUDENT"
  }
}
```

#### PUT `/student/profile/:studentId`
Update student's profile
```json
Request:
{
  "fullName": "John Doe Updated",
  "phone": "+9876543210",
  "address": "456 Oak St",
  "dateOfBirth": "1995-01-15"
}

Response (200): Same as GET
```

### Settings Endpoints

#### GET `/student/settings/:studentId`
Fetch student's settings
```json
Response (200):
{
  "success": true,
  "data": {
    "notifications": {
      "email": true,
      "push": false,
      "assignments": true,
      "assessments": true,
      "announcements": false
    },
    "privacy": {
      "profileVisibility": "public",
      "showPerformance": true
    },
    "preferences": {
      "language": "en",
      "theme": "light"
    }
  }
}
```

#### PUT `/student/settings/:studentId`
Update student's settings (same request/response structure)

### Achievements Endpoints

#### GET `/student/achievements/:studentId`
Get all achievements with progress
```json
Response (200):
{
  "success": true,
  "data": [
    {
      "id": "ach_first_assessment",
      "title": "First Steps",
      "description": "Complete your first assessment",
      "icon": "star",
      "color": "from-yellow-400 to-orange-500",
      "earned": true,
      "earnedDate": "2025-01-15T10:30:00Z",
      "progress": 100
    },
    {
      "id": "ach_score_threshold",
      "title": "Quick Learner",
      "earned": false,
      "progress": 60,  // 3 out of 5 exams with 90%+
      "requirement": 5
    }
  ]
}
```

### Support Ticket Endpoints

#### POST `/support/tickets`
Create a support ticket
```json
Request:
{
  "subject": "Payment not working",
  "message": "I tried to purchase a paper but...",
  "category": "payment"
}

Response (201):
{
  "success": true,
  "data": {
    "id": "ticket_123",
    "subject": "Payment not working",
    "status": "open",
    "priority": "medium",
    "createdAt": "2025-02-16T14:30:00Z"
  }
}
```

#### GET `/support/tickets?status=open&page=1&limit=10`
Get paginated ticket list

#### GET `/support/tickets/:ticketId`
Get ticket detail with all replies

#### POST `/support/tickets/:ticketId/reply`
Add reply to ticket
```json
Request:
{
  "message": "Thank you for reporting this..."
}
```

---

## 🗄️ Database Schema

### Key Models

**User**
- Stores user account information
- Roles: STUDENT, TEACHER, SUPER_ADMIN
- Relations: profile, settings, achievements, support tickets

**StudentProfile**
- Extended profile info (phone, address, DOB)
- One-to-one with User

**StudentSettings**
- User preferences (notifications, privacy, language, theme)
- One-to-one with User

**Achievement**
- Available achievements
- Tracks type (first_assessment, score_threshold, etc.)

**UserAchievement**
- Maps earned achievements to users
- Tracks earnedAt timestamp

**SupportTicket**
- Student support requests
- Status tracking (open, in_progress, resolved)
- Priority auto-calculation

**SupportTicketReply**
- Teacher/admin responses to tickets

---

## 🐳 Deployment

### Docker Setup

1. **Using Docker Compose** (includes MySQL, Redis)
   ```bash
   cd Hubx_backend
   docker-compose up -d
   ```

2. **Environment Setup**
   - Create `.env` file with production values
   - Ensure DATABASE_URL points to your MySQL instance

3. **Database Migrations**
   ```bash
   docker-compose exec app npm run prisma:migrate
   ```

4. **Start Services**
   ```bash
   docker-compose up
   ```

### Production Checklist

- [ ] Change all JWT secrets
- [ ] Change all database passwords
- [ ] Set NODE_ENV to "production"
- [ ] Enable HTTPS
- [ ] Configure proper CORS origins
- [ ] Set up SSL certificates
- [ ] Enable rate limiting
- [ ] Configure Redis for session store
- [ ] Setup email notifications
- [ ] Setup error monitoring (Sentry)
- [ ] Run security audit
- [ ] Backup database regularly

---

## 🧪 Testing

### Backend Tests
```bash
cd Hubx_backend
npm run test
npm run test:coverage
```

### Frontend Tests
```bash
cd Hubx_frontend
npm run test
npm run test:watch
npm run test:coverage
```

---

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check MySQL is running
mysql -u root -p

# Test connection
npm run prisma:db push --force-reset
```

### Redis Connection Issues
```bash
# Check Redis is running
redis-cli ping
# Should respond with PONG
```

### JWT Issues
- Ensure JWT_SECRET is set and consistent
- Check token expiration
- Verify Authorization header format

### File Upload Issues
- Verify AWS credentials
- Check bucket permissions
- Ensure bucket is in correct region

---

## 📚 Learning Resources

- [Express.js Documentation](https://expressjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Razorpay Integration Guide](https://razorpay.com/docs)
- [AWS S3 Documentation](https://docs.aws.amazon.com/s3)

---

## 📝 API Response Format

All API responses follow this format:

**Success Response (2xx)**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { /* actual data */ },
  "pagination": { /* optional, for list endpoints */ }
}
```

**Error Response (4xx, 5xx)**
```json
{
  "success": false,
  "message": "Human-friendly error message",
  "errors": { /* optional validation errors */ },
  "requestId": "req_xyz123" /* for debugging */
}
```

---

## 📞 Support

For issues and feature requests, please create a support ticket through the in-app support system or email support@hubx.com

---

## 📄 License

ISC License - See package.json for details

---

## 🤝 Contributing

See CONTRIBUTING.md for guidelines

**Last Updated**: February 2025
**Version**: 1.0.0 (Production Ready)
