import { describe, expect, it } from "vitest";
import { countSqlStatements, isPostgresMigration } from "@/lib/migrations/parse";

describe("migration parsing", () => {
  it("accepts root-level SQL migration files", () => {
    expect(isPostgresMigration("002_safe_migration.sql")).toBe(true);
    expect(isPostgresMigration("nested/002_safe_migration.sql")).toBe(false);
    expect(isPostgresMigration("migration.ts")).toBe(false);
  });

  it("counts executable SQL statements without line comments", () => {
    expect(countSqlStatements("-- a note\nBEGIN;\nALTER TABLE accounts ADD COLUMN name text;\nCOMMIT;")).toBe(3);
  });
});
