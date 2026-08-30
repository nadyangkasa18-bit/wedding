import {
  getGuestById,
  getGuestProgress,
  getGuestScore,
} from "@/lib/server/wedding-repository";

export const dynamic = "force-dynamic";

// Viewer bootstrap: guest record + current score + deck position.
export async function GET(_request, { params }) {
  const { id } = await params;

  const guest = await getGuestById(id);
  if (!guest) {
    return Response.json({ error: "Guest not found" }, { status: 404 });
  }

  const [score, progress] = await Promise.all([
    getGuestScore(id),
    getGuestProgress(id),
  ]);

  return Response.json({ guest, score, progress });
}
