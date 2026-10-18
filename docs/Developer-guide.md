# Developer Guide

This guide explains the technical structure and setup for Secure E-Voting.

Architecture
- Frontend: Next.js (pages router)
- Backend: Express.js
- API endpoints: under src/routes
- Controllers: under src/controllers
- Database: Prisma + PostgreSQL
- Notification system: SendGrid or SMTP via notificationService

Project structure
- frontend/ — UI pages and components
- src/ — API server, routes, controllers, services
- prisma/ — database schema and migrations
- docs/ — documentation
- README.md — project overview

Required environment variables
```bash
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret
FRONTEND_URL=http://localhost:3000
SYSTEM_OWNER_EMAIL=admin@example.com
SYSTEM_OWNER_PASSWORD=StrongPassword123!
SUPPORT_EMAIL=albertjesocen@gmail.com

# Email or SendGrid
SENDGRID_API_KEY=...
EMAIL_FROM=no-reply@yourdomain.com

# OR SMTP
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
