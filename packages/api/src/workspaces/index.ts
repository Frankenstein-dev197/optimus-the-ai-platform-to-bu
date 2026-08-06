/**
 * Représentation d'un espace de travail (Workspace) Optimus Dev.
 */
export interface OptimusWorkspace {
  readonly id: string;
  readonly name: string;
  readonly ownerId: string;
  readonly ownerUsername: string;
  readonly status: 'running' | 'stopped' | 'starting' | 'stopping' | 'error';
  readonly templateId: string;
  readonly templateName: string;
  readonly templateVersion: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly resources: WorkspaceResources;
  readonly gitRepoUrl?: string;
  readonly activeBranch?: string;
}

/**
 * Spécification des ressources d'un workspace.
 */
export interface WorkspaceResources {
  readonly cpuCores: number;
  readonly memoryGB: number;
  readonly diskGB: number;
  readonly gpuCount?: number;
}

/**
 * DTO pour la création d'un espace de travail.
 */
export interface CreateWorkspaceDto {
  readonly name: string;
  readonly templateId: string;
  readonly gitRepoUrl?: string;
  readonly branch?: string;
  readonly resources?: Partial<WorkspaceResources>;
}

/**
 * Représentation d'un modèle d'espace de travail (Template Coder/Terraform).
 */
export interface WorkspaceTemplate {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly activeVersionId: string;
  readonly createdAt: string;
  readonly isPublic: boolean;
  readonly ownerId: string;
}

/**
 * Événements du domaine Workspace.
 */
export type WorkspaceEvent =
  | { readonly type: 'workspace.created'; readonly workspaceId: string; readonly name: string; readonly ownerId: string }
  | { readonly type: 'workspace.started'; readonly workspaceId: string }
  | { readonly type: 'workspace.stopped'; readonly workspaceId: string }
  | { readonly type: 'workspace.deleted'; readonly workspaceId: string }
  | { readonly type: 'workspace.error'; readonly workspaceId: string; readonly message: string };
