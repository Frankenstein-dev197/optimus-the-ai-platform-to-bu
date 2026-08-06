import { GitProviderAdapter, GitRepository, GitBranch, GitCommit, GitPullRequest } from "../types";

export class GiteaAdapter implements GitProviderAdapter {
  readonly providerId = "gitea";

  getAuthUrl(clientId: string, redirectUri: string, scopes: string[]): string {
    const scopeParam = encodeURIComponent(scopes.join(" "));
    return `https://gitea.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scopeParam}`;
  }

  async exchangeCodeForToken(clientId: string, clientSecret: string, code: string, redirectUri: string): Promise<string> {
    return `gitea_token_mock_${code}`;
  }

  async listRepositories(token: string): Promise<GitRepository[]> {
    return [
      {
        id: "gt-1",
        name: "optimus-selfhosted",
        fullName: "optimus-local/optimus-selfhosted",
        url: "https://gitea.com/optimus-local/optimus-selfhosted",
        defaultBranch: "main",
        isPrivate: true,
        owner: "optimus-local"
      }
    ];
  }

  async getRepository(token: string, owner: string, repo: string): Promise<GitRepository> {
    return {
      id: "gt-1",
      name: repo,
      fullName: `${owner}/${repo}`,
      url: `https://gitea.com/${owner}/${repo}`,
      defaultBranch: "main",
      isPrivate: true,
      owner
    };
  }

  async createRepository(token: string, name: string, isPrivate: boolean): Promise<GitRepository> {
    return {
      id: `gt-new-${Date.now()}`,
      name,
      fullName: `optimus-local/${name}`,
      url: `https://gitea.com/optimus-local/${name}`,
      defaultBranch: "main",
      isPrivate,
      owner: "optimus-local"
    };
  }

  async forkRepository(token: string, fullName: string): Promise<GitRepository> {
    const name = fullName.split("/")[1];
    return {
      id: `gt-fork-${Date.now()}`,
      name,
      fullName: `optimus-user-local/${name}`,
      url: `https://gitea.com/optimus-user-local/${name}`,
      defaultBranch: "main",
      isPrivate: true,
      owner: "optimus-user-local"
    };
  }

  async listBranches(token: string, repoFullName: string): Promise<GitBranch[]> {
    return [
      { name: "main", commitSha: "abcgitea1234567890" }
    ];
  }

  async getCommit(token: string, repoFullName: string, sha: string): Promise<GitCommit> {
    return {
      sha,
      message: "chore: update local config settings",
      author: "Jules <jules@optimus.dev>",
      date: new Date().toISOString()
    };
  }

  async getDiff(token: string, repoFullName: string, base: string, head: string): Promise<string> {
    return `diff --git a/config.json b/config.json`;
  }

  async listPullRequests(token: string, repoFullName: string, status?: 'open' | 'closed' | 'all'): Promise<GitPullRequest[]> {
    return [
      {
        id: "gtpr-1",
        number: 5,
        title: "Merge local bugfixes",
        sourceBranch: "fix/local",
        targetBranch: "main",
        status: "open",
        author: "gitea-user",
        url: `https://gitea.com/${repoFullName}/pulls/5`
      }
    ];
  }

  async createPullRequest(token: string, repoFullName: string, title: string, head: string, base: string, body?: string): Promise<GitPullRequest> {
    return {
      id: `gtpr-new-${Date.now()}`,
      number: 6,
      title,
      sourceBranch: head,
      targetBranch: base,
      status: "open",
      author: "gitea-user",
      url: `https://gitea.com/${repoFullName}/pulls/6`
    };
  }

  async mergePullRequest(token: string, repoFullName: string, number: number): Promise<void> {
    // Stub
  }

  async setupWebhook(token: string, repoFullName: string, payloadUrl: string, secret: string): Promise<void> {
    // Stub
  }
}
