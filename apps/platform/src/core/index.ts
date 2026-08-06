/**
 * Représentation abstraite d'une requête HTTP arrivant sur la Gateway.
 */
export interface GatewayRequest {
  readonly method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  readonly url: string;
  readonly headers: Record<string, string>;
  readonly query: Record<string, string | string[]>;
  readonly body?: any;
  /** Contexte d'authentification injecté par le middleware d'auth */
  user?: {
    id: string;
    username: string;
    role: string;
    scopes?: string[];
  };
}

/**
 * Représentation abstraite d'une réponse HTTP retournée par la Gateway.
 */
export interface GatewayResponse {
  status: number;
  headers: Record<string, string>;
  body: any;
}

/**
 * Signature d'un Handler de route (Contrôleur).
 */
export type GatewayHandler = (req: GatewayRequest) => Promise<GatewayResponse>;

/**
 * Signature d'un Middleware de Gateway.
 */
export type GatewayMiddleware = (req: GatewayRequest, next: () => Promise<GatewayResponse>) => Promise<GatewayResponse>;

/**
 * Interface d'un Routeur au sein de la Gateway.
 */
export interface IGatewayRouter {
  register(method: GatewayRequest['method'], path: string, handler: GatewayHandler, ...middlewares: GatewayMiddleware[]): void;
  handle(req: GatewayRequest): Promise<GatewayResponse>;
}

/**
 * Conteneur d'injection de dépendances (DI Container) pour la Gateway.
 * Permet d'enregistrer et de résoudre les services découplés.
 */
export class DependencyContainer {
  private services = new Map<string, any>();

  register<T>(serviceId: string, instance: T): void {
    this.services.set(serviceId, instance);
  }

  resolve<T>(serviceId: string): T {
    const service = this.services.get(serviceId);
    if (!service) {
      throw new Error(`Service non trouvé dans le conteneur de dépendances: ${serviceId}`);
    }
    return service as T;
  }
}

export const globalContainer = new DependencyContainer();
