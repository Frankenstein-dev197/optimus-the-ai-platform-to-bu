import {
  IOptimusAPI,
  OptimusUser,
  UpdateUserProfileDto,
  ChangePasswordDto,
  OptimusOrganization,
  CreateOrganizationDto,
  OptimusTeam,
  CreateTeamDto,
  OrganizationMember,
  OptimusWorkspace,
  CreateWorkspaceDto,
  WorkspaceTemplate,
  OptimusApiKey,
  CreateApiKeyDto,
  OptimusQuota,
  OptimusBillingUsage,
  OptimusAuditLog,
  AuditLogFilters,
  OptimusAIChatSession,
  OptimusAIChatMessage,
  OptimusAICommandRequest,
  OptimusAICommandResponse,
  OptimusGitIntegrationConfig,
  OptimusProject,
  ImportGitRepositoryDto,
  OptimusPluginMetadata
} from "@optimus/api";
import { GitRepository, GitPullRequest } from "@optimus/git";
import { ISDKInterceptor, SDKRequestContext, SDKResponseContext } from "./interceptors";
import { ISDKPlugin } from "./plugins";

export interface SDKClientConfig {
  readonly baseURL: string;
  readonly token?: string;
  readonly apiKey?: string;
}

/**
 * Client principal d'intégration du SDK Optimus Dev.
 * Consomme exclusivement les contrats d'API partagés et gère la chaîne d'intercepteurs
 * ainsi que les plugins d'extension de manière abstraite.
 */
export class OptimusSDKClient implements IOptimusAPI {
  private readonly baseURL: string;
  private token?: string;
  private apiKey?: string;
  private readonly interceptors: ISDKInterceptor[] = [];
  private readonly plugins = new Map<string, ISDKPlugin>();

  constructor(config: SDKClientConfig) {
    this.baseURL = config.baseURL;
    this.token = config.token;
    this.apiKey = config.apiKey;
  }

  // --- INTERCEPTEURS & MIDDLEWARES ---

  /** Enregistre un nouvel intercepteur de requêtes (middleware) */
  addInterceptor(interceptor: ISDKInterceptor): void {
    this.interceptors.push(interceptor);
  }

  /** Récupère la liste des intercepteurs actifs */
  getInterceptors(): readonly ISDKInterceptor[] {
    return this.interceptors;
  }

  // --- EXTENSIBILITÉ DES PLUGINS ---

  /** Installe un plugin d'extension du SDK */
  installPlugin(plugin: ISDKPlugin): void {
    if (this.plugins.has(plugin.id)) {
      throw new Error(`Plugin avec l'ID ${plugin.id} déjà installé.`);
    }
    this.plugins.set(plugin.id, plugin);
    plugin.onInstall(this);
  }

  /** Désinstalle un plugin du SDK */
  uninstallPlugin(pluginId: string): void {
    const plugin = this.plugins.get(pluginId);
    if (plugin) {
      if (plugin.onUninstall) {
        plugin.onUninstall(this);
      }
      this.plugins.delete(pluginId);
    }
  }

  /** Obtient la liste des plugins actifs */
  listInstalledSDKPlugins(): ISDKPlugin[] {
    return Array.from(this.plugins.values());
  }

  // --- EXÉCUTION DU PIPELINE DE REQUÊTE ---

