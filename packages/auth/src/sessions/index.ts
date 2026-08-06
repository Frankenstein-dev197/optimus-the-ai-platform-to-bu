import { OptimusUser } from "../types";

/**
 * Représentation d'une session SSO active au sein de l'écosystème Optimus.
 * Une session lie un utilisateur connecté à une validité temporelle sur le domaine partagé.
 */
export interface OptimusSession {
  /** Identifiant unique de la session */
  readonly sessionId: string;
  /** Utilisateur associé à cette session */
  readonly user: OptimusUser;
  /** Adresse IP à l'origine de la session */
  readonly ipAddress: string;
  /** Agent utilisateur (User Agent) associé */
  readonly userAgent: string;
  /** Date d'établissement de la session (format ISO-8601) */
  readonly createdAt: string;
  /** Date d'expiration de la session (format ISO-8601) */
  readonly expiresAt: string;
}

/**
 * Jeton d'accès (Access Token) à durée de vie courte servant à authentifier les requêtes API.
 */
export interface OptimusAccessToken {
  /** Valeur opaque ou JWT du jeton d'accès */
  readonly token: string;
  /** Date d'expiration du jeton d'accès (format ISO-8601) */
  readonly expiresAt: string;
}

/**
 * Jeton de rafraîchissement (Refresh Token) à durée de vie longue servant à renouveler les jetons d'accès.
 */
export interface OptimusRefreshToken {
  /** Valeur sécurisée et cryptographique du jeton de rafraîchissement */
  readonly token: string;
  /** Date d'expiration du jeton de rafraîchissement (format ISO-8601) */
  readonly expiresAt: string;
}

/**
 * Configuration d'un Cookie partagé sous-domaine pour l'authentification SSO unifiée.
 */
export interface OptimusSharedCookie {
  /** Nom du cookie (ex: "optimus_sso_session") */
  readonly name: string;
  /** Valeur chiffrée ou JWT du cookie */
  readonly value: string;
  /** Domaine parent partagé (ex: ".optimus.dev" pour couvrir apps/web et apps/coder) */
  readonly domain: string;
  /** Chemin d'application valide (généralement "/") */
  readonly path: string;
  /** Temps de vie maximal en secondes */
  readonly maxAge?: number;
  /** Flag exigeant HTTPS */
  readonly secure: boolean;
  /** Flag interdisant l'accès JS au cookie (protection XSS) */
  readonly httpOnly: boolean;
  /** Protection CSRF */
  readonly sameSite: 'lax' | 'strict' | 'none';
}
