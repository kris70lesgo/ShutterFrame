export type PullRequestIntakeRequest = { owner: string; repo: string; prNumber: number };
export type PullRequestIntake = PullRequestIntakeRequest & { title: string; author: string; commitSha: string; baseBranch: string; changedFiles: string[]; migrationFiles: string[] };

const migrationFile = /^(?:migrations|db\/migrations|database\/migrations)\/.+\.sql$/i;

function assertRequest({ owner, repo, prNumber }: PullRequestIntakeRequest) {
  if (!/^[A-Za-z0-9_.-]+$/.test(owner) || !/^[A-Za-z0-9_.-]+$/.test(repo) || !Number.isSafeInteger(prNumber) || prNumber < 1) throw new Error("Invalid pull request reference.");
}

async function github(path: string) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN is not configured.");
  const response = await fetch(`https://api.github.com${path}`, { headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${token}`, "X-GitHub-Api-Version": "2022-11-28" }, cache: "no-store" });
  if (!response.ok) throw new Error(`GitHub request failed with status ${response.status}.`);
  return response;
}

export async function fetchPullRequestIntake(request: PullRequestIntakeRequest): Promise<PullRequestIntake> {
  assertRequest(request);
  const pr = await (await github(`/repos/${request.owner}/${request.repo}/pulls/${request.prNumber}`)).json() as { title: string; user: { login: string }; head: { sha: string }; base: { ref: string } };
  const changedFiles: string[] = [];
  for (let page = 1; ; page += 1) {
    const files = await (await github(`/repos/${request.owner}/${request.repo}/pulls/${request.prNumber}/files?per_page=100&page=${page}`)).json() as Array<{ filename: string }>;
    changedFiles.push(...files.map(({ filename }) => filename));
    if (files.length < 100) break;
  }
  return { ...request, title: pr.title, author: pr.user.login, commitSha: pr.head.sha, baseBranch: pr.base.ref, changedFiles, migrationFiles: changedFiles.filter((file) => migrationFile.test(file)) };
}
