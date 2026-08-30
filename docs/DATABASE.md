# Database handoff

The app is currently backed by seeded demo data and local browser progress. The shared production version should replace `lib/server/wedding-repository.js` with database queries while keeping its exported functions stable.

## Recommended entities

- `guests`: name, table, phone, relation, hometown, profile fields, auth status
- `tables`: number, display name
- `missions`: title, instructions, type, points, color, active status, sort order
- `submissions`: guest, mission, text answer, media URL, status, points, timestamps
- `scores`: guest, total points, completed mission count
- `reactions`: guest, submission, reaction type

## Upload flow

1. Client requests a signed upload URL.
2. Photo or video uploads directly to object storage.
3. The returned media URL is submitted with the mission response.
4. A server action validates the guest, mission, file type, and points.
5. The wall displays approved submissions.

## Suggested next implementation

Use managed Postgres for relational data and Vercel Blob or equivalent object storage for photo proof. Add moderation status before enabling a public live wall.
