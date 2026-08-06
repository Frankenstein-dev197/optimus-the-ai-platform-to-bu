import { GitRepository, GitPullRequest } from "@optimus/git";

// --- CONTRATS UTILISATEUR & AUTHENTIFICATION ---

export interface OptimusUser {
  id: string;
  username: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  role: 'admin' | 'developer' | 'billing_admin';
  createdAt: string;
}

export interface OptimusOrganization {
  id: string;
  name: string;
  displayName: string;
  createdAt: string;
}

export interface OptimusTeam {
  id: string;
  orgId: string;
  name: string;
  membersCount: number;
}

// --- CONTRATS ESPACES DE TRAVAIL (WORKSPACES) ---

export interface OptimusWorkspace {
  id: string;
  name: string;
  ownerId: string;
  ownerUsername: string;
  status: 'running' | 'stopped' | 'starting' | 'stopping' | 'error';
  templateId: string;
  templateName: string;
  templateVersion: string;
  createdAt: string;
  updatedAt: string;
  resources: {
    cpuCores: number;
    memoryGB: number;
    diskGB: number;
    gpuCount?: number;
  };
  gitRepoUrl?: string;
  activeBranch?: string;
}

export interface OptimusTemplate {
  id: string;
  name: string;
  description: string;
  activeVersionId: string;
  createdAt: string;
  isPublic: boolean;
}

// --- CONTRATS DEVELOPER SERVICES (API Keys, Quotas, Logs) ---

export interface OptimusApiKey {
  id: string;
  name: string;
  prefix: string; // ex: opt_dev_abc123...
  userId: string;
  scopes: string[];
  expiresAt?: string;
  createdAt: string;
  lastUsedAt?: string;
}

export interface OptimusQuota {
  id: string;
  orgId: string;
  maxWorkspaces: number;
  maxCpuCores: number;
  maxMemoryGB: number;
  maxDiskGB: number;
  usedWorkspaces: number;
  usedCpuCores: number;
  usedMemoryGB: number;
  usedDiskGB: number;
}

export interface OptimusBillingUsage {
  id: string;
  orgId: string;
  periodStart: string;
  periodEnd: string;
  computeSeconds: number;
  computeCostUSD: number;
  aiTokensUsed: number;
  aiCostUSD: number;
  totalCostUSD: number;
}

export interface OptimusAuditLog {
  id: string;
  timestamp: string;
  userId: string;
  username: string;
  action: string; // ex: 'workspace.create', 'apikey.revoke'
  resourceType: string;
  resourceId: string;
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'failed';
  details?: Record<string, any>;
}

// --- CONTRATS INTEGRATION SERVICES IA ---

export interface OptimusAIChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface OptimusAIChatSession {
  id: string;
  userId: string;
  workspaceId?: string;
  title: string;
  messages: OptimusAIChatMessage[];
  createdAt: string;
}

export interface OptimusAICommandRequest {
  prompt: string;
  workspaceId: string;
  contextFiles?: string[];
}

export interface OptimusAICommandResponse {
  suggestedCode: string;
  explanation: string;
  commandsToRun?: string[];
}

// --- PORTAIL DE DÉVELOPPEMENT & INTEGRATION SERVICES GIT ---

export interface OptimusProject {
  id: string;
  name: string;
  gitRepo: GitRepository;
  linkedWorkspaces: string[]; // liste d'IDs de workspaces OptimusWorkspace
  createdAt: string;
}

export interface OptimusGitIntegrationConfig {
  userId: string;
  providerId: 'github' | 'gitlab' | 'gitea' | 'bitbucket';
  hasActiveToken: boolean;
  linkedAccountName: string;
}

// --- INTERFACE CONTRACTUELLE DE L'API REST ---

export interface IOptimusAPI {
  // Users & Auth
  getCurrentUser(): Promise<OptimusUser>;
  listOrganizations(): Promise<OptimusOrganization[]>;
  listTeams(orgId: string): Promise<OptimusTeam[]>;

  // Workspaces
  listWorkspaces(): Promise<OptimusWorkspace[]>;
  getWorkspace(id: string): Promise<OptimusWorkspace>;
  createWorkspace(name: string, templateId: string, gitRepoUrl?: string): Promise<OptimusWorkspace>;
  startWorkspace(id: string): Promise<OptimusWorkspace>;
  stopWorkspace(id: string): Promise<OptimusWorkspace>;
  deleteWorkspace(id: string): Promise<void>;

  // API Keys
  listApiKeys(): Promise<OptimusApiKey[]>;
  createApiKey(name: string, scopes: string[], expiresAt?: string): Promise<OptimusApiKey>;
  revokeApiKey(id: string): Promise<void>;

  // Quotas & Billing
  getQuotas(orgId: string): Promise<OptimusQuota>;
  getBillingUsage(orgId: string): Promise<OptimusBillingUsage>;

  // Audit Logs
  listAuditLogs(orgId: string): Promise<OptimusAuditLog[]>;

  // AI Services
  createAIChatSession(workspaceId?: string): Promise<OptimusAIChatSession>;
  sendAIChatMessage(sessionId: string, content: string): Promise<OptimusAIChatMessage[]>;
  requestAICommand(request: OptimusAICommandRequest): Promise<OptimusAICommandResponse>;

  // Git Portal Integrations
  listLinkedGitAccounts(): Promise<OptimusGitIntegrationConfig[]>;
  listGitRepositories(providerId: string): Promise<GitRepository[]>;
  importGitRepository(providerId: string, repoFullName: string): Promise<OptimusProject>;
  listProjectPullRequests(projectId: string): Promise<GitPullRequest[]>;
  createProjectPullRequest(projectId: string, title: string, head: string, base: string): Promise<GitPullRequest>;
}
