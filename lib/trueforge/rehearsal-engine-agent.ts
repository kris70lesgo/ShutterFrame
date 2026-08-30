import "server-only";

import { getTrueForgeClient } from "@/lib/trueforge/client";
import { NEON_MCP_SERVER_NAME } from "@/lib/database/neon";
import { serverEnv } from "@/lib/env/server";
import { redactUnknown } from "@/lib/rehearsal-engine/redaction";
import { createEvidence } from "@/lib/database/evidence";
import { deepSeekUsageFromMetrics, estimateDeepSeekV4FlashOffPeakUsd } from "@/lib/rehearsal-engine/deepseek-cost";

export const SHUTTERFRAME_REHEARSAL_AGENT_NAME = "shutterframe-rehearsal";

export type EngineEvent = { type: string; toolCallId?: string; toolName?: string; payload: unknown };

function agentManifest() {
  return {
    model: { name: "deepseek/deepseek-v4-flash", params: { temperature: 0, maxTokens: 4096, thinking: { type: "disabled" } } },
    config: { sandbox: { enabled: true, fileDownloads: false }, iterationLimit: 40 },
    mcpServers: [{ name: NEON_MCP_SERVER_NAME, preload: true, enableTools: ["create_branch", "run_sql", "describe_table_schema", "get_database_tables", "delete_branch"], requireApprovalForTools: [] }],
    instructions: "You are ShutterFrame's deterministic rehearsal executor. The run instructions are complete: never call ask_user_question, never request approval, and never wait for user input. Use Neon MCP for every database operation and sandbox.exec only for staging and static inspection of server-provided artifacts. Never clone repositories. Never request, print, read, or expose credentials, connection strings, environment variables, auth headers, API keys, or Git credential files. Never connect the sandbox to a database. Never run database commands in the sandbox. Follow the ordered user instruction exactly and return a compact JSON summary after the tools finish.",
  };
}

export async function ensureShutterFrameRehearsalAgent() {
  const client = getTrueForgeClient(180);
  const agents = (await client.agents.list()).data;
  const existing = agents.find((agent) => agent.name === SHUTTERFRAME_REHEARSAL_AGENT_NAME);
  if (existing) return { agent: (await client.agents.update(existing.id, { manifest: agentManifest() })).data, created: false };
  return { agent: (await client.agents.create({ name: SHUTTERFRAME_REHEARSAL_AGENT_NAME, manifest: agentManifest() })).data, created: true };
}

export async function sessionUsesShutterFrameRehearsalAgent(sessionId: string) {
  const session = (await getTrueForgeClient(30).sessions.get(sessionId)).data;
  return session.agent.type === "reference" && session.agent.name === SHUTTERFRAME_REHEARSAL_AGENT_NAME;
}

export async function createShutterFrameRehearsalSession() {
  return (await getTrueForgeClient(180).sessions.create({ agent: { name: SHUTTERFRAME_REHEARSAL_AGENT_NAME } })).data.id;
}

