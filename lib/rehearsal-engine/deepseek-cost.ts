export const DEEPSEEK_SPEND_LIMIT_USD = 1;

export type DeepSeekUsage = {
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
};

// Official DeepSeek V4 Flash off-peak USD-per-million-token rates. The engine
// records estimates so the local $1 guard can stop before a further run starts.
export function estimateDeepSeekV4FlashOffPeakUsd(usage: DeepSeekUsage) {
  const cacheMissTokens = Math.max(0, usage.inputTokens - usage.cacheReadTokens);
  return cacheMissTokens * 0.22 / 1_000_000
    + usage.cacheReadTokens * 0.007 / 1_000_000
    + usage.outputTokens * 0.66 / 1_000_000;
}

export function deepSeekUsageFromMetrics(value: unknown): DeepSeekUsage | null {
  if (!value || typeof value !== "object") return null;
  const metrics = value as Record<string, unknown>;
  const inputTokens = Number(metrics.totalInputTokens);
  const outputTokens = Number(metrics.totalOutputTokens);
  const cacheReadTokens = Number(metrics.totalCacheReadTokens ?? 0);
  if (![inputTokens, outputTokens, cacheReadTokens].every(Number.isFinite)) return null;
  return { inputTokens, outputTokens, cacheReadTokens };
}
