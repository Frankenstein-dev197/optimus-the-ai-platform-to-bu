import { GitProviderAdapter, GitRepository, GitBranch, GitCommit, GitPullRequest } from "../types";

export class GitHubAdapter implements GitProviderAdapter {
  readonly providerId = "github";

  getAuthUrl(clientId: string, redirectUri: string, scopes: string[]): string {
    const scopeParam = encodeURIComponent(scopes.join(" "));
    return `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopeParam}`;
  }

  async exchangeCodeForToken(clientId: string, clientSecret: string, code: string, redirectUri: string): Promise<string> {
    // Stub pour échange de code OAuth
    return `github_token_mock_${code}`;
  }

  async listRepositories(token: string): Promise<GitRepository[]> {
    return [
      {
        id: "gh-1",
        name: "optimus-app",
        fullName: "optimus/optimus-app",
        url: "https://github.com/optimus/optimus-app",
        defaultBranch: "main",
        isPrivate: true,
        owner: "optimus"
      }
    ];
  }

  async getRepository(token: string, owner: string, repo: string): Promise<GitRepository> {
    return {
      id: "gh-1",
      name: repo,
      fullName: `${owner}/${repo}`,
      url: `https://github.com/` + owner + "/" + repo,
      defaultBranch: "main",
      isPrivate: true,
      owner: owner
    };
  }

  async createRepository(token: string, name: string, isPrivate: boolean): Promise<GitRepository> {
    return {
      id: `gh-new-${Date.now()}`,
      name,
      fullName: `optimus/${name}`,
      url: `https://github.com/optimus/${name}`,
      defaultBranch: "main",
      isPrivate,
      owner: "optimus"
    };
  }

  async forkRepository(token: string, fullName: string): Promise<GitRepository> {
    const name = fullName.split("/")[1];
    return {
      id: `gh-fork-${Date.now()}`,
      name,
      fullName: `optimus-user/${name}`,
      url: `https://github.com/optimus-user/${name}`,
      defaultBranch: "main",
      isPrivate: true,
      owner: "optimus-user"
    };
  }

  async listBranches(token: string, repoFullName: string): Promise<GitBranch[]> {
    return [
      { name: "main", commitSha: "abcdef1234567890" },
      { name: "feature/ai-chat", commitSha: "1234567890abcdef" }
    ];
  }

  async getCommit(token: string, repoFullName: string, sha: string): Promise<GitCommit> {
    return {
      sha,
      message: "feat(ai): integrate LLM helper sidebar",
      author: "Jules <jules@optimus.dev>",
      date: new Date().toISOString()
    };
  }

  async getDiff(token: string, repoFullName: string, base: string, head: string): Promise<string> {
    return `diff --git a/index.ts b/index.ts\n--- a/index.ts\n+++ b/index.ts\n@@ -1,1 +1,2 @@\n+console.log("Optimus AI Connected");`;
  }

  async listPullRequests(token: string, repoFullName: string, status?: 'open' | 'closed' | 'all'): Promise<GitPullRequest[]> {
    return [
      {
        id: "pr-1",
        number: 42,
        title: "feat(ai): integrate autonomous coder engine",
        sourceBranch: "feature/ai-chat",
        targetBranch: "main",
        status: "open",
        author: "jules",
        url: `https://github.com/${repoFullName}/pull/42`
      }
    ];
  }

  async createPullRequest(token: string, repoFullName: string, title: string, head: string, base: string, body?: string): Promise<GitPullRequest> {
    return {
      id: `pr-new-${Date.now()}`,
      number: 43,
      title,
      sourceBranch: head,
      targetBranch: base,
      status: "open",
      author: "jules",
      url: `https://github.com/${repoFullName}/pull/43`
    };
  }

  async mergePullRequest(token: string, repoFullName: string, number: number): Promise<void> {
    // Stub pour la fusion
  }

  async setupWebhook(token: string, repoFullName: string, payloadUrl: string, secret: string): Promise<void> {
    // Stub pour la configuration du webhook
  }
}
