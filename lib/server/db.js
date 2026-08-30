import "server-only";
import postgres from "postgres";

// Lazy singleton. The client is created on first query, never at import time,
// so `next build` (which loads route modules to read their config) does not
// need DATABASE_URL — only the running server does.
const globalForDb = globalThis;

function makeClient() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Configure it in the Vercel project settings " +
        "(or .env.local for local dev).",
    );
  }

  const isPooler =
    /pooler\.supabase\.com/.test(url) || /[:.]6543(\/|\?|$)/.test(url);
  const isLocal = /@(localhost|127\.0\.0\.1|\[::1\])[:/]/.test(url);

  return postgres(url, {
    ssl: isLocal || /sslmode=disable/.test(url) ? false : "require",
    // The Supabase transaction pooler cannot use prepared statements.
    prepare: !isPooler,
  });
}

function getClient() {
  if (!globalForDb.__weddingSql) {
    globalForDb.__weddingSql = makeClient();
  }
  return globalForDb.__weddingSql;
}

// Proxy so callers keep using `sql\`...\``, `sql.begin(...)`, `sql.unsafe(...)`
// unchanged, while the real connection is deferred until the first call.
export const sql = new Proxy(function () {}, {
  apply(_target, _thisArg, args) {
    return getClient()(...args);
  },
  get(_target, prop) {
    const client = getClient();
    const value = client[prop];
    return typeof value === "function" ? value.bind(client) : value;
  },
});
