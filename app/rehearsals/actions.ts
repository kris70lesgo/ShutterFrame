"use server";

import { redirect } from "next/navigation";
import { createQueuedRehearsal } from "@/lib/database/rehearsals";
import { fetchPullRequestIntake, InvalidPullRequestReferenceError, validatePullRequestIntakeRequest } from "@/lib/github/intake";
import { startRehearsalEngine } from "@/lib/rehearsal-engine";

export type IntakeFormState = { error?: string };

export async function createRehearsalAction(_: IntakeFormState, formData: FormData): Promise<IntakeFormState> {
  let rehearsalId: string;
  try {
    const request = validatePullRequestIntakeRequest({ owner: formData.get("owner"), repo: formData.get("repo"), prNumber: Number(formData.get("prNumber")) });
    const intake = await fetchPullRequestIntake(request);
    const migrationPath = intake.migrationFiles[0];
    if (!migrationPath) return { error: "No .sql file was found in this pull request, so there is no migration to rehearse." };
    const rehearsal = await createQueuedRehearsal({ repoOwner: intake.owner, repoName: intake.repo, prNumber: intake.prNumber, commitSha: intake.commitSha, migrationPath });
    rehearsalId = rehearsal.id;
    await startRehearsalEngine(rehearsalId);
  } catch (error) {
    if (error instanceof InvalidPullRequestReferenceError) return { error: "Use a valid GitHub owner, repository, and pull-request number." };
    return { error: "The pull request could not be added. Check the number and try again." };
  }
  redirect(`/rehearsals/${rehearsalId}`);
}
