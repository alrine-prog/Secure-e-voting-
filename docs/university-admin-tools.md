# University administrator tools

University administrators can register staff and observer accounts from `/admin`. The system emails each new account a temporary password; if the delivery fails, the user can use **Forgot password** to establish account access. Administrators can suspend or reactivate staff and observer accounts. Suspension requires a reason, which is stored in the university activity log.

Create an election as a draft, add candidates under posts such as **Guild President**, and then open the election. Candidate lists are locked once the election is open. An election can be closed by its administrator. Approved voters can be notified by email and/or SMS through the configured notification provider.

The university activity log displays the latest 100 actions associated with the institution. To apply the updated role and candidate schema to a development database, regenerate Prisma Client and run the project's database schema update (for example, `npx prisma db push`). Review the schema changes and back up production data before applying them to a live database.
