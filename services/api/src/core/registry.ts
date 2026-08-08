import { DependencyContainer } from "./index";

/**
 * Contrat d'interface pour un module de la plateforme Optimus Gateway.
 * Chaque domaine fonctionnel (auth, workspaces, git, etc.) doit implémenter cette classe.
 */
export interface IPlatformModule {
  /** Identifiant unique du module (ex: 'auth', 'workspaces') */
  readonly moduleId: string;

  /** Enregistre les dépendances et services du module dans le conteneur DI */
  registerServices(container: DependencyContainer): void;

  /** Initialise les routes, écouteurs d'événements, ou middlewares du module */
  initializeModule(container: DependencyContainer): Promise<void>;
}

/**
 * Registre central de gestion des modules de la Gateway.
 * Permet d'activer, désactiver et interroger dynamiquement les modules enregistrés.
 */
export class ModuleRegistry {
  private modules = new Map<string, IPlatformModule>();

  constructor(private container: DependencyContainer) {}

  /** Enregistre et initialise un nouveau module fonctionnel */
  register(module: IPlatformModule): void {
    if (this.modules.has(module.moduleId)) {
      throw new Error(`Le module avec l'identifiant ${module.moduleId} est déjà enregistré.`);
    }
    this.modules.set(module.moduleId, module);
    module.registerServices(this.container);
  }

  /** Récupère un module enregistré */
  getModule(moduleId: string): IPlatformModule {
    const module = this.modules.get(moduleId);
    if (!module) {
      throw new Error(`Module non trouvé dans le registre de la plateforme: ${moduleId}`);
    }
    return module;
  }

  /** Retourne la liste de tous les modules actifs */
  listModules(): IPlatformModule[] {
    return Array.from(this.modules.values());
  }

  /** Initialise l'intégralité des modules enregistrés */
  async initializeAll(): Promise<void> {
    for (const module of this.modules.values()) {
      await module.initializeModule(this.container);
    }
  }
}