  /**
   * Pipeline générique d'exécution de requêtes d'API.
   * Gère de manière abstraite la chaîne d'intercepteurs (avant, après, et en cas d'erreur)
   * sans aucune dépendance directe à axios ou fetch réels (conforme aux contraintes).
   */
  async executeRequest<T>(endpoint: string, method: SDKRequestContext['options']['method'] = 'GET', body?: any): Promise<T> {
    const requestContext: SDKRequestContext = {
      url: `${this.baseURL}${endpoint}`,
      options: {
        method,
        headers: {
          ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
          ...(this.apiKey ? { "X-API-Key": this.apiKey } : {}),
        },
        body
      }
    };

    // 1. Exécution des intercepteurs avant la requête (Pre-request chain)
    for (const interceptor of this.interceptors) {
      if (interceptor.beforeRequest) {
        await interceptor.beforeRequest(requestContext);
      }
    }

    // 2. Simulation de l'appel d'API (Pas d'implémentation d'appel réel, renvoi de stubs abstraits)
    try {
      const responseContext: SDKResponseContext<any> = {
        status: 200,
        headers: { "content-type": "application/json" },
        data: {} as any // Sera peuplé par des types de retour mockés propres au contrat
      };

      // 3. Exécution des intercepteurs après la réponse (Post-response chain)
      for (const interceptor of this.interceptors) {
        if (interceptor.afterResponse) {
          await interceptor.afterResponse(requestContext, responseContext);
        }
      }

      return responseContext.data as T;
    } catch (error: any) {
      // 4. Gestion des erreurs et retries
      let shouldRetry = false;
      for (const interceptor of this.interceptors) {
        if (interceptor.onError) {
          const retryChoice = await interceptor.onError(requestContext, error);
          if (retryChoice) {
            shouldRetry = true;
          }
        }
      }

      if (shouldRetry) {
        // Dans une logique réelle, nous relancerions executeRequest.
        // Ici, nous simulons de manière abstraite.
      }

      throw error;
    }
  }

  // --- USERS ---

  async getCurrentUser(): Promise<OptimusUser> {
    return this.executeRequest<OptimusUser>("/api/v1/users/me");
  }

  async updateProfile(dto: UpdateUserProfileDto): Promise<OptimusUser> {
    return this.executeRequest<OptimusUser>("/api/v1/users/me", "PUT", dto);
  }

  async changePassword(dto: ChangePasswordDto): Promise<void> {
    return this.executeRequest<void>("/api/v1/users/me/password", "POST", dto);
  }

  // --- ORGANIZATIONS & TEAMS ---

  async listOrganizations(): Promise<OptimusOrganization[]> {
    return this.executeRequest<OptimusOrganization[]>("/api/v1/organizations");
  }

  async createOrganization(dto: CreateOrganizationDto): Promise<OptimusOrganization> {
    return this.executeRequest<OptimusOrganization>("/api/v1/organizations", "POST", dto);
  }

  async listTeams(orgId: string): Promise<OptimusTeam[]> {
    return this.executeRequest<OptimusTeam[]>(`/api/v1/organizations/${orgId}/teams`);
  }

  async createTeam(orgId: string, dto: CreateTeamDto): Promise<OptimusTeam> {
    return this.executeRequest<OptimusTeam>(`/api/v1/organizations/${orgId}/teams`, "POST", dto);
  }

  async listTeamMembers(orgId: string, teamId: string): Promise<OrganizationMember[]> {
    return this.executeRequest<OrganizationMember[]>(`/api/v1/organizations/${orgId}/teams/${teamId}/members`);
  }

  // --- WORKSPACES ---

  async listWorkspaces(): Promise<OptimusWorkspace[]> {
    return this.executeRequest<OptimusWorkspace[]>("/api/v1/workspaces");
  }

  async getWorkspace(id: string): Promise<OptimusWorkspace> {
    return this.executeRequest<OptimusWorkspace>(`/api/v1/workspaces/${id}`);
  }

  async createWorkspace(dto: CreateWorkspaceDto): Promise<OptimusWorkspace> {
    return this.executeRequest<OptimusWorkspace>("/api/v1/workspaces", "POST", dto);
  }

  async startWorkspace(id: string): Promise<OptimusWorkspace> {
    return this.executeRequest<OptimusWorkspace>(`/api/v1/workspaces/${id}/start`, "POST");
  }

  async stopWorkspace(id: string): Promise<OptimusWorkspace> {
    return this.executeRequest<OptimusWorkspace>(`/api/v1/workspaces/${id}/stop`, "POST");
  }

