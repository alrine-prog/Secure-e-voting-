# Candidate profile management

University administrators can manage candidate profiles at `/admin/candidates`. Create or select an election, then add or edit the candidate's full name, position, faculty, college, party, symbol, optional photo, and additional details.

## Database setup

After updating the code, regenerate Prisma Client and apply the schema to the configured PostgreSQL database:

```bash
npx prisma generate
npx prisma db push
```

## Candidate photos

Candidate image uploads are limited to JPEG, PNG, or WebP and 5 MB. They are stored under `uploads/candidates` and served through `/elections/candidate-photos/:filename`. For production deployments, persist this directory across deploys or replace local disk storage with a durable object-storage provider.
