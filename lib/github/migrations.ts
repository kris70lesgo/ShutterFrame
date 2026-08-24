export type PullRequestMigrationSource = {
  owner: string;
  repository: string;
  pullRequestNumber: number;
};

/** GitHub MCP boundary reserved for migration-file discovery in a pull request. */
export interface GitHubMigrationSourceService {
  listSqlMigrations(source: PullRequestMigrationSource): Promise<string[]>;
}
