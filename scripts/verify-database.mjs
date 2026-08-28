import { randomUUID } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { neon } from "@neondatabase/serverless";

const envFile = resolve(process.cwd(), ".env.local");
if (existsSync(envFile)) for (const line of readFileSync(envFile, "utf8").split(/\r?\n/)) {
  const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (match && process.env[match[1]] === undefined) process.env[match[1]] = match[2];
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) { console.error("DATABASE_CONNECTION_FAILED"); process.exit(1); }

const sql = neon(databaseUrl);
try {
  const rehearsalId = randomUUID();
  const [, insertedRows, readRows, deletedRows] = await sql.transaction([
    sql`CREATE TEMP TABLE rehearsals (id uuid PRIMARY KEY, status text NOT NULL) ON COMMIT DROP`,
    sql`INSERT INTO rehearsals (id, status) VALUES (${rehearsalId}, ${"verification"}) RETURNING id, status`,
    sql`SELECT id, status FROM rehearsals WHERE id = ${rehearsalId}`,
    sql`DELETE FROM rehearsals WHERE id = ${rehearsalId} RETURNING id`,
  ]);
  const [inserted] = insertedRows;
  const [read] = readRows;
  if (!read || read.id !== rehearsalId || read.status !== "verification") throw new Error("Verification row was not read back.");
  if (deletedRows.length !== 1 || inserted.id !== rehearsalId) throw new Error("Verification row was not deleted.");
  console.log("INSERT: success");
  console.log("READ: success");
  console.log(`ROW: ${read.id} ${read.status}`);
  console.log("DELETE: success");
  console.log("DATABASE_CONNECTION_OK");
} catch {
  console.error("DATABASE_CONNECTION_FAILED");
  process.exitCode = 1;
}
