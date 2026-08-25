import { NextResponse } from "next/server";
import { createQueuedRehearsal } from "@/lib/database/rehearsals";
import { fetchPullRequestIntake } from "@/lib/github/intake";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { owner?: unknown; repo?: unknown; prNumber?: unknown };
    if (typeof body.owner !== "string" || typeof body.repo !== "string" || typeof body.prNumber !== "number") return NextResponse.json({ error: "owner, repo, and prNumber are required." }, { status: 400 });
    const intake = await fetchPullRequestIntake({ owner: body.owner, repo: body.repo, prNumber: body.prNumber });
    const rehearsal = await createQueuedRehearsal({ repoOwner: intake.owner, repoName: intake.repo, prNumber: intake.prNumber, commitSha: intake.commitSha, migrationPath: intake.migrationFiles[0] ?? null });
    return NextResponse.json({ rehearsal, pullRequest: { owner: intake.owner, repo: intake.repo, number: intake.prNumber, title: intake.title, author: intake.author, commitSha: intake.commitSha, baseBranch: intake.baseBranch, changedFiles: intake.changedFiles, migrationFiles: intake.migrationFiles } }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "GitHub pull request intake failed." }, { status: 502 });
  }
}
