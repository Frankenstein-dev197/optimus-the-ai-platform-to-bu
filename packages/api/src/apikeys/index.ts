/**
 * Clé d'API développeur active pour l'automatisation.
 */
export interface OptimusApiKey {
  readonly id: string;
  readonly name: string;
  readonly prefix: string; // ex: opt_dev_...
  readonly userId: string;
  readonly scopes: string[];
  readonly expiresAt?: string;
  readonly createdAt: string;
  readonly lastUsedAt?: string;
}

/**
 * DTO pour la création d'une clé d'API.
 */
export interface CreateApiKeyDto {
  readonly name: string;
  readonly scopes: string[];
  readonly expiresAt?: string;
}

/**
 * Événements du domaine des clés d'API.
 */
export type ApiKeyEvent =
  | { readonly type: 'apikey.created'; readonly keyId: string; readonly userId: string }
  | { readonly type: 'apikey.revoked'; readonly keyId: string; readonly userId: string }
  | { readonly type: 'apikey.used'; readonly keyId: string; readonly timestamp: string };
