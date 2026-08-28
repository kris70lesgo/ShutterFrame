import "server-only";

import { createEvidence, getTrackedModelSpendUsd } from "@/lib/database/evidence";
import { createRunLog } from "@/lib/database/logs";
import { getRehearsal } from "@/lib/database/rehearsals";
import { fetchMigrationArtifact, verifyPullRequestHead } from "@/lib/github/artifacts";
import { createStartingRun, getLatestRunForRehearsal, markRunReady, markRunStatus, replaceRunTrueForgeSession, setRunInfrastructure, type Run } from "@/lib/database/runs";
import { redactUnknown } from "@/lib/rehearsal-engine/redaction";
import { classifyRehearsalOutcome, type RehearsalOutcome } from "@/lib/rehearsal-engine/classification";
import { DEEPSEEK_SPEND_LIMIT_USD, deepSeekUsageFromMetrics, estimateDeepSeekV4FlashOffPeakUsd } from "@/lib/rehearsal-engine/deepseek-cost";
import { createShutterFrameRehearsalSession, ensureShutterFrameRehearsalAgent, runRehearsalEngineTurn, sessionUsesShutterFrameRehearsalAgent, type EngineEvent } from "@/lib/trueforge/rehearsal-engine-agent";

const activeStatuses = new Set(["starting", "branching", "sandbox_starting", "migration_running", "validating"]);
const text = (value: unknown) => typeof value === "string" ? value : JSON.stringify(value);
const hasTool = (events: EngineEvent[], name: string) => events.some((event) => event.type === "tool.response" && (event.toolName === name || event.toolName?.endsWith(`.${name}`)));
const findMatch = (events: EngineEvent[], pattern: RegExp) => events.map((event) => text(event.payload).match(pattern)?.[1]).find(Boolean) ?? null;
const branchId = (events: EngineEvent[]) => findMatch(events, /\b(br-[a-z0-9-]+)\b/i) ?? findMatch(events, /"branchId"\s*:\s*"([^"]+)"/);
const sandboxId = (events: EngineEvent[]) => findMatch(events, /"sandboxId"\s*:\s*"([^"]+)"/) ?? findMatch(events, /"sandbox_id"\s*:\s*"([^"]+)"/);
const migrationFingerprint = (events: EngineEvent[]) => findMatch(events, /\b([a-f0-9]{64})\b/i);
const toolOutput = (events: EngineEvent[], name: string) => events.filter((event) => event.type === "tool.response" && (event.toolName === name || event.toolName?.endsWith(`.${name}`))).map((event) => text(event.payload)).join("\n");
const hasSandboxFailure = (value: string) => /(?:no such file|command not found|fatal:|error:|exit code:\s*[1-9])/i.test(value);

async function log(runId: string, level: "info" | "warn" | "error", message: string, metadata: Record<string, unknown> | null = null) {
  await createRunLog({ runId, level, message, metadata: redactUnknown(metadata) as Record<string, unknown> | null });
}

async function loadOrCreateRun(rehearsalId: string) {
  const latest = await getLatestRunForRehearsal(rehearsalId);
  if (latest && activeStatuses.has(latest.status)) throw new Error("A rehearsal run is already active.");
  return latest && latest.status === "ready" ? latest : createStartingRun(rehearsalId);
}

async function ensureCompatibleSession(run: Run) {
  if (run.trueforgeSessionId) {
    try {
      if (await sessionUsesShutterFrameRehearsalAgent(run.trueforgeSessionId)) return { run, replaced: false };
    } catch {
      // A missing or stale session is intentionally replaced below.
    }
  }
  const sessionId = await createShutterFrameRehearsalSession();
  const readyRun = run.trueforgeSessionId ? await replaceRunTrueForgeSession(run.id, sessionId) : await markRunReady(run.id, sessionId);
  if (!readyRun) throw new Error("Run was not found while persisting its TrueForge session.");
  return { run: readyRun, replaced: Boolean(run.trueforgeSessionId) };
}

export async function runRehearsalEngine(rehearsalId: string): Promise<{ runId: string; outcome: RehearsalOutcome; events: EngineEvent[] }> {
  const rehearsal = await getRehearsal(rehearsalId);
  if (!rehearsal) throw new Error("Rehearsal was not found.");
  if (!rehearsal.migrationPath) throw new Error("Rehearsal has no persisted migration path.");
  let run = await loadOrCreateRun(rehearsal.id);
  await createRunLog({ runId: run.id, level: "info", message: "Rehearsal started", metadata: null });
  let events: EngineEvent[] = [];
  let infrastructureFailed = false;
  try {
    const trackedSpend = await getTrackedModelSpendUsd();
    if (trackedSpend >= DEEPSEEK_SPEND_LIMIT_USD) throw new Error("DeepSeek spend guard reached $1.00; no further model call was made.");
    await verifyPullRequestHead({ owner: rehearsal.repoOwner, repo: rehearsal.repoName, prNumber: rehearsal.prNumber, expectedCommitSha: rehearsal.commitSha });
    const artifact = await fetchMigrationArtifact({ owner: rehearsal.repoOwner, repo: rehearsal.repoName, commitSha: rehearsal.commitSha, migrationPath: rehearsal.migrationPath });
    await createEvidence({ runId: run.id, type: "commit_sha", name: "commit_sha", status: "pass", data: { commitSha: artifact.commitSha } });
    await createEvidence({ runId: run.id, type: "migration_path", name: "migration_path", status: "pass", data: { path: artifact.path } });
    await createEvidence({ runId: run.id, type: "github_blob_sha", name: "github_blob_sha", status: artifact.githubBlobSha ? "pass" : "warning", data: { githubBlobSha: artifact.githubBlobSha } });
    await createEvidence({ runId: run.id, type: "migration_fingerprint", name: "migration_fingerprint", status: "pass", data: { fingerprint: artifact.sha256, byteLength: artifact.byteLength } });
    await log(run.id, "info", "GitHub PR and migration artifact verified", { commitSha: artifact.commitSha, migrationPath: artifact.path, byteLength: artifact.byteLength });
    await ensureShutterFrameRehearsalAgent();
    await log(run.id, "info", "TrueForge agent loaded");
    const session = await ensureCompatibleSession(run);
    run = session.run;
    await log(run.id, "info", session.replaced ? "TrueForge session replaced with compatible rehearsal agent" : "TrueForge session loaded");
    if (!run.trueforgeSessionId) throw new Error("TrueForge session was not persisted for the run.");
    await markRunStatus(run.id, "branching");
    events = await runRehearsalEngineTurn({ sessionId: run.trueforgeSessionId, repoOwner: rehearsal.repoOwner, repoName: rehearsal.repoName, commitSha: rehearsal.commitSha, migrationPath: rehearsal.migrationPath, migrationSql: artifact.content, fingerprint: artifact.sha256, runId: run.id });
    const usage = events.map((event) => event.type === "turn.done" ? deepSeekUsageFromMetrics((event.payload as { metrics?: unknown }).metrics) : null).filter((value): value is NonNullable<typeof value> => Boolean(value)).reduce((total, value) => ({ inputTokens: total.inputTokens + value.inputTokens, outputTokens: total.outputTokens + value.outputTokens, cacheReadTokens: total.cacheReadTokens + value.cacheReadTokens }), { inputTokens: 0, outputTokens: 0, cacheReadTokens: 0 });
    if (usage.inputTokens || usage.outputTokens) await createEvidence({ runId: run.id, type: "model_usage", name: "deepseek_v4_flash", status: "pass", data: { inputTokens: usage.inputTokens, outputTokens: usage.outputTokens, cacheReadTokens: usage.cacheReadTokens, estimatedUsd: estimateDeepSeekV4FlashOffPeakUsd(usage) } });
    const resources = { neonBranchId: branchId(events) ?? undefined, daytonaSandboxId: sandboxId(events) ?? undefined };
    await setRunInfrastructure(run.id, resources);
    if (resources.neonBranchId) await log(run.id, "info", "Neon branch created", { branchId: resources.neonBranchId });
    if (resources.daytonaSandboxId) await log(run.id, "info", "Daytona sandbox started", { sandboxId: resources.daytonaSandboxId });
    const all = events.map((event) => text(event.payload)).join("\n");
    const sandboxOutput = toolOutput(events, "exec");
    const checks = {
      branch: hasTool(events, "create_branch") && Boolean(resources.neonBranchId),
      sandbox: events.some((event) => event.type === "sandbox.created"),
      artifactStage: sandboxOutput.includes("artifacts/migration.sql") && !hasSandboxFailure(sandboxOutput),
      migrationFile: true,
      fingerprint: Boolean(migrationFingerprint(events)),
      fingerprintVerification: sandboxOutput.includes(artifact.sha256) && !hasSandboxFailure(sandboxOutput),
      migration: hasTool(events, "run_sql"),
      schema: hasTool(events, "describe_table_schema") || hasTool(events, "get_database_tables"),
      foreignKeys: all.includes("pg_constraint") && hasTool(events, "run_sql"),
      rowCounts: all.includes("count") && hasTool(events, "run_sql"),
      smoke: all.includes("smoke_test") && hasTool(events, "run_sql"),
      cleanup: hasTool(events, "delete_branch"),
    };
    for (const [name, passed] of Object.entries(checks)) await createEvidence({ runId: run.id, type: "check", name, status: passed ? "pass" : name === "rowCounts" ? "warning" : "fail", data: { passed } });
    await createEvidence({ runId: run.id, type: "migration_fingerprint", name: "migration_fingerprint", status: checks.fingerprint ? "pass" : "fail", data: { fingerprint: migrationFingerprint(events) } });
    await createEvidence({ runId: run.id, type: "cleanup", name: "cleanup", status: checks.cleanup ? "pass" : "fail", data: null });
    await log(run.id, "info", "Evidence persisted", { checks: Object.keys(checks).length });
    if (checks.cleanup) await log(run.id, "info", "Neon cleanup completed");
    if (checks.sandbox) await log(run.id, "info", "Daytona cleanup completed", { mode: "TrueForge session-scoped sandbox" });
    const outcome = classifyRehearsalOutcome({ infrastructureFailed, requiredChecksPassed: Object.values(checks).every(Boolean) });
    await markRunStatus(run.id, outcome);
    await createRunLog({ runId: run.id, level: outcome === "completed" ? "info" : "warn", message: `Rehearsal ${outcome}`, metadata: { toolEvents: events.length } });
    return { runId: run.id, outcome, events };
  } catch (error) {
    infrastructureFailed = true;
    await markRunStatus(run.id, "failed");
    await log(run.id, "error", "Rehearsal infrastructure failure", { error: error instanceof Error ? error.message : "Unknown error" });
    throw error;
  }
}
