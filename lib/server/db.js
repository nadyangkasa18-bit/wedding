import "server-only";
import postgres from "postgres";

// Single pooled client, reused across hot reloads in dev.
// In production on Vercel this should point at the Supabase transaction
// pooler (port 6543); migrations use DIRECT_URL instead (see db/client.js).
const globalForDb = globalThis;

function makeClient() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Add it to .env.local (see .env.example).",
    );
  }

  const isPooler = /pooler\.supabase\.com/.test(url) || /[:.]6543(\/|\?|$)/.test(url);
  const isLocal = /@(localhost|127\.0\.0\.1|\[::1\])[:/]/.test(url);

  return postgres(url, {
    ssl: isLocal || /sslmode=disable/.test(url) ? false : "require",
    // The Supabase transaction pooler cannot use prepared statements.
    prepare: !isPooler,
  });
}

export const sql = globalForDb.__weddingSql ?? makeClient();

if (process.env.NODE_ENV !== "production") {
  globalForDb.__weddingSql = sql;
}
