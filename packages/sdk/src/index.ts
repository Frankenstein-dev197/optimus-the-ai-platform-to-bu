import {
  IOptimusAPI,
  OptimusUser,
  OptimusOrganization,
  OptimusTeam,
  OptimusWorkspace,
  OptimusApiKey,
  OptimusQuota,
  OptimusBillingUsage,
  OptimusAuditLog,
  OptimusAIChatSession,
  OptimusAIChatMessage,
  OptimusAICommandRequest,
  OptimusAICommandResponse,
  OptimusGitIntegrationConfig,
  OptimusProject
} from "@optimus/api";
import { GitRepository, GitPullRequest } from "@optimus/git";

export interface SDKConfig {
  baseURL: string;
  token?: string;
  onSessionExpired?: () => void;
}

export class OptimusSDKClient implements IOptimusAPI {
  private baseURL: string;
  private token?: string;
  private onSessionExpired?: () => void;

  constructor(config: SDKConfig) {
    this.baseURL = config.baseURL;
    this.token = config.token;
    this.onSessionExpired = config.onSessionExpired;
  }

  // Permet de mettre à jour dynamiquement le jeton lors des connexions SSO
  setToken(token: string): void {
    this.token = token;
  }

  private async fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = new Headers(options.headers);
    headers.set("Content-Type", "application/json");
    if (this.token) {
      headers.set("Authorization", `Bearer ${this.token}`);
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers,
      });

      if (response.status === 401 && this.onSessionExpired) {
        this.onSessionExpired();
      }

      if (!response.ok) {
        throw new Error(`Erreur API [${response.status}]: ${response.statusText}`);
      }

      // Pour les requêtes de suppression ou sans contenu de retour
      if (response.status === 204) {
        return null as unknown as T;
      }

      return await response.json() as T;
    } catch (e) {
      throw new Error(`Échec de la communication réseau avec Optimus Dev: ` + String(e));
    }
  }

  // --- IMPLEMENTATION DES CONTRATS UTILISATEUR & AUTH ---

  async getCurrentUser(): Promise<OptimusUser> {
    return this.fetchAPI<OptimusUser>("/api/v1/users/me");
  }

  async listOrganizations(): Promise<OptimusOrganization[]> {
    return this.fetchAPI<OptimusOrganization[]>("/api/v1/organizations");
  }

  async listTeams(orgId: string): Promise<OptimusTeam[]> {
    return this.fetchAPI<OptimusTeam[]>(`/api/v1/organizations/${orgId}/teams`);
  }

  // --- IMPLEMENTATION DES CONTRATS ESPACES DE TRAVAIL (WORKSPACES) ---

  async listWorkspaces(): Promise<OptimusWorkspace[]> {
    return this.fetchAPI<OptimusWorkspace[]>("/api/v1/workspaces");
  }

  async getWorkspace(id: string): Promise<OptimusWorkspace> {
    return this.fetchAPI<OptimusWorkspace>(`/api/v1/workspaces/${id}`);
  }

  async createWorkspace(name: string, templateId: string, gitRepoUrl?: string): Promise<OptimusWorkspace> {
    return this.fetchAPI<OptimusWorkspace>("/api/v1/workspaces", {
      method: "POST",
      body: JSON.stringify({ name, templateId, gitRepoUrl }),
    });
  }

  async startWorkspace(id: string): Promise<OptimusWorkspace> {
    return this.fetchAPI<OptimusWorkspace>(`/api/v1/workspaces/${id}/start`, {
      method: "POST",
    });
  }

  async stopWorkspace(id: string): Promise<OptimusWorkspace> {
    return this.fetchAPI<OptimusWorkspace>(`/api/v1/workspaces/${id}/stop`, {
      method: "POST",
    });
  }

  async deleteWorkspace(id: string): Promise<void> {
    return this.fetchAPI<void>(`/api/v1/workspaces/${id}`, {
      method: "DELETE",
    });
  }

  // --- IMPLEMENTATION DU PORTAIL CLÉS API ---

  async listApiKeys(): Promise<OptimusApiKey[]> {
    return this.fetchAPI<OptimusApiKey[]>("/api/v1/developer/apikeys");
  }

  async createApiKey(name: string, scopes: string[], expiresAt?: string): Promise<OptimusApiKey> {
    return this.fetchAPI<OptimusApiKey>("/api/v1/developer/apikeys", {
      method: "POST",
      body: JSON.stringify({ name, scopes, expiresAt }),
    });
  }

  async revokeApiKey(id: string): Promise<void> {
    return this.fetchAPI<void>(`/api/v1/developer/apikeys/${id}`, {
      method: "DELETE",
    });
  }

  // --- IMPLEMENTATION FACTURATION & QUOTAS ---

  async getQuotas(orgId: string): Promise<OptimusQuota> {
    return this.fetchAPI<OptimusQuota>(`/api/v1/organizations/${orgId}/quotas`);
  }

  async getBillingUsage(orgId: string): Promise<OptimusBillingUsage> {
    return this.fetchAPI<OptimusBillingUsage>(`/api/v1/organizations/${orgId}/billing`);
  }

  // --- IMPLEMENTATION JOURNAUX D'AUDIT ---

  async listAuditLogs(orgId: string): Promise<OptimusAuditLog[]> {
    return this.fetchAPI<OptimusAuditLog[]>(`/api/v1/organizations/${orgId}/audit-logs`);
  }

  // --- IMPLEMENTATION INTEGRATION SERVICES IA ---

  async createAIChatSession(workspaceId?: string): Promise<OptimusAIChatSession> {
    return this.fetchAPI<OptimusAIChatSession>("/api/v1/ai/chat/sessions", {
      method: "POST",
      body: JSON.stringify({ workspaceId }),
    });
  }

  async sendAIChatMessage(sessionId: string, content: string): Promise<OptimusAIChatMessage[]> {
    return this.fetchAPI<OptimusAIChatMessage[]>(`/api/v1/ai/chat/sessions/${sessionId}/messages`, {
      method: "POST",
      body: JSON.stringify({ content }),
    });
  }

  async requestAICommand(request: OptimusAICommandRequest): Promise<OptimusAICommandResponse> {
    return this.fetchAPI<OptimusAICommandResponse>("/api/v1/ai/commands", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  // --- IMPLEMENTATION DU PORTAIL GIT INTEGRATIONS ---

  async listLinkedGitAccounts(): Promise<OptimusGitIntegrationConfig[]> {
    return this.fetchAPI<OptimusGitIntegrationConfig[]>("/api/v1/developer/git/accounts");
  }

  async listGitRepositories(providerId: string): Promise<GitRepository[]> {
    return this.fetchAPI<GitRepository[]>(`/api/v1/developer/git/repositories/${providerId}`);
  }

  async importGitRepository(providerId: string, repoFullName: string): Promise<OptimusProject> {
    return this.fetchAPI<OptimusProject>("/api/v1/developer/git/projects", {
      method: "POST",
      body: JSON.stringify({ providerId, repoFullName }),
    });
  }

  async listProjectPullRequests(projectId: string): Promise<GitPullRequest[]> {
    return this.fetchAPI<GitPullRequest[]>(`/api/v1/developer/git/projects/${projectId}/pulls`);
  }

  async createProjectPullRequest(projectId: string, title: string, head: string, base: string): Promise<GitPullRequest> {
    return {
      id: `pr-mock-${Date.now()}`,
      number: Math.floor(Math.random() * 100),
      title,
      sourceBranch: head,
      targetBranch: base,
      status: "open",
      author: "me",
      url: `https://github.com/mock-repo/pull/${Math.floor(Math.random() * 100)}`
    };
  }
}
