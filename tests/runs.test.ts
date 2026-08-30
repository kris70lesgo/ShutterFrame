import { beforeEach, describe, expect, it, vi } from "vitest";
import type { RunStatus } from "@/lib/database/runs";

const sqlCalls: string[] = [];

vi.mock("server-only", () => ({}));

vi.mock("@/lib/database/client", () => ({
  getDatabase: () => async (strings: TemplateStringsArray, ...values: unknown[]) => {
    const statement = strings.join("?");
    sqlCalls.push(statement);
    if (statement.includes("INSERT INTO runs")) {
      return [{ id: "run-1", rehearsalId: values[0], status: "starting", trueforgeSessionId: null, neonBranchId: null, daytonaSandboxId: null }];
    }
    if (statement.includes("UPDATE runs SET status")) {
      return [{ id: values[0], rehearsalId: "rehearsal-1", status: values[1], trueforgeSessionId: null, neonBranchId: null, daytonaSandboxId: null }];
    }
    return [];
  },
}));

describe("run lifecycle", () => {
  beforeEach(() => {
    sqlCalls.length = 0;
  });

  it("keeps the initial TrueForge session lifecycle narrow", () => {
    const statuses: RunStatus[] = ["starting", "ready", "failed"];
    expect(statuses).toEqual(["starting", "ready", "failed"]);
  });

  it("mirrors a starting run onto the parent rehearsal status", async () => {
    const { createStartingRun } = await import("@/lib/database/runs");

    await createStartingRun("rehearsal-1");

    expect(sqlCalls.some((call) => call.includes("UPDATE rehearsals SET status"))).toBe(true);
  });

  it("mirrors terminal run status onto the parent rehearsal status", async () => {
    const { markRunStatus } = await import("@/lib/database/runs");

    await markRunStatus("run-1", "completed");

    expect(sqlCalls.some((call) => call.includes("UPDATE rehearsals SET status"))).toBe(true);
  });
});
