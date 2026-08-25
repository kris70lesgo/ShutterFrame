export type TrueForgeHealth = {
  reachable: boolean;
  message: string;
  checkedAt: string;
  capabilities?: unknown;
};

export type RehearsalSessionContext = {
  repoOwner: string;
  repoName: string;
  prNumber: number;
  commitSha: string;
  migrationPath: string | null;
};

export type TrueForgeSessionRequest = {
  rehearsal: RehearsalSessionContext;
};

export type TrueForgeSessionResult = {
  sessionId: string;
  response: string;
};
