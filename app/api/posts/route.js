import { createWallPost, getWallPosts } from "@/lib/server/wedding-repository";

export async function GET() {
  const posts = await getWallPosts();
  return Response.json({ posts });
}

export async function POST(request) {
  const body = await request.json();
  const required = ["name", "table", "mission", "body", "points"];
  const missing = required.filter((field) => body[field] === undefined || body[field] === "");

  if (missing.length) {
    return Response.json(
      { error: "Missing required fields", fields: missing },
      { status: 400 },
    );
  }

  const post = await createWallPost(body);
  return Response.json({ post }, { status: 201 });
}
