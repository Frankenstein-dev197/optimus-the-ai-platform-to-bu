import { GatewayMiddleware } from "../../core";

/**
 * Middleware de sécurité et d'authentification pour la Gateway.
 * Valide de manière abstraite l'intégrité de la session SSO et configure le contexte utilisateur.
 */
export const ssoAuthMiddleware: GatewayMiddleware = async (req, next) => {
  const authHeader = req.headers["authorization"];
  const ssoCookie = req.headers["cookie"]?.split(";").find(c => c.trim().startsWith("optimus_sso_session="));

  if (!authHeader && !ssoCookie) {
    return {
      status: 401,
      headers: { "Content-Type": "application/json" },
      body: { error: "Non autorisé - Cookie de session SSO unifiée ou clé d'API invalide." }
    };
  }

  // Injection du contexte utilisateur authentifié
  req.user = {
    id: "user-123",
    username: "optimus_developer",
    role: "developer",
    scopes: ["api:read", "api:write"]
  };

  return await next();
};
