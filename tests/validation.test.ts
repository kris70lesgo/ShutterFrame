import { describe, expect, it } from "vitest";
import { allChecksPassed } from "@/lib/validation";

describe("validation evidence", () => {
  it("requires at least one passing deterministic check", () => {
    expect(allChecksPassed([])).toBe(false);
    expect(allChecksPassed([{ check: "migration-executed", passed: true, detail: "Applied" }])).toBe(true);
  });
});
