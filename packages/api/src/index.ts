// Ré-exportation ordonnée de l'ensemble des modules de domaine d'Optimus

export * from "./users";
export * from "./organizations";
export * from "./workspaces";
export * from "./git";
export * from "./ai";
export * from "./apikeys";
export * from "./audit";
export * from "./billing";
export * from "./plugins";

export type { OptimusOrganization, OptimusTeam } from "@optimus/auth";

// --- INTERFACE CONTRACTUELLE DE L'API REST CENTRALE (IOptimusAPI) ---

import { OptimusUser, UpdateUserProfileDto, ChangePasswordDto } from "./users";
import { CreateOrganizationDto, CreateTeamDto, OrganizationMember } from "./organizations";
import { OptimusWorkspace, CreateWorkspaceDto, WorkspaceTemplate } from "./workspaces";
import { OptimusProject, OptimusGitIntegrationConfig, ImportGitRepositoryDto } from "./git";
import { OptimusAIChatSession, OptimusAIChatMessage, OptimusAICommandRequest, OptimusAICommandResponse } from "./ai";
import { OptimusApiKey, CreateApiKeyDto } from "./apikeys";
import { OptimusAuditLog, AuditLogFilters } from "./audit";
import { OptimusQuota, OptimusBillingUsage } from "./billing";
import { OptimusPluginMetadata } from "./plugins";
import { GitRepository, GitPullRequest } from "@optimus/git";
import { OptimusOrganization, OptimusTeam } from "@optimus/auth";

export interface IOptimusAPI {
  // --- USERS ---
  getCurrentUser(): Promise<OptimusUser>;
  updateProfile(dto: UpdateUserProfileDto): Promise<OptimusUser>;
  changePassword(dto: ChangePasswordDto): Promise<void>;

  // --- ORGANIZATIONS & TEAMS ---
  listOrganizations(): Promise<OptimusOrganization[]>;
  createOrganization(dto: CreateOrganizationDto): Promise<OptimusOrganization>;
  listTeams(orgId: string): Promise<OptimusTeam[]>;
  createTeam(orgId: string, dto: CreateTeamDto): Promise<OptimusTeam>;
  listTeamMembers(orgId: string, teamId: string): Promise<OrganizationMember[]>;

  // --- WORKSPACES ---
  listWorkspaces(): Promise<OptimusWorkspace[]>;
  getWorkspace(id: string): Promise<OptimusWorkspace>;
  createWorkspace(dto: CreateWorkspaceDto): Promise<OptimusWorkspace>;
  startWorkspace(id: string): Promise<OptimusWorkspace>;
  stopWorkspace(id: string): Promise<OptimusWorkspace>;
  deleteWorkspace(id: string): Promise<void>;
  listTemplates(): Promise<WorkspaceTemplate[]>;

  // --- API KEYS DEVELOPER ---
  listApiKeys(): Promise<OptimusApiKey[]>;
  createApiKey(dto: CreateApiKeyDto): Promise<OptimusApiKey>;
  revokeApiKey(id: string): Promise<void>;

  // --- QUOTAS & BILLING ---
  getQuotas(orgId: string): Promise<OptimusQuota>;
  getBillingUsage(orgId: string): Promise<OptimusBillingUsage>;

  // --- AUDIT LOGS ---
  listAuditLogs(orgId: string, filters?: AuditLogFilters): Promise<OptimusAuditLog[]>;

  // --- INTELLIGENCE ARTIFICIELLE ---
  createAIChatSession(workspaceId?: string): Promise<OptimusAIChatSession>;
  sendAIChatMessage(sessionId: string, content: string): Promise<OptimusAIChatMessage[]>;
  requestAICommand(request: OptimusAICommandRequest): Promise<OptimusAICommandResponse>;

  // --- GIT PORTAL INTEGRATIONS ---
  listLinkedGitAccounts(): Promise<OptimusGitIntegrationConfig[]>;
  listGitRepositories(providerId: string): Promise<GitRepository[]>;
  importGitRepository(dto: ImportGitRepositoryDto): Promise<OptimusProject>;
  listProjectPullRequests(projectId: string): Promise<GitPullRequest[]>;
  createProjectPullRequest(projectId: string, title: string, head: string, base: string): Promise<GitPullRequest>;

  // --- PLUGINS ---
  listInstalledPlugins(): Promise<OptimusPluginMetadata[]>;
  togglePlugin(pluginId: string, enable: boolean): Promise<void>;
}
