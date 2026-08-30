import { describe, expect, it } from "vitest";
import { detectMigrationFiles } from "@/lib/github/intake";

describe("GitHub pull request intake", () => {
  it("prefers common migration directories before other SQL files", () => {
    expect(detectMigrationFiles([
      "docs/example.sql",
      "src/query.sql",
      "database/migrations/002_add_index.sql",
      "migrations/001_create_users.sql",
    ])).toEqual([
      "database/migrations/002_add_index.sql",
      "migrations/001_create_users.sql",
      "docs/example.sql",
      "src/query.sql",
    ]);
  });

  it("falls back to safe SQL files outside migration directories for public repo demos", () => {
    expect(detectMigrationFiles([
      "README.md",
      "sql/schema/update_accounts.sql",
      "../secrets.sql",
    ])).toEqual(["sql/schema/update_accounts.sql"]);
  });
});
