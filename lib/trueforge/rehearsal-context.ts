import type { RehearsalSessionContext } from "@/lib/trueforge/types";

export const TRUEFORGE_REHEARSAL_RESPONSE = "SHUTTERFRAME_REHEARSAL_OK";

export function buildRehearsalContextPrompt(rehearsal: RehearsalSessionContext) {
  return [
    "Rehearsal context:",
    `repo owner: ${rehearsal.repoOwner}`,
    `repo name: ${rehearsal.repoName}`,
    `PR number: ${rehearsal.prNumber}`,
    `commit SHA: ${rehearsal.commitSha}`,
    `migration path: ${rehearsal.migrationPath ?? "none"}`,
    `Reply with exactly: ${TRUEFORGE_REHEARSAL_RESPONSE}`,
  ].join("\n");
}
