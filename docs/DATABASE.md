# Database

Backend: **Supabase Postgres**, talked to through plain SQL (`postgres` driver)
behind `lib/server/wedding-repository.js`. The repository's exported functions
are the stable seam — API routes and the UI never import `lib/data/*` or run
SQL directly once the backend is live.

## Connections

| Env var | Supabase source | Used by |
| --- | --- | --- |
| `DATABASE_URL` | Transaction pooler, port 6543 | Next app at runtime (serverless-safe; no prepared statements) |
| `DIRECT_URL` | Direct connection, port 5432 | `npm run db:migrate`, `npm run db:seed` (multi-statement transactions) |

## Commands

```
npm run db:migrate   # apply db/migrations/*.sql in order, once each
npm run db:seed      # upsert missions + guests from lib/data/wedding-data.js
```

Migrations are tracked in `schema_migrations`. Add a new `NNN_name.sql` file to
evolve the schema; never edit an applied migration.

## Schema (001_init.sql)

- **guests** — `name`, `phone`, generated `phone_last4`, `table`, `relation`,
  `hometown`, `claimed_at`, `session_epoch`. `id` is `text`: seed rows keep
  slugs, imported rows get a uuid. `session_epoch` is embedded in the guest
  cookie; an admin "reset claim" bumps it to invalidate outstanding cookies.
- **missions** — the card-deck content. `kicker`, `title`, `note`, `points`,
  `kind` (`photo`|`text`), `color` (checked set), `sort_order`, `active`.
  `id` is identity so the backoffice can create missions.
- **submissions** — one guest's answer to one mission. `body` (text answer)
  and/or `media_url` (photo in Supabase Storage), `points` snapshot,
  `status` (`pending`|`approved`|`rejected`), `reviewed_at`.
- **guest_scores** (view) — leaderboard. `points = SUM(points) WHERE status <> 'rejected'`.
- **auth_attempts** — throttles the last-4-digits claim check.
- **guest_progress** — per-guest card position in the deck (UI convenience).

## Guest auth (name claim)

No email/password. During onboarding the guest picks their name, then enters
the **last 4 digits of their phone**, checked against `guests.phone_last4`.
On success a signed cookie (`AUTH_SECRET`) carrying `guest_id` + `session_epoch`
is issued and `claimed_at` is set. Brute-force protection is "light touch": a
small fixed delay per wrong attempt, hard lock on a name after ~20 failures
(`auth_attempts.locked_until`). Guests who can't verify (name not found, no
phone on file) get a **read-only** experience — browse missions, wall, and
leaderboard, but no submissions or points.

The **guest CSV must include a phone column** or those guests can't self-verify.

## Scoring

Points apply the moment a guest submits (`status = 'pending'`). An admin
rejection deducts them (row moves to `rejected`, dropped from the view's sum).
`approved` / `rejected` are **admin-only** states — never returned by any
guest-facing endpoint.

## Wall + moderation

Every submission starts `pending`. The public wall query returns
`status = 'approved'` only. The backoffice lists submissions by status with
checkbox multi-select, plus **"Approve selected"** and **"Approve all pending"**
bulk actions (`UPDATE submissions SET status='approved', reviewed_at=now()
WHERE id = ANY($1)` / `WHERE status='pending'`).

## Upload flow (wall photos)

1. Client asks a Next route for a signed upload URL (Supabase Storage,
   `SUPABASE_WALL_BUCKET`).
2. File uploads directly to the bucket.
3. The returned object URL is submitted with the mission answer.
4. Server validates guest session, mission, file type/size, sets `media_url`
   and the `points` snapshot, inserts `status = 'pending'`.

## Backoffice (admin)

Separate path (`app/(admin)/…`, `app/api/admin/…`), guarded by middleware and
its own session cookie. **Single admin account** from env — `ADMIN_USERNAME` +
`ADMIN_PASSWORD_HASH` (bcrypt); no `admin_users` table. Functions: CSV import
for guests and missions (**upsert, never delete** — match guests on phone then
name+table, missions on id/title; validate → dry-run preview → commit),
submission moderation, reset a guest's claim, manual points adjustment.
