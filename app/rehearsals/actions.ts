"use server";

import { redirect } from "next/navigation";
import { createQueuedRehearsal } from "@/lib/database/rehearsals";
import { fetchPullRequestIntake, InvalidPullRequestReferenceError, validatePullRequestIntakeRequest } from "@/lib/github/intake";

export type IntakeFormState = { error?: string };

export async function createRehearsalAction(_: IntakeFormState, formData: FormData): Promise<IntakeFormState> {
  let rehearsalId: string;
  try {
    const request = validatePullRequestIntakeRequest({ owner: formData.get("owner"), repo: formData.get("repo"), prNumber: Number(formData.get("prNumber")) });
    const intake = await fetchPullRequestIntake(request);
    const migrationPath = intake.migrationFiles[0];
    if (!migrationPath) return { error: "No SQL migration was found in this pull request." };
    const rehearsal = await createQueuedRehearsal({ repoOwner: intake.owner, repoName: intake.repo, prNumber: intake.prNumber, commitSha: intake.commitSha, migrationPath });
    rehearsalId = rehearsal.id;
  } catch (error) {
    if (error instanceof InvalidPullRequestReferenceError) return { error: "Use the configured repository and a valid pull-request number." };
    return { error: "The pull request could not be added. Check the number and try again." };
  }
  redirect(`/rehearsals/${rehearsalId}`);
}
