import { OptimusUser, OptimusRole, OptimusPermission, OptimusApiScope } from "../types";
import { OptimusSession, OptimusAccessToken, OptimusRefreshToken, OptimusSharedCookie } from "../sessions";
import { OptimusJWTPayload, TokenValidationResult } from "../tokens";
import { OAuthProviderId, OAuthProviderConfig, OAuthUserProfile } from "../providers";
import { PermissionCheckResult } from "../permissions";

/**
 * Service de gestion des jetons JWT et d'accès API.
 */
export interface ITokenService {
  /** Génère un jeton JWT unifié à partir des informations de session */
  generateToken(session: OptimusSession, secret: string): Promise<string>;

  /** Valide, décode et vérifie un jeton d'accès JWT */
  validateToken(token: string, secret: string): Promise<TokenValidationResult>;
}

/**
 * Service de gestion du cycle de vie des sessions SSO utilisateur.
 */
export interface ISessionService {
  /** Crée une nouvelle session SSO active */
  createSession(user: OptimusUser, ipAddress: string, userAgent: string): Promise<OptimusSession>;

  /** Récupère et valide une session à partir de son identifiant */
  getSession(sessionId: string): Promise<OptimusSession | null>;

  /** Détruit et révoque une session active (Logout) */
  invalidateSession(sessionId: string): Promise<void>;

  /** Crée la configuration de cookie SSO partagé du domaine */
  createSSOCookie(token: string, domain: string): OptimusSharedCookie;

  /** Crée la configuration de cookie de suppression SSO (Logout) */
  clearSSOCookie(domain: string): OptimusSharedCookie;
}

/**
 * Service central d'authentification et de coordination OAuth/SSO.
 */
export interface IOAuthService {
  /** Récupère l'URL d'autorisation OAuth d'un fournisseur enregistré */
  getAuthRedirectUrl(providerId: OAuthProviderId, redirectUri: string, state: string): Promise<string>;

  /** Gère le callback de redirection OAuth : échange le code et renvoie le profil utilisateur tiers */
  handleOAuthCallback(providerId: OAuthProviderId, code: string, redirectUri: string): Promise<OAuthUserProfile>;

  /** Associe un compte tiers à un compte utilisateur existant d'Optimus */
  linkGitAccountToUser(userId: string, profile: OAuthUserProfile): Promise<void>;
}

/**
 * Service d'autorisation fine et d'évaluation des permissions.
 */
export interface IPermissionService {
  /** Vérifie si un utilisateur possède une permission d'administration ou d'action spécifique */
  hasPermission(userId: string, permission: OptimusPermission, contextId?: string): Promise<PermissionCheckResult>;

  /** Vérifie si un jeton de clé de développeur possède les scopes d'API requis */
  hasScope(tokenPayload: OptimusJWTPayload, requiredScope: OptimusApiScope): boolean;
}

/**
 * Service de coordination générale de l'authentification et du SSO.
 */
export interface IAuthService {
  /** Service d'émission de jetons */
  readonly tokens: ITokenService;
  /** Service de gestion de session */
  readonly sessions: ISessionService;
  /** Service d'authentification tierce */
  readonly oauth: IOAuthService;
  /** Service d'évaluation des autorisations */
  readonly permissions: IPermissionService;
}
