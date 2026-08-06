/**
 * Types de fournisseurs d'authentification tiers (OAuth 2.0 / OIDC) supportés de base.
 */
export type OAuthProviderId =
  | 'github'
  | 'gitlab'
  | 'google'
  | 'microsoft'
  | 'gitea'
  | 'bitbucket';

/**
 * Représentation du profil utilisateur standardisé renvoyé par n'importe quel fournisseur OAuth.
 * Permet d'uniformiser l'enregistrement et la création de comptes utilisateurs.
 */
export interface OAuthUserProfile {
  /** Identifiant unique fourni par le tiers (ex: ID GitHub) */
  readonly externalId: string;
  /** Fournisseur d'identité d'origine */
  readonly providerId: OAuthProviderId;
  /** Nom d'utilisateur chez le tiers */
  readonly username: string;
  /** E-mail associé au compte tiers */
  readonly email: string;
  /** Nom d'affichage */
  readonly displayName?: string;
  /** URL de l'avatar ou de la photo de profil */
  readonly avatarUrl?: string;
}

/**
 * Configuration nécessaire pour instancier et exécuter le protocole OAuth 2.0 avec un fournisseur.
 */
export interface OAuthProviderConfig {
  /** Identifiant unique du fournisseur d'authentification */
  readonly providerId: OAuthProviderId;
  /** ID client OAuth 2.0 de l'application enregistré chez le fournisseur */
  readonly clientId: string;
  /** Secret client OAuth 2.0 */
  readonly clientSecret: string;
  /** URL d'autorisation d'origine (ex: https://github.com/login/oauth/authorize) */
  readonly authUrl: string;
  /** URL d'échange de jetons (ex: https://github.com/login/oauth/access_token) */
  readonly tokenUrl: string;
  /** URL de l'API tiers pour récupérer les infos utilisateur (ex: https://api.github.com/user) */
  readonly userInfoUrl: string;
  /** Scopes de permissions demandés au tiers (ex: ["user:email", "read:org"]) */
  readonly scopes: string[];
}

/**
 * Interface de contrat pour un fournisseur OAuth.
 * Chaque adaptateur de fournisseur (ex: GitHub, GitLab) doit implémenter cette classe.
 */
export interface IOptimusOAuthProvider {
  /** Spécifie le type de fournisseur d'identité */
  readonly providerId: OAuthProviderId;

  /** Génère l'URL de redirection vers l'interface de connexion du tiers */
  getAuthorizationUrl(config: OAuthProviderConfig, redirectUri: string, state: string): string;

  /** Échange le code d'autorisation reçu après redirection contre un jeton d'accès tiers */
  exchangeCodeForToken(config: OAuthProviderConfig, code: string, redirectUri: string): Promise<string>;

  /** Récupère le profil de l'utilisateur de manière standardisée en interrogeant l'API du tiers */
  getUserProfile(config: OAuthProviderConfig, accessToken: string): Promise<OAuthUserProfile>;
}
