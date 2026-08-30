import { getWallPosts } from "@/lib/server/wedding-repository";

export const dynamic = "force-dynamic";

// The wall shows approved submissions only. Creating one is POST /api/submissions.
export async function GET() {
  const posts = await getWallPosts();
  return Response.json({ posts });
}
