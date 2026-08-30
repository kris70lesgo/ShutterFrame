import "server-only";

import { createHash } from "node:crypto";

const MAX_MIGRATION_BYTES = 512 * 1024;
const ownerOrRepo = /^[A-Za-z0-9_.-]+$/;
const commitSha = /^[a-f0-9]{40}$/i;
const safePath = /^(?!.*(?:^|\/)\.\.(?:\/|$))(?:[A-Za-z0-9_.-]+\/)*[A-Za-z0-9_.-]+\.sql$/i;

export class GitHubArtifactError extends Error {
  constructor(message = "GitHub artifact retrieval failed.") { super(message); }
}

async function github(path: string) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new GitHubArtifactError("GITHUB_TOKEN is not configured.");
  const response = await fetch(`https://api.github.com${path}`, {
    headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${token}`, "X-GitHub-Api-Version": "2022-11-28" },
    cache: "no-store",
  });
  if (!response.ok) throw new GitHubArtifactError(response.status === 404 ? "GitHub artifact was not found at the expected commit." : "GitHub artifact retrieval failed.");
  return response;
}

export async function verifyPullRequestHead(input: { owner: string; repo: string; prNumber: number; expectedCommitSha: string }) {
  if (!ownerOrRepo.test(input.owner) || !ownerOrRepo.test(input.repo) || !Number.isSafeInteger(input.prNumber) || input.prNumber < 1 || !commitSha.test(input.expectedCommitSha)) throw new GitHubArtifactError("Invalid GitHub artifact reference.");
  const pull = await (await github(`/repos/${input.owner}/${input.repo}/pulls/${input.prNumber}`)).json() as { head?: { sha?: string } };
  if (pull.head?.sha !== input.expectedCommitSha) throw new GitHubArtifactError("Pull request head changed; create a new rehearsal for the current commit.");
}

export async function fetchMigrationArtifact(input: { owner: string; repo: string; commitSha: string; migrationPath: string }) {
  if (!ownerOrRepo.test(input.owner) || !ownerOrRepo.test(input.repo) || !commitSha.test(input.commitSha) || !safePath.test(input.migrationPath)) throw new GitHubArtifactError("Invalid GitHub artifact reference.");
  const path = input.migrationPath.split("/").map(encodeURIComponent).join("/");
  const file = await (await github(`/repos/${input.owner}/${input.repo}/contents/${path}?ref=${encodeURIComponent(input.commitSha)}`)).json() as { type?: string; encoding?: string; content?: string; sha?: string; size?: number };
  if (file.type !== "file" || file.encoding !== "base64" || typeof file.content !== "string") throw new GitHubArtifactError("GitHub response is not a file.");
  const encoded = file.content.replace(/\s/g, "");
  if (!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(encoded)) throw new GitHubArtifactError("Migration file encoding is invalid.");
  const bytes = Buffer.from(encoded, "base64");
  if (bytes.length === 0 || bytes.length > MAX_MIGRATION_BYTES || (typeof file.size === "number" && file.size !== bytes.length)) throw new GitHubArtifactError("Migration file exceeds the permitted size or is invalid.");
  let content: string;
  try { content = new TextDecoder("utf-8", { fatal: true }).decode(bytes); } catch { throw new GitHubArtifactError("Migration file is not valid UTF-8 text."); }
  return { owner: input.owner, repo: input.repo, commitSha: input.commitSha, path: input.migrationPath, content, githubBlobSha: file.sha, byteLength: bytes.length, sha256: createHash("sha256").update(bytes).digest("hex") };
}
