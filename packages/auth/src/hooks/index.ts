import { OptimusUser, OptimusRole, OptimusPermission } from "../types";
import { OptimusSession } from "../sessions";

export interface UseAuthResult {
  /** Indique si l'utilisateur est connecté */
  readonly isAuthenticated: boolean;
  /** Indique si les données d'authentification sont en cours de chargement */
  readonly isLoading: boolean;
  /** Utilisateur actuellement connecté (null si déconnecté) */
  readonly user: OptimusUser | null;
  /** Session SSO active (null si déconnecté) */
  readonly session: OptimusSession | null;
  /** Erreur survenue lors de l'authentification */
  readonly error: Error | null;

  /** Connecte un utilisateur via SSO avec token */
  loginWithSSO(token: string): Promise<void>;
  /** Déconnecte l'utilisateur actuel et invalide la session SSO */
  logout(): Promise<void>;
  /** Force le rafraîchissement silencieux de la session SSO */
  refreshSession(): Promise<void>;
  /** Évalue si l'utilisateur connecté possède une permission spécifique */
  hasPermission(permission: OptimusPermission, contextId?: string): boolean;
}

/**
 * Signature du hook React d'authentification principal d'Optimus.
 * Ce hook sera utilisé dans apps/web et apps/coder pour consommer la session SSO unifiée.
 */
export function useAuth(): UseAuthResult {
  // Stub - L'implémentation complète utilisera les Contextes React et le SDK packages/sdk.
  return {
    isAuthenticated: false,
    isLoading: false,
    user: null,
    session: null,
    error: null,
    loginWithSSO: async () => {},
    logout: async () => {},
    refreshSession: async () => {},
    hasPermission: () => false
  };
}

export interface UseOAuthResult {
  /** Lance le processus de connexion redirigée vers un fournisseur tiers */
  redirectToProvider(providerId: string, redirectUri?: string): Promise<void>;
  /** Gère la redirection retour (callback) et finalise l'authentification */
  handleCallback(code: string, state: string): Promise<OptimusUser>;
}

/**
 * Signature du hook React d'interaction avec les fournisseurs tiers OAuth.
 */
export function useOAuth(): UseOAuthResult {
  // Stub
  return {
    redirectToProvider: async () => {},
    handleCallback: async () => {
      throw new Error("Non implémenté");
    }
  };
}
