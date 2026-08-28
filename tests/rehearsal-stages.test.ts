import { describe, expect, it } from "vitest";
import { mapRehearsalStages } from "@/lib/rehearsal-engine/stages";

describe("live rehearsal progress", () => {
  it("maps persisted engine evidence to completed stages", () => {
    const stages = mapRehearsalStages("completed", [
      { id: "1", runId: "run", type: "commit_sha", name: "commit_sha", status: "success", data: null },
      { id: "2", runId: "run", type: "migration", name: "migration", status: "success", data: null },
      { id: "3", runId: "run", type: "cleanup", name: "cleanup", status: "success", data: null },
    ]);
    expect(stages.find((stage) => stage.key === "pr")?.state).toBe("completed");
    expect(stages.find((stage) => stage.key === "migration")?.state).toBe("completed");
    expect(stages.find((stage) => stage.key === "cleanup")?.state).toBe("completed");
  });

  it("does not display a completion state for blocked work", () => {
    const stages = mapRehearsalStages("blocked", []);
    expect(stages.some((stage) => stage.state === "completed")).toBe(false);
    expect(stages[0]?.state).toBe("blocked");
  });
});
