import { NextResponse } from "next/server";

import { runRehearsalEngine, startRehearsalEngine } from "@/lib/rehearsal-engine";

function isAllowedRequest(request: Request) {
  const expected = process.env.SHUTTERFRAME_RUN_TOKEN;
  if (expected && request.headers.get("x-shutterframe-run-token") === expected) return true;
  const origin = request.headers.get("origin");
  if (!origin) return true;
  return origin === new URL(request.url).origin;
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!isAllowedRequest(request)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const { id } = await context.params;
  try {
    if (request.headers.get("x-shutterframe-run-token")) {
      const result = await runRehearsalEngine(id);
      return NextResponse.json({ runId: result.runId, outcome: result.outcome }, { status: 202 });
    }
    const runId = await startRehearsalEngine(id);
    return NextResponse.json({ runId }, { status: 202 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to start rehearsal.";
    const status = /already active/.test(message) ? 409 : /not found|required/.test(message) ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
