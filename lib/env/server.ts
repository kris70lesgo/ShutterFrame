import "server-only";

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

export const serverEnv = {
  databaseUrl: process.env.DATABASE_URL,
  databaseConfigured: Boolean(process.env.DATABASE_URL),
  trueforgeBaseUrl: trimTrailingSlash(
    process.env.TRUEFORGE_BASE_URL ?? "http://localhost:8790",
  ),
  geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
  deepseekConfigured: Boolean(process.env.DEEPSEEK_API_KEY),
  neonProjectId: process.env.NEON_PROJECT_ID,
  neonConfigured: Boolean(process.env.NEON_API_KEY && process.env.NEON_PROJECT_ID),
  githubConfigured: Boolean(process.env.GITHUB_TOKEN),
  daytonaConfigured: Boolean(process.env.DAYTONA_API_KEY),
  daytonaApiKey: process.env.DAYTONA_API_KEY,
  daytonaApiUrl: trimTrailingSlash(process.env.DAYTONA_API_URL ?? "https://app.daytona.io/api"),
};
