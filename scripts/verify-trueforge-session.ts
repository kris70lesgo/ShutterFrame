import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { createQueuedRehearsal, deleteRehearsal, getRehearsal } from "@/lib/database/rehearsals";
import { deleteRun, getRun } from "@/lib/database/runs";
import { createTrueForgeRehearsalSession } from "@/lib/trueforge/rehearsal-session";
import { deleteRehearsalSession } from "@/lib/trueforge/sessions";
import { TRUEFORGE_REHEARSAL_RESPONSE } from "@/lib/trueforge/rehearsal-context";

const envFile = resolve(process.cwd(), ".env.local");
if (existsSync(envFile)) for (const line of readFileSync(envFile, "utf8").split(/\r?\n/)) {
  const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (match && process.env[match[1]] === undefined) process.env[match[1]] = match[2];
}

async function verify() {
  let rehearsalId: string | undefined;
  let runId: string | undefined;
  let sessionId: string | undefined;

  try {
    if (!process.env.DATABASE_URL) throw new Error("Verification is not configured.");

    const rehearsal = await createQueuedRehearsal({
      repoOwner: "shutterframe-verification",
      repoName: "trueforge-session",
      prNumber: 1,
      commitSha: randomUUID(),
      migrationPath: "migrations/verification.sql",
    });
    rehearsalId = rehearsal.id;

    const loadedRehearsal = await getRehearsal(rehearsalId);
    if (!loadedRehearsal) throw new Error("Verification rehearsal was not read back.");
    console.log("REHEARSAL_LOAD: success");

    const result = await createTrueForgeRehearsalSession(rehearsalId);
    runId = result.run.id;
    sessionId = result.session.sessionId;
    console.log("RUN_CREATE: success");
    console.log("TRUEFORGE_SESSION: success");

    if (result.session.response !== TRUEFORGE_REHEARSAL_RESPONSE) throw new Error("Expected DeepSeek response was not received through TrueForge.");
    console.log("DEEPSEEK_THROUGH_TRUEFORGE: success");

    if (result.run.status !== "ready" || result.run.trueforgeSessionId !== sessionId) throw new Error("TrueForge session ID was not persisted.");
    console.log("SESSION_ID_PERSISTED: success");

    const storedRun = await getRun(runId);
    if (!storedRun || storedRun.status !== "ready" || storedRun.trueforgeSessionId !== sessionId) throw new Error("Run was not read back.");
    console.log("RUN_READ: success");

    await deleteRehearsalSession(sessionId);
    await deleteRun(runId);
    runId = undefined;
    await deleteRehearsal(rehearsalId);
    rehearsalId = undefined;
    console.log("CLEANUP: success");
    console.log("TRUEFORGE_REHEARSAL_OK");
  } catch {
    if (sessionId) try { await deleteRehearsalSession(sessionId); } catch { /* Best-effort remote cleanup without leaking details. */ }
    if (runId) try { await deleteRun(runId); } catch { /* Best-effort database cleanup without leaking details. */ }
    if (rehearsalId) try { await deleteRehearsal(rehearsalId); } catch { /* Best-effort database cleanup without leaking details. */ }
    console.error("TRUEFORGE_REHEARSAL_FAILED");
    process.exitCode = 1;
  }
}

void verify();
