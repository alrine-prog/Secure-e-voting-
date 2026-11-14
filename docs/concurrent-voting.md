# Concurrent voting notes

The voting endpoints use short PostgreSQL `SERIALIZABLE` transactions and a bounded retry for Prisma serialization conflicts (`P2034`). The token's conditional `used: false` update is the single-winner claim; the token claim and vote insert commit or roll back together. The ballot/token unique key and `createMany({ skipDuplicates: true })` make simultaneous token provisioning safe across multiple server instances.

When a voter submits the same ballot concurrently, one request should succeed and the others should receive HTTP 409. Temporary serialization contention is retried up to four total attempts; if it remains busy the API returns HTTP 503 so the client can safely retry. Do not automatically retry with a different token or candidate.

Before deployment:

- Ensure PostgreSQL is the production database and that Prisma migrations have been applied.
- Load test against a staging database with realistic voter counts, concurrent submissions, repeated submissions, and server restarts.
- Check that the application and database connection pools are sized for expected peak traffic; avoid unbounded per-request work.
- Monitor request latency, HTTP 409/503 rates, transaction conflicts, database pool saturation, and failed vote writes.
- Have tested backups and a recovery plan. These changes do not make a system immune to outages and are not a certification for real elections.