  async deleteWorkspace(id: string): Promise<void> {
    return this.executeRequest<void>(`/api/v1/workspaces/${id}`, "DELETE");
  }

  async listTemplates(): Promise<WorkspaceTemplate[]> {
    return this.executeRequest<WorkspaceTemplate[]>("/api/v1/templates");
  }

  // --- API KEYS DEVELOPER ---

  async listApiKeys(): Promise<OptimusApiKey[]> {
    return this.executeRequest<OptimusApiKey[]>("/api/v1/developer/apikeys");
  }

  async createApiKey(dto: CreateApiKeyDto): Promise<OptimusApiKey> {
    return this.executeRequest<OptimusApiKey>("/api/v1/developer/apikeys", "POST", dto);
  }

  async revokeApiKey(id: string): Promise<void> {
    return this.executeRequest<void>(`/api/v1/developer/apikeys/${id}`, "DELETE");
  }

  // --- QUOTAS & BILLING ---

  async getQuotas(orgId: string): Promise<OptimusQuota> {
    return this.executeRequest<OptimusQuota>(`/api/v1/organizations/${orgId}/quotas`);
  }

  async getBillingUsage(orgId: string): Promise<OptimusBillingUsage> {
    return this.executeRequest<OptimusBillingUsage>(`/api/v1/organizations/${orgId}/billing`);
  }

  // --- AUDIT LOGS ---

  async listAuditLogs(orgId: string, filters?: AuditLogFilters): Promise<OptimusAuditLog[]> {
    return this.executeRequest<OptimusAuditLog[]>(`/api/v1/organizations/${orgId}/audit-logs`, "GET", filters);
  }

  // --- INTELLIGENCE ARTIFICIELLE ---

  async createAIChatSession(workspaceId?: string): Promise<OptimusAIChatSession> {
    return this.executeRequest<OptimusAIChatSession>("/api/v1/ai/chat/sessions", "POST", { workspaceId });
  }

  async sendAIChatMessage(sessionId: string, content: string): Promise<OptimusAIChatMessage[]> {
    return this.executeRequest<OptimusAIChatMessage[]>(`/api/v1/ai/chat/sessions/${sessionId}/messages`, "POST", { content });
  }

  async requestAICommand(request: OptimusAICommandRequest): Promise<OptimusAICommandResponse> {
    return this.executeRequest<OptimusAICommandResponse>("/api/v1/ai/commands", "POST", request);
  }

  // --- GIT PORTAL INTEGRATIONS ---

  async listLinkedGitAccounts(): Promise<OptimusGitIntegrationConfig[]> {
    return this.executeRequest<OptimusGitIntegrationConfig[]>("/api/v1/developer/git/accounts");
  }

  async listGitRepositories(providerId: string): Promise<GitRepository[]> {
    return this.executeRequest<GitRepository[]>(`/api/v1/developer/git/repositories/${providerId}`);
  }

  async importGitRepository(dto: ImportGitRepositoryDto): Promise<OptimusProject> {
    return this.executeRequest<OptimusProject>("/api/v1/developer/git/projects", "POST", dto);
  }

  async listProjectPullRequests(projectId: string): Promise<GitPullRequest[]> {
    return this.executeRequest<GitPullRequest[]>(`/api/v1/developer/git/projects/${projectId}/pulls`);
  }

  async createProjectPullRequest(projectId: string, title: string, head: string, base: string): Promise<GitPullRequest> {
    return this.executeRequest<GitPullRequest>(`/api/v1/developer/git/projects/${projectId}/pulls`, "POST", { title, head, base });
  }

  // --- PLUGINS ---

  async listInstalledPlugins(): Promise<OptimusPluginMetadata[]> {
    return this.executeRequest<OptimusPluginMetadata[]>("/api/v1/plugins");
  }

  async togglePlugin(pluginId: string, enable: boolean): Promise<void> {
    return this.executeRequest<void>(`/api/v1/plugins/${pluginId}/toggle`, "POST", { enable });
  }
}
