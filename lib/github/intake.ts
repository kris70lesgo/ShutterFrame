export type PullRequestIntakeRequest = { owner: string; repo: string; prNumber: number };
export type PullRequestIntake = PullRequestIntakeRequest & { title: string; author: string; commitSha: string; baseBranch: string; changedFiles: string[]; migrationFiles: string[] };

const migrationFile = /^(?:migrations|db\/migrations|database\/migrations)\/.+\.sql$/i;

export class InvalidPullRequestReferenceError extends Error {
  constructor() {
    super("Invalid pull request reference.");
  }
}

export class GitHubRequestError extends Error {
  constructor() {
    super("GitHub request failed.");
  }
}

export function validatePullRequestIntakeRequest(value: unknown): PullRequestIntakeRequest {
  if (!value || typeof value !== "object") throw new InvalidPullRequestReferenceError();
  const { owner, repo, prNumber } = value as Record<string, unknown>;
  if (
    typeof owner !== "string" ||
    typeof repo !== "string" ||
    typeof prNumber !== "number" ||
    !/^[A-Za-z0-9_.-]+$/.test(owner) ||
    !/^[A-Za-z0-9_.-]+$/.test(repo) ||
    !Number.isSafeInteger(prNumber) ||
    prNumber < 1
  ) {
    throw new InvalidPullRequestReferenceError();
  }
  return { owner, repo, prNumber };
}

async function github(path: string) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN is not configured.");
  try {
    const response = await fetch(`https://api.github.com${path}`, { headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${token}`, "X-GitHub-Api-Version": "2022-11-28" }, cache: "no-store" });
    if (!response.ok) throw new GitHubRequestError();
    return response;
  } catch (error) {
    if (error instanceof GitHubRequestError) throw error;
    throw new GitHubRequestError();
  }
}

export async function fetchPullRequestIntake(request: PullRequestIntakeRequest): Promise<PullRequestIntake> {
  const validRequest = validatePullRequestIntakeRequest(request);
  const pr = await (await github(`/repos/${validRequest.owner}/${validRequest.repo}/pulls/${validRequest.prNumber}`)).json() as { title: string; user: { login: string }; head: { sha: string }; base: { ref: string } };
  const changedFiles: string[] = [];
  for (let page = 1; ; page += 1) {
    const files = await (await github(`/repos/${validRequest.owner}/${validRequest.repo}/pulls/${validRequest.prNumber}/files?per_page=100&page=${page}`)).json() as Array<{ filename: string }>;
    changedFiles.push(...files.map(({ filename }) => filename));
    if (files.length < 100) break;
  }
  return { ...validRequest, title: pr.title, author: pr.user.login, commitSha: pr.head.sha, baseBranch: pr.base.ref, changedFiles, migrationFiles: changedFiles.filter((file) => migrationFile.test(file)) };
}
