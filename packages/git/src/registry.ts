import { GitProviderAdapter } from "./types";
import { GitHubAdapter } from "./adapters/github";
import { GitLabAdapter } from "./adapters/gitlab";
import { GiteaAdapter } from "./adapters/gitea";
import { BitbucketAdapter } from "./adapters/bitbucket";

export class GitProviderRegistry {
  private adapters = new Map<string, GitProviderAdapter>();

  constructor() {
    // Enregistrement par défaut des adaptateurs supportés
    this.register(new GitHubAdapter());
    this.register(new GitLabAdapter());
    this.register(new GiteaAdapter());
    this.register(new BitbucketAdapter());
  }

  register(adapter: GitProviderAdapter): void {
    this.adapters.set(adapter.providerId, adapter);
  }

  getAdapter(providerId: string): GitProviderAdapter {
    const adapter = this.adapters.get(providerId);
    if (!adapter) {
      throw new Error(`Aucun adaptateur Git trouvé pour le fournisseur: ${providerId}`);
    }
    return adapter;
  }

  listRegisteredProviders(): string[] {
    return Array.from(this.adapters.keys());
  }
}

export const globalGitRegistry = new GitProviderRegistry();
