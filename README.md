# Secure E-voting - Scaffold

This repository contains a TypeScript/Node.js scaffold for the Secure E-Voting project.

What's included in this commit:
- TypeScript Express app skeleton
- Prisma schema with core models (University, User, Voter, Election, VoteToken, Vote, PasswordResetOtp, AuditLog)
- Routes and controllers for:
  - Approving a voter by university admin
  - Notifying approved voters for an election (university admin only)
- A simple notification service (nodemailer) with console fallback
- A small dev auth middleware (header-based) to simulate university admin access. Replace with real auth.

Getting started (development):
1. Copy `.env.example` to `.env` and fill DATABASE_URL and SMTP settings if you want real emails.

2. Install deps:
   npm install

3. Run Prisma migrate (create DB first):
   npx prisma migrate dev --name init

4. Start dev server:
   npm run dev

Dev auth middleware (temporary):
- Set request headers: `x-user-id`, `x-user-role`, `x-university-id`.
- For example: `x-user-role: university_admin` and `x-university-id: <your-university-id>` to call the admin endpoints.

Files to review:
- src/routes/admin.ts
- src/controllers/voterController.ts
- src/services/notificationService.ts
- prisma/schema.prisma

Next steps I can implement now (pick one):
- Real authentication (JWT) and role-based guards
- Staff endpoints for registering voters and batch import
- Voting endpoint that enforces `voter.approved === true` and token-based anonymous voting
- UI scaffold (React)

If you want, I can run additional commits to implement one of the next steps.
