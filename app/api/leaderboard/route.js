import { getLeaderboard } from "@/lib/server/wedding-repository";

export async function GET() {
  const leaders = await getLeaderboard();
  return Response.json({ leaders });
}
