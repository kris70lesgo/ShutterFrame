import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { createQueuedRehearsal } from "@/lib/database/rehearsals";
import { GitHubRequestError, InvalidPullRequestReferenceError, fetchPullRequestIntake, validatePullRequestIntakeRequest } from "@/lib/github/intake";

function requestHasValidToken(request: Request) {
  const expected = process.env.SHUTTERFRAME_INTAKE_TOKEN;
  const authorization = request.headers.get("authorization");
  const supplied = authorization?.startsWith("Bearer ") ? authorization.slice("Bearer ".length) : "";
  if (!expected) return null;
  const expectedBuffer = Buffer.from(expected);
  const suppliedBuffer = Buffer.from(supplied);
  return expectedBuffer.length === suppliedBuffer.length && timingSafeEqual(expectedBuffer, suppliedBuffer);
}

export async function POST(request: Request) {
  const authorized = requestHasValidToken(request);
  if (authorized === null) return NextResponse.json({ error: "Intake endpoint is not configured." }, { status: 503 });
  if (!authorized) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  let intakeRequest;
  try {
    intakeRequest = validatePullRequestIntakeRequest(await request.json());
  } catch (error) {
    if (error instanceof InvalidPullRequestReferenceError || error instanceof SyntaxError) {
      return NextResponse.json({ error: "owner, repo, and prNumber must be valid." }, { status: 400 });
    }
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  let intake;
  try {
    intake = await fetchPullRequestIntake(intakeRequest);
  } catch (error) {
    if (error instanceof GitHubRequestError) {
      return NextResponse.json({ error: "GitHub pull request intake failed." }, { status: 502 });
    }
    return NextResponse.json({ error: "Intake service is not configured." }, { status: 500 });
  }

  try {
    const rehearsal = await createQueuedRehearsal({ repoOwner: intake.owner, repoName: intake.repo, prNumber: intake.prNumber, commitSha: intake.commitSha, migrationPath: intake.migrationFiles[0] ?? null });
    return NextResponse.json({ rehearsal, pullRequest: { owner: intake.owner, repo: intake.repo, number: intake.prNumber, title: intake.title, author: intake.author, commitSha: intake.commitSha, baseBranch: intake.baseBranch, changedFiles: intake.changedFiles, migrationFiles: intake.migrationFiles } }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to create rehearsal." }, { status: 500 });
  }
}
