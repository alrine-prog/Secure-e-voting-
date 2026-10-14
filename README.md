# Updates: Auth & Voting Flow

This commit adds:
- JWT-based authentication (login / token issuance)
- Seed routine to create default system owner from env or provided defaults
- University registration endpoint (creates pending university and inactive university_admin user)
- Staff creation endpoint (by university_admin)
- Voter token issuance for elections (admin action)
- Anonymous vote casting using single-use tokens (transactional)
- Password reset via OTP (email/sms) endpoints

Quick notes:
- Configure .env: set DATABASE_URL, JWT_SECRET, SYSTEM_OWNER_EMAIL, SYSTEM_OWNER_PASSWORD, SMTP_* for email sending
- To call protected endpoints use: Authorization: Bearer <token>
- Admin endpoints require user role checks. Use the seeded system owner to approve universities (future endpoint to add).