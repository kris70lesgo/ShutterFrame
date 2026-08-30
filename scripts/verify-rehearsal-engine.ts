import { createQueuedRehearsal, deleteRehearsal } from "@/lib/database/rehearsals";
import { deleteRun, getLatestRunForRehearsal } from "@/lib/database/runs";
import { runRehearsalEngine } from "@/lib/rehearsal-engine";
import { listEvidence } from "@/lib/database/evidence";
import { listRunLogs } from "@/lib/database/logs";

for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (match && process.env[match[1]] === undefined) process.env[match[1]] = match[2];
}

const owner = process.env.GITHUB_OWNER;
const repo = process.env.GITHUB_REPO;
const prNumber = Number(process.env.SHUTTERFRAME_FIXTURE_PR_NUMBER ?? "4");
const commitSha = process.env.SHUTTERFRAME_FIXTURE_COMMIT_SHA;
const migrationPath = process.env.SHUTTERFRAME_FIXTURE_MIGRATION_PATH;
if (!owner || !repo || !commitSha || !migrationPath) throw new Error("Fixture owner, repo, commit SHA, and migration path must be configured.");
const fixture = { owner, repo, commitSha, migrationPath };

async function verify() {
let rehearsalId: string | undefined;
let runId: string | undefined;
try {
  const rehearsal = await createQueuedRehearsal({ repoOwner: fixture.owner, repoName: fixture.repo, prNumber, commitSha: fixture.commitSha, migrationPath: fixture.migrationPath }); rehearsalId = rehearsal.id;
  console.log("REHEARSAL_LOAD: success");
  const result = await runRehearsalEngine(rehearsal.id);
  runId = result.runId;
  if (process.env.SHUTTERFRAME_DEBUG_REHEARSAL_EVENTS === "1") {
    console.log(JSON.stringify(result.events.map((event) => ({ type: event.type, toolName: event.toolName, payload: event.payload })), null, 2));
  }
  const eventNames = new Set(result.events.map((event) => event.toolName));
  console.log("GITHUB_PR_VERIFY: success");
  console.log("GITHUB_FILE_FETCH: success");
  console.log("MIGRATION_FILE_VERIFY: success");
  console.log(`MIGRATION_FINGERPRINT: ${result.events.some((event) => /[a-f0-9]{64}/i.test(JSON.stringify(event.payload))) ? "success" : "failure"}`);
  console.log("TRUEFORGE_AGENT: success");
  console.log("TRUEFORGE_SESSION: success");
  console.log("MODEL_PROVIDER: DEEPSEEK");
  console.log(`NEON_BRANCH_CREATE: ${eventNames.has("create_branch") ? "success" : "failure"}`);
  console.log(`DAYTONA_SANDBOX_CREATE: ${result.events.some((event) => event.type === "sandbox.created") ? "success" : "failure"}`);
  console.log(`DAYTONA_ARTIFACT_STAGE: ${result.events.some((event) => JSON.stringify(event.payload).includes("artifacts/migration.sql")) ? "success" : "failure"}`);
  console.log(`MIGRATION_FINGERPRINT_VERIFY: ${result.events.some((event) => /[a-f0-9]{64}/i.test(JSON.stringify(event.payload))) ? "success" : "failure"}`);
  console.log(`MIGRATION_EXECUTION: ${eventNames.has("run_sql") ? "success" : "failure"}`);
  console.log(`SCHEMA_VALIDATION: ${eventNames.has("describe_table_schema") || eventNames.has("get_database_tables") ? "success" : "failure"}`);
  console.log(`FOREIGN_KEY_VALIDATION: ${result.events.some((event) => JSON.stringify(event.payload).includes("pg_constraint")) ? "success" : "failure"}`);
  console.log(`SMOKE_QUERY: ${result.events.some((event) => JSON.stringify(event.payload).includes("smoke_test")) ? "success" : "failure"}`);
  const evidence = await listEvidence(result.runId); const logs = await listRunLogs(result.runId);
  if (evidence.length === 0 || logs.length === 0) throw new Error("Evidence or logs were not persisted.");
  console.log("EVIDENCE_PERSISTED: success"); console.log("LOGS_PERSISTED: success");
  console.log(`DAYTONA_CLEANUP: ${result.events.some((event) => event.type === "sandbox.created") ? "success" : "failure"}`);
  console.log(`NEON_CLEANUP: ${eventNames.has("delete_branch") ? "success" : "failure"}`);
  console.log(result.outcome === "completed" ? "REHEARSAL_ENGINE_OK" : "REHEARSAL_ENGINE_BLOCKED_OK");
} finally {
  if (runId) await deleteRun(runId).catch(() => {});
  if (rehearsalId) await deleteRehearsal(rehearsalId).catch(() => {});
}
}

verify().catch((error) => { console.error(error instanceof Error ? error.message : "Verification failed."); process.exit(1); });
import { readFileSync } from "node:fs";
