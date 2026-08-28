import { describe, expect, it } from "vitest";
import { TRUEFORGE_REHEARSAL_RESPONSE, buildRehearsalContextPrompt } from "@/lib/trueforge/rehearsal-context";

describe("TrueForge rehearsal context", () => {
  it("includes only the permitted rehearsal metadata and the deterministic response instruction", () => {
    const prompt = buildRehearsalContextPrompt({ repoOwner: "acme", repoName: "shutterframe", prNumber: 1287, commitSha: "abc123", migrationPath: "migrations/001.sql" });
    expect(prompt).toBe(["Rehearsal context:", "repo owner: acme", "repo name: shutterframe", "PR number: 1287", "commit SHA: abc123", "migration path: migrations/001.sql", `Reply with exactly: ${TRUEFORGE_REHEARSAL_RESPONSE}`].join("\n"));
  });
});
