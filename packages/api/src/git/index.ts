import { GitRepository, GitPullRequest } from "@optimus/git";

/**
 * Représentation d'un projet Optimus lié à un dépôt Git.
 */
export interface OptimusProject {
  readonly id: string;
  readonly name: string;
  readonly gitRepo: GitRepository;
  readonly linkedWorkspaces: string[];
  readonly createdAt: string;
}

/**
 * Configuration de l'intégration Git pour un utilisateur d'Optimus Dev.
 */
export interface OptimusGitIntegrationConfig {
  readonly userId: string;
  readonly providerId: 'github' | 'gitlab' | 'gitea' | 'bitbucket';
  readonly hasActiveToken: boolean;
  readonly linkedAccountName: string;
}

/**
 * DTO pour l'importation d'un dépôt Git dans Optimus.
 */
export interface ImportGitRepositoryDto {
  readonly providerId: 'github' | 'gitlab' | 'gitea' | 'bitbucket';
  readonly repoFullName: string;
}

/**
 * Événements du domaine Git.
 */
export type GitEvent =
  | { readonly type: 'git.account.linked'; readonly userId: string; readonly providerId: string }
  | { readonly type: 'git.repo.imported'; readonly projectId: string; readonly fullName: string }
  | { readonly type: 'git.webhook.received'; readonly providerId: string; readonly event: string; readonly payload: Record<string, any> };
