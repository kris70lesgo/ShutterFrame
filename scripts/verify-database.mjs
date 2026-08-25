import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { neon } from "@neondatabase/serverless";

const envFile = resolve(process.cwd(), ".env.local");
if (existsSync(envFile)) for (const line of readFileSync(envFile, "utf8").split(/\r?\n/)) {
  const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) { console.error("DATABASE_CONNECTION_FAILED"); process.exit(1); }

const sql = neon(databaseUrl);
let rehearsalId;
try {
  const [inserted] = await sql`
    INSERT INTO rehearsals (repo_owner, repo_name, pr_number, commit_sha, migration_path, status)
    VALUES (${"shutterframe-verification"}, ${"database-check"}, ${-1}, ${"verification"}, ${null}, ${"verification"})
    RETURNING id, status
  `;
  rehearsalId = inserted.id;
  console.log("INSERT: success");
  const [read] = await sql`SELECT id, status FROM rehearsals WHERE id = ${rehearsalId}`;
  if (!read || read.id !== rehearsalId || read.status !== "verification") throw new Error("Verification row was not read back.");
  console.log("READ: success");
  console.log(`ROW: ${read.id} ${read.status}`);
  await sql`DELETE FROM rehearsals WHERE id = ${rehearsalId}`;
  rehearsalId = undefined;
  console.log("DELETE: success");
  console.log("DATABASE_CONNECTION_OK");
} catch {
  if (rehearsalId) try { await sql`DELETE FROM rehearsals WHERE id = ${rehearsalId}`; } catch { /* Best-effort cleanup without leaking details. */ }
  console.error("DATABASE_CONNECTION_FAILED");
  process.exitCode = 1;
}
