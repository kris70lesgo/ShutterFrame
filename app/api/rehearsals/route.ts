import { NextResponse } from "next/server";
import { createQueuedRehearsal } from "@/lib/database/rehearsals";
import { GitHubRequestError, InvalidPullRequestReferenceError, fetchPullRequestIntake, validatePullRequestIntakeRequest } from "@/lib/github/intake";
import { startRehearsalEngine } from "@/lib/rehearsal-engine";

function isAllowedBrowserRequest(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  return origin === new URL(request.url).origin;
}

export async function POST(request: Request) {
  if (!isAllowedBrowserRequest(request)) {
    return NextResponse.json({ error: "Cross-origin rehearsal creation is not allowed." }, { status: 403 });
  }

  let intakeRequest;
  try {
    intakeRequest = validatePullRequestIntakeRequest(await request.json());
  } catch (error) {
    if (error instanceof InvalidPullRequestReferenceError || error instanceof SyntaxError) {
      return NextResponse.json({ error: "Use a valid GitHub owner, repository, and pull-request number." }, { status: 400 });
    }
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  let intake;
  try {
    intake = await fetchPullRequestIntake(intakeRequest);
  } catch (error) {
    if (error instanceof GitHubRequestError) {
      return NextResponse.json({ error: "GitHub pull request intake failed. Check that the repository and PR exist and are accessible." }, { status: 502 });
    }
    return NextResponse.json({ error: "GitHub intake is not configured." }, { status: 500 });
  }

  const migrationPath = intake.migrationFiles[0];
  if (!migrationPath) {
    return NextResponse.json({ error: "No .sql file was found in this pull request, so there is no migration to rehearse." }, { status: 422 });
  }

  try {
    const rehearsal = await createQueuedRehearsal({ repoOwner: intake.owner, repoName: intake.repo, prNumber: intake.prNumber, commitSha: intake.commitSha, migrationPath });
    const runId = await startRehearsalEngine(rehearsal.id);
    return NextResponse.json({ rehearsal, runId, pullRequest: { owner: intake.owner, repo: intake.repo, number: intake.prNumber, title: intake.title, author: intake.author, commitSha: intake.commitSha, baseBranch: intake.baseBranch, changedFiles: intake.changedFiles, migrationFiles: intake.migrationFiles } }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to create or start the rehearsal." }, { status: 500 });
  }
}
