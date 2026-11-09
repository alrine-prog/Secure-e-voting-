# User profile photos

The `User.photoUrl` column is nullable for compatibility with existing accounts. New staff and observer accounts created from the university dashboard require a JPEG, PNG, or WebP photo (up to 5 MB). Images are stored under `uploads/profiles`; persist this directory in production or use durable object storage. All authenticated roles can update their profile photo from the dashboard navigation.

The organization label shown on dashboards is derived from the user's linked university (`University.name`), rather than copied into each account, keeping it consistent with the institution record.

Apply the Prisma schema update with `npx prisma db push` (also performed by the repository's existing postbuild script), or run the migration SQL with your deployment migration process. Regenerate Prisma Client before building the backend.
