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
```
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
```

Backend run
```
npm install
node src/server.js
```

Frontend run
```
cd frontend
npm install
# create .env.local
# NEXT_PUBLIC_API_BASE=http://localhost:4000
npm run dev
```

API patterns
- auth routes: /auth/*
- university routes: /universities/*
- admin routes: /admin/*
- staff routes: /staff/*
- election routes: /elections/*
- support: /support

Auth & roles
The system uses role-based access:
- system_owner
- university_admin
- staff
- voter

Protected routes should check:
- authentication
- role
- university boundary where appropriate

Important files
- src/server.js — server bootstrap and route mounting
- src/controllers/adminController.ts — approval/rejection logic
- src/controllers/universityController.ts — university registration logic
- src/controllers/staffController.ts — staff/voter creation logic
- src/controllers/votingController.ts — vote token + casting logic
- src/services/notificationService.ts — SendGrid/SMTP email handling
- src/seed.ts — system owner seeding

Development notes
- Add new routes under src/routes
- Add business logic to the matching controller
- Use Prisma to access DB records
- Keep authorization checks role-based
- Write logs for approvals, rejections, election lifecycle actions, and support requests

Testing checklist
- University registration works
- System owner can approve pending universities
- University admin login works after approval
- Staff can register voters and upload CSV
- Approved voters can vote with tokens
- Election results update correctly
- Contact form sends email through support endpoint
