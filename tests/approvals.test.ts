import { describe, expect, it } from "vitest";
import { canReviewRun } from "@/lib/approvals/policy";

describe("approval policy", () => {
  it("allows one decision for a completed rehearsal", () => expect(canReviewRun("completed", false)).toBe(true));
  it("does not allow a blocked rehearsal to be approved", () => expect(canReviewRun("blocked", false)).toBe(false));
  it("does not allow a second decision", () => expect(canReviewRun("completed", true)).toBe(false));
});
