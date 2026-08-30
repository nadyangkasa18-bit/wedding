import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const dynamic = "force-dynamic";

// Serves docs/openapi.yaml so the Swagger UI page (/api-docs.html) has a
// same-origin URL to load. The YAML file stays the single source of truth.
export async function GET() {
  const spec = await readFile(join(process.cwd(), "docs", "openapi.yaml"), "utf8");
  return new Response(spec, {
    headers: { "Content-Type": "application/yaml; charset=utf-8" },
  });
}
