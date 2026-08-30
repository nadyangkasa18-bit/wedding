import { saveGuestProgress } from "@/lib/server/wedding-repository";

export const dynamic = "force-dynamic";

export async function PUT(request, { params }) {
  const { id } = await params;

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const missionIndex = Number(body.missionIndex);
  if (!Number.isInteger(missionIndex) || missionIndex < 0) {
    return Response.json(
      { error: "missionIndex must be a non-negative integer" },
      { status: 400 },
    );
  }

  await saveGuestProgress(id, { missionIndex });
  return Response.json({ ok: true });
}
