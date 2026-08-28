import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { neon } from "@neondatabase/serverless";
import { fetchPullRequestIntake } from "@/lib/github/intake";

const envFile = resolve(process.cwd(), ".env.local");
if (existsSync(envFile)) for (const line of readFileSync(envFile, "utf8").split(/\r?\n/)) {
  const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (match && process.env[match[1]] === undefined) process.env[match[1]] = match[2];
}

async function verify() {
const owner = process.env.GITHUB_OWNER;
const repo = process.env.GITHUB_REPO;
const suppliedPrNumber = process.argv[2] ?? process.env.GITHUB_INTAKE_PR_NUMBER;
const prNumber = Number(suppliedPrNumber);
let rehearsalId: string | undefined;
try {
  if (!owner || !repo || !process.env.DATABASE_URL || !Number.isSafeInteger(prNumber) || prNumber < 1) throw new Error("Verification is not configured.");
  const sql = neon(process.env.DATABASE_URL);
  const intake = await fetchPullRequestIntake({ owner, repo, prNumber });
  console.log("GITHUB_PR_FETCH: success");
  console.log("COMMIT_SHA: detected");
  console.log("CHANGED_FILES: detected");
  console.log(`MIGRATION_FILES: ${intake.migrationFiles.length > 0 ? "detected" : "none"}`);
  const [rehearsal] = await sql`INSERT INTO rehearsals (repo_owner, repo_name, pr_number, commit_sha, migration_path, status) VALUES (${intake.owner}, ${intake.repo}, ${intake.prNumber}, ${intake.commitSha}, ${intake.migrationFiles[0] ?? null}, ${"queued"}) RETURNING id, status`;
  rehearsalId = rehearsal.id;
  console.log("DATABASE_INSERT: success");
  const [stored] = await sql`SELECT id, status FROM rehearsals WHERE id = ${rehearsalId}`;
  if (!stored || stored.id !== rehearsalId || stored.status !== "queued") throw new Error("Queued rehearsal was not read back.");
  console.log("DATABASE_READ: success");
  await sql`DELETE FROM rehearsals WHERE id = ${rehearsalId}`;
  rehearsalId = undefined;
  console.log("DATABASE_DELETE: success");
  console.log("GITHUB_INTAKE_OK");
} catch {
  if (rehearsalId && process.env.DATABASE_URL) try { await neon(process.env.DATABASE_URL)`DELETE FROM rehearsals WHERE id = ${rehearsalId}`; } catch { /* Best-effort cleanup without leaking details. */ }
  console.error("GITHUB_INTAKE_FAILED");
  process.exitCode = 1;
}
}

void verify();
