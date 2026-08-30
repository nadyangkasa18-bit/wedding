import { searchGuests } from "@/lib/server/wedding-repository";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const guests = await searchGuests(searchParams.get("q") || "");
  return Response.json({ guests });
}
