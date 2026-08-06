import { GitProviderAdapter, GitRepository, GitBranch, GitCommit, GitPullRequest } from "../types";

export class GitLabAdapter implements GitProviderAdapter {
  readonly providerId = "gitlab";

  getAuthUrl(clientId: string, redirectUri: string, scopes: string[]): string {
    const scopeParam = encodeURIComponent(scopes.join(" "));
    return `https://gitlab.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scopeParam}`;
  }

  async exchangeCodeForToken(clientId: string, clientSecret: string, code: string, redirectUri: string): Promise<string> {
    return `gitlab_token_mock_${code}`;
  }

  async listRepositories(token: string): Promise<GitRepository[]> {
    return [
      {
        id: "gl-1",
        name: "optimus-core",
        fullName: "optimus-group/optimus-core",
        url: "https://gitlab.com/optimus-group/optimus-core",
        defaultBranch: "main",
        isPrivate: true,
        owner: "optimus-group"
      }
    ];
  }

  async getRepository(token: string, owner: string, repo: string): Promise<GitRepository> {
    return {
      id: "gl-1",
      name: repo,
      fullName: `${owner}/${repo}`,
      url: `https://gitlab.com/${owner}/${repo}`,
      defaultBranch: "main",
      isPrivate: true,
      owner
    };
  }

  async createRepository(token: string, name: string, isPrivate: boolean): Promise<GitRepository> {
    return {
      id: `gl-new-${Date.now()}`,
      name,
      fullName: `optimus-group/${name}`,
      url: `https://gitlab.com/optimus-group/${name}`,
      defaultBranch: "main",
      isPrivate,
      owner: "optimus-group"
    };
  }

  async forkRepository(token: string, fullName: string): Promise<GitRepository> {
    const name = fullName.split("/")[1];
    return {
      id: `gl-fork-${Date.now()}`,
      name,
      fullName: `optimus-user-fork/${name}`,
      url: `https://gitlab.com/optimus-user-fork/${name}`,
      defaultBranch: "main",
      isPrivate: true,
      owner: "optimus-user-fork"
    };
  }

  async listBranches(token: string, repoFullName: string): Promise<GitBranch[]> {
    return [
      { name: "main", commitSha: "abcgitlab1234567890" }
    ];
  }

  async getCommit(token: string, repoFullName: string, sha: string): Promise<GitCommit> {
    return {
      sha,
      message: "ci: add gitlab-ci multi-stage runner",
      author: "Jules <jules@optimus.dev>",
      date: new Date().toISOString()
    };
  }

  async getDiff(token: string, repoFullName: string, base: string, head: string): Promise<string> {
    return `diff --git a/.gitlab-ci.yml b/gitlab-ci.yml`;
  }

  async listPullRequests(token: string, repoFullName: string, status?: 'open' | 'closed' | 'all'): Promise<GitPullRequest[]> {
    return [
      {
        id: "mr-1",
        number: 101,
        title: "Resolve pipeline failures in dev branch",
        sourceBranch: "fix/pipelines",
        targetBranch: "main",
        status: "open",
        author: "gitlab-dev",
        url: `https://gitlab.com/${repoFullName}/-/merge_requests/101`
      }
    ];
  }

  async createPullRequest(token: string, repoFullName: string, title: string, head: string, base: string, body?: string): Promise<GitPullRequest> {
    return {
      id: `mr-new-${Date.now()}`,
      number: 102,
      title,
      sourceBranch: head,
      targetBranch: base,
      status: "open",
      author: "gitlab-dev",
      url: `https://gitlab.com/${repoFullName}/-/merge_requests/102`
    };
  }

  async mergePullRequest(token: string, repoFullName: string, number: number): Promise<void> {
    // Stub
  }

  async setupWebhook(token: string, repoFullName: string, payloadUrl: string, secret: string): Promise<void> {
    // Stub
  }
}
