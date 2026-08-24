export type TrueForgeHealth = {
  reachable: boolean;
  message: string;
  checkedAt: string;
  capabilities?: unknown;
};

export type TrueForgeSessionRequest = {
  migrationId: string;
  prompt: string;
};
