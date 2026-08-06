export interface OptimusSession {
  sessionId: string;
  userId: string;
  username: string;
  email: string;
  role: 'admin' | 'developer' | 'billing_admin';
  createdAt: string;
  expiresAt: string;
}

export interface OptimusJWTPayload {
  sub: string; // ID utilisateur
  username: string;
  email: string;
  role: 'admin' | 'developer' | 'billing_admin';
  iat: number;
  exp: number;
  iss: string; // 'optimus-auth'
  aud: string[]; // ['optimus-landing', 'optimus-dev']
}

export interface CookieConfig {
  name: string;
  value: string;
  domain: string; // ex: '.optimus.dev' pour le SSO multi-sous-domaines
  path: string; // ex: '/'
  maxAge?: number;
  secure: boolean;
  httpOnly: boolean;
  sameSite: 'lax' | 'strict' | 'none';
}

export interface OAuthConfig {
  providerId: 'github' | 'gitlab' | 'gitea' | 'bitbucket' | 'google' | 'keycloak';
  clientId: string;
  clientSecret: string;
  authUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
  scopes: string[];
}

export interface ISSOConfigurator {
  // Génération et vérification des jetons d'authentification
  generateSSOToken(session: OptimusSession, secret: string): Promise<string>;
  verifySSOToken(token: string, secret: string): Promise<OptimusJWTPayload>;

  // Gestion des cookies partagés du domaine
  createSSOCookie(token: string, domain: string): CookieConfig;
  clearSSOCookie(domain: string): CookieConfig;

  // Enregistrement et configuration des fournisseurs d'identité OAuth tiers
  getOAuthProviderConfig(providerId: string): OAuthConfig;
}

// Stub ou implémentation légère d'une classe SSO de référence
export class OptimusSSO implements ISSOConfigurator {
  private oauthProviders = new Map<string, OAuthConfig>();

  registerOAuthProvider(config: OAuthConfig): void {
    this.oauthProviders.set(config.providerId, config);
  }

  async generateSSOToken(session: OptimusSession, secret: string): Promise<string> {
    // Dans une implémentation réelle, nous utiliserions une bibliothèque JWT (comme jose ou jsonwebtoken).
    // Pour les fondations, nous renvoyons un format d'échange simulé.
    const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const payload = btoa(JSON.stringify({
      sub: session.userId,
      username: session.username,
      email: session.email,
      role: session.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(new Date(session.expiresAt).getTime() / 1000),
      iss: "optimus-auth",
      aud: ["optimus-landing", "optimus-dev"]
    }));
    return `${header}.${payload}.mock_signature`;
  }

  async verifySSOToken(token: string, secret: string): Promise<OptimusJWTPayload> {
    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new Error("Format de jeton SSO JWT invalide");
    }
    try {
      const payloadDecoded = JSON.parse(atob(parts[1]));
      return payloadDecoded as OptimusJWTPayload;
    } catch (e) {
      throw new Error("Échec du décodage du jeton SSO JWT: " + String(e));
    }
  }

  createSSOCookie(token: string, domain: string): CookieConfig {
    return {
      name: "optimus_sso_session",
      value: token,
      domain: domain, // ex: '.optimus.dev' permet au cookie d'être partagé sur apps/web et apps/coder
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 jours
      secure: true,
      httpOnly: true,
      sameSite: "lax"
    };
  }

  clearSSOCookie(domain: string): CookieConfig {
    return {
      name: "optimus_sso_session",
      value: "",
      domain: domain,
      path: "/",
      maxAge: 0,
      secure: true,
      httpOnly: true,
      sameSite: "lax"
    };
  }

  getOAuthProviderConfig(providerId: string): OAuthConfig {
    const config = this.oauthProviders.get(providerId);
    if (!config) {
      throw new Error(`Aucun fournisseur OAuth configuré pour: ${providerId}`);
    }
    return config;
  }
}
