/**
 * Options d'une requête HTTP générique passée dans le SDK.
 */
export interface SDKRequestOptions {
  readonly method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  readonly headers?: Record<string, string>;
  readonly body?: any;
  readonly timeoutMs?: number;
}

/**
 * Représentation standardisée de la requête interceptée.
 */
export interface SDKRequestContext {
  readonly url: string;
  options: SDKRequestOptions;
}

/**
 * Représentation de la réponse d'API standardisée interceptée.
 */
export interface SDKResponseContext<T = any> {
  readonly status: number;
  readonly headers: Record<string, string>;
  readonly data: T;
}

/**
 * Interface de contrat pour un intercepteur (Middleware) du SDK.
 * Permet de modifier ou d'enrichir les requêtes d'API (ex: injection de clés API, logging, retries, etc.).
 */
export interface ISDKInterceptor {
  readonly name: string;

  /** Exécuté avant l'appel d'API */
  beforeRequest?(context: SDKRequestContext): Promise<void>;

  /** Exécuté après avoir reçu la réponse de l'API */
  afterResponse?(requestContext: SDKRequestContext, responseContext: SDKResponseContext): Promise<void>;

  /** Exécuté en cas d'erreur de requête d'API (permet d'implémenter des stratégies de Retry) */
  onError?(requestContext: SDKRequestContext, error: Error): Promise<boolean>; // Retourne true s'il faut retenter la requête
}
