# Candidate profiles and voting

University administrators can manage candidate profiles at `/admin/candidates`, linked from the admin navigation. Candidate profiles can be edited with a new image upload or by retaining the current photo.

Voters see current open elections at `/voter`, review candidate profiles, choose one candidate per election, enter their single-use voting token, and submit. The candidate listing is restricted to authenticated voters and their university. The server verifies that the chosen candidate belongs to the election and that the token is unused and belongs to an approved voter at that university.

Candidate image uploads are limited to JPEG, PNG, or WebP and 5 MB and stored under `uploads/candidates`. In production, persist that directory across deployments or configure durable object storage.
