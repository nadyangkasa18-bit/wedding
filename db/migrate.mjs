// Applies db/migrations/*.sql in filename order, once each, inside a
// transaction. Tracks applied files in schema_migrations.
// Connects via DIRECT_URL (falls back to DATABASE_URL) — see db/client.mjs.
//
//   npm run db:migrate
import { readdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "./client.mjs";

const migrationsDir = join(dirname(fileURLToPath(import.meta.url)), "migrations");

const sql = createClient();

try {
  await sql`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename   text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `;

  const files = (await readdir(migrationsDir))
    .filter((name) => name.endsWith(".sql"))
    .sort();

  const applied = new Set(
    (await sql`SELECT filename FROM schema_migrations`).map((row) => row.filename),
  );

  let ran = 0;
  for (const filename of files) {
    if (applied.has(filename)) continue;

    const contents = await readFile(join(migrationsDir, filename), "utf8");
    process.stdout.write(`applying ${filename} ... `);

    await sql.begin(async (tx) => {
      await tx.unsafe(contents);
      await tx`INSERT INTO schema_migrations (filename) VALUES (${filename})`;
    });

    console.log("ok");
    ran += 1;
  }

  console.log(ran === 0 ? "already up to date" : `applied ${ran} migration(s)`);
} finally {
  await sql.end();
}