export async function runRehearsalEngineTurn(input: { sessionId: string; repoOwner: string; repoName: string; commitSha: string; migrationPath: string; migrationSql: string; fingerprint: string; runId: string }) {
  if (!serverEnv.neonProjectId) throw new Error("NEON_PROJECT_ID is required for a rehearsal.");
  const client = getTrueForgeClient(300);
  const rehearsalTurnIds = new Set<string>();
  const runPhase = async (content: string, previousTurnId: "none" | "auto") => {
    const turn = (await client.sessions.createTurn(input.sessionId, { previousTurnId, input: [{ type: "user.message", content }] })).data;
    rehearsalTurnIds.add(turn.id);
    for (let attempt = 0; attempt < 120; attempt += 1) {
      const events = (await client.sessions.listEvents(input.sessionId)).data;
      if (events.some((item) => item.turnId === turn.id && item.event.type === "tool.response_required")) {
        throw new Error("TrueForge requested an approval or user response; the rehearsal engine will not bypass it.");
      }
      const done = events.find((item) => item.turnId === turn.id && item.event.type === "turn.done");
      if (done?.event.type === "turn.done") {
        if (done.event.state.status !== "done") throw new Error(done.event.state.status === "error" ? done.event.state.message : "TrueForge turn was cancelled.");
        const usage = deepSeekUsageFromMetrics(done.event.state.metrics);
        if (usage) await createEvidence({ runId: input.runId, type: "model_usage", name: "deepseek_v4_flash", status: "pass", data: { ...usage, estimatedUsd: estimateDeepSeekV4FlashOffPeakUsd(usage) } });
        return turn.id;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    throw new Error("TrueForge turn timed out before completion.");
  };
  const encodedSql = Buffer.from(input.migrationSql, "utf8").toString("base64");
  const context = `Run ${input.runId}. Neon project: ${serverEnv.neonProjectId}. Repository: ${input.repoOwner}/${input.repoName}. Commit: ${input.commitSha}. Migration: ${input.migrationPath}. Server SHA-256: ${input.fingerprint}.`;
  const phaseOneTurnId = await runPhase([
    context,
    `Phase 1 only. Call Neon create_branch with branchName shutterframe-${input.runId.slice(0, 8)} and short expiry. Then call sandbox.exec to create artifacts/migration.sql from this base64 data, calculate shasum -a 256 artifacts/migration.sql, and compare it to ${input.fingerprint}: ${encodedSql}. Do not clone a repository or inspect environment/credential files. Do not run SQL, validations, or cleanup in this phase.`,
    "End with a compact factual summary containing the branch ID, migration fingerprint, and SQL content needed by the next phase.",
  ].join("\n"), "none");
  let phaseOneEvents = (await client.sessions.listEvents(input.sessionId)).data.filter((item) => item.turnId === phaseOneTurnId);
  const hasVerifiedFingerprint = () => phaseOneEvents.some((item) => item.event.type === "tool.response" && String(item.event.content).includes(input.fingerprint));
  if (!hasVerifiedFingerprint()) {
    await runPhase("Fingerprint remediation only. You MUST call sandbox.exec once and run shasum -a 256 artifacts/migration.sql. Do not call any other tool. Do not explain before calling exec. Return the resulting 64-character SHA-256 only.", "auto");
    phaseOneEvents = (await client.sessions.listEvents(input.sessionId)).data.filter((item) => rehearsalTurnIds.has(item.turnId));
  }
  if (!hasVerifiedFingerprint()) throw new Error("Artifact fingerprint mismatch; migration was not executed.");
  const phaseOneText = phaseOneEvents.map((item) => JSON.stringify(redactUnknown(item.event))).join("\n");
  if (/\bbr-[a-z0-9-]+\b/i.test(phaseOneText)) await createEvidence({ runId: input.runId, type: "check", name: "branch", status: "pass", data: { phase: "artifact_staging" } });
  if (phaseOneEvents.some((item) => item.event.type === "sandbox.created")) await createEvidence({ runId: input.runId, type: "check", name: "sandbox", status: "pass", data: { phase: "artifact_staging" } });
  if (phaseOneText.includes("artifacts/migration.sql")) await createEvidence({ runId: input.runId, type: "check", name: "artifactStage", status: "pass", data: { phase: "artifact_staging" } });
  if (phaseOneText.includes(input.fingerprint)) await createEvidence({ runId: input.runId, type: "check", name: "fingerprintVerification", status: "pass", data: { phase: "artifact_staging" } });
  let successfulLifecycle = false;
  try {
    await runPhase([
      "Phase 2 only. Using the branch ID and exact migration SQL obtained in phase 1, call Neon run_sql to apply the migration against that branch, then call Neon run_sql for SELECT 1 AS smoke_test.",
      "Continue in this same turn with deterministic validation: get_database_tables, describe affected table schemas when identifiable, run_sql querying pg_constraint for invalid/unvalidated foreign-key constraints, and a small row-count observation where identifiable.",
      "Finally, call delete_branch for the disposable branch. Never execute database commands in the sandbox. Return compact JSON stating every check truthfully. Do not stop between these operations or request user input.",
    ].join("\n"), "auto");
    successfulLifecycle = true;
  } finally {
    // A completed phase has already deleted its branch. On any interruption,
    // make one best-effort cleanup turn without adding latency to the happy path.
    if (!successfulLifecycle) {
      try { await runPhase("Cleanup only. If the disposable Neon branch from this run still exists, call delete_branch now. Do not call any other tool.", "auto"); } catch { /* never replace the root failure */ }
    }
  }
  const persistedEvents = (await client.sessions.listEvents(input.sessionId)).data.filter((item) => rehearsalTurnIds.has(item.turnId));
  const persistedToolNames = new Map<string, string>();
  const persisted: EngineEvent[] = [];
  for (const item of persistedEvents.reverse()) {
    const event = item.event;
    if (event.type === "turn.done") persisted.push({ type: event.type, payload: redactUnknown({ status: event.state.status, metrics: event.state.metrics }) });
    if (event.type === "sandbox.created") persisted.push({ type: event.type, toolName: "sandbox.create", payload: redactUnknown(event) });
    if (event.type === "model.message") {
      for (const call of event.toolCalls ?? []) {
        if (!call.id || !call.function?.name) continue;
        persistedToolNames.set(call.id, call.function.name);
        persisted.push({ type: "tool.call", toolCallId: call.id, toolName: call.function.name, payload: redactUnknown({ arguments: call.function.arguments }) });
      }
      if (event.content) persisted.push({ type: "model.message", payload: redactUnknown(event.content) });
    }
    if (event.type === "tool.response") persisted.push({ type: event.type, toolCallId: event.toolCallId, toolName: persistedToolNames.get(event.toolCallId), payload: redactUnknown(event.content) });
  }
  return persisted;
}
