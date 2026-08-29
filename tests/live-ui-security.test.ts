import { describe, expect, it } from "vitest";
import { redactUnknown } from "@/lib/rehearsal-engine/redaction";

describe("live UI payload safety", () => {
  it("redacts connection strings and token-like values before presentation", () => {
    const safe = redactUnknown({ databaseUrl: "postgresql://user:password@example.test/db", message: "Bearer ghp_abcdefghijklmnopqrstuvwxyz" });
    expect(JSON.stringify(safe)).not.toContain("password@example");
    expect(JSON.stringify(safe)).not.toContain("ghp_abcdefghijklmnopqrstuvwxyz");
  });
});
