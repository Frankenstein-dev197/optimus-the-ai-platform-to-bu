export interface GitRepository {
  id: string;
  name: string;
  fullName: string;
  url: string;
  defaultBranch: string;
  isPrivate: boolean;
  owner: string;
}

export interface GitBranch {
  name: string;
  commitSha: string;
}

export interface GitCommit {
  sha: string;
  message: string;
  author: string;
  date: string;
}

export interface GitPullRequest {
  id: string;
  number: number;
  title: string;
  sourceBranch: string;
  targetBranch: string;
  status: 'open' | 'closed' | 'merged';
  author: string;
  url: string;
}

export interface GitProviderAdapter {
  readonly providerId: string; // 'github' | 'gitlab' | 'gitea' | 'bitbucket'

  // Authentification OAuth
  getAuthUrl(clientId: string, redirectUri: string, scopes: string[]): string;
  exchangeCodeForToken(clientId: string, clientSecret: string, code: string, redirectUri: string): Promise<string>;

  // Gestion des dépôts
  listRepositories(token: string): Promise<GitRepository[]>;
  getRepository(token: string, owner: string, repo: string): Promise<GitRepository>;
  createRepository(token: string, name: string, isPrivate: boolean): Promise<GitRepository>;
  forkRepository(token: string, fullName: string): Promise<GitRepository>;

  // Branches, Commits et Diffs
  listBranches(token: string, repoFullName: string): Promise<GitBranch[]>;
  getCommit(token: string, repoFullName: string, sha: string): Promise<GitCommit>;
  getDiff(token: string, repoFullName: string, base: string, head: string): Promise<string>;

  // Pull Requests / Merge Requests
  listPullRequests(token: string, repoFullName: string, status?: 'open' | 'closed' | 'all'): Promise<GitPullRequest[]>;
  createPullRequest(token: string, repoFullName: string, title: string, head: string, base: string, body?: string): Promise<GitPullRequest>;
  mergePullRequest(token: string, repoFullName: string, number: number): Promise<void>;

  // Webhooks et événements
  setupWebhook(token: string, repoFullName: string, payloadUrl: string, secret: string): Promise<void>;
}
