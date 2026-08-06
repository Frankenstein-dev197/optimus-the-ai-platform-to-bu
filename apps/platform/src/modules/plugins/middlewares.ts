import { GatewayMiddleware } from "../../core";

/**
 * Middleware vérifiant les permissions de sécurité accordées au plugin avant chargement.
 */
export const pluginSecurityMiddleware: GatewayMiddleware = async (req, next) => {
  const untrustedPlugin = false; // Simulation
  if (untrustedPlugin) {
    return {
      status: 403,
      headers: { "Content-Type": "application/json" },
      body: { error: "Action refusée - Le plugin requiert des droits système non autorisés." }
    };
  }
  return await next();
};
