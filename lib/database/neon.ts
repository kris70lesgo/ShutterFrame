export type NeonBranchRequest = {
  parentBranchId: string;
  name: string;
};

/**
 * Future Neon MCP adapter. TrueForge, rather than the Next.js process, will
 * execute branch creation, SQL, and deletion with scoped development access.
 */
export interface NeonBranchService {
  createTemporaryBranch(request: NeonBranchRequest): Promise<{ branchId: string }>;
  destroyTemporaryBranch(branchId: string): Promise<void>;
}
