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

function readConfiguredRepository() {
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  if (!owner || !repo || !/^[A-Za-z0-9_.-]+$/.test(owner) || !/^[A-Za-z0-9_.-]+$/.test(repo)) {
    throw new Error("GITHUB_OWNER and GITHUB_REPO must be configured.");
  }
  return { owner, repo };
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
    const url = new URL(path, "https://api.github.com");
    if (url.origin !== "https://api.github.com" || !url.pathname.startsWith("/repos/")) throw new GitHubRequestError();
    const response = await fetch(url, { headers: { Accept: "application/vnd.github+json", Authorization: `token ${token}`, "X-GitHub-Api-Version": "2022-11-28" }, cache: "no-store" });
    if (!response.ok) throw new GitHubRequestError();
    return response;
  } catch (error) {
    if (error instanceof GitHubRequestError) throw error;
    throw new GitHubRequestError();
  }
}

export async function fetchPullRequestIntake(request: PullRequestIntakeRequest): Promise<PullRequestIntake> {
  const validRequest = validatePullRequestIntakeRequest(request);
  const configuredRepository = readConfiguredRepository();
  if (
    validRequest.owner.toLowerCase() !== configuredRepository.owner.toLowerCase() ||
    validRequest.repo.toLowerCase() !== configuredRepository.repo.toLowerCase()
  ) {
    throw new InvalidPullRequestReferenceError();
  }

  const pr = await (await github(`/repos/${configuredRepository.owner}/${configuredRepository.repo}/pulls/${validRequest.prNumber}`)).json() as { title: string; user: { login: string }; head: { sha: string }; base: { ref: string } };
  const changedFiles: string[] = [];
  for (let page = 1; ; page += 1) {
    const files = await (await github(`/repos/${configuredRepository.owner}/${configuredRepository.repo}/pulls/${validRequest.prNumber}/files?per_page=100&page=${page}`)).json() as Array<{ filename: string }>;
    changedFiles.push(...files.map(({ filename }) => filename));
    if (files.length < 100) break;
  }
  return { ...validRequest, title: pr.title, author: pr.user.login, commitSha: pr.head.sha, baseBranch: pr.base.ref, changedFiles, migrationFiles: changedFiles.filter((file) => migrationFile.test(file)) };
}
