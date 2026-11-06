# Initial system-owner sign-in

The first system-owner account is created from `SYSTEM_OWNER_EMAIL` and `SYSTEM_OWNER_PASSWORD` during server startup. There are no built-in credentials. Before the first startup, configure both values in `.env`; use a unique password of at least 12 characters containing uppercase and lowercase letters, a number, and a symbol. Then sign in at `/login?role=system_owner` with that email and password. Never commit `.env` or share bootstrap credentials.

If a system-owner account already exists, normal startup preserves its password. To explicitly reset it from environment variables, set `FORCE_SEED=true` for a controlled one-time startup with a strong `SYSTEM_OWNER_PASSWORD`, then remove `FORCE_SEED` immediately. In production, the same explicit bootstrap configuration is required if no system owner exists.

Voter registration requires a working SMTP or SendGrid configuration: the temporary password is sent only to the voter's email and is never returned to the staff page or written to fallback logs. If email delivery fails after registration, the account remains pending and the voter should use the password-reset process after the email provider is fixed.
