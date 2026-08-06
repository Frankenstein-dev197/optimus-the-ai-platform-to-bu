import { globalContainer, GatewayRequest, GatewayResponse } from "./core";
import { ModuleRegistry, IPlatformModule } from "./core/registry";
import { IPlatformLifecycle, LifecycleStep, ILifecycleListener } from "./core/lifecycle";
import { AuthHandler, ssoAuthMiddleware } from "./modules/auth";
import { UsersHandler } from "./modules/users";
import { OrganizationsHandler } from "./modules/organizations";
import { WorkspacesHandler } from "./modules/workspaces";
import { GitHandler } from "./modules/git";
import { AIHandler } from "./modules/ai";
import { ApiKeysHandler } from "./modules/apikeys";
import { AuditHandler } from "./modules/audit";
import { BillingHandler } from "./modules/billing";
import { PluginsHandler } from "./modules/plugins";

/**
 * Implémentation du gestionnaire de cycle de vie principal de la Gateway Platform.
 */
class GatewayLifecycle implements IPlatformLifecycle {
  currentStep: LifecycleStep = 'initialize';
  private listeners: ILifecycleListener[] = [];

  registerListener(listener: ILifecycleListener): void {
    this.listeners.push(listener);
  }

  async boot(): Promise<void> {
    this.currentStep = 'configure';
    for (const listener of this.listeners) {
      if (listener.onInitialize) await listener.onInitialize();
    }

    this.currentStep = 'boot';
    for (const listener of this.listeners) {
      if (listener.onBoot) await listener.onBoot();
    }

    this.currentStep = 'ready';
    for (const listener of this.listeners) {
      if (listener.onReady) await listener.onReady();
    }
  }

  async shutdown(): Promise<void> {
    this.currentStep = 'shutdown';
    for (const listener of this.listeners) {
      if (listener.onShutdown) await listener.onShutdown();
    }
  }
}

/**
 * Classe d'implémentation d'un module d'infrastructure exemple pour l'authentification.
 */
class AuthModule implements IPlatformModule {
  readonly moduleId = 'auth';

  registerServices(container: typeof globalContainer): void {
    container.register("AuthService", {} as any);
  }

  async initializeModule(container: typeof globalContainer): Promise<void> {
    // Initialisation spécifique du module auth
  }
}

/**
 * Classe d'implémentation d'un module d'infrastructure exemple pour les APIs d'administration.
 */
class ApiModule implements IPlatformModule {
  readonly moduleId = 'api';

  registerServices(container: typeof globalContainer): void {
    container.register("ApiService", {} as any);
  }

  async initializeModule(container: typeof globalContainer): Promise<void> {
    // Initialisation spécifique des APIs
  }
}

/**
 * Point d'entrée principal de la structure d'initialisation de la Gateway Platform Optimus.
 * Coordonne le cycle de vie, charge les modules via le registre et orchestre le routage.
 */
export class OptimusPlatformGateway {
  private lifecycle: IPlatformLifecycle;
  private registry: ModuleRegistry;

  constructor() {
    this.lifecycle = new GatewayLifecycle();
    this.registry = new ModuleRegistry(globalContainer);
    this.initializePlatform();
  }

  private initializePlatform(): void {
    // Enregistrement des modules dans le registre
    this.registry.register(new AuthModule());
    this.registry.register(new ApiModule());

    // Enregistrement de la Gateway auprès du cycle de vie
    this.lifecycle.registerListener({
      name: 'GatewayCore',
      onBoot: async () => {
        await this.registry.initializeAll();
      }
    });
  }

  /** Démarre proprement la Gateway */
  async start(): Promise<void> {
    await this.lifecycle.boot();
  }

  /** Arrête proprement la Gateway */
  async stop(): Promise<void> {
    await this.lifecycle.shutdown();
  }

  /**
   * Simule la réception et le traitement d'une requête HTTP d'API à travers la Gateway.
   * Valide la chaîne de middlewares et le routage vers le contrôleur correspondant.
   */
  async dispatchRequest(req: GatewayRequest): Promise<GatewayResponse> {
    const authService = globalContainer.resolve<any>("AuthService");
    const apiService = globalContainer.resolve<any>("ApiService");

    const authHandler = new AuthHandler(authService);
    const usersHandler = new UsersHandler(apiService);
    const orgsHandler = new OrganizationsHandler(apiService);
    const workspacesHandler = new WorkspacesHandler(apiService);
    const gitHandler = new GitHandler(apiService);
    const aiHandler = new AIHandler(apiService);
    const apiKeysHandler = new ApiKeysHandler(apiService);
    const auditHandler = new AuditHandler(apiService);
    const billingHandler = new BillingHandler(apiService);
    const pluginsHandler = new PluginsHandler(apiService);

    // Détection simplifiée des routes et redirection vers le handler correspondant
    try {
      if (req.url.startsWith("/api/v1/auth/redirect")) {
        return await authHandler.handleRedirect(req);
      }

      if (req.url.startsWith("/api/v1/auth/callback")) {
        return await authHandler.handleCallback(req);
      }

      // Application globale du middleware d'authentification SSO
      return await ssoAuthMiddleware(req, async () => {
        if (req.url.startsWith("/api/v1/users/me")) {
          return req.method === "GET"
            ? await usersHandler.handleGetMe(req)
            : await usersHandler.handleUpdateProfile(req);
        }

        if (req.url.startsWith("/api/v1/organizations") && !req.url.includes("audit-logs") && !req.url.includes("billing")) {
          return req.method === "GET"
            ? await orgsHandler.handleListOrgs(req)
            : await orgsHandler.handleCreateOrg(req);
        }

        if (req.url.startsWith("/api/v1/workspaces")) {
          if (req.url.endsWith("/start")) {
            return await workspacesHandler.handleStartWorkspace(req);
          }
          return req.method === "GET"
            ? await workspacesHandler.handleListWorkspaces(req)
            : await workspacesHandler.handleCreateWorkspace(req);
        }

        if (req.url.startsWith("/api/v1/developer/git")) {
          if (req.url.endsWith("/projects")) {
            return await gitHandler.handleImportRepository(req);
          }
          return await gitHandler.handleListGitAccounts(req);
        }

        if (req.url.startsWith("/api/v1/ai")) {
          if (req.url.includes("/chat/sessions")) {
            return await aiHandler.handleCreateChatSession(req);
          }
          return await aiHandler.handleRequestCommand(req);
        }

        if (req.url.startsWith("/api/v1/developer/apikeys")) {
          return req.method === "GET"
            ? await apiKeysHandler.handleListKeys(req)
            : await apiKeysHandler.handleCreateKey(req);
        }

        if (req.url.includes("/audit-logs")) {
          return await auditHandler.handleListLogs(req);
        }

        if (req.url.includes("/billing")) {
          return await billingHandler.handleGetUsage(req);
        }

        if (req.url.startsWith("/api/v1/plugins")) {
          if (req.url.endsWith("/toggle")) {
            return await pluginsHandler.handleTogglePlugin(req);
          }
          return await pluginsHandler.handleListPlugins(req);
        }

        return {
          status: 404,
          headers: { "Content-Type": "application/json" },
          body: { error: `Route non trouvée: ${req.method} ${req.url}` }
        };
      });

    } catch (e: any) {
      return {
        status: 500,
        headers: { "Content-Type": "application/json" },
        body: { error: `Erreur d'exécution de la Gateway: ${e.message}` }
      };
    }
  }
}
