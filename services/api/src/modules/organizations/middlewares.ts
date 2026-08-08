import { GatewayMiddleware } from "../../core";

/**
 * Middleware de vérification du rôle d'administrateur de l'organisation.
 */
export const orgAdminMiddleware: GatewayMiddleware = async (req, next) => {
  if (req.user?.role !== 'admin') {
    return {
      status: 403,
      headers: { "Content-Type": "application/json" },
      body: { error: "Permission refusée - Droits d'administration requis pour cette organisation." }
    };
  }
  return await next();
};
