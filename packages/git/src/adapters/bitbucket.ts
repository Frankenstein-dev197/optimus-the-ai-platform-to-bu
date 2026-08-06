import { GitProviderAdapter, GitRepository, GitBranch, GitCommit, GitPullRequest } from "../types";

export class BitbucketAdapter implements GitProviderAdapter {
  readonly providerId = "bitbucket";

  getAuthUrl(clientId: string, redirectUri: string, scopes: string[]): string {
    const scopeParam = encodeURIComponent(scopes.join(" "));
    return `https://bitbucket.org/site/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scopeParam}`;
  }

  async exchangeCodeForToken(clientId: string, clientSecret: string, code: string, redirectUri: string): Promise<string> {
    return `bitbucket_token_mock_${code}`;
  }

  async listRepositories(token: string): Promise<GitRepository[]> {
    return [
      {
        id: "bb-1",
        name: "optimus-enterprise",
        fullName: "optimus-ent/optimus-enterprise",
        url: "https://bitbucket.org/optimus-ent/optimus-enterprise",
        defaultBranch: "main",
        isPrivate: true,
        owner: "optimus-ent"
      }
    ];
  }

  async getRepository(token: string, owner: string, repo: string): Promise<GitRepository> {
    return {
      id: "bb-1",
      name: repo,
      fullName: `${owner}/${repo}`,
      url: `https://bitbucket.org/${owner}/${repo}`,
      defaultBranch: "main",
      isPrivate: true,
      owner
    };
  }

  async createRepository(token: string, name: string, isPrivate: boolean): Promise<GitRepository> {
    return {
      id: `bb-new-${Date.now()}`,
      name,
      fullName: `optimus-ent/${name}`,
      url: `https://bitbucket.org/optimus-ent/${name}`,
      defaultBranch: "main",
      isPrivate,
      owner: "optimus-ent"
    };
  }

  async forkRepository(token: string, fullName: string): Promise<GitRepository> {
    const name = fullName.split("/")[1];
    return {
      id: `bb-fork-${Date.now()}`,
      name,
      fullName: `optimus-user-ent/${name}`,
      url: `https://bitbucket.org/optimus-user-ent/${name}`,
      defaultBranch: "main",
      isPrivate: true,
      owner: "optimus-user-ent"
    };
  }

  async listBranches(token: string, repoFullName: string): Promise<GitBranch[]> {
    return [
      { name: "main", commitSha: "abcbitbucket1234567890" }
    ];
  }

  async getCommit(token: string, repoFullName: string, sha: string): Promise<GitCommit> {
    return {
      sha,
      message: "refactor: optimize enterprise db cluster connection",
      author: "Jules <jules@optimus.dev>",
      date: new Date().toISOString()
    };
  }

  async getDiff(token: string, repoFullName: string, base: string, head: string): Promise<string> {
    return `diff --git a/db.ts b/db.ts`;
  }

  async listPullRequests(token: string, repoFullName: string, status?: 'open' | 'closed' | 'all'): Promise<GitPullRequest[]> {
    return [
      {
        id: "bbpr-1",
        number: 12,
        title: "Database connection refactoring",
        sourceBranch: "refactor/db",
        targetBranch: "main",
        status: "open",
        author: "bb-user",
        url: `https://bitbucket.org/${repoFullName}/pull-requests/12`
      }
    ];
  }

  async createPullRequest(token: string, repoFullName: string, title: string, head: string, base: string, body?: string): Promise<GitPullRequest> {
    return {
      id: `bbpr-new-${Date.now()}`,
      number: 13,
      title,
      sourceBranch: head,
      targetBranch: base,
      status: "open",
      author: "bb-user",
      url: `https://bitbucket.org/${repoFullName}/pull-requests/13`
    };
  }

  async mergePullRequest(token: string, repoFullName: string, number: number): Promise<void> {
    // Stub
  }

  async setupWebhook(token: string, repoFullName: string, payloadUrl: string, secret: string): Promise<void> {
    // Stub
  }
}
