import { getLeaderboard } from "@/lib/server/wedding-repository";

export const dynamic = "force-dynamic";

export async function GET() {
  const leaders = await getLeaderboard();
  return Response.json({ leaders });
}
