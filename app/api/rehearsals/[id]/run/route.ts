import { NextResponse } from "next/server";

import { runRehearsalEngine } from "@/lib/rehearsal-engine";

export async function POST(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    return NextResponse.json(await runRehearsalEngine(id), { status: 202 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to start rehearsal.";
    const status = /already active/.test(message) ? 409 : /not found|required/.test(message) ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
