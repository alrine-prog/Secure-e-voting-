# Secure E-Voting

Secure E-Voting is a secure online voting platform for universities and institutions. It supports:
- University registration and approval workflow
- University admin login and role-based access
- Staff management and voter registration
- Election creation, opening, closing, and results viewing
- Single-use voting tokens for secure vote casting
- Audit logs, notification support, and system approvals

Project structure
- frontend/ — Next.js frontend
- src/ — Express API server
- prisma/ — Prisma schema and migrations
- docs/ — user/admin/developer documentation

Quick start
1. Copy environment variables:
   - cp .env.example .env
   - or create your own .env with DATABASE_URL, JWT_SECRET, FRONTEND_URL, and SMTP/SendGrid values

2. Install dependencies:
   - npm install
   - cd frontend && npm install && cd ..

3. Start backend:
   - node src/server.js

4. Start frontend:
   - cd frontend
   - npm run dev

5. Open:
   - http://localhost:3000

Default system owner
The server seeds a system owner account automatically if environment variables are set:
- SYSTEM_OWNER_EMAIL
- SYSTEM_OWNER_PASSWORD

Example:
```bash
SYSTEM_OWNER_EMAIL=admin@example.com
SYSTEM_OWNER_PASSWORD=StrongPassword123!
