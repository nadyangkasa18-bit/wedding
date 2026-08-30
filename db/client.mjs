// Standalone postgres client for CLI scripts (migrate / seed).
// The Next app uses lib/server/db.js instead; this file must stay
// importable from plain `node` with no "server-only" guard.
//
// Scripts prefer DIRECT_URL (Supabase direct connection, port 5432) because
// migrations run multi-statement transactions that the transaction-mode
// pooler does not support. Falls back to DATABASE_URL for a plain local db.
import postgres from "postgres";

// Only the transaction pooler (port 6543) forbids prepared statements.
// The session pooler (5432) and direct connections support them.
export function isTransactionPooler(url) {
  return /[:.]6543(\/|\?|$)/.test(url);
}

export function sslMode(url) {
  if (/sslmode=disable/.test(url)) return false;
  if (/@(localhost|127\.0\.0\.1|\[::1\])[:/]/.test(url)) return false;
  return "require";
}

export function createClient() {
  const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!url) {
    console.error(
      "Set DIRECT_URL (preferred) or DATABASE_URL in .env.local and retry.",
    );
    process.exit(1);
  }

  return postgres(url, {
    ssl: sslMode(url),
    // The Supabase transaction pooler cannot use prepared statements.
    prepare: !isTransactionPooler(url),
    max: 1,
    onnotice: () => {},
  });
}
