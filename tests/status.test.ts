import { describe, expect, it } from "vitest";
import { canTransition } from "@/lib/migrations/status";

describe("rehearsal status transitions", () => {
  it("requires validation before approval", () => {
    expect(canTransition("executing", "awaiting-approval")).toBe(false);
    expect(canTransition("validating", "awaiting-approval")).toBe(true);
  });

  it("does not permit cleanup to restart a run", () => {
    expect(canTransition("cleaned-up", "queued")).toBe(false);
  });
});
