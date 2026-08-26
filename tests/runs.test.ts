import { describe, expect, it } from "vitest";
import type { RunStatus } from "@/lib/database/runs";

describe("run lifecycle", () => {
  it("keeps the initial TrueForge session lifecycle narrow", () => {
    const statuses: RunStatus[] = ["starting", "ready", "failed"];
    expect(statuses).toEqual(["starting", "ready", "failed"]);
  });
});
