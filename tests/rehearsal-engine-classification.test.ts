import { describe, expect, it } from "vitest";
import { classifyRehearsalOutcome } from "@/lib/rehearsal-engine/classification";
import { redactSensitiveText, redactUnknown } from "@/lib/rehearsal-engine/redaction";
import { estimateDeepSeekV4FlashOffPeakUsd } from "@/lib/rehearsal-engine/deepseek-cost";

describe("rehearsal outcome classification", () => {
  it("makes infrastructure failures fail and required check failures block", () => {
    expect(classifyRehearsalOutcome({ infrastructureFailed: true, requiredChecksPassed: true })).toBe("failed");
    expect(classifyRehearsalOutcome({ infrastructureFailed: false, requiredChecksPassed: false })).toBe("blocked");
    expect(classifyRehearsalOutcome({ infrastructureFailed: false, requiredChecksPassed: true })).toBe("completed");
  });
});

describe("DeepSeek budget accounting", () => {
  it("counts cache reads separately from cache misses", () => {
    expect(estimateDeepSeekV4FlashOffPeakUsd({ inputTokens: 1_000_000, cacheReadTokens: 1_000_000, outputTokens: 0 })).toBe(0.007);
    expect(estimateDeepSeekV4FlashOffPeakUsd({ inputTokens: 1_000_000, cacheReadTokens: 0, outputTokens: 0 })).toBe(0.22);
  });
});

describe("rehearsal redaction", () => {
  it("redacts PostgreSQL connection strings and nested secret values", () => {
    expect(redactSensitiveText("postgresql://owner:password@example.test/db")).not.toContain("password");
    expect(redactUnknown({ database_url: "postgresql://owner:password@example.test/db" })).toEqual({ database_url: "[REDACTED]" });
  });

  it("redacts unlabelled provider keys and authorization values", () => {
    expect(redactSensitiveText("sk-abcdefghijklmnopqrstuvwxyz123456")).toBe("[REDACTED]");
    expect(redactSensitiveText("nvapi-abcdefghijklmnopqrstuvwxyz123456")).toBe("[REDACTED]");
    expect(redactSensitiveText("Bearer opaque-provider-credential")).toBe("Bearer [REDACTED]");
  });
});
