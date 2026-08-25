import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { neon } from "@neondatabase/serverless";
import { TrueForge } from "@truefoundry/trueforge-sdk";
import { TRUEFORGE_REHEARSAL_RESPONSE } from "@/lib/trueforge/rehearsal-context";
import { startRehearsalSessionWithClient } from "@/lib/trueforge/session-client";

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
    if (!process.env.DATABASE_URL || !process.env.TRUEFORGE_BASE_URL) throw new Error("Verification is not configured.");

    const sql = neon(process.env.DATABASE_URL);
    const [rehearsal] = await sql`INSERT INTO rehearsals (repo_owner, repo_name, pr_number, commit_sha, migration_path, status) VALUES (${"shutterframe-verification"}, ${"trueforge-session"}, ${1}, ${randomUUID()}, ${"migrations/verification.sql"}, ${"queued"}) RETURNING id`;
    rehearsalId = rehearsal.id;

    const [loadedRehearsal] = await sql`SELECT id, repo_owner AS "repoOwner", repo_name AS "repoName", pr_number AS "prNumber", commit_sha AS "commitSha", migration_path AS "migrationPath" FROM rehearsals WHERE id = ${rehearsalId}`;
    if (!loadedRehearsal) throw new Error("Verification rehearsal was not read back.");
    console.log("REHEARSAL_LOAD: success");

    const [run] = await sql`INSERT INTO runs (rehearsal_id, status, started_at) VALUES (${rehearsalId}, ${"starting"}, now()) RETURNING id`;
    runId = run.id;
    console.log("RUN_CREATE: success");

    const client = new TrueForge({ baseUrl: process.env.TRUEFORGE_BASE_URL, auth: false, timeoutInSeconds: 60, maxRetries: 0 });
    const session = await startRehearsalSessionWithClient(client, {
      rehearsal: {
        repoOwner: loadedRehearsal.repoOwner,
        repoName: loadedRehearsal.repoName,
        prNumber: loadedRehearsal.prNumber,
        commitSha: loadedRehearsal.commitSha,
        migrationPath: loadedRehearsal.migrationPath,
      },
    });
    sessionId = session.sessionId;
    console.log("TRUEFORGE_SESSION: success");

    if (session.response !== TRUEFORGE_REHEARSAL_RESPONSE) throw new Error("Expected Groq response was not received through TrueForge.");
    console.log("GROQ_THROUGH_TRUEFORGE: success");

    const [readyRun] = await sql`UPDATE runs SET trueforge_session_id = ${sessionId}, status = ${"ready"} WHERE id = ${runId} RETURNING id, status, trueforge_session_id AS "trueforgeSessionId"`;
    if (!readyRun || readyRun.status !== "ready" || readyRun.trueforgeSessionId !== sessionId) throw new Error("TrueForge session ID was not persisted.");
    console.log("SESSION_ID_PERSISTED: success");

    const [storedRun] = await sql`SELECT id, status, trueforge_session_id AS "trueforgeSessionId" FROM runs WHERE id = ${runId}`;
    if (!storedRun || storedRun.status !== "ready" || storedRun.trueforgeSessionId !== sessionId) throw new Error("Run was not read back.");
    console.log("RUN_READ: success");

    await client.sessions.delete(sessionId);
    await sql`DELETE FROM runs WHERE id = ${runId}`;
    runId = undefined;
    await sql`DELETE FROM rehearsals WHERE id = ${rehearsalId}`;
    rehearsalId = undefined;
    console.log("CLEANUP: success");
    console.log("TRUEFORGE_REHEARSAL_OK");
  } catch {
    const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : undefined;
    const client = process.env.TRUEFORGE_BASE_URL ? new TrueForge({ baseUrl: process.env.TRUEFORGE_BASE_URL, auth: false, timeoutInSeconds: 60, maxRetries: 0 }) : undefined;
    if (sessionId && client) try { await client.sessions.delete(sessionId); } catch { /* Best-effort remote cleanup without leaking details. */ }
    if (runId && sql) try { await sql`DELETE FROM runs WHERE id = ${runId}`; } catch { /* Best-effort database cleanup without leaking details. */ }
    if (rehearsalId && sql) try { await sql`DELETE FROM rehearsals WHERE id = ${rehearsalId}`; } catch { /* Best-effort database cleanup without leaking details. */ }
    console.error("TRUEFORGE_REHEARSAL_FAILED");
    process.exitCode = 1;
  }
}

void verify();
