import {
  createSubmission,
  getGuestScore,
  RepositoryError,
} from "@/lib/server/wedding-repository";

export const dynamic = "force-dynamic";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    // TODO(step 3): derive guestId from the signed session cookie, not the body.
    const guestId = body.guestId;

    const submission = await createSubmission({
      guestId,
      missionId: body.missionId,
      body: typeof body.body === "string" && body.body.trim() ? body.body.trim() : null,
      mediaUrl: body.mediaUrl || null,
      mediaType: body.mediaType || null,
    });

    const score = await getGuestScore(guestId);
    return Response.json({ submission, score }, { status: 201 });
  } catch (err) {
    if (err instanceof RepositoryError) {
      return Response.json({ error: err.message }, { status: err.status });
    }
    console.error("createSubmission failed", err);
    return Response.json({ error: "Could not save submission" }, { status: 500 });
  }
}
