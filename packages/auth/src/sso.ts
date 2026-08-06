import { OptimusSession, OptimusSharedCookie } from "./sessions";
import { OptimusJWTPayload, TokenValidationResult } from "./tokens";
import { OAuthProviderConfig } from "./providers";

/**
 * Implémentation de référence du configurateur SSO d'Optimus.
 * Gère la génération de cookies de domaine parent pour apps/web et apps/coder.
 */
export class OptimusSSO {
  private oauthProviders = new Map<string, OAuthProviderConfig>();

  registerOAuthProvider(config: OAuthProviderConfig): void {
    this.oauthProviders.set(config.providerId, config);
  }

  async generateSSOToken(session: OptimusSession): Promise<string> {
    const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const payload = btoa(JSON.stringify({
      sub: session.user.id,
      username: session.user.username,
      email: session.user.email,
      role: session.user.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(new Date(session.expiresAt).getTime() / 1000),
      iss: "optimus-auth",
      aud: ["optimus-landing", "optimus-dev"]
    }));
    return `${header}.${payload}.mock_signature`;
  }

  async verifySSOToken(token: string): Promise<TokenValidationResult> {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return { isValid: false, errorReason: "Format de jeton SSO JWT invalide" };
    }
    try {
      const payloadDecoded = JSON.parse(atob(parts[1])) as OptimusJWTPayload;
      return { isValid: true, payload: payloadDecoded };
    } catch (e) {
      return { isValid: false, errorReason: "Échec du décodage du jeton SSO: " + String(e) };
    }
  }

  createSSOCookie(token: string, domain: string): OptimusSharedCookie {
    return {
      name: "optimus_sso_session",
      value: token,
      domain: domain, // ex: '.optimus.dev' permet le SSO entre apps/web et apps/coder
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 jours
      secure: true,
      httpOnly: true,
      sameSite: "lax"
    };
  }

  clearSSOCookie(domain: string): OptimusSharedCookie {
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

  getOAuthProviderConfig(providerId: string): OAuthProviderConfig {
    const config = this.oauthProviders.get(providerId);
    if (!config) {
      throw new Error(`Aucun fournisseur OAuth configuré pour: ${providerId}`);
    }
    return config;
  }
}
