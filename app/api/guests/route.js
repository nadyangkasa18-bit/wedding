import { searchGuests } from "@/lib/server/wedding-repository";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const guests = await searchGuests(searchParams.get("q") || "");
  return Response.json({ guests });
}
