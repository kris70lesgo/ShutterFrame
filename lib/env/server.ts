import "server-only";

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

export const serverEnv = {
  trueforgeBaseUrl: trimTrailingSlash(
    process.env.TRUEFORGE_BASE_URL ?? "http://127.0.0.1:8790",
  ),
  groqConfigured: Boolean(process.env.GROQ_API_KEY),
  neonConfigured: Boolean(process.env.NEON_API_KEY && process.env.NEON_PROJECT_ID),
  githubConfigured: Boolean(
    process.env.GITHUB_TOKEN && process.env.GITHUB_OWNER && process.env.GITHUB_REPO,
  ),
  daytonaConfigured: Boolean(process.env.DAYTONA_API_KEY),
};
