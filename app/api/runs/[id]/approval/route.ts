import { NextResponse } from "next/server";
import { createApproval, getApprovalForRun, type ApprovalDecision } from "@/lib/database/approvals";
import { getRun } from "@/lib/database/runs";
import { getRehearsal } from "@/lib/database/rehearsals";
import { canReviewRun } from "@/lib/approvals/policy";

const validDecisions = new Set<ApprovalDecision>(["approved", "rejected"]);

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let payload: { decision?: string; notes?: string };
  try { payload = await request.json(); } catch { return NextResponse.json({ error: "Invalid request body." }, { status: 400 }); }
  if (!validDecisions.has(payload.decision as ApprovalDecision)) return NextResponse.json({ error: "A valid decision is required." }, { status: 400 });
  if (typeof payload.notes !== "undefined" && (typeof payload.notes !== "string" || payload.notes.length > 1000)) return NextResponse.json({ error: "Notes must be at most 1000 characters." }, { status: 400 });

  const run = await getRun(id);
  if (!run) return NextResponse.json({ error: "Run not found." }, { status: 404 });
  const rehearsal = await getRehearsal(run.rehearsalId);
  if (!rehearsal) return NextResponse.json({ error: "Rehearsal not found." }, { status: 404 });
  const existing = await getApprovalForRun(id);
  if (!canReviewRun(run.status, Boolean(existing))) {
    if (existing) return NextResponse.json({ approval: existing, existing: true }, { status: 200 });
    return NextResponse.json({ error: "Only completed runs can be reviewed." }, { status: 409 });
  }

  const approval = await createApproval({ runId: id, decision: payload.decision as ApprovalDecision, actor: "demo-reviewer", commitSha: rehearsal.commitSha, notes: payload.notes?.trim() || null });
  if (!approval) return NextResponse.json({ error: "This run was already reviewed." }, { status: 409 });
  return NextResponse.json({ approval }, { status: 201 });
}
