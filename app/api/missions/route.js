import { getMissions } from "@/lib/server/wedding-repository";

export const dynamic = "force-dynamic";

export async function GET() {
  const missions = await getMissions();
  return Response.json({ missions });
}
